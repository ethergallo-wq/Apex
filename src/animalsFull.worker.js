import { ANIMALS } from './animals-data';

const animalsById = new Map(ANIMALS.map(animal => [String(animal?.id), animal]));

globalThis.onmessage = event => {
  const requestId = event?.data?.requestId;
  const animalId = String(event?.data?.animalId || '');
  globalThis.postMessage({ requestId, animal:animalsById.get(animalId) || null });
};
