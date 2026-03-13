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

/**
 * Extract referral code from the order payload.
 * We check multiple possible locations since we don't know the exact structure yet.
 */
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
 * Credit the referral commission to the influencer.
 * Returns the sale ID if credited, null if influencer not found or duplicate.
 */
async function creditReferral(
  refCode: string,
  externalId: string,
  orderTotal: number,
  supabaseAdmin: any,
): Promise<string | null> {
  // Find influencer by referral code
  const { data: influencer } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("referral_code", refCode)
    .maybeSingle();

  if (!influencer) {
    console.warn(`Influencer not found for referral code: ${refCode}`);
    return null;
  }

  const { data: saleId, error } = await supabaseAdmin.rpc("credit_referral_commission", {
    _influencer_id: influencer.id,
    _referral_code: refCode,
    _external_order_id: externalId,
    _order_total: orderTotal,
    _commission_rate: 0.10,
  });

  if (error) {
    console.error("Failed to credit referral:", error);
    return null;
  }

  return saleId;
}

/**
 * Create a delivery record for the driver system.
 */
async function createDelivery(order: any, externalId: string, supabaseAdmin: any) {
  // Check if already exists
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

/**
 * WEBHOOK HANDLER
 * The Multipedidos webhook ONLY fires for orders made via referral/tracked links.
 * So every order that arrives here is a referral sale.
 */
async function handleWebhook(body: any) {
  // Log full payload for debugging (crucial during testing)
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

    // 1. Create delivery record for drivers
    const deliveryResult = await createDelivery(order, externalId, supabaseAdmin);

    // 2. Credit referral commission
    let referralResult = null;
    if (refCode) {
      referralResult = await creditReferral(refCode, externalId, orderTotal, supabaseAdmin);
      console.log(`Referral credit result for ${refCode}: ${referralResult}`);
    } else {
      console.warn(
        `Order ${externalId} arrived via webhook but NO referral code found in payload. ` +
        `Check the payload structure above to identify where Multipedidos sends the tracking code.`
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

    // Default: webhook receives referral orders from Multipedidos
    if (action === "webhook" && req.method === "POST") {
      const body = await req.json();
      const results = await handleWebhook(body);
      return new Response(JSON.stringify({ ok: true, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Test auth endpoint
    if (action === "test_auth") {
      // Quick test to verify Multipedidos token works
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
