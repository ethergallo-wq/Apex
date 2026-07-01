import React, { useMemo, useState } from 'react';
import { buildHomeMission } from './homeMission';

const LIGHT_APP_BG = '#F3EFE6';
const ANIMALDEX_ORANGE_GRADIENT = 'linear-gradient(135deg,#B84D3A,#D06A45)';
const BADGE_LEVEL_COLORS = { 1: '#CD7F32', 2: '#C0C0C0', 3: '#FFD700', 4: '#8F34F5' };

function hexToRgba(hex, alpha = 1) {
  const clean = String(hex || '#ffffff').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(ch => ch + ch).join('') : clean;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function xpForLevel(level) {
  return Math.round(100 * Math.pow(Math.max(1, level - 1), 1.65));
}

function buildAwardImagePath(badgeId) {
  return `/awards/${String(badgeId || '').toLowerCase()}.png`;
}

function SocialCountBadge({ count = 0, style = {} }) {
  if (!count) return null;
  return (
    <span style={{ minWidth: 22, height: 22, padding: '0 6px', borderRadius: 999, background: '#B84D3A', color: 'white', fontSize: 11, fontWeight: 1000, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(184,77,58,.34)', ...style }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

function ProgressRing({ progress = 0, color = '#F0A840', size = 52 }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.10)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}

export default function MainMenuV2({
  onOpen,
  onLogout,
  tutorialFocus = null,
  statusMap = {},
  visitedCountries = [],
  earnedBadgeIds = [],
  userProfile,
  user,
  socialSnapshot = null,
  onOpenFriends,
  onOpenGridStatus,
  onOpenRegions,
  onQuickSeen,
  onOpenPhoto,
  onOpenBadge,
  theme = 'dark',
  menuProgress = null,
}) {
  const progress = menuProgress || {
    level: 1,
    xp: 0,
    searchedCount: 0,
    seenCount: 0,
    capturedCount: 0,
    nearlyCompletedBadges: [],
  };
  const pendingFriendRequests = socialSnapshot?.pendingFriendRequestCount || socialSnapshot?.requestsIn?.length || 0;
  const [navOpen, setNavOpen] = useState(false);
  const mission = useMemo(() => buildHomeMission(progress), [progress]);
  const isLightTheme = theme === 'light';
  const pageText = isLightTheme ? '#171717' : 'white';
  const mutedText = isLightTheme ? 'rgba(0,0,0,.58)' : 'rgba(255,255,255,.62)';
  const lightPanel = isLightTheme ? '#F6F4EF' : 'rgba(255,255,255,.055)';
  const lightPanelBorder = isLightTheme ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.08)';
  const displayName = userProfile?.nickname || userProfile?.username || user?.email?.split('@')[0] || 'Esploratore';
  const nextLevelXP = xpForLevel(progress.level + 1);
  const currLevelXP = xpForLevel(progress.level);
  const xpPct = Math.max(0, Math.min(100, ((progress.xp - currLevelXP) / Math.max(1, nextLevelXP - currLevelXP)) * 100));
  const badgeCount = (earnedBadgeIds || []).length;
  const nearlyBadges = progress.nearlyCompletedBadges || [];

  const openFriendsFromHome = (tab = 'feed') => {
    if (typeof onOpenFriends === 'function') onOpenFriends(tab, 'menu');
    else onOpen('friends');
  };

  const runMission = () => {
    if (mission.action === 'badge') {
      onOpenBadge?.(mission.badgeId);
      return;
    }
    if (mission.action === 'grid-seen') {
      onOpenGridStatus?.(['avvistato']);
      return;
    }
    if (mission.action === 'grid-all') {
      onOpenGridStatus?.(['ricercato', 'avvistato', 'catturato']);
      return;
    }
    if (mission.action === 'regions') {
      (onOpenRegions || (() => onOpen('regions')))();
    }
  };

  const drawerItems = [
    { id: 'badges', label: 'Badge', icon: '🏅' },
    { id: 'abilities', label: 'Abilità', icon: '✨' },
    { id: 'compare', label: 'Comparatore', icon: '⚔️' },
    { id: 'profile', label: 'Profilo', icon: '👤' },
    { id: 'settings', label: 'Impostazioni', icon: '⚙️' },
  ];

  const stats = [
    { label: 'Ricercati', value: progress.searchedCount || 0, action: () => onOpenGridStatus?.(['ricercato']) },
    { label: 'Avvistati', value: progress.seenCount || 0, action: () => onOpenGridStatus?.(['avvistato']) },
    { label: 'Catturati', value: progress.capturedCount || 0, action: () => onOpenGridStatus?.(['catturato']) },
    { label: 'Badge', value: badgeCount, action: () => onOpen('badges') },
  ];

  const exploreTiles = [
    {
      id: 'regions',
      eyebrow: 'Esplorazione',
      title: 'Territori',
      subtitle: 'Mappa e bioregioni',
      accent: '#90D84A',
      background: 'linear-gradient(135deg, rgba(5,11,13,.88), rgba(5,11,13,.42)), radial-gradient(circle at 82% 38%, rgba(144,216,74,.28), transparent 42%)',
      action: () => (onOpenRegions || (() => onOpen('regions')))(),
    },
    {
      id: 'taxonomy',
      eyebrow: 'Tassonomia',
      title: 'Albero della vita',
      subtitle: 'Naviga i rami',
      accent: '#90D84A',
      background: `linear-gradient(135deg, rgba(3,8,5,.82), rgba(3,8,5,.48)), url("/backgrounds/background_tree.png") center 43% / cover no-repeat`,
      action: () => onOpen('taxonomy'),
    },
    {
      id: 'friends',
      eyebrow: 'Social',
      title: 'Allenatori',
      subtitle: 'Feed e amici',
      accent: '#F0A840',
      background: `linear-gradient(135deg, rgba(12,10,9,.78), rgba(25,16,10,.52)), url("/backgrounds/background_amici.png") center / cover no-repeat`,
      action: () => openFriendsFromHome('feed'),
      badge: pendingFriendRequests,
    },
    {
      id: 'badges',
      eyebrow: 'Progressi',
      title: 'Badge',
      subtitle: 'Premi e traguardi',
      accent: '#FFD700',
      background: 'linear-gradient(135deg, rgba(28,20,8,.88), rgba(18,14,8,.62)), radial-gradient(circle at 78% 24%, rgba(255,215,0,.18), transparent 40%)',
      action: () => onOpen('badges'),
    },
  ];

  const boxShadow = isLightTheme ? '0 14px 30px rgba(0,0,0,.08)' : '0 16px 38px rgba(0,0,0,.22)';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background: isLightTheme ? LIGHT_APP_BG : 'radial-gradient(circle at 50% -10%, rgba(184,77,58,.13), transparent 36%), linear-gradient(180deg,#101216,#0B0D10)', overflow: 'hidden' }}>
      <div style={{ minHeight: 'calc(env(safe-area-inset-top, 0px) + 56px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'calc(env(safe-area-inset-top, 0px) + 4px) 14px 8px', boxSizing: 'border-box', background: ANIMALDEX_ORANGE_GRADIENT, borderRadius: '0 0 22px 22px', boxShadow: '0 12px 28px rgba(184,77,58,.22)', flexShrink: 0 }}>
        <button onClick={() => setNavOpen(true)} aria-label="Menu" style={{ width: 44, height: 44, borderRadius: 15, border: '1px solid rgba(255,255,255,.10)', background: 'rgba(0,0,0,.10)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5, padding: '0 10px', cursor: 'pointer' }}>
          {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: 22, height: 2.5, borderRadius: 4, background: 'white' }} />)}
        </button>
        <div style={{ color: 'white', fontSize: 20, fontWeight: 1000, textShadow: '0 1px 10px rgba(0,0,0,.18)' }}>Apex</div>
        <button onClick={() => onOpen('profile')} aria-label="Profilo" style={{ width: 44, height: 44, borderRadius: 15, border: '1px solid rgba(255,255,255,.14)', background: 'rgba(0,0,0,.14)', overflow: 'hidden', cursor: 'pointer', padding: 0, position: 'relative' }}>
          {userProfile?.avatar_url
            ? <img src={userProfile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: 'white', fontSize: 16, fontWeight: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{displayName.slice(0, 1).toUpperCase()}</span>}
          {!!pendingFriendRequests && <span style={{ position: 'absolute', top: -2, right: -2 }}><SocialCountBadge count={pendingFriendRequests} /></span>}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 28px', WebkitOverflowScrolling: 'touch' }}>
        <button onClick={() => onOpen('profile')} style={{ width: '100%', border: `1px solid ${lightPanelBorder}`, borderRadius: 20, background: isLightTheme ? 'rgba(255,255,255,.72)' : 'rgba(255,255,255,.045)', padding: '12px 14px', marginBottom: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', boxShadow, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,.12)', background: 'rgba(0,0,0,.18)', flexShrink: 0 }}>
              {userProfile?.avatar_url
                ? <img src={userProfile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: pageText, fontSize: 16, fontWeight: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{displayName.slice(0, 1).toUpperCase()}</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: pageText, fontSize: 16, fontWeight: 1000, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
              <div style={{ color: mutedText, fontSize: 11, marginTop: 2 }}>Liv. {progress.level} · {progress.xp} / {nextLevelXP} XP</div>
              <div style={{ height: 7, borderRadius: 999, background: 'rgba(255,255,255,.08)', overflow: 'hidden', marginTop: 8 }}>
                <div style={{ height: '100%', width: `${xpPct}%`, background: 'linear-gradient(90deg,#D8D2C4,#C87955,#B84D3A)', borderRadius: 999 }} />
              </div>
            </div>
          </div>
        </button>

        <div style={{ borderRadius: 24, border: '1px solid rgba(184,77,58,.34)', background: 'linear-gradient(135deg, rgba(24,10,6,.72), rgba(20,20,22,.52)), url("/backgrounds/background_grid.png") center / cover no-repeat', padding: 18, marginBottom: 14, boxShadow: '0 18px 40px rgba(0,0,0,.24)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(8,8,10,.82), rgba(8,8,10,.38) 58%, rgba(8,8,10,.18))', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ color: '#F0A840', fontSize: 10.5, fontWeight: 1000, letterSpacing: .8, textTransform: 'uppercase' }}>{mission.eyebrow}</div>
            <div style={{ color: 'white', fontSize: 22, fontWeight: 1000, lineHeight: 1.08, marginTop: 6 }}>{mission.title}</div>
            <div style={{ color: 'rgba(255,255,255,.72)', fontSize: 12.5, lineHeight: 1.45, marginTop: 7, maxWidth: '92%' }}>{mission.subtitle}</div>
            <button onClick={runMission} style={{ marginTop: 14, height: 40, padding: '0 16px', borderRadius: 999, border: 'none', background: ANIMALDEX_ORANGE_GRADIENT, color: 'white', fontFamily: 'inherit', fontSize: 13, fontWeight: 1000, cursor: 'pointer', boxShadow: '0 10px 24px rgba(184,77,58,.32)' }}>{mission.cta}</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <button
            onClick={() => onOpenGridStatus?.(['ricercato', 'avvistato', 'catturato'])}
            style={{
              minHeight: 74,
              borderRadius: 20,
              border: tutorialFocus === 'grid' ? '2px solid #F0A840' : 'none',
              background: ANIMALDEX_ORANGE_GRADIENT,
              color: 'white',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 1000,
              cursor: 'pointer',
              boxShadow: tutorialFocus === 'grid' ? '0 0 0 4px rgba(240,168,64,.24), 0 14px 30px rgba(184,77,58,.28)' : '0 14px 30px rgba(184,77,58,.28)',
              padding: '12px 10px',
            }}
          >
            Esplora Dex
          </button>
          <button
            onClick={() => onOpenPhoto?.()}
            style={{
              minHeight: 74,
              borderRadius: 20,
              border: '1.5px solid rgba(184,77,58,.48)',
              background: isLightTheme ? 'rgba(255,255,255,.82)' : 'rgba(255,255,255,.06)',
              color: isLightTheme ? '#7D3326' : 'white',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 1000,
              cursor: 'pointer',
              padding: '12px 10px',
            }}
          >
            Cattura
          </button>
        </div>
        <button onClick={() => onQuickSeen?.()} style={{ width: '100%', border: 'none', background: 'transparent', color: mutedText, fontFamily: 'inherit', fontSize: 12, fontWeight: 800, cursor: 'pointer', marginBottom: 16, padding: '2px 0 0' }}>
          Avvista veloce →
        </button>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4, marginBottom: 18, scrollbarWidth: 'none' }}>
          {stats.map(stat => (
            <button key={stat.label} onClick={stat.action} style={{ flex: '0 0 auto', minWidth: 92, borderRadius: 18, border: `1px solid ${lightPanelBorder}`, background: isLightTheme ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.05)', padding: '12px 14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', boxShadow }}>
              <div style={{ color: pageText, fontSize: 20, fontWeight: 1000, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ color: mutedText, fontSize: 10.5, fontWeight: 800, marginTop: 4 }}>{stat.label}</div>
            </button>
          ))}
        </div>

        <div style={{ color: '#90D84A', fontSize: 11, fontWeight: 1000, letterSpacing: .8, textTransform: 'uppercase', margin: '0 0 10px 2px' }}>Esplora</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: nearlyBadges.length ? 18 : 0 }}>
          {exploreTiles.map(tile => (
            <button key={tile.id} onClick={tile.action} style={{ position: 'relative', minHeight: 132, borderRadius: 22, border: `1px solid ${hexToRgba(tile.accent, .28)}`, background: tile.background, backgroundSize: 'cover', color: 'white', fontFamily: 'inherit', textAlign: 'left', padding: 14, cursor: 'pointer', overflow: 'hidden', boxShadow }}>
              {!!tile.badge && <div style={{ position: 'absolute', top: 10, right: 10 }}><SocialCountBadge count={tile.badge} /></div>}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.58))', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ color: tile.accent, fontSize: 9.5, fontWeight: 1000, letterSpacing: .7, textTransform: 'uppercase' }}>{tile.eyebrow}</div>
                <div style={{ fontSize: 17, fontWeight: 1000, lineHeight: 1.08, marginTop: 5 }}>{tile.title}</div>
                <div style={{ color: 'rgba(255,255,255,.68)', fontSize: 10.5, marginTop: 5, lineHeight: 1.35 }}>{tile.subtitle}</div>
              </div>
            </button>
          ))}
        </div>

        {!!nearlyBadges.length && (
          <>
            <div style={{ color: mutedText, fontSize: 11, fontWeight: 1000, textTransform: 'uppercase', margin: '0 0 10px 2px' }}>Quasi completati</div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 6, scrollbarWidth: 'none' }}>
              {nearlyBadges.map(rule => {
                const color = BADGE_LEVEL_COLORS[rule.level] || '#F0A840';
                return (
                  <button key={rule.badgeId} onClick={() => onOpenBadge?.(rule.badgeId)} style={{ flex: '0 0 auto', width: 148, borderRadius: 20, border: `1px solid ${hexToRgba(color, .42)}`, background: isLightTheme ? `linear-gradient(180deg, ${hexToRgba(color, .12)}, rgba(251,247,239,.96))` : `linear-gradient(180deg, ${hexToRgba(color, .14)}, rgba(18,18,20,.88))`, padding: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', boxShadow }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                        <ProgressRing progress={rule.progress} color={color} />
                        <img src={buildAwardImagePath(rule.badgeId)} alt="" style={{ position: 'absolute', inset: 10, width: 32, height: 32, objectFit: 'contain' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: pageText, fontSize: 11.5, fontWeight: 1000, lineHeight: 1.15, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{rule.name}</div>
                        <div style={{ color, fontSize: 10.5, fontWeight: 1000, marginTop: 4 }}>{Math.round(rule.progress * 100)}%</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {navOpen && (
        <div onClick={() => setNavOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 420, background: 'rgba(0,0,0,.52)', display: 'flex', alignItems: 'stretch' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(82vw, 330px)', height: '100%', background: isLightTheme ? '#FBF7EF' : '#121417', borderRight: `1px solid ${lightPanelBorder}`, boxShadow: '24px 0 80px rgba(0,0,0,.45)', padding: '18px 14px', boxSizing: 'border-box', color: pageText }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 18 }}>
              <button onClick={() => setNavOpen(false)} aria-label="Chiudi" style={{ width: 38, height: 38, borderRadius: 13, border: `1px solid ${lightPanelBorder}`, background: 'transparent', color: pageText, fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ display: 'grid', gap: 9 }}>
              {drawerItems.map(item => (
                <button key={item.id} onClick={() => { setNavOpen(false); onOpen(item.id); }} style={{ minHeight: 58, border: `1px solid ${lightPanelBorder}`, borderRadius: 17, background: lightPanel, color: pageText, cursor: 'pointer', padding: '0 13px', display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left', fontFamily: 'inherit' }}>
                  <span style={{ width: 38, height: 38, borderRadius: 14, background: isLightTheme ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 950, flex: 1 }}>{item.label}</span>
                  {item.id === 'profile' && <SocialCountBadge count={pendingFriendRequests} />}
                </button>
              ))}
            </div>
            <button onClick={() => { setNavOpen(false); onLogout?.(); }} style={{ width: '100%', height: 50, marginTop: 18, borderRadius: 17, border: '1px solid rgba(184,77,58,.35)', background: 'rgba(184,77,58,.10)', color: '#D06A45', fontWeight: 1000, fontFamily: 'inherit', cursor: 'pointer' }}>Esci</button>
          </div>
        </div>
      )}
    </div>
  );
}
