export const SNAKE_SILHOUETTE_SCALE = 0.4;

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
  if (SNAKE_FAMILIES.has(family)) return true;

  // A populated non-snake family is stronger evidence than a common name such
  // as "tartaruga collo-serpente" or a scientific epithet like "serpentina".
  if (family) return false;
  if (normalizeTaxon(animal?.cls || animal?.class) !== 'reptilia') return false;

  const names = normalizeTaxon(`${animal?.com || ''} ${animal?.com_en || ''}`);
  return /\b(serpente|snake|vipera|viper|cobra|mamba|pitone|python|boa|anaconda|crotalo|rattlesnake|colubro|biacco)\b/.test(names);
}

export function getAnimalSilhouetteScale(animal) {
  return isSnakeAnimal(animal) ? SNAKE_SILHOUETTE_SCALE : 1;
}
