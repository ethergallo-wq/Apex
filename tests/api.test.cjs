const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const identify = require('../api/identify-animal');
const requestAdd = require('../api/request-animal-add');

const originalFetch = global.fetch;
const originalEnv = { ...process.env };
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'owner@example.test' };
let calls;
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });

beforeEach(() => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'public-test-key';
  process.env.OPENAI_API_KEY = 'test-key';
  delete process.env.RESEND_API_KEY;
  calls = [];
  global.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).includes('/auth/v1/user')) return json(user);
    if (String(url).includes('/rest/v1/animal_add_requests')) return json({ id: 'request-id' });
    if (String(url).includes('api.openai.com')) return json({ output_text: JSON.stringify({ identification_status: 'unusable', alternatives: [] }) });
    throw new Error('Unexpected network call');
  };
});

afterEach(() => {
  global.fetch = originalFetch;
  for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
  Object.assign(process.env, originalEnv);
});

async function invoke(handler, body, authorization = 'Bearer test-token', method = 'POST') {
  const headers = {};
  let result;
  const res = {
    setHeader: (key, value) => { headers[key] = value; },
    end: value => { result = JSON.parse(value); },
  };
  await handler({ method, body, headers: authorization ? { authorization } : {} }, res);
  return { status: res.statusCode, body: result, headers };
}

test('both APIs reject anonymous callers before any paid call or database write', async () => {
  for (const handler of [identify, requestAdd]) {
    const result = await invoke(handler, { image_data_url: 'data:image/jpeg;base64,YQ==', common_name: 'Lion' }, '');
    assert.equal(result.status, 401);
    assert.equal(result.headers['Cache-Control'], 'no-store');
  }
  assert.equal(calls.length, 0);
});

test('invalid tokens cannot invoke identification', async () => {
  global.fetch = async () => json({ message: 'Invalid JWT', code: 'bad_jwt' }, 401);
  const result = await invoke(identify, { image_data_url: 'data:image/jpeg;base64,YQ==' });
  assert.equal(result.status, 401);
});

test('Auth unavailability fails closed with 503', async () => {
  global.fetch = async () => { throw new DOMException('timeout', 'TimeoutError'); };
  const result = await invoke(identify, { image_data_url: 'data:image/jpeg;base64,YQ==' });
  assert.equal(result.status, 503);
});

test('request identity comes from Auth and database writes retain the caller JWT', async () => {
  const result = await invoke(requestAdd, { common_name: 'Lion', user_id: 'forged-user', user_email: 'forged@example.test', lat: 0, lng: 0 });
  assert.equal(result.status, 200);
  const write = calls.find(call => call.url.includes('/rest/v1/'));
  const row = JSON.parse(write.init.body);
  assert.equal(row.user_id, user.id);
  assert.equal(row.user_email, user.email);
  assert.equal(row.lat, 0);
  assert.equal(row.lng, 0);
  assert.equal(new Headers(write.init.headers).get('authorization'), 'Bearer test-token');
});

test('invalid coordinates, malformed payloads and oversize requests are rejected', async () => {
  assert.equal((await invoke(requestAdd, { common_name: 'Lion', lat: 100 })).status, 400);
  assert.equal((await invoke(requestAdd, null)).status, 400);
  assert.equal((await invoke(identify, 'invalid json')).status, 400);
  assert.equal((await invoke(identify, { image_data_url: 'x'.repeat(4_000_001) })).status, 413);
  assert.equal((await invoke(identify, [])).status, 400);
});

test('identification only accepts inline images or this project storage', async () => {
  assert.equal((await invoke(identify, { image_url: 'https://other.example/photo.jpg' })).status, 400);
  assert.equal((await invoke(identify, { image_data_url: 'data:text/html;base64,YQ==' })).status, 400);
  assert.equal((await invoke(identify, { image_data_url: 'data:image/jpeg;base64,YQ==', candidates: [null] })).status, 200);
  assert.ok(calls.find(call => call.url.includes('api.openai.com')).init.signal);
});

test('upstream timeouts and failures produce bounded, generic errors', async () => {
  global.fetch = async url => {
    if (String(url).includes('/auth/')) return json(user);
    throw new DOMException('timeout', 'TimeoutError');
  };
  assert.equal((await invoke(identify, { image_data_url: 'data:image/jpeg;base64,YQ==' })).status, 504);
  global.fetch = async url => String(url).includes('/auth/') ? json(user) : json({ error: { message: 'private provider diagnostics' } }, 500);
  const result = await invoke(identify, { image_data_url: 'data:image/jpeg;base64,YQ==' });
  assert.equal(result.status, 502);
  assert.doesNotMatch(JSON.stringify(result.body), /private provider/);
});
