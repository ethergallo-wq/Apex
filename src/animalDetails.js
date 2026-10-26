const pending = new Map();

export function loadAnimalDetails(animal) {
  if (!animal?._detailUrl) return Promise.reject(new Error('Scheda animale non disponibile.'));
  const url = animal._detailUrl;
  if (pending.has(url)) return pending.get(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  const request = fetch(url, { signal: controller.signal })
    .then(async response => {
      if (!response.ok) throw new Error(`Scheda animale: HTTP ${response.status}`);
      const full = await response.json();
      if (String(full?.id) !== String(animal.id)) throw new Error('Scheda animale non valida.');
      return full;
    })
    .finally(() => {
      clearTimeout(timer);
      pending.delete(url);
    });
  pending.set(url, request);
  return request;
}

// Slim records include placeholders (geo:null, empty arrays). They must not
// overwrite full detail fields; only the user's current progress wins.
export function mergeAnimalDetails(full, animal) {
  return {
    ...animal,
    ...full,
    status: animal.status ?? full.status,
    userStatus: animal.userStatus ?? full.userStatus,
    userAnimal: animal.userAnimal ?? full.userAnimal,
    documented: animal.documented ?? full.documented,
  };
}
