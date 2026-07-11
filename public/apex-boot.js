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
    '/animals/ornithorhynchus-anatinus.png',
    '/animals/tachyglossus-aculeatus.png',
    '/animals/daubentonia-madagascariensis.png',
    '/animals/condylura-cristata.png',
    '/animals/nasalis-larvatus.png',
    '/animals/okapia-johnstoni.png',
    '/animals/psychrolutes-marcidus.png',
    '/animals/milnesium-tardigradum.png',
    '/animals/pipa-pipa.png',
    '/animals/phyllium-giganteum.png',
    '/animals/uroplatus-phantasticus.png',
    '/animals/chlamyphorus-truncatus.png',
    '/animals/moloch-horridus.png',
    '/animals/chlamydoselachus-anguineus.png',
    '/animals/thaumoctopus-mimicus.png',
    '/animals/vampyroteuthis-infernalis.png',
    '/animals/ambystoma-mexicanum.png',
    '/animals/balaeniceps-rex.png',
    '/animals/saiga-tatarica.png',
    '/animals/opisthocomus-hoazin.png',
  ];
  var ANIMAL_FLIP_MS = 333;
  var MESSAGE_FLIP_MS = 3000;

  function pickRandomMessage(exclude) {
    var pool = exclude == null ? MESSAGES.slice() : MESSAGES.filter(function (msg) { return msg !== exclude; });
    if (!pool.length) pool = MESSAGES.slice();
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function preloadImages() {
    ANIMALS.forEach(function (src) {
      var img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }

  function init() {
    var root = document.getElementById('apex-inline-boot');
    if (!root) return;
    root.innerHTML = '';
    root.style.cssText = 'min-height:100vh;min-height:100dvh;background:radial-gradient(circle at 50% 18%, rgba(184,77,58,.16), transparent 42%), #111113;color:white;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';

    var shell = document.createElement('div');
    shell.style.cssText = 'width:100%;max-width:360px;display:flex;flex-direction:column;align-items:center;gap:18px;text-align:center';

    var animalWrap = document.createElement('div');
    animalWrap.style.cssText = 'min-height:58px;display:flex;align-items:center;justify-content:center';

    var animalImg = document.createElement('img');
    animalImg.alt = '';
    animalImg.width = 58;
    animalImg.height = 58;
    animalImg.decoding = 'async';
    animalImg.style.cssText = 'width:58px;height:58px;object-fit:contain;display:block';
    animalWrap.appendChild(animalImg);
    shell.appendChild(animalWrap);

    var msg = document.createElement('div');
    msg.id = 'apex-inline-boot-message';
    msg.style.cssText = 'min-height:48px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.82);font-weight:900;font-size:15px;line-height:1.35;padding:0 8px';
    msg.textContent = pickRandomMessage();
    shell.appendChild(msg);

    root.appendChild(shell);
    preloadImages();

    var animalIdx = 0;
    var activeMessage = msg.textContent;
    if (ANIMALS.length) animalImg.src = ANIMALS[0];

    window.setInterval(function () {
      if (!ANIMALS.length) return;
      animalIdx = (animalIdx + 1) % ANIMALS.length;
      animalImg.src = ANIMALS[animalIdx];
    }, ANIMAL_FLIP_MS);

    window.setInterval(function () {
      activeMessage = pickRandomMessage(activeMessage);
      msg.textContent = activeMessage;
    }, MESSAGE_FLIP_MS);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
