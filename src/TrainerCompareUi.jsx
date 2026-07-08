import React, { useMemo } from 'react';

function clampPct(value, max) {
  if (!max) return value > 0 ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round((Number(value || 0) / max) * 100)));
}

export function TrainerStatBar({ label, value = 0, max = 1, color = '#90D84A', subLabel = '', isLightTheme = false }) {
  const pct = clampPct(value, max);
  const track = isLightTheme ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.08)';
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ color: isLightTheme ? 'rgba(0,0,0,.62)' : 'rgba(255,255,255,.58)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</span>
        <span style={{ color, fontSize: 11.5, fontWeight: 1000 }}>{value}{subLabel ? ` ${subLabel}` : ''}</span>
      </div>
      <div style={{ height: 7, borderRadius: 999, background: track, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${color}99, ${color})`, boxShadow: `0 0 10px ${color}44` }} />
      </div>
    </div>
  );
}

const STAT_DEFS = [
  { key: 'xp', label: 'XP', color: '#F0A840' },
  { key: 'seenCount', label: 'Avvistati', color: '#C87955' },
  { key: 'capturedCount', label: 'Catturati', color: '#B84D3A' },
  { key: 'badgeCount', label: 'Badge', color: '#90D84A' },
  { key: 'documentedCount', label: 'Atlante', color: '#9DD3FF' },
];

function statMax(rows, key) {
  return Math.max(1, ...(rows || []).map(r => Number(r?.[key] || 0)));
}

export function TrainerLeaderboardCard({
  row,
  maxes = {},
  rank = 1,
  isLightTheme = false,
  panelBg = 'rgba(255,255,255,.055)',
  panelBorder = 'rgba(255,255,255,.08)',
  mainText = 'white',
  subText = 'rgba(255,255,255,.58)',
  FriendAvatar,
  onClick,
}) {
  const rankColor = rank === 1 ? '#F0C449' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : (isLightTheme ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.08)');
  const rankText = rank <= 3 ? '#17100A' : mainText;
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        fontFamily: 'inherit',
        borderRadius: 20,
        background: row.isMe ? 'linear-gradient(135deg,rgba(240,168,64,.16),rgba(255,255,255,.045))' : panelBg,
        border: `1px solid ${row.isMe ? 'rgba(240,168,64,.28)' : panelBorder}`,
        padding: 12,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 13, background: rankColor, color: rankText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 1000, flexShrink: 0 }}>{rank}</div>
        {FriendAvatar ? <FriendAvatar p={row} /> : null}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: mainText, fontSize: 14, fontWeight: 1000 }}>{row.isMe ? 'Tu' : row.nickname}</div>
          <div style={{ color: subText, fontSize: 11, marginTop: 2 }}>Liv. {row.level || 1} · {row.xp?.toLocaleString('it-IT') || 0} XP</div>
        </div>
        {row.isMe && <span style={{ color: '#F0A840', fontSize: 10, fontWeight: 1000, textTransform: 'uppercase' }}>Tu</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
        {STAT_DEFS.filter(s => s.key !== 'xp').map(stat => (
          <TrainerStatBar
            key={stat.key}
            label={stat.label}
            value={row[stat.key] || 0}
            max={maxes[stat.key] || 1}
            color={stat.color}
            isLightTheme={isLightTheme}
          />
        ))}
      </div>
    </Wrapper>
  );
}

export function TrainerHeadToHead({
  me,
  them,
  isLightTheme = false,
  panelBg = 'rgba(255,255,255,.055)',
  panelBorder = 'rgba(255,255,255,.08)',
  mainText = 'white',
  subText = 'rgba(255,255,255,.58)',
}) {
  const rows = useMemo(() => {
    const a = me || {};
    const b = them || {};
    return STAT_DEFS.map(stat => ({
      ...stat,
      me: Number(a[stat.key] || 0),
      them: Number(b[stat.key] || 0),
      max: Math.max(Number(a[stat.key] || 0), Number(b[stat.key] || 0), 1),
    }));
  }, [me, them]);

  return (
    <div style={{ borderRadius: 20, background: panelBg, border: `1px solid ${panelBorder}`, padding: 14, marginBottom: 14 }}>
      <div style={{ color: mainText, fontSize: 15, fontWeight: 1000, marginBottom: 4 }}>Tu vs {them?.nickname || 'Allenatore'}</div>
      <div style={{ color: subText, fontSize: 11.5, lineHeight: 1.4, marginBottom: 12 }}>Confronto diretto sui progressi principali.</div>
      <div style={{ display: 'grid', gap: 12 }}>
        {rows.map(stat => {
          const mePct = clampPct(stat.me, stat.max);
          const themPct = clampPct(stat.them, stat.max);
          const meWins = stat.me > stat.them;
          const tie = stat.me === stat.them;
          return (
            <div key={stat.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: subText, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>
                <span>{stat.label}</span>
                <span style={{ color: tie ? subText : (meWins ? '#90D84A' : '#F0A840') }}>{meWins ? 'In vantaggio' : tie ? 'Parità' : 'Indietro'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#F0A840', fontSize: 11, fontWeight: 1000, marginBottom: 4, textAlign: 'right' }}>{stat.me.toLocaleString('it-IT')}</div>
                  <div style={{ height: 8, borderRadius: 999, background: isLightTheme ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.08)', overflow: 'hidden', direction: 'rtl' }}>
                    <div style={{ width: `${mePct}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, #F0A84099, #F0A840)` }} />
                  </div>
                </div>
                <div style={{ width: 28, textAlign: 'center', color: stat.color, fontSize: 14, fontWeight: 1000 }}>⚡</div>
                <div>
                  <div style={{ color: mainText, fontSize: 11, fontWeight: 1000, marginBottom: 4 }}>{stat.them.toLocaleString('it-IT')}</div>
                  <div style={{ height: 8, borderRadius: 999, background: isLightTheme ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                    <div style={{ width: `${themPct}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${stat.color}99, ${stat.color})` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function buildTrainerStatMaxes(rows = []) {
  return STAT_DEFS.reduce((acc, stat) => {
    acc[stat.key] = statMax(rows, stat.key);
    return acc;
  }, {});
}
