import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generic proxy to DocuSeal's "create submission from HTML" API — keeps the
// DOCUSEAL_API_KEY secret off the client. Callers supply the document HTML
// (with <signature-field>/<date-field> tags already embedded) and who's
// signing; this just forwards the request and returns the embed slug.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  try {
    const { documentTitle, html, submitterName, submitterEmail } = await req.json()
    const apiKey = Deno.env.get('DOCUSEAL_API_KEY')
    if (!apiKey) throw new Error('DOCUSEAL_API_KEY not configured')

    const res = await fetch('https://api.docuseal.com/submissions/html', {
      method: 'POST',
      headers: { 'X-Auth-Token': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: documentTitle,
        documents: [{ name: documentTitle, html }],
        submitters: [{ role: 'Signer', name: submitterName, email: submitterEmail }],
        send_email: false,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return new Response(JSON.stringify({ error: errText }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const submission = await res.json()
    const slug = submission.submitters?.[0]?.slug
    return new Response(JSON.stringify({ slug }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
