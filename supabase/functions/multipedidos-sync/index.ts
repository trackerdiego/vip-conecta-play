import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

/**
 * Get the commission rate for a given level from the commission_rates table.
 * Falls back to 0.01 (1%) if not found.
 */
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
  // Find influencer by referral code, including their level
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

async function createDelivery(order: any, externalId: string, supabaseAdmin: any) {
  const { data: existing } = await supabaseAdmin
    .from("deliveries")
    .select("id")
    .eq("external_order_id", externalId)
    .maybeSingle();

  if (existing) return { skipped: true, id: externalId };

  const deliveryAddress = order.address
    ? `${order.address.street || ""}, ${order.address.number || ""} - ${order.address.neighborhood || ""}, ${order.address.city || ""}`
    : order.delivery_type === "table"
      ? `Mesa: ${order.table || "N/A"}`
      : "Endereço não informado";

  const { error } = await supabaseAdmin.from("deliveries").insert({
    external_order_id: externalId,
    pickup_address: "Parada do Açaí VIP",
    delivery_address: deliveryAddress,
    fare: order.total || 0,
    status: "pending",
    offered_at: new Date().toISOString(),
    pickup_lat: order.pickup_lat || null,
    pickup_lng: order.pickup_lng || null,
    delivery_lat: order.address?.latitude || null,
    delivery_lng: order.address?.longitude || null,
    multipedidos_order_data: order,
  });

  if (error) throw error;
  return { created: true, id: externalId };
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
