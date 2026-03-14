import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Coordenadas fixas da Parada do Açaí Caucaia (Caucaia-CE)
const PICKUP_LAT = -3.7373;
const PICKUP_LNG = -38.6531;

const MULTIPEDIDOS_API = "https://api.multipedidos.com.br/v2";

// Mapeamento de status interno → Multipedidos
const STATUS_MAP: Record<string, string> = {
  accepted: "APPROVED",
  picked_up: "SENT",
  delivered: "OVER",
};

// Mapeamento de status Multipedidos → status interno de orders
const MP_STATUS_TO_ORDER: Record<string, string> = {
  CREATED: "received",
  APPROVED: "preparing",
  DONE: "ready",
  SENT: "dispatched",
  CANCELED: "canceled",
  SCHEDULED: "received",
};

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// ── Multipedidos Auth ──────────────────────────────────────────────

async function getMultipedidosJwt(): Promise<string> {
  const token = Deno.env.get("MULTIPEDIDOS_INTEGRATION_TOKEN");
  if (!token) throw new Error("MULTIPEDIDOS_INTEGRATION_TOKEN not set");

  const res = await fetch(`${MULTIPEDIDOS_API}/integration/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Multipedidos auth failed [${res.status}]: ${body}`);
  }

  const data = await res.json();
  const jwt = data.token || data.access_token;
  if (!jwt) throw new Error("No JWT returned from Multipedidos auth");
  return jwt;
}

// ── Update Status on Multipedidos ──────────────────────────────────

async function updateMultipedidosStatus(
  externalOrderId: string,
  appStatus: string,
): Promise<{ ok: boolean; detail?: string }> {
  const mpStatus = STATUS_MAP[appStatus];
  if (!mpStatus) {
    return { ok: false, detail: `Unknown status mapping for: ${appStatus}` };
  }

  try {
    const jwt = await getMultipedidosJwt();
    const restaurantId = Deno.env.get("MULTIPEDIDOS_RESTAURANT_ID");
    if (!restaurantId) throw new Error("MULTIPEDIDOS_RESTAURANT_ID not set");

    const res = await fetch(
      `https://api.multipedidos.com.br/restaurant/${restaurantId}/order/${externalOrderId}/status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ status: mpStatus }),
      },
    );

    const body = await res.text();
    console.log(
      `Multipedidos status update [${externalOrderId}] → ${mpStatus}: ${res.status} ${body}`,
    );

    if (!res.ok) {
      return { ok: false, detail: `HTTP ${res.status}: ${body}` };
    }

    return { ok: true };
  } catch (err) {
    console.error("Multipedidos status update error:", err);
    return { ok: false, detail: err.message };
  }
}

// ── Referral helpers ───────────────────────────────────────────────

function extractReferralCode(order: any): string | null {
  return (
    order.external_source ||
    order.campaign ||
    order.utm_campaign ||
    order.referral_code ||
    order.metadata?.referral_code ||
    order.metadata?.utm_campaign ||
    order.customer?.referral_code ||
    order.tracking?.utm_campaign ||
    order.tracking?.referral_code ||
    null
  );
}

async function getCommissionRate(level: number, supabaseAdmin: any): Promise<number> {
  const { data } = await supabaseAdmin
    .from("commission_rates")
    .select("rate")
    .eq("level", level)
    .maybeSingle();

  return data?.rate ?? 0.01;
}

async function creditReferral(
  refCode: string,
  externalId: string,
  orderTotal: number,
  supabaseAdmin: any,
): Promise<string | null> {
  const { data: influencer } = await supabaseAdmin
    .from("profiles")
    .select("id, level")
    .eq("referral_code", refCode)
    .maybeSingle();

  if (!influencer) {
    console.warn(`Influencer not found for referral code: ${refCode}`);
    return null;
  }

  const influencerLevel = influencer.level ?? 1;
  const commissionRate = await getCommissionRate(influencerLevel, supabaseAdmin);

  console.log(`Influencer ${influencer.id} level=${influencerLevel} commission_rate=${commissionRate}`);

  const { data: saleId, error } = await supabaseAdmin.rpc("credit_referral_commission", {
    _influencer_id: influencer.id,
    _referral_code: refCode,
    _external_order_id: externalId,
    _order_total: orderTotal,
    _commission_rate: commissionRate,
  });

  if (error) {
    console.error("Failed to credit referral:", error);
    return null;
  }

  return saleId;
}

// ── Geocoding ──────────────────────────────────────────────────────

function buildGeoQuery(order: any): { street: string; city: string; state: string } {
  const street = order.address || order.client?.street || "";
  const number = order.street_number || order.client?.street_number || "";
  const city = (order.city && order.city.trim()) || order.client?.city || "Fortaleza";

  const streetFull = street && number ? `${street}, ${number}` : street;

  return { street: streetFull, city, state: "Ceará" };
}

async function geocodeAddress(order: any): Promise<{ lat: number; lng: number } | null> {
  const { street, city, state } = buildGeoQuery(order);
  if (!street) return null;

  const headers = { "User-Agent": "ParadaDoAcaiVIP/1.0" };

  try {
    const structuredUrl = `https://nominatim.openstreetmap.org/search?format=json&street=${encodeURIComponent(street)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=Brazil&limit=1`;
    console.log(`Geocode structured: street="${street}" city="${city}"`);

    let res = await fetch(structuredUrl, { headers });
    if (res.ok) {
      const results = await res.json();
      if (results.length > 0) {
        const { lat, lon } = results[0];
        console.log(`Geocoded (structured) → ${lat}, ${lon}`);
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      }
    }

    const freeQuery = `${street}, ${city}, CE, Brasil`;
    const freeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(freeQuery)}&limit=1`;
    console.log(`Geocode fallback: "${freeQuery}"`);

    res = await fetch(freeUrl, { headers });
    if (res.ok) {
      const results = await res.json();
      if (results.length > 0) {
        const { lat, lon } = results[0];
        console.log(`Geocoded (fallback) → ${lat}, ${lon}`);
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      }
    }

    console.warn(`No geocoding results for: ${street}, ${city}`);
    return null;
  } catch (err) {
    console.error(`Geocoding error:`, err);
    return null;
  }
}

// ── Address helpers ────────────────────────────────────────────────

function buildDeliveryAddress(order: any): string {
  const street = order.address || order.client?.street || "";
  const number = order.street_number || order.client?.street_number || "";
  const neighborhood = order.bairro || order.client?.bairro || "";
  const city = order.city || order.client?.city || "";
  const complement = order.complemento || order.client?.complemento || "";
  const ref = order.address_ref || order.client?.referral || "";

  const parts = [
    street && number ? `${street}, ${number}` : street || number,
    complement,
    neighborhood,
    city,
  ].filter(Boolean);

  const addr = parts.join(" - ");
  if (ref) return `${addr} (Ref: ${ref})`;
  return addr || "Endereço não informado";
}

function extractCustomerName(order: any): string {
  return order.client?.name || order.customer_name || order.client?.first_name || "Cliente";
}

// ── Save order to orders table ─────────────────────────────────────

async function saveOrder(
  order: any,
  externalId: string,
  status: string,
  supabaseAdmin: any,
): Promise<{ upserted: boolean }> {
  const orderTotal = order.total || 0;
  const refCode = extractReferralCode(order);
  const deliveryAddress = order.delivery_type === "table"
    ? `Mesa: ${order.table || "N/A"}`
    : buildDeliveryAddress(order);
  const customerName = extractCustomerName(order);

  const { error } = await supabaseAdmin.from("orders").upsert(
    {
      external_order_id: externalId,
      status,
      order_data: order,
      order_total: orderTotal,
      referral_code: refCode,
      delivery_address: deliveryAddress,
      customer_name: customerName,
    },
    { onConflict: "external_order_id" },
  );

  if (error) {
    console.error(`Failed to save order ${externalId}:`, error);
    throw error;
  }

  return { upserted: true };
}

// ── Dispatch order → create delivery ───────────────────────────────

async function dispatchOrder(
  externalId: string,
  supabaseAdmin: any,
): Promise<{ dispatched: boolean; delivery_id?: string }> {
  // Fetch the order
  const { data: order, error: fetchErr } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("external_order_id", externalId)
    .maybeSingle();

  if (fetchErr || !order) {
    console.error(`Order ${externalId} not found for dispatch`);
    return { dispatched: false };
  }

  if (order.status === "dispatched") {
    console.log(`Order ${externalId} already dispatched`);
    return { dispatched: false };
  }

  const orderData = order.order_data || {};

  // Geocode
  const clientCoords = orderData.client?.coordinates;
  let deliveryLat = clientCoords?.lat || clientCoords?.latitude || null;
  let deliveryLng = clientCoords?.lng || clientCoords?.longitude || null;

  if (!deliveryLat && !deliveryLng && orderData.delivery_type !== "table") {
    const geocoded = await geocodeAddress(orderData);
    if (geocoded) {
      deliveryLat = geocoded.lat;
      deliveryLng = geocoded.lng;
    }
  }

  const fare = orderData.motoboy_remuneration > 0
    ? orderData.motoboy_remuneration
    : (orderData.delivery_fee > 0 ? orderData.delivery_fee : 5);

  // Create delivery
  const { error: deliveryErr } = await supabaseAdmin.from("deliveries").upsert(
    {
      external_order_id: externalId,
      pickup_address: "Parada do Açaí Caucaia",
      delivery_address: order.delivery_address || "Endereço não informado",
      fare,
      status: "pending",
      offered_at: new Date().toISOString(),
      pickup_lat: PICKUP_LAT,
      pickup_lng: PICKUP_LNG,
      delivery_lat: deliveryLat,
      delivery_lng: deliveryLng,
      multipedidos_order_data: orderData,
    },
    { onConflict: "external_order_id", ignoreDuplicates: true },
  );

  if (deliveryErr) {
    console.error(`Failed to create delivery for ${externalId}:`, deliveryErr);
    throw deliveryErr;
  }

  // Update order status to dispatched
  await supabaseAdmin
    .from("orders")
    .update({ status: "dispatched" })
    .eq("external_order_id", externalId);

  console.log(`Order ${externalId} dispatched to drivers`);
  return { dispatched: true };
}

// ── Webhook handler ────────────────────────────────────────────────

async function handleWebhook(body: any) {
  console.log("=== WEBHOOK PAYLOAD ===");
  console.log(JSON.stringify(body, null, 2));
  console.log("=== END PAYLOAD ===");

  const supabaseAdmin = getSupabaseAdmin();
  const orders = Array.isArray(body) ? body : [body];
  const results = [];

  for (const order of orders) {
    const externalId = String(order.id);
    const orderTotal = order.total || 0;
    const refCode = extractReferralCode(order);
    const mpStatus = order.order_status || order.status || "CREATED";

    console.log(`Processing order ${externalId}: total=${orderTotal}, refCode=${refCode}, mpStatus=${mpStatus}`);

    // Map Multipedidos status to internal order status
    const internalStatus = MP_STATUS_TO_ORDER[mpStatus] || "received";

    // Save/update order in orders table
    await saveOrder(order, externalId, internalStatus, supabaseAdmin);

    // Credit referral on first receive (don't wait for DONE)
    let referralResult = null;
    if (refCode) {
      referralResult = await creditReferral(refCode, externalId, orderTotal, supabaseAdmin);
      console.log(`Referral credit result for ${refCode}: ${referralResult}`);
    } else {
      console.warn(`Order ${externalId}: no referral code found`);
    }

    // If status is DONE or SENT (ready for pickup by motoboy), dispatch to drivers
    let dispatchResult = null;
    if (mpStatus === "DONE" || mpStatus === "SENT") {
      dispatchResult = await dispatchOrder(externalId, supabaseAdmin);
      console.log(`Dispatch result for ${externalId}: ${JSON.stringify(dispatchResult)}`);
    }

    results.push({
      id: externalId,
      mp_status: mpStatus,
      internal_status: internalStatus,
      dispatched: dispatchResult?.dispatched ?? false,
      referral_credited: !!referralResult,
      ref_code: refCode,
    });
  }

  return results;
}

// ── Manual dispatch (admin fallback) ───────────────────────────────

async function handleManualDispatch(externalOrderId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const result = await dispatchOrder(externalOrderId, supabaseAdmin);
  return result;
}

// ── Main handler ───────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "webhook";

    // ─── Webhook: receive orders from Multipedidos ───
    if (action === "webhook" && req.method === "POST") {
      const body = await req.json();
      const results = await handleWebhook(body);
      return new Response(JSON.stringify({ ok: true, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Manual dispatch: admin marks order as ready ───
    if (action === "dispatch" && req.method === "POST") {
      const { external_order_id } = await req.json();

      if (!external_order_id) {
        return new Response(
          JSON.stringify({ error: "Missing external_order_id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const result = await handleManualDispatch(external_order_id);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Update status: sync driver actions back to Multipedidos ───
    if (action === "update_status" && req.method === "POST") {
      const { external_order_id, status } = await req.json();

      if (!external_order_id || !status) {
        return new Response(
          JSON.stringify({ error: "Missing external_order_id or status" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const result = await updateMultipedidosStatus(external_order_id, status);
      return new Response(JSON.stringify(result), {
        status: result.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Test auth ───
    if (action === "test_auth") {
      const token = Deno.env.get("MULTIPEDIDOS_INTEGRATION_TOKEN");
      if (!token) {
        return new Response(JSON.stringify({ error: "MULTIPEDIDOS_INTEGRATION_TOKEN not set" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({ ok: true, token_preview: token.substring(0, 10) + "..." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("multipedidos-sync error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
