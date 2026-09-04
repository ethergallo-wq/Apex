import { getSupabaseAuthErrorMessage } from './supabaseClient';

test('translates fetch failures into a useful login message', () => {
  expect(getSupabaseAuthErrorMessage(new TypeError('Failed to fetch')))
    .toBe('Il servizio di accesso è temporaneamente irraggiungibile. Controlla la connessione e riprova tra poco.');
});

test('reports auth timeouts without exposing an internal error', () => {
  expect(getSupabaseAuthErrorMessage({ code:'AUTH_TIMEOUT', message:'Google login timeout' }))
    .toBe('Il servizio di accesso sta impiegando troppo tempo. Riprova tra poco.');
});
