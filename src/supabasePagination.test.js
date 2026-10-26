import { fetchAllRows } from './supabasePagination';

function source(rows, serverLimit = 1000, errorAt = -1) {
  return jest.fn(() => {
    let start, end;
    return {
      range: function (from, to) { start = from; end = to; return this; },
      abortSignal: async () => start === errorAt
        ? { data: null, error: new Error('Network failed') }
        : { data: rows.slice(start, Math.min(end + 1, start + serverLimit)), error: null },
    };
  });
}

test('reads all 1106 animals beyond the default 1000 row cap', async () => {
  const rows = Array.from({ length: 1106 }, (_, id) => ({ id }));
  const query = source(rows);
  expect(await fetchAllRows(query)).toEqual(rows);
  expect(query).toHaveBeenCalledTimes(4);
});

test('a server cap smaller than the requested page does not silently truncate progress', async () => {
  const rows = Array.from({ length: 230 }, (_, id) => ({ id }));
  expect(await fetchAllRows(source(rows, 100))).toEqual(rows);
});

test('does not expose a partial snapshot when a later page fails', async () => {
  await expect(fetchAllRows(source(Array.from({ length: 600 }, (_, id) => ({ id })), 1000, 500)))
    .rejects.toThrow('Network failed');
});

test('aborts an in-flight request on timeout', async () => {
  jest.useFakeTimers();
  const query = () => ({
    range() { return this; },
    abortSignal: signal => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }),
  });
  const request = fetchAllRows(query, { timeoutMs: 50 });
  const assertion = expect(request).rejects.toThrow('aborted');
  jest.advanceTimersByTime(50);
  await assertion;
  jest.useRealTimers();
});
