export const APEX_BOOT_MESSAGES = [
  'Lucidando gli zoccoli degli equini…',
  'Contando le macchie dei leopardi…',
  'Riscaldando le ali dei colibrì…',
  'Stirando le antenne delle farfalle…',
  'Sincronizzando i branchi di pesci…',
  'Spiegando ai pinguini perché volano sott’acqua…',
  'Misurando la lingua del camaleonte…',
  'Convincendo l’ornitorinco che è un mammifero…',
  'Controllando se i polpi hanno davvero tre cuori…',
  'Chiedendo al koala quante ore ha dormito oggi…',
  'Allineando le strisce delle zebre al carrello…',
];

export const APEX_BOOT_ANIMAL_IMAGES = [
  '/animals/acinonyx-jubatus.png',
  '/animals/amblyrhynchus-cristatus.png',
  '/animals/amphiprion-ocellaris.png',
  '/animals/panthera-leo.png',
  '/animals/ursus-arctos.png',
  '/animals/loxodonta-africana.png',
  '/animals/giraffa-camelopardalis.png',
  '/animals/accipiter-nisus.png',
  '/animals/anax-imperator.png',
  '/animals/passer-domesticus.png',
  '/animals/delphinus-delphis.png',
  '/animals/chamaeleo-africanus.png',
  '/animals/crocodylus-niloticus.png',
  '/animals/equus-quagga.png',
  '/animals/falco-peregrinus.png',
  '/animals/gorilla-beringei.png',
  '/animals/hippopotamus-amphibius.png',
  '/animals/lama-glama.png',
  '/animals/meleagris-gallopavo.png',
  '/animals/octopus-vulgaris.png',
  '/animals/pongo-pygmaeus.png',
  '/animals/tursiops-truncatus.png',
  '/animals/salamandra-salamandra.png',
].filter(Boolean);

export function buildMarqueeTrack(images = APEX_BOOT_ANIMAL_IMAGES, repeat = 2) {
  const base = (images || []).filter(Boolean);
  if (!base.length) return [];
  return Array.from({ length: repeat }, () => base).flat();
}

export function pickBootSpotlightImages(images = APEX_BOOT_ANIMAL_IMAGES, count = 5, offset = 0) {
  const base = (images || []).filter(Boolean);
  if (!base.length) return [];
  const picked = [];
  for (let i = 0; i < count; i += 1) {
    picked.push(base[(offset + i) % base.length]);
  }
  return picked;
}

export function preloadBootImages(images = APEX_BOOT_ANIMAL_IMAGES) {
  if (typeof window === 'undefined') return;
  (images || []).filter(Boolean).forEach((src) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  });
}
