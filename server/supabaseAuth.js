const { createClient } = require('@supabase/supabase-js');

function httpError(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

// Validate the token with Auth; never trust user IDs or emails in the payload.
async function authenticateRequest(req) {
  const match = /^Bearer\s+(\S+)$/i.exec(req.headers?.authorization || '');
  if (!match) throw httpError(401, 'Accedi per continuare.');
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!url || !key) throw httpError(503, 'Servizio temporaneamente non configurato.');

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      headers: { Authorization: `Bearer ${match[1]}` },
      fetch: (input, init = {}) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }),
    },
  });
  let result;
  try {
    result = await client.auth.getUser(match[1]);
  } catch {
    throw httpError(503, 'Servizio di accesso temporaneamente irraggiungibile.');
  }
  if (result.error || !result.data?.user?.id) {
    const unavailable = !result.error?.status || result.error.status >= 500;
    throw httpError(unavailable ? 503 : 401, unavailable
      ? 'Servizio di accesso temporaneamente irraggiungibile.'
      : 'Sessione scaduta. Accedi di nuovo.');
  }
  return { user: result.data.user, client };
}

function parseObjectBody(req, maxBytes) {
  const raw = req.body;
  let body;
  try {
    const text = typeof raw === 'string' ? raw : JSON.stringify(raw);
    if (!text) throw new Error('Missing body');
    if (Buffer.byteLength(text) > maxBytes) throw httpError(413, 'Richiesta troppo grande.');
    body = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (error) {
    if (error.statusCode) throw error;
    throw httpError(400, 'Payload non valido.');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw httpError(400, 'Payload non valido.');
  return body;
}

module.exports = { authenticateRequest, httpError, parseObjectBody };
