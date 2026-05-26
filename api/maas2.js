export const config = { runtime: 'edge' }

const UPSTREAM = 'https://api.maas2.apollorion.com/'

export default async function handler() {
  try {
    const upstream = await fetch(UPSTREAM, { headers: { Accept: 'application/json' } })
    const text = await upstream.text()
    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: 'maas2_upstream_error', status: upstream.status, body: text.slice(0, 500) }),
        {
          status: 502,
          headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
            'cache-control': 'no-store',
          },
        },
      )
    }
    try {
      JSON.parse(text)
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'maas2_response_not_json', detail: String(err), body: text.slice(0, 500) }),
        {
          status: 502,
          headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
            'cache-control': 'no-store',
          },
        },
      )
    }
    return new Response(text, {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'maas2_unreachable', detail: String(err) }),
      {
        status: 502,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
          'cache-control': 'no-store',
        },
      },
    )
  }
}
