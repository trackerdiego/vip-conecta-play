import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Coordenadas fixas da Parada do Açaí VIP (Fortaleza-CE)
const PICKUP_LAT = -3.7319;
const PICKUP_LNG = -38.5267;

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

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

/**
 * Extract clean geocoding fields from order data.
 */
function buildGeoQuery(order: any): { street: string; city: string; state: string } {
  const street = order.address || order.client?.street || "";
  const number = order.street_number || order.client?.street_number || "";
  const city = (order.city && order.city.trim()) || order.client?.city || "Fortaleza";

  const streetFull = street && number ? `${street}, ${number}` : street;

  return { street: streetFull, city, state: "Ceará" };
}

/**
 * Geocode using Nominatim structured query, with fallback to free-form.
 */
async function geocodeAddress(order: any): Promise<{ lat: number; lng: number } | null> {
  const { street, city, state } = buildGeoQuery(order);
  if (!street) return null;

  const headers = { "User-Agent": "ParadaDoAcaiVIP/1.0" };

  try {
    // Attempt 1: structured query
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

    // Attempt 2: simple free-form with just street + city
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

async function createDelivery(order: any, externalId: string, supabaseAdmin: any) {
  const deliveryAddress = order.delivery_type === "table"
    ? `Mesa: ${order.table || "N/A"}`
    : buildDeliveryAddress(order);

  // Try to get delivery coordinates from order data first
  const clientCoords = order.client?.coordinates;
  let deliveryLat = clientCoords?.lat || clientCoords?.latitude || null;
  let deliveryLng = clientCoords?.lng || clientCoords?.longitude || null;

  // If no coordinates from order, geocode the delivery address
  if (!deliveryLat && !deliveryLng && deliveryAddress && order.delivery_type !== "table") {
    const geocoded = await geocodeAddress(deliveryAddress);
    if (geocoded) {
      deliveryLat = geocoded.lat;
      deliveryLng = geocoded.lng;
    }
  }

  const { data, error } = await supabaseAdmin.from("deliveries").upsert(
    {
      external_order_id: externalId,
      pickup_address: "Parada do Açaí VIP",
      delivery_address: deliveryAddress,
      fare: (order.motoboy_remuneration > 0 ? order.motoboy_remuneration : (order.delivery_fee > 0 ? order.delivery_fee : 5)),
      status: "pending",
      offered_at: new Date().toISOString(),
      pickup_lat: PICKUP_LAT,
      pickup_lng: PICKUP_LNG,
      delivery_lat: deliveryLat,
      delivery_lng: deliveryLng,
      multipedidos_order_data: order,
    },
    { onConflict: "external_order_id", ignoreDuplicates: true },
  );

  if (error) throw error;
  return { created: !data ? false : true, id: externalId };
}

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

    console.log(`Processing order ${externalId}: total=${orderTotal}, refCode=${refCode}`);

    const deliveryResult = await createDelivery(order, externalId, supabaseAdmin);

    let referralResult = null;
    if (refCode) {
      referralResult = await creditReferral(refCode, externalId, orderTotal, supabaseAdmin);
      console.log(`Referral credit result for ${refCode}: ${referralResult}`);
    } else {
      console.warn(
        `Order ${externalId} arrived via webhook but NO referral code found in payload.`
      );
    }

    results.push({
      id: externalId,
      delivery: deliveryResult,
      referral_credited: !!referralResult,
      ref_code: refCode,
    });
  }

  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "webhook";

    if (action === "webhook" && req.method === "POST") {
      const body = await req.json();
      const results = await handleWebhook(body);
      return new Response(JSON.stringify({ ok: true, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
