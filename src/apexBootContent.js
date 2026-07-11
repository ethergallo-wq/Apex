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

// 20 specie curate tra le più strane del catalogo Apex — solo PNG esistenti in /public/animals/.
export const APEX_BOOT_ANIMAL_IMAGES = [
  '/animals/ornithorhynchus-anatinus.png',      // ornitorinco
  '/animals/tachyglossus-aculeatus.png',        // echidna
  '/animals/daubentonia-madagascariensis.png',  // aye-aye
  '/animals/condylura-cristata.png',            // talpa dal naso a stella
  '/animals/nasalis-larvatus.png',              // naso scimmia
  '/animals/okapia-johnstoni.png',              // okapi
  '/animals/psychrolutes-marcidus.png',         // pesce blob
  '/animals/milnesium-tardigradum.png',          // tardigrado
  '/animals/pipa-pipa.png',                     // rana pipa
  '/animals/phyllium-giganteum.png',            // insetto foglia
  '/animals/uroplatus-phantasticus.png',        // geco coda-foglia
  '/animals/chlamyphorus-truncatus.png',        // armadillo rosa
  '/animals/moloch-horridus.png',               // diavolo spinoso
  '/animals/chlamydoselachus-anguineus.png',    // squalo frangine
  '/animals/thaumoctopus-mimicus.png',          // polpo mimico
  '/animals/vampyroteuthis-infernalis.png',      // calamaro vampiro
  '/animals/ambystoma-mexicanum.png',           // axolotl
  '/animals/balaeniceps-rex.png',               // becco a scarpa
  '/animals/saiga-tatarica.png',                // antilope dal naso gonfio
  '/animals/opisthocomus-hoazin.png',           // hoatzin
].filter(Boolean);

export function pickRandomBootMessage(messages = APEX_BOOT_MESSAGES, exclude = null) {
  const pool = (messages || []).filter(Boolean);
  if (!pool.length) return 'Apertura Apex…';
  const candidates = exclude == null ? pool : pool.filter(msg => msg !== exclude);
  const source = candidates.length ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export function preloadBootImages(images = APEX_BOOT_ANIMAL_IMAGES) {
  if (typeof window === 'undefined') return;
  (images || []).filter(Boolean).forEach((src) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  });
}
