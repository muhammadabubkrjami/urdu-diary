// Netlify Function: secure same-origin proxy for the public Aruuz API.
// It keeps the browser from calling aruuz.com directly, avoiding CORS issues.

const API = {
  taqti: 'https://aruuz.com/api/default/gettaqti',
  islah: 'https://aruuz.com/api/default/getIslah',
  oneLine: 'https://aruuz.com/api/default/getIslahOneLine'
};

export default async (request) => {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const text = url.searchParams.get('text') || '';
  const meter = url.searchParams.get('meter') || '';

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }

  if (!['taqti', 'islah', 'oneLine'].includes(type)) {
    return new Response(JSON.stringify({ error: 'Invalid API type' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }

  if (!text.trim()) {
    return new Response(JSON.stringify({ error: 'Text is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }

  if (type === 'oneLine' && !meter.trim()) {
    return new Response(JSON.stringify({ error: 'Meter is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }

  const endpoint = API[type];
  const target = new URL(endpoint);
  target.searchParams.set('text', text);
  if (type === 'oneLine') target.searchParams.set('meter', meter);

  try {
    const upstream = await fetch(target, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const body = await upstream.text();

    return new Response(body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Aruuz API request failed' }), {
      status: 502,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });
  }
};
  
