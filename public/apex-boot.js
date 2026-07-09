(function () {
  var MESSAGES = [
    'Lucidando gli zoccoli degli equini…',
    'Contando le macchie dei leopardi…',
    'Riscaldando le ali dei colibrì…',
    'Stirando le antenne delle farfalle…',
    'Sincronizzando i branchi di pesci…',
  ];
  var ANIMALS = [
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
    '/animals/octopus-vulgaris.png',
    '/animals/pongo-pygmaeus.png',
    '/animals/tursiops-truncatus.png',
  ];

  function buildTrack(list, reverse) {
    var base = reverse ? list.slice().reverse() : list.slice();
    return base.concat(base);
  }

  function renderTrack(container, list, reverse, duration) {
    var track = document.createElement('div');
    track.className = reverse ? 'apex-boot-marquee-track-reverse' : 'apex-boot-marquee-track';
    track.style.animationDuration = duration + 's';
    buildTrack(list, false).forEach(function (src, index) {
      var cell = document.createElement('div');
      cell.style.cssText = 'width:72px;height:72px;border-radius:18px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);overflow:hidden;flex-shrink:0;box-shadow:0 8px 20px rgba(0,0,0,.28)';
      var img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.width = 72;
      img.height = 72;
      img.decoding = 'async';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
      cell.appendChild(img);
      track.appendChild(cell);
    });
    var wrap = document.createElement('div');
    wrap.style.cssText = 'overflow:hidden;width:100%;mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)';
    wrap.appendChild(track);
    container.appendChild(wrap);
  }

  function init() {
    var root = document.getElementById('apex-inline-boot');
    if (!root) return;
    root.innerHTML = '';
    root.style.cssText = 'min-height:100vh;min-height:100dvh;background:radial-gradient(circle at 50% 18%, rgba(184,77,58,.16), transparent 42%), #111113;color:white;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';

    var shell = document.createElement('div');
    shell.style.cssText = 'width:100%;max-width:360px;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center';

    var marquee = document.createElement('div');
    marquee.style.cssText = 'width:100%;display:grid;gap:10px';
    renderTrack(marquee, ANIMALS, false, 20);
    renderTrack(marquee, ANIMALS, true, 26);
    shell.appendChild(marquee);

    var msg = document.createElement('div');
    msg.id = 'apex-inline-boot-message';
    msg.style.cssText = 'min-height:44px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.82);font-weight:900;font-size:15px;line-height:1.35';
    msg.textContent = MESSAGES[0];
    shell.appendChild(msg);

    root.appendChild(shell);

    var idx = 0;
    window.setInterval(function () {
      idx = (idx + 1) % MESSAGES.length;
      var el = document.getElementById('apex-inline-boot-message');
      if (el) el.textContent = MESSAGES[idx];
    }, 2800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
