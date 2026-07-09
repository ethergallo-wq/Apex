import React, { useEffect, useMemo, useState } from 'react';
import { APEX_BOOT_ANIMAL_IMAGES, APEX_BOOT_MESSAGES, buildMarqueeTrack } from './apexBootContent';

function MarqueeRow({ images, reverse = false, duration = 22 }) {
  const track = useMemo(() => buildMarqueeTrack(images, 2), [images]);
  if (!track.length) return null;
  return (
    <div style={{ overflow: 'hidden', width: '100%', maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' }}>
      <div
        className={reverse ? 'apex-boot-marquee-track-reverse' : 'apex-boot-marquee-track'}
        style={{ animationDuration: `${duration}s` }}
      >
        {track.map((src, index) => (
          <div key={`${src}-${index}`} style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.10)', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 20px rgba(0,0,0,.28)' }}>
            <img src={src} alt="" width={72} height={72} decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ApexBootLoader({ message = null, frameProps = null }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const activeMessage = message || APEX_BOOT_MESSAGES[messageIndex % APEX_BOOT_MESSAGES.length] || 'Apertura Apex…';

  useEffect(() => {
    if (message) return undefined;
    const timer = window.setInterval(() => {
      setMessageIndex(i => (i + 1) % APEX_BOOT_MESSAGES.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [message]);

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
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
        <div style={{ width: '100%', display: 'grid', gap: 10 }}>
          <MarqueeRow images={APEX_BOOT_ANIMAL_IMAGES} duration={20} />
          <MarqueeRow images={[...APEX_BOOT_ANIMAL_IMAGES].reverse()} reverse duration={26} />
        </div>
        <div style={{ minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div key={activeMessage} className="apex-boot-message-fade" style={{ color: 'rgba(255,255,255,.82)', fontWeight: 900, fontSize: 15, letterSpacing: 0.2, lineHeight: 1.35 }}>
            {activeMessage}
          </div>
        </div>
      </div>
    </div>
  );
}
