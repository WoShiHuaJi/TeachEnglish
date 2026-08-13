const ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/

function getId(request) {
  const id = new URL(request.url).searchParams.get('id')
  return id && ID_PATTERN.test(id) ? id : null
}

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' }

export async function onRequestGet(context) {
  const id = getId(context.request)
  if (!id) return new Response(JSON.stringify({ error: 'invalid id' }), { status: 400, headers: JSON_HEADERS })
  const value = await context.env.PROGRESS_KV.get(id)
  return new Response(value || '{}', { headers: JSON_HEADERS })
}

export async function onRequestPut(context) {
  const id = getId(context.request)
  if (!id) return new Response(JSON.stringify({ error: 'invalid id' }), { status: 400, headers: JSON_HEADERS })
  const body = await context.request.text()
  if (body.length > 512 * 1024) {
    return new Response(JSON.stringify({ error: 'payload too large' }), { status: 413, headers: JSON_HEADERS })
  }
  await context.env.PROGRESS_KV.put(id, body)
  return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS })
}
