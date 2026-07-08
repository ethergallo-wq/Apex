import React, { useEffect, useMemo, useState } from 'react';

export const APEX_BOOT_ANIMALS = [
  { slug: 'melanocetus-johnsonii', name: 'Rana pescatrice' },
  { slug: 'ornithorhynchus-anatinus', name: 'Ornitorinco' },
  { slug: 'psychrolutes-marcidus', name: 'Pesce blob' },
  { slug: 'vampyroteuthis-infernalis', name: 'Vampiro degli abissi' },
  { slug: 'macropinna-microstoma', name: 'Pesce dal cappuccio' },
  { slug: 'eurypharynx-pelecanoides', name: 'Anguilla pellicano' },
  { slug: 'hymenopus-coronatus', name: 'Mantide orchidea' },
  { slug: 'gonodactylus-smithii', name: 'Gambero mantide' },
  { slug: 'uroplatus-phantasticus', name: 'Geco foglia' },
  { slug: 'brookesia-micra', name: 'Camaleonte nano' },
  { slug: 'nautilus-pompilius', name: 'Nautilus' },
  { slug: 'argonauta-argo', name: 'Polpo di vetro' },
  { slug: 'galeopithecus-volans', name: 'Colugo' },
  { slug: 'uakari-calvus', name: 'Uacari calvo' },
  { slug: 'rhynochetos-jubatus', name: 'Kagu' },
  { slug: 'saiga-tatarica', name: 'Saiga' },
  { slug: 'steatornis-caripensis', name: 'Uccello del petrolio' },
  { slug: 'priodontes-maximus', name: 'Tatù gigante' },
  { slug: 'atractosteus-spatula', name: 'Pesce alligatore' },
  { slug: 'tarsius-syrichta', name: 'Tarsio' },
];

function shuffleAnimals(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function getThumbUrl(slug) {
  return `/animals/thumbs/${slug}.webp`;
}

export default function ApexBootLoader({ message = 'Apertura Apex...', frameProps = null }) {
  const animals = useMemo(() => shuffleAnimals(APEX_BOOT_ANIMALS), []);
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const current = animals[index];

  useEffect(() => {
    animals.forEach((animal) => {
      const img = new Image();
      img.src = getThumbUrl(animal.slug);
    });
  }, [animals]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % animals.length);
      setTick((prev) => prev + 1);
    }, 180);
    return () => window.clearInterval(intervalId);
  }, [animals.length]);

  return (
    <div
      {...(frameProps || {})}
      style={{
        height: 'var(--animaldex-app-height, 100dvh)',
        maxWidth: 480,
        margin: '0 auto',
        background: 'radial-gradient(circle at 50% 18%, rgba(184,77,58,.16), transparent 42%), #111113',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Sora',-apple-system,BlinkMacSystemFont,sans-serif",
        padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 24px calc(env(safe-area-inset-bottom, 0px) + 24px)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
        <div
          key={`${current.slug}-${tick}`}
          className="apex-boot-icon"
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            background: 'rgba(255,255,255,.06)',
            border: '1px solid rgba(255,255,255,.10)',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 10px 28px rgba(0,0,0,.28)',
          }}
        >
          <img
            src={getThumbUrl(current.slug)}
            alt=""
            decoding="async"
            style={{
              width: 52,
              height: 52,
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.35))',
            }}
          />
        </div>
        <div style={{ color: 'rgba(255,255,255,.78)', fontWeight: 900, fontSize: 15, letterSpacing: 0.2 }}>
          {message}
        </div>
        <div style={{ color: 'rgba(255,255,255,.48)', fontWeight: 800, fontSize: 12, minHeight: 16 }}>
          {current.name}
        </div>
      </div>
    </div>
  );
}
