export const CURLED_BODY_SILHOUETTE_SCALE = 0.4;

const SNAKE_ORDERS = new Set(['serpentes', 'ophidia']);

// Families are more reliable than `ord` in the current catalog, where many
// reptiles do not have the order populated yet.
const SNAKE_FAMILIES = new Set([
  'acrochordidae',
  'aniliidae',
  'anomalepididae',
  'anomaloepididae',
  'atractaspididae',
  'boidae',
  'bolyeriidae',
  'calabariidae',
  'colubridae',
  'cylindrophiidae',
  'dipsadidae',
  'elapidae',
  'gerrhopilidae',
  'homalopsidae',
  'lamprophiidae',
  'leptotyphlopidae',
  'loxocemidae',
  'natricidae',
  'pareidae',
  'prosymnidae',
  'psammophiidae',
  'pseudaspididae',
  'pythonidae',
  'sibynophiidae',
  'tropidophiidae',
  'typhlopidae',
  'uropeltidae',
  'viperidae',
  'xenodermidae',
  'xenopeltidae',
  'xenotyphlopidae',
]);

const MORAY_FAMILIES = new Set(['muraenidae']);

function normalizeTaxon(value) {
  return String(value || '').trim().toLowerCase();
}

export function isSnakeAnimal(animal) {
  const order = normalizeTaxon(
    animal?.suborder ||
    animal?.sub_order ||
    animal?.ord ||
    animal?.order ||
    animal?.taxonomy?.suborder ||
    animal?.taxonomy?.order
  );
  if (SNAKE_ORDERS.has(order)) return true;

  const family = normalizeTaxon(animal?.fam || animal?.family || animal?.taxonomy?.family);
  return SNAKE_FAMILIES.has(family);
}

export function isMorayAnimal(animal) {
  const family = normalizeTaxon(animal?.fam || animal?.family || animal?.taxonomy?.family);
  return MORAY_FAMILIES.has(family);
}

export function getAnimalSilhouetteScale(animal) {
  return isSnakeAnimal(animal) || isMorayAnimal(animal) ? CURLED_BODY_SILHOUETTE_SCALE : 1;
}
