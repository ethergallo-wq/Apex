import { fetchSocialProfilesByIds, SOCIAL_PROFILE_COLUMNS } from './socialProfiles';

test('uses bounded RPC batches without fetching private profile columns', async () => {
  const ids = Array.from({ length: 205 }, (_, i) => `user-${i}`);
  const client = { rpc: jest.fn((name, { p_user_ids }) => Promise.resolve({ data: p_user_ids.map(user_id => ({ user_id })) })), from: jest.fn() };
  expect((await fetchSocialProfilesByIds(client, ids)).length).toBe(205);
  expect(client.rpc.mock.calls.map(call => call[1].p_user_ids.length)).toEqual([200, 5]);
  expect(client.from).not.toHaveBeenCalled();
});

test('only a missing RPC permits the safe-column compatibility fallback', async () => {
  const query = { select: jest.fn(() => query), in: jest.fn(() => query), abortSignal: jest.fn(async () => ({ data: [{ user_id: 'friend' }] })) };
  const client = { rpc: jest.fn(async () => ({ error: { code: 'PGRST202' } })), from: jest.fn(() => query) };
  await expect(fetchSocialProfilesByIds(client, ['friend'])).resolves.toEqual([{ user_id: 'friend' }]);
  expect(query.select).toHaveBeenCalledWith(SOCIAL_PROFILE_COLUMNS);
  expect(SOCIAL_PROFILE_COLUMNS).not.toMatch(/email|phone|birth|answers|\*/);
  client.rpc.mockResolvedValue({ error: { code: '42501' } });
  client.from.mockClear();
  await expect(fetchSocialProfilesByIds(client, ['friend'])).rejects.toMatchObject({ code: '42501' });
  expect(client.from).not.toHaveBeenCalled();
});
