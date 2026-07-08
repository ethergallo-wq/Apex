import React from 'react';

export default function ApexBootLoader({ message = 'Apertura Apex...', frameProps = null }) {
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
            src="/Apex_logo_32x32.png"
            alt=""
            width={40}
            height={40}
            decoding="async"
            style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.35))' }}
          />
        </div>
        <div style={{ color: 'rgba(255,255,255,.78)', fontWeight: 900, fontSize: 15, letterSpacing: 0.2 }}>
          {message}
        </div>
      </div>
    </div>
  );
}
