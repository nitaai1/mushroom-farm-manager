import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization) return json({ error: 'Sign in is required' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authorization } } },
    )
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return json({ error: 'Invalid session' }, 401)

    const { to, farmName, message } = await request.json()
    const email = String(to ?? '').trim()
    const name = String(farmName ?? 'Mushroom Farm').slice(0, 120)
    const text = String(message ?? '').slice(0, 20000)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !text) {
      return json({ error: 'A valid recipient and order message are required' }, 400)
    }

    const apiKey = Deno.env.get('RESEND_API_KEY')
    const from = Deno.env.get('ORDER_FROM_EMAIL')
    if (!apiKey || !from) {
      return json({ error: 'Email service is not configured' }, 503)
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: `${name}: items ready to order`,
        text,
      }),
    })
    const result = await response.json()
    if (!response.ok) {
      return json({ error: result?.message ?? 'Email delivery failed' }, 502)
    }

    return json({ sent: true, id: result.id })
  } catch {
    return json({ error: 'Unable to send the order email' }, 500)
  }
})
