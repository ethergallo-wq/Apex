export const APEX_BOOT_MESSAGES = [
  'Lucidando gli zoccoli agli equini…',
  'Contando le zampe dei millepiedi…',
  'Svegliando i gufi con delicatezza…',
  'Aspettando la conferma dal bradipo…',
  'Insegnando a parlare ai pappagalli…',
  'Mettendo in fila i pinguini…',
  'Colorando i camaleonti…',
  'Contando le pecore…',
  'Mettendo in equilibrio i fenicotteri…',
  'Riempiendo le gobbe dei cammelli…',
  'Appendendo i pipistrelli…',
  'Sotterrando le talpe…',
  'Pulendo le lenti dei cannocchiali…',
  'Allacciando le scarpe da trekking…',
  'Riempiendo le bombole da immersione…',
  'Cercando i leocorni…',
  'Affilando i denti degli squali…',
  'Caricando gli animali nella tua zona…',
  'Cercando gli avvistamenti più recenti…',
  'Preparando le destinazioni migliori…',
  'Caricando le tue esplorazioni…',
  'Ricostruendo l’albero tassonomico…',
  'Sincronizzando i tuoi progressi…',
  'Caricando i tuoi badge…',
];

// 20 specie strane — thumb WebP leggere (~24 KB) invece delle PNG full-size (~800 KB).
const APEX_BOOT_ANIMAL_IDS = [
  'ornithorhynchus-anatinus',
  'tachyglossus-aculeatus',
  'daubentonia-madagascariensis',
  'condylura-cristata',
  'nasalis-larvatus',
  'okapia-johnstoni',
  'psychrolutes-marcidus',
  'milnesium-tardigradum',
  'pipa-pipa',
  'phyllium-giganteum',
  'uroplatus-phantasticus',
  'chlamyphorus-truncatus',
  'moloch-horridus',
  'chlamydoselachus-anguineus',
  'thaumoctopus-mimicus',
  'vampyroteuthis-infernalis',
  'ambystoma-mexicanum',
  'balaeniceps-rex',
  'saiga-tatarica',
  'opisthocomus-hoazin',
];

export const APEX_BOOT_ANIMAL_IMAGES = APEX_BOOT_ANIMAL_IDS.map(
  (id) => `/animals/thumbs/${id}.webp`,
);

export function pickRandomBootMessage(messages = APEX_BOOT_MESSAGES, exclude = null) {
  const pool = (messages || []).filter(Boolean);
  if (!pool.length) return 'Apertura Apex…';
  const candidates = exclude == null ? pool : pool.filter(msg => msg !== exclude);
  const source = candidates.length ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export function preloadBootImages(images = APEX_BOOT_ANIMAL_IMAGES, startIndex = 0, count = 3) {
  if (typeof window === 'undefined') return;
  const list = (images || []).filter(Boolean);
  if (!list.length) return;
  const limit = Math.min(count, list.length);
  for (let i = 0; i < limit; i += 1) {
    const src = list[(startIndex + i) % list.length];
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  }
}
