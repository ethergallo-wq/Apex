import React, { useMemo } from 'react';
import { getAnimalThumbUrl } from './homeMissionUi';

function hoursUntilTomorrow() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((tomorrow - now) / (1000 * 60 * 60)));
}

export default function DailyAtlasCard({
  dailyDiscovery = null,
  onDocumentAnimal,
  onOpenAnimal,
  theme = 'dark',
  style = {},
}) {
  const hoursLeft = useMemo(() => hoursUntilTomorrow(), []);
  if (!dailyDiscovery?.animal) return null;
  const isLightTheme = theme === 'light';
  const pageText = isLightTheme ? '#171717' : 'white';
  const mutedText = isLightTheme ? 'rgba(0,0,0,.58)' : 'rgba(255,255,255,.72)';
  const thumbUrl = getAnimalThumbUrl(dailyDiscovery.animal);
  const documented = dailyDiscovery.documented;

  return (
    <div style={{
      borderRadius: 22,
      border: '1px solid rgba(157,211,255,.30)',
      overflow: 'hidden',
      marginBottom: 16,
      boxShadow: '0 16px 40px rgba(0,0,0,.28), 0 0 0 1px rgba(157,211,255,.06)',
      position: 'relative',
      minHeight: 132,
      ...style,
    }}>
      {thumbUrl && (
        <img
          className="apex-home-blurred-background"
          src={thumbUrl}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 35%',
            filter: 'blur(22px) saturate(1.35) brightness(.55)',
            transform: 'scale(1.12)',
            display: 'block',
          }}
        />
      )}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: isLightTheme
          ? 'linear-gradient(135deg, rgba(255,255,255,.88) 0%, rgba(230,242,255,.78) 55%, rgba(200,228,255,.72) 100%)'
          : 'linear-gradient(135deg, rgba(8,14,22,.82) 0%, rgba(12,28,48,.76) 50%, rgba(18,20,23,.88) 100%)',
        pointerEvents: 'none',
      }} />
      {!documented && (
        <div style={{
          position: 'absolute',
          top: -20,
          right: -10,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(157,211,255,.22), transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ position: 'relative', zIndex: 1, padding: '14px 14px 13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
          <div style={{ color: '#9DD3FF', fontSize: 10.5, fontWeight: 1000, letterSpacing: .9, textTransform: 'uppercase' }}>
            Atlante · Scoperta del giorno
          </div>
          {documented && (
            <div style={{
              color: 'rgba(157,211,255,.85)',
              fontSize: 10,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 999,
              background: 'rgba(157,211,255,.12)',
              border: '1px solid rgba(157,211,255,.22)',
              whiteSpace: 'nowrap',
            }}>
              Nuova tra {hoursLeft}h
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            onClick={() => onOpenAnimal?.(dailyDiscovery.animal)}
            style={{
              width: 92,
              height: 92,
              borderRadius: 20,
              overflow: 'hidden',
              border: documented ? '2px solid rgba(157,211,255,.55)' : '2px dashed rgba(157,211,255,.50)',
              background: isLightTheme ? 'rgba(255,255,255,.65)' : 'rgba(0,0,0,.32)',
              padding: 8,
              cursor: 'pointer',
              flexShrink: 0,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: documented
                ? '0 8px 24px rgba(74,144,194,.35), inset 0 0 0 1px rgba(255,255,255,.08)'
                : '0 0 20px rgba(157,211,255,.18)',
              position: 'relative',
            }}
          >
            <img
              src={thumbUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                filter: documented ? 'sepia(.55) saturate(.75) brightness(1.02)' : 'brightness(0) saturate(0)',
                opacity: documented ? 1 : .9,
              }}
            />
            {documented && (
              <div style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#4A90C2,#9DD3FF)',
                color: '#0B1B26',
                fontSize: 12,
                fontWeight: 1000,
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,.35)',
              }}>
                ✓
              </div>
            )}
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: pageText, fontSize: 16, fontWeight: 1000, lineHeight: 1.1 }}>
              {documented ? (dailyDiscovery.animal.com || dailyDiscovery.animal.sci) : 'Una specie ti aspetta'}
            </div>
            <div style={{ color: mutedText, fontSize: 11.5, lineHeight: 1.35, marginTop: 5 }}>
              {documented
                ? 'Documentata nel tuo Atlante. Timbro apposto sulla scheda di oggi.'
                : 'Viaggia da casa: documenta una specie dal mondo e rivela la sua scheda.'}
            </div>
          </div>

          {documented ? (
            <button
              type="button"
              onClick={() => onOpenAnimal?.(dailyDiscovery.animal)}
              style={{
                flexShrink: 0,
                minHeight: 44,
                borderRadius: 14,
                padding: '0 14px',
                border: '1px solid rgba(157,211,255,.42)',
                background: 'rgba(157,211,255,.16)',
                color: '#9DD3FF',
                fontFamily: 'inherit',
                fontSize: 12.5,
                fontWeight: 1000,
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              Scopri
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDocumentAnimal?.(dailyDiscovery.animal.id)}
              style={{
                flexShrink: 0,
                minHeight: 44,
                borderRadius: 14,
                padding: '0 14px',
                border: 'none',
                background: 'linear-gradient(135deg,#4A90C2,#9DD3FF)',
                color: '#0B1B26',
                fontFamily: 'inherit',
                fontSize: 12.5,
                fontWeight: 1000,
                cursor: 'pointer',
                boxShadow: '0 10px 24px rgba(74,144,194,.35)',
              }}
            >
              Documenta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
