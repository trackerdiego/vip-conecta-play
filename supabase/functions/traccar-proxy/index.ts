import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

async function traccarFetch(path: string, method = 'GET', body?: unknown) {
  const TRACCAR_URL = Deno.env.get('TRACCAR_URL')!
  const TRACCAR_USER = Deno.env.get('TRACCAR_USER')!
  const TRACCAR_PASSWORD = Deno.env.get('TRACCAR_PASSWORD')!

  // TRACCAR_URL should be the base (e.g. https://host:port) — we append /api here
  // If TRACCAR_URL already ends with /api, strip it to avoid duplication
  const base = TRACCAR_URL.replace(/\/+$/, '').replace(/\/api$/, '')
  const url = `${base}/api${path}`
  const headers: Record<string, string> = {
    'Authorization': 'Basic ' + btoa(`${TRACCAR_USER}:${TRACCAR_PASSWORD}`),
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const opts: RequestInit = { method, headers }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(url, opts)
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }

  if (!res.ok) {
    throw new Error(`Traccar ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`)
  }
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const userId = claimsData.claims.sub as string
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    let result: unknown

    switch (action) {
      // === DEVICES ===
      case 'create_device': {
        const { name, uniqueId } = await req.json()
        result = await traccarFetch('/devices', 'POST', {
          name,
          uniqueId,
          category: 'motorcycle',
        })
        // Save mapping to DB
        const device = result as { id: number }
        await supabase.from('traccar_devices').insert({
          driver_id: userId,
          traccar_device_id: device.id,
          unique_id: uniqueId,
        })
        break
      }

      case 'get_device': {
        const { data: mapping } = await supabase
          .from('traccar_devices')
          .select('*')
          .eq('driver_id', userId)
          .maybeSingle()
        if (!mapping) {
          result = null
          break
        }
        result = await traccarFetch(`/devices?id=${mapping.traccar_device_id}`)
        break
      }

      case 'list_devices': {
        result = await traccarFetch('/devices')
        break
      }

      // === POSITIONS ===
      case 'update_position': {
        const { lat, lng, heading, speed, uniqueId } = await req.json()
        // Use OsmAnd protocol for position reporting
        const TRACCAR_URL = Deno.env.get('TRACCAR_URL')!.replace(/\/$/, '')
        const params = new URLSearchParams({
          id: uniqueId,
          lat: String(lat),
          lon: String(lng),
          speed: String(speed || 0),
          bearing: String(heading || 0),
          timestamp: String(Math.floor(Date.now() / 1000)),
        })
        const posRes = await fetch(`${TRACCAR_URL}/?${params.toString()}`)
        const posText = await posRes.text()
        result = { ok: posRes.ok, response: posText }
        break
      }

      case 'get_positions': {
        const deviceId = url.searchParams.get('deviceId')
        result = await traccarFetch(`/positions${deviceId ? `?deviceId=${deviceId}` : ''}`)
        break
      }

      // === REPORTS ===
      case 'route_report': {
        const deviceId = url.searchParams.get('deviceId')
        const from = url.searchParams.get('from')
        const to = url.searchParams.get('to')
        result = await traccarFetch(`/reports/route?deviceId=${deviceId}&from=${from}&to=${to}`)
        break
      }

      // === GEOFENCES ===
      case 'create_geofence': {
        const body = await req.json()
        result = await traccarFetch('/geofences', 'POST', body)
        break
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
