(function () {
  var MESSAGES = [
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
  var ANIMALS = [
    '/animals/thumbs/ornithorhynchus-anatinus.webp',
    '/animals/thumbs/tachyglossus-aculeatus.webp',
    '/animals/thumbs/daubentonia-madagascariensis.webp',
    '/animals/thumbs/condylura-cristata.webp',
    '/animals/thumbs/nasalis-larvatus.webp',
    '/animals/thumbs/okapia-johnstoni.webp',
    '/animals/thumbs/psychrolutes-marcidus.webp',
    '/animals/thumbs/milnesium-tardigradum.webp',
    '/animals/thumbs/pipa-pipa.webp',
    '/animals/thumbs/phyllium-giganteum.webp',
    '/animals/thumbs/uroplatus-phantasticus.webp',
    '/animals/thumbs/chlamyphorus-truncatus.webp',
    '/animals/thumbs/moloch-horridus.webp',
    '/animals/thumbs/chlamydoselachus-anguineus.webp',
    '/animals/thumbs/thaumoctopus-mimicus.webp',
    '/animals/thumbs/vampyroteuthis-infernalis.webp',
    '/animals/thumbs/ambystoma-mexicanum.webp',
    '/animals/thumbs/balaeniceps-rex.webp',
    '/animals/thumbs/saiga-tatarica.webp',
    '/animals/thumbs/opisthocomus-hoazin.webp',
  ];
  var ANIMAL_FLIP_MS = 333;
  var MESSAGE_FLIP_MS = 3000;

  function pickRandomMessage(exclude) {
    var pool = exclude == null ? MESSAGES.slice() : MESSAGES.filter(function (msg) { return msg !== exclude; });
    if (!pool.length) pool = MESSAGES.slice();
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function preloadAround(list, index, count) {
    if (!list.length) return;
    var limit = Math.min(count || 3, list.length);
    for (var i = 0; i < limit; i += 1) {
      var src = list[(index + i) % list.length];
      var img = new Image();
      img.decoding = 'async';
      img.src = src;
    }
  }

  function init() {
    var root = document.getElementById('apex-inline-boot');
    if (!root) return;

    var animalWrap = document.getElementById('apex-inline-boot-animal');
    var msg = document.getElementById('apex-inline-boot-message');
    if (!animalWrap || !msg) return;

    var animalImg = document.createElement('img');
    animalImg.alt = '';
    animalImg.width = 58;
    animalImg.height = 58;
    animalImg.decoding = 'async';
    animalImg.style.cssText = 'width:58px;height:58px;object-fit:contain;display:block';
    animalWrap.appendChild(animalImg);

    msg.textContent = pickRandomMessage();
    msg.className = 'apex-boot-text-shimmer';

    var animalIdx = 0;
    var activeMessage = msg.textContent;
    if (ANIMALS.length) {
      animalImg.src = ANIMALS[0];
      preloadAround(ANIMALS, 0, 4);
    }

    window.setInterval(function () {
      if (!ANIMALS.length) return;
      animalIdx = (animalIdx + 1) % ANIMALS.length;
      animalImg.src = ANIMALS[animalIdx];
      preloadAround(ANIMALS, animalIdx + 1, 2);
    }, ANIMAL_FLIP_MS);

    window.setInterval(function () {
      activeMessage = pickRandomMessage(activeMessage);
      msg.textContent = activeMessage;
      msg.className = 'apex-boot-text-shimmer apex-boot-message-fade';
    }, MESSAGE_FLIP_MS);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
