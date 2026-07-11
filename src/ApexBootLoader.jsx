import React, { useEffect, useMemo, useState } from 'react';
import {
  APEX_BOOT_ANIMAL_IMAGES,
  pickRandomBootMessage,
  preloadBootImages,
} from './apexBootContent';

const ANIMAL_FLIP_MS = 333;
const MESSAGE_FLIP_MS = 3000;

export default function ApexBootLoader({ message = null, frameProps = null }) {
  const images = useMemo(() => APEX_BOOT_ANIMAL_IMAGES.filter(Boolean), []);
  const [animalIndex, setAnimalIndex] = useState(0);
  const [activeMessage, setActiveMessage] = useState(() => pickRandomBootMessage());

  useEffect(() => {
    preloadBootImages(images);
  }, [images]);

  useEffect(() => {
    if (!images.length) return undefined;
    const timer = window.setInterval(() => {
      setAnimalIndex(i => (i + 1) % images.length);
    }, ANIMAL_FLIP_MS);
    return () => window.clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    if (message) return undefined;
    const timer = window.setInterval(() => {
      setActiveMessage(prev => pickRandomBootMessage(undefined, prev));
    }, MESSAGE_FLIP_MS);
    return () => window.clearInterval(timer);
  }, [message]);

  const activeImage = images[animalIndex % images.length] || null;
  const displayMessage = message || activeMessage || 'Apertura Apex…';

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
        padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 18px calc(env(safe-area-inset-bottom, 0px) + 24px)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' }}>
        <div style={{ minHeight: 58, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {activeImage && (
            <img
              key={activeImage}
              src={activeImage}
              alt=""
              width={58}
              height={58}
              loading="eager"
              decoding="async"
              style={{ width: 58, height: 58, objectFit: 'contain', display: 'block' }}
            />
          )}
        </div>
        <div style={{ minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
          <div key={displayMessage} className="apex-boot-message-fade" style={{ color: 'rgba(255,255,255,.82)', fontWeight: 900, fontSize: 15, letterSpacing: 0.2, lineHeight: 1.35 }}>
            {displayMessage}
          </div>
        </div>
      </div>
    </div>
  );
}
