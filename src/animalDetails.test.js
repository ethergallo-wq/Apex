import { loadAnimalDetails, mergeAnimalDetails } from './animalDetails';

const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

test('fetches only the selected animal and deduplicates concurrent requests', async () => {
  const full = { id: 7, bio: 'Details', geo: { iso: ['IT'] } };
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => full });
  const animal = { id: 7, _detailUrl: '/data/animal-details/7.hash.json' };
  const first = loadAnimalDetails(animal);
  const second = loadAnimalDetails(animal);
  expect(first).toBe(second);
  expect(await first).toEqual(full);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch.mock.calls[0][0]).toBe(animal._detailUrl);
});

test('failed and mismatched responses can be retried', async () => {
  const animal = { id: 8, _detailUrl: '/data/animal-details/8.hash.json' };
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: false, status: 503 })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 9 }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 8 }) });
  await expect(loadAnimalDetails(animal)).rejects.toThrow('503');
  await expect(loadAnimalDetails(animal)).rejects.toThrow('non valida');
  await expect(loadAnimalDetails(animal)).resolves.toEqual({ id: 8 });
});

test('detail hydration restores geography and descriptions without losing user progress', () => {
  const full = { id: 1, geo: { iso: ['IT'] }, bioregions_v4: ['MED'], bio: 'Biology', status: 'locked' };
  const slim = { id: 1, geo: null, bioregions_v4: [], status: 'catturato', documented: true };
  expect(mergeAnimalDetails(full, slim)).toMatchObject({
    geo: { iso: ['IT'] }, bioregions_v4: ['MED'], bio: 'Biology', status: 'catturato', documented: true,
  });
});
