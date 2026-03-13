import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory JWT cache
let cachedJwt: string | null = null;
let jwtExpiresAt = 0;

async function getMultipedidosJwt(): Promise<string> {
  if (cachedJwt && Date.now() < jwtExpiresAt) return cachedJwt;

  const token = Deno.env.get("MULTIPEDIDOS_INTEGRATION_TOKEN");
  if (!token) throw new Error("MULTIPEDIDOS_INTEGRATION_TOKEN not set");

  const res = await fetch("https://api.multipedidos.com.br/integration/auth/login", {
    method: "POST",
    headers: { "x-integration-token": token },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Multipedidos auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedJwt = data.token;
  // Refresh 5 min before expiry (JWT lasts 60 min)
  jwtExpiresAt = Date.now() + 55 * 60 * 1000;
  return cachedJwt!;
}

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// Poll orders from Multipedidos API
async function pollOrders() {
  const jwt = await getMultipedidosJwt();
  const restaurantId = Deno.env.get("MULTIPEDIDOS_RESTAURANT_ID");
  if (!restaurantId) throw new Error("MULTIPEDIDOS_RESTAURANT_ID not set");

  // Query orders from last 2 hours
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  const formatDate = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const res = await fetch(
    `https://api.multipedidos.com.br/restaurant/${restaurantId}/order/query/paginate/0/100`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        columnsTerms: {
          createdAt: `${formatDate(twoHoursAgo)} -> ${formatDate(now)}`,
        },
        sortSettings: { createdAt: "desc" },
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Multipedidos poll failed (${res.status}): ${text}`);
  }

  const orders = await res.json();
  return Array.isArray(orders) ? orders : [];
}

// Process a single order into a delivery record
async function processOrder(order: any, supabaseAdmin: any) {
  const externalId = String(order.id);

  // Check if already exists
  const { data: existing } = await supabaseAdmin
    .from("deliveries")
    .select("id")
    .eq("external_order_id", externalId)
    .maybeSingle();

  if (existing) return { skipped: true, id: externalId };

  // Build delivery address from order data
  const deliveryAddress = order.address
    ? `${order.address.street || ""}, ${order.address.number || ""} - ${order.address.neighborhood || ""}, ${order.address.city || ""}`
    : order.delivery_type === "table"
      ? `Mesa: ${order.table || "N/A"}`
      : "Endereço não informado";

  const pickupAddress = "Parada do Açaí VIP"; // Default restaurant address

  const { error } = await supabaseAdmin.from("deliveries").insert({
    external_order_id: externalId,
    pickup_address: pickupAddress,
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

// Webhook handler — receives POST from Multipedidos
async function handleWebhook(body: any) {
  const supabaseAdmin = getSupabaseAdmin();
  const orders = Array.isArray(body) ? body : [body];
  const results = [];

  for (const order of orders) {
    const result = await processOrder(order, supabaseAdmin);
    results.push(result);
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

    // Webhook: public POST from Multipedidos (no auth needed)
    if (action === "webhook" && req.method === "POST") {
      const body = await req.json();
      const results = await handleWebhook(body);
      return new Response(JSON.stringify({ ok: true, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Poll: authenticated call from our app
    if (action === "poll") {
      // Validate internal auth
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabaseAdmin = getSupabaseAdmin();
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );

      const { data: claims, error: claimsError } = await supabaseClient.auth.getClaims(
        authHeader.replace("Bearer ", ""),
      );
      if (claimsError || !claims?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const orders = await pollOrders();
      const results = [];
      for (const order of orders) {
        const result = await processOrder(order, supabaseAdmin);
        results.push(result);
      }

      return new Response(
        JSON.stringify({ ok: true, total: orders.length, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Auth test: check if token works
    if (action === "test_auth") {
      const jwt = await getMultipedidosJwt();
      return new Response(
        JSON.stringify({ ok: true, jwt_preview: jwt.substring(0, 20) + "..." }),
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
