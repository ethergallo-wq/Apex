import React from 'react';
import { getAnimalThumbUrl } from './homeMissionUi';

export default function DailyAtlasCard({
  dailyDiscovery = null,
  onDocumentAnimal,
  onOpenAnimal,
  theme = 'dark',
  style = {},
}) {
  if (!dailyDiscovery?.animal) return null;
  const isLightTheme = theme === 'light';
  const pageText = isLightTheme ? '#171717' : 'white';
  const mutedText = isLightTheme ? 'rgba(0,0,0,.58)' : 'rgba(255,255,255,.62)';

  return (
    <div style={{
      borderRadius: 22,
      border: '1px solid rgba(157,211,255,.26)',
      background: isLightTheme ? 'rgba(255,255,255,.82)' : 'linear-gradient(135deg, rgba(157,211,255,.08), rgba(18,20,23,.92))',
      padding: 14,
      marginBottom: 16,
      boxShadow: '0 14px 32px rgba(0,0,0,.20)',
      ...style,
    }}>
      <div style={{ color: '#9DD3FF', fontSize: 10.5, fontWeight: 1000, letterSpacing: .9, textTransform: 'uppercase', marginBottom: 10 }}>
        Atlante · Scoperta del giorno
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={() => onOpenAnimal?.(dailyDiscovery.animal)}
          style={{ width: 72, height: 72, borderRadius: 18, overflow: 'hidden', border: '1.5px dashed rgba(157,211,255,.45)', background: 'rgba(0,0,0,.24)', padding: 0, cursor: 'pointer', flexShrink: 0 }}
        >
          <img
            src={getAnimalThumbUrl(dailyDiscovery.animal)}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: dailyDiscovery.documented ? 'sepia(.72) saturate(.55) brightness(.94)' : 'brightness(0) saturate(0)',
              opacity: dailyDiscovery.documented ? 1 : .85,
            }}
          />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: pageText, fontSize: 15, fontWeight: 1000, lineHeight: 1.1 }}>
            {dailyDiscovery.documented ? (dailyDiscovery.animal.com || dailyDiscovery.animal.sci) : 'Una specie ti aspetta'}
          </div>
          <div style={{ color: mutedText, fontSize: 11.5, lineHeight: 1.35, marginTop: 4 }}>
            {dailyDiscovery.documented
              ? 'Documentata nel tuo Atlante. Domani una nuova specie da scoprire.'
              : 'Viaggia da casa: documenta una specie dal mondo e rivela la sua scheda.'}
          </div>
        </div>
        {dailyDiscovery.documented ? (
          <div style={{ flexShrink: 0, borderRadius: 14, padding: '9px 12px', background: 'rgba(157,211,255,.12)', border: '1px solid rgba(157,211,255,.34)', color: '#9DD3FF', fontSize: 11.5, fontWeight: 1000 }}>
            📖 Fatto
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onDocumentAnimal?.(dailyDiscovery.animal.id)}
            style={{ flexShrink: 0, minHeight: 44, borderRadius: 14, padding: '0 14px', border: 'none', background: 'linear-gradient(135deg,#4A90C2,#9DD3FF)', color: '#0B1B26', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 1000, cursor: 'pointer', boxShadow: '0 10px 24px rgba(74,144,194,.30)' }}
          >
            Documenta
          </button>
        )}
      </div>
    </div>
  );
}
