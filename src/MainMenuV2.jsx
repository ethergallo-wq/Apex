import React, { useMemo, useState, useEffect } from 'react';
import { buildHomeMission } from './homeMission';
import { getAnimalThumbUrl } from './homeMissionUi';
import { HOME_EXPLORE_TILES, getHomeExploreImage } from './homeImages';
import DailyAtlasCard from './DailyAtlasCard';
import {
  getProfileAvatarAnimalId,
  getProfileAvatarChoices,
  persistProfileAvatarAnimalId,
  resolveProfileAvatarAnimal,
  saveProfileAvatarAnimal,
  ProfileAvatarImage,
} from './profileAvatar';

const LIGHT_APP_BG = '#F3EFE6';
const ORANGE = '#B84D3A';
const ORANGE_GRADIENT = 'linear-gradient(135deg,#B84D3A,#D06A45)';
const GREEN = '#90D84A';
const FOREST_GREEN = '#2D6A4F';
const BADGE_LEVEL_COLORS = { 1: '#CD7F32', 2: '#C0C0C0', 3: '#FFD700', 4: '#8F34F5' };
const EXPLORE_TILE_TITLE_OVERLAY = 'linear-gradient(180deg, transparent 52%, rgba(0,0,0,.78) 100%)';
const EXPLORE_TILE_TITLE_OVERLAY_LIGHT = 'linear-gradient(180deg, transparent 58%, rgba(0,0,0,.62) 100%)';

function hexToRgba(hex, alpha = 1) {
  const clean = String(hex || '#ffffff').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(ch => ch + ch).join('') : clean;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function xpForLevel(level) {
  return Math.round(100 * Math.pow(Math.max(1, level - 1), 1.65));
}

function buildAwardImagePath(badgeId) {
  return `/awards/${String(badgeId || '').toLowerCase()}.png`;
}

function badgeAccentImage(badgeId = '', index = 0) {
  const images = [
    '/regions/afrotropici_equatoriali.jpg',
    '/regions/Scandinavia_foreste_boreali.jpg',
    '/regions/amazzonia.jpg',
    '/regions/africa.jpg',
    '/regions/eastern_indo_pacific.jpg',
  ];
  const seed = String(badgeId || index).split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return images[seed % images.length];
}

function SocialCountBadge({ count = 0, style = {}, prominent = false }) {
  if (!count) return null;
  const prominentStyle = prominent ? {
    minWidth: 24,
    height: 24,
    padding: '0 7px',
    fontSize: 11,
    fontWeight: 1000,
    background: 'linear-gradient(135deg,#FF6B4A,#B84D3A)',
    border: '2px solid rgba(255,255,255,.95)',
    boxShadow: '0 0 0 1px rgba(184,77,58,.45), 0 0 10px rgba(255,120,80,.85), 0 0 22px rgba(240,80,50,.55), 0 4px 14px rgba(0,0,0,.42)',
    textShadow: '0 1px 2px rgba(0,0,0,.35)',
  } : {
    minWidth: 20,
    height: 20,
    padding: '0 5px',
    fontSize: 10,
    fontWeight: 1000,
    background: ORANGE,
    boxShadow: '0 4px 12px rgba(184,77,58,.34)',
  };
  return (
    <span style={{ borderRadius: 999, color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...prominentStyle, ...style }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

function IconGrid({ size = 22, color = 'white' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.8" fill={color} />
      <rect x="14" y="3" width="7" height="7" rx="1.8" fill={color} />
      <rect x="3" y="14" width="7" height="7" rx="1.8" fill={color} />
      <rect x="14" y="14" width="7" height="7" rx="1.8" fill={color} />
    </svg>
  );
}

function IconCamera({ size = 22, color = ORANGE, filled = false }) {
  if (filled) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ filter: 'drop-shadow(0 2px 8px rgba(184,77,58,.45))' }}>
        <path d="M9.5 7.5 8.2 5.5H5.5C4.12 5.5 3 6.62 3 8v9.5C3 18.88 4.12 20 5.5 20h13c1.38 0 2.5-1.12 2.5-2.5V8c0-1.38-1.12-2.5-2.5-2.5h-2.7L14.5 7.5h-5Z" fill="#B84D3A" stroke="#D06A45" strokeWidth="1.1" />
        <circle cx="12" cy="13" r="3.6" fill="rgba(255,255,255,.18)" stroke="#F5F1EA" strokeWidth="1.5" />
        <circle cx="12" cy="13" r="1.5" fill="#F5F1EA" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9.5 7.5 8.2 5.5H5.5C4.12 5.5 3 6.62 3 8v9.5C3 18.88 4.12 20 5.5 20h13c1.38 0 2.5-1.12 2.5-2.5V8c0-1.38-1.12-2.5-2.5-2.5h-2.7L14.5 7.5h-5Z" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="13" r="3.6" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

function IconSearch({ size = 16, color = 'rgba(255,255,255,.55)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth="1.8" />
      <path d="m16.5 16.5 4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconEye({ size = 16, color = 'rgba(255,255,255,.55)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2.5 12.5S6.5 6 12 6s9.5 6.5 9.5 6.5S17.5 19 12 19 2.5 12.5 2.5 12.5Z" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="12.5" r="2.6" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

function IconPaw({ size = 16, color = 'rgba(255,255,255,.55)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="8" cy="9" rx="2.1" ry="2.6" fill={color} />
      <ellipse cx="12" cy="7.5" rx="2.1" ry="2.6" fill={color} />
      <ellipse cx="16" cy="9" rx="2.1" ry="2.6" fill={color} />
      <path d="M7.5 12.5c1.2 3.2 3.3 5 4.5 5s3.3-1.8 4.5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconStarBadge({ size = 16, color = 'rgba(255,255,255,.55)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.5" stroke={color} strokeWidth="1.8" />
      <path d="M12 8.2 13.1 11h3.1l-2.5 1.8.9 3-2.6-1.8-2.6 1.8.9-3-2.5-1.8h3.1Z" fill={color} />
    </svg>
  );
}

function ProgressRing({ progress = 0, color = '#F0A840', size = 74, stroke = 5 }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ display: 'block' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(0,0,0,.42)" stroke="rgba(255,255,255,.14)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize={size * 0.19} fontWeight="800">{pct}%</text>
    </svg>
  );
}

function ExploreImageTile({ title, imageSrc, imageWebp, onClick, borderColor, overlay = EXPLORE_TILE_TITLE_OVERLAY, imagePosition = 'center', badge = null, minHeight = 128, loading = 'lazy', fetchPriority, gridColumn }) {
  const preferredSrc = imageWebp || imageSrc;
  const [activeSrc, setActiveSrc] = useState(preferredSrc);

  const handleImageError = () => {
    if (imageSrc && activeSrc !== imageSrc) {
      setActiveSrc(imageSrc);
      return;
    }
    setActiveSrc('');
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight,
        gridColumn,
        borderRadius: 22,
        border: `1px solid ${borderColor}`,
        background: '#121417',
        color: 'white',
        fontFamily: 'inherit',
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
        padding: 0,
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {activeSrc ? (
        <img
          src={activeSrc}
          alt=""
          loading={loading}
          decoding="async"
          onError={handleImageError}
          {...(fetchPriority ? { fetchPriority } : {})}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: imagePosition, display: 'block' }}
        />
      ) : null}
      <div style={{ position: 'absolute', inset: 0, background: overlay, pointerEvents: 'none' }} />
      {badge}
      <div style={{ position: 'relative', zIndex: 1, padding: '10px 14px 14px' }}>
        <div style={{ fontSize: 17, fontWeight: 1000, lineHeight: 1.05, textShadow: '0 2px 10px rgba(0,0,0,.55)' }}>{title}</div>
      </div>
    </button>
  );
}

function ProfileAvatarButton({ animal, fallbackUrl, displayName, onClick, pageText = 'white' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Cambia immagine profilo"
      style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.06)', flexShrink: 0, boxShadow: '0 10px 24px rgba(0,0,0,.22)', position: 'relative', padding: 0, cursor: 'pointer' }}
    >
      <ProfileAvatarImage animal={animal} size={64} fallbackLetter={displayName} fallbackUrl={fallbackUrl} />
    </button>
  );
}

function MissionAnimalSlot({ slot }) {
  const filled = slot?.type === 'filled' && slot.thumbUrl;
  return (
    <div
      title={slot?.label || ''}
      style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        overflow: 'hidden',
        background: filled ? 'rgba(240,168,64,.18)' : 'rgba(255,255,255,.08)',
        border: `1.5px solid ${filled ? 'rgba(240,168,64,.52)' : 'rgba(255,255,255,.12)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: filled ? 1 : .62,
        boxShadow: filled ? '0 4px 12px rgba(240,168,64,.18)' : 'none',
        padding: filled ? 3 : 0,
        boxSizing: 'border-box',
      }}
    >
      {filled
        ? <img src={slot.thumbUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,.24)' }} />}
    </div>
  );
}

export default function MainMenuV2({
  onOpen,
  onLogout,
  tutorialFocus = null,
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
  onOpenMissionGrid,
  theme = 'dark',
  menuProgress = null,
  dailyDiscovery = null,
  onDocumentAnimal,
  onOpenAnimal,
  usageStreak = 0,
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
  const socialAlertCount = socialSnapshot?.socialAlertCount || pendingFriendRequests;
  const [navOpen, setNavOpen] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const userIdKey = user?.id || 'guest';
  const [profileAvatarAnimalId, setProfileAvatarAnimalId] = useState(() => getProfileAvatarAnimalId(userIdKey));
  useEffect(() => { setProfileAvatarAnimalId(getProfileAvatarAnimalId(userIdKey)); }, [userIdKey]);
  const mission = useMemo(() => buildHomeMission(progress), [progress]);
  const isLightTheme = theme === 'light';
  const pageText = isLightTheme ? '#171717' : 'white';
  const mutedText = isLightTheme ? 'rgba(0,0,0,.58)' : 'rgba(255,255,255,.62)';
  const panelBorder = isLightTheme ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.08)';
  const panelBg = isLightTheme ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.05)';
  const displayName = userProfile?.nickname || userProfile?.username || user?.email?.split('@')[0] || 'Esploratore';
  const nextLevelXP = xpForLevel(progress.level + 1);
  const currLevelXP = xpForLevel(progress.level);
  const xpPct = Math.max(0, Math.min(100, ((progress.xp - currLevelXP) / Math.max(1, nextLevelXP - currLevelXP)) * 100));
  const badgeCount = (earnedBadgeIds || []).length;
  const nearlyBadges = progress.nearlyCompletedBadges || [];
  const animalsWithStatus = progress.animalsWithStatus || [];
  const avatarChoices = useMemo(() => getProfileAvatarChoices(animalsWithStatus), [animalsWithStatus]);
  const avatarAnimal = useMemo(
    () => resolveProfileAvatarAnimal({ animalsWithStatus, profileAvatarAnimalId, userProfile }),
    [animalsWithStatus, profileAvatarAnimalId, userProfile]
  );

  const openFriendsFromHome = () => {
    if (typeof onOpenFriends === 'function') onOpenFriends('feed', 'menu');
    else onOpen('friends');
  };

  const chooseProfileAvatar = (animal) => {
    if (!animal?.id) return;
    setProfileAvatarAnimalId(String(animal.id));
    persistProfileAvatarAnimalId(userIdKey, animal.id);
    saveProfileAvatarAnimal(user?.id, animal).catch(() => {});
    setAvatarPickerOpen(false);
  };

  const runMission = () => {
    if (onOpenMissionGrid) {
      onOpenMissionGrid(mission);
      return;
    }
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
    { id: 'friends', label: 'Allenatori', icon: '👥' },
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

  const missionBadgeId = mission.badgeId || nearlyBadges[0]?.badgeId;

  return (
    <div data-home-layout="v2" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background: isLightTheme ? LIGHT_APP_BG : 'radial-gradient(circle at 82% -8%, rgba(184,77,58,.16), transparent 34%), radial-gradient(circle at 12% 88%, rgba(144,216,74,.10), transparent 28%), linear-gradient(180deg,#101216,#0B0D10)', overflow: 'hidden' }}>
      <div style={{ minHeight: 'calc(env(safe-area-inset-top, 0px) + 54px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'calc(env(safe-area-inset-top, 0px) + 4px) 14px 10px', boxSizing: 'border-box', background: ORANGE_GRADIENT, borderRadius: '0 0 22px 22px', boxShadow: '0 12px 28px rgba(184,77,58,.24)', flexShrink: 0 }}>
        <button onClick={() => setNavOpen(true)} aria-label="Menu" style={{ width: 42, height: 42, borderRadius: 14, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(0,0,0,.12)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5, padding: '0 10px', cursor: 'pointer' }}>
          {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: 20, height: 2.5, borderRadius: 4, background: 'white' }} />)}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <img src="/Apex_logo_32x32.png" alt="Apex" width={30} height={30} style={{ display: 'block', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.18))' }} />
        </div>
        <div style={{ width: 42, display: 'flex', justifyContent: 'flex-end' }}>
          {!!socialAlertCount && (
            <button onClick={openFriendsFromHome} aria-label="Notifiche social" style={{ width: 42, height: 42, borderRadius: 14, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(0,0,0,.12)', cursor: 'pointer', position: 'relative', padding: 0 }}>
              <span style={{ fontSize: 18, lineHeight: '42px' }}>👥</span>
              <span style={{ position: 'absolute', top: -3, right: -3 }}><SocialCountBadge count={socialAlertCount} /></span>
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 28px', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overscrollBehavior: 'contain' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <ProfileAvatarButton
            animal={avatarAnimal}
            fallbackUrl={!avatarAnimal ? userProfile?.avatar_url : ''}
            displayName={displayName}
            pageText={pageText}
            onClick={() => {
              if (avatarChoices.length) setAvatarPickerOpen(true);
              else onOpen('profile');
            }}
          />
          <button
            type="button"
            onClick={() => onOpen('profile')}
            style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
          >
            <div style={{ color: pageText, fontSize: 22, fontWeight: 1000, lineHeight: 1.05 }}>{displayName}</div>
            <div style={{ color: mutedText, fontSize: 12.5, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>Liv. {progress.level} · {(progress.xp ?? 0).toLocaleString('it-IT')} XP</span>
              {usageStreak > 1 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 999, padding: '2px 9px', background: 'rgba(240,168,64,.14)', border: '1px solid rgba(240,168,64,.32)', color: '#F0A840', fontSize: 11, fontWeight: 1000 }}>
                  🔥 {usageStreak} giorni
                </span>
              )}
            </div>
            <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.10)', overflow: 'hidden', marginTop: 10 }}>
              <div style={{ height: '100%', width: `${xpPct}%`, background: 'linear-gradient(90deg,#D8D2C4,#C87955,#B84D3A)', borderRadius: 999, boxShadow: '0 0 14px rgba(184,77,58,.24)' }} />
            </div>
          </button>
        </div>

        <button type="button" onClick={runMission} style={{ width: '100%', borderRadius: 24, minHeight: 156, border: '1px solid rgba(184,77,58,.28)', marginBottom: 14, position: 'relative', overflow: 'hidden', boxShadow: '0 18px 44px rgba(0,0,0,.28)', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <img
            src={mission.accentImage}
            alt=""
            loading="eager"
            decoding="async"
            fetchPriority="high"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.04)', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,10,12,.18), rgba(8,10,12,.72) 58%, rgba(8,10,12,.88))' }} />
          {missionBadgeId && (
            <div style={{ position: 'absolute', top: 14, right: 14, width: 54, height: 54, borderRadius: 16, background: 'rgba(0,0,0,.28)', border: '1px solid rgba(255,255,255,.14)', display: 'grid', placeItems: 'center', backdropFilter: 'blur(6px)' }}>
              <img src={buildAwardImagePath(missionBadgeId)} alt="" style={{ width: 40, height: 40, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(240,168,64,.32))' }} />
            </div>
          )}
          <div style={{ position: 'relative', zIndex: 1, padding: '16px 16px 14px', display: 'flex', flexDirection: 'column', minHeight: 156, boxSizing: 'border-box' }}>
            <div style={{ color: GREEN, fontSize: 10.5, fontWeight: 1000, letterSpacing: .9, textTransform: 'uppercase' }}>{mission.eyebrow}</div>
            <div style={{ color: 'white', fontSize: 18, fontWeight: 1000, lineHeight: 1.15, marginTop: 8, maxWidth: missionBadgeId ? 'calc(100% - 64px)' : '100%', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {mission.titleLine1 || mission.title}
            </div>
            {(mission.titleLine2 || mission.subtitle) && (
              <div style={{ color: 'rgba(255,255,255,.78)', fontSize: 12.5, fontWeight: 800, marginTop: 5, lineHeight: 1.2 }}>
                {mission.titleLine2 || mission.subtitle}
              </div>
            )}
            {!!(mission.animalSlots || []).length && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {mission.animalSlots.map((slot, index) => (
                  <MissionAnimalSlot key={`${slot.type}-${index}`} slot={slot} />
                ))}
              </div>
            )}
          </div>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <button
            data-tour="home-grid"
            onClick={() => (tutorialFocus === 'grid' ? onOpen?.('grid') : onOpenGridStatus?.(['ricercato', 'avvistato', 'catturato']))}
            style={{
              minHeight: 82,
              borderRadius: 20,
              border: tutorialFocus === 'grid' ? '2.5px solid #F0A840' : 'none',
              background: ORANGE_GRADIENT,
              color: 'white',
              fontFamily: 'inherit',
              fontSize: 15,
              fontWeight: 1000,
              cursor: 'pointer',
              boxShadow: tutorialFocus === 'grid'
                ? '0 0 0 5px rgba(240,168,64,.28), 0 0 32px rgba(240,168,64,.55), 0 14px 30px rgba(184,77,58,.28)'
                : '0 14px 30px rgba(184,77,58,.28)',
              padding: '14px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <IconGrid />
            Esplora Dex
          </button>
          <button
            onClick={() => onOpenPhoto?.()}
            style={{
              minHeight: 82,
              borderRadius: 20,
              border: `1.8px solid ${hexToRgba(ORANGE, .62)}`,
              background: isLightTheme
                ? 'linear-gradient(145deg, rgba(255,255,255,.92), rgba(251,235,228,.88))'
                : 'linear-gradient(145deg, rgba(18,20,23,.94), rgba(28,16,12,.88))',
              color: isLightTheme ? '#7D3326' : 'white',
              fontFamily: 'inherit',
              fontSize: 15,
              fontWeight: 1000,
              cursor: 'pointer',
              padding: '14px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: isLightTheme ? '0 10px 24px rgba(184,77,58,.12)' : '0 10px 24px rgba(0,0,0,.22), inset 0 0 0 1px rgba(184,77,58,.08)',
            }}
          >
            <IconCamera filled size={26} />
            Cattura
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, marginBottom: 18 }}>
          {stats.map(stat => {
            const statValue = Number(stat.value) || 0;
            const valueSize = statValue >= 1000 ? 'clamp(14px, 4.2vw, 18px)' : 'clamp(16px, 4.8vw, 18px)';
            return (
              <button
                key={stat.label}
                onClick={stat.action}
                style={{
                  borderRadius: 18,
                  border: `1px solid ${hexToRgba(FOREST_GREEN, isLightTheme ? .34 : .42)}`,
                  background: isLightTheme
                    ? `linear-gradient(135deg, ${hexToRgba(FOREST_GREEN, .10)}, rgba(255,255,255,.88))`
                    : `linear-gradient(135deg, ${hexToRgba(FOREST_GREEN, .16)}, rgba(18,20,23,.92))`,
                  padding: '14px 6px 12px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'center',
                  boxShadow: '0 10px 24px rgba(0,0,0,.14)',
                  minWidth: 0,
                }}
              >
                <div style={{ color: pageText, fontSize: valueSize, fontWeight: 1000, lineHeight: 1.1, wordBreak: 'break-word' }}>{statValue.toLocaleString('it-IT')}</div>
                <div style={{ color: isLightTheme ? hexToRgba(FOREST_GREEN, .82) : '#90D84A', fontSize: 'clamp(8.5px, 2.4vw, 9.5px)', fontWeight: 800, marginTop: 6, lineHeight: 1.15, whiteSpace: 'normal' }}>{stat.label}</div>
              </button>
            );
          })}
        </div>

        <DailyAtlasCard
          dailyDiscovery={dailyDiscovery}
          onDocumentAnimal={onDocumentAnimal}
          onOpenAnimal={onOpenAnimal}
          theme={theme}
        />

        <div style={{ color: GREEN, fontSize: 11, fontWeight: 1000, letterSpacing: .9, textTransform: 'uppercase', margin: '0 0 10px 2px' }}>Esplora</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: nearlyBadges.length ? 18 : 8 }}>
          <ExploreImageTile
            title="Territori"
            imageSrc={HOME_EXPLORE_TILES.regioni.fallback}
            imageWebp={getHomeExploreImage('regioni')}
            onClick={() => (onOpenRegions || (() => onOpen('regions')))()}
            borderColor={hexToRgba(GREEN, .24)}
            minHeight={108}
            gridColumn="1 / -1"
          />

          <ExploreImageTile
            title="Albero della vita"
            imageSrc={HOME_EXPLORE_TILES.tree.fallback}
            imageWebp={getHomeExploreImage('tree')}
            imagePosition="center 42%"
            overlay={EXPLORE_TILE_TITLE_OVERLAY_LIGHT}
            onClick={() => onOpen('taxonomy')}
            borderColor={hexToRgba(GREEN, .24)}
          />

          <ExploreImageTile
            title="Badge"
            imageSrc={HOME_EXPLORE_TILES.badges.fallback}
            imageWebp={getHomeExploreImage('badges')}
            imagePosition="center 38%"
            onClick={() => onOpen('badges')}
            borderColor={hexToRgba('#FFD700', .24)}
          />
        </div>

        {!!nearlyBadges.length && (
          <>
            <div style={{ color: mutedText, fontSize: 11, fontWeight: 1000, letterSpacing: .8, textTransform: 'uppercase', margin: '0 0 10px 2px' }}>Quasi completati</div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {nearlyBadges.map((rule, index) => {
                const color = BADGE_LEVEL_COLORS[rule.level] || '#F0A840';
                const bg = badgeAccentImage(rule.badgeId, index);
                return (
                  <button key={rule.badgeId} onClick={() => onOpenBadge?.(rule.badgeId)} style={{ flex: '0 0 auto', width: 132, borderRadius: 20, border: `1px solid ${hexToRgba(color, .34)}`, overflow: 'hidden', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', background: '#121417', boxShadow: '0 12px 28px rgba(0,0,0,.22)' }}>
                    <div style={{ height: 96, position: 'relative', overflow: 'hidden' }}>
                      <img src={bg} alt="" loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.58))' }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                        <ProgressRing progress={rule.progress} color={color} />
                      </div>
                    </div>
                    <div style={{ padding: '10px 10px 12px' }}>
                      <div style={{ color: pageText, fontSize: 14, fontWeight: 1000, lineHeight: 1.1 }}>{rule.name}</div>
                      <div style={{ color: mutedText, fontSize: 10.5, fontWeight: 800, marginTop: 4 }}>Avanzamento</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <button onClick={() => onQuickSeen?.()} style={{ width: '100%', border: 'none', background: 'transparent', color: mutedText, fontFamily: 'inherit', fontSize: 12, fontWeight: 800, cursor: 'pointer', marginTop: 10, padding: 0 }}>
          Avvista veloce →
        </button>
      </div>

      {avatarPickerOpen && (
        <div onClick={() => setAvatarPickerOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 460, background: 'rgba(0,0,0,.74)', display: 'flex', alignItems: 'flex-end', padding: '12px 12px calc(env(safe-area-inset-bottom, 0px) + 12px)', boxSizing: 'border-box' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '72dvh', overflow: 'hidden', borderRadius: '28px 28px 20px 20px', background: isLightTheme ? '#FBF7EF' : '#17191D', border: `1px solid ${panelBorder}`, boxShadow: '0 28px 90px rgba(0,0,0,.62)', padding: 14, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexShrink: 0 }}>
              <div>
                <div style={{ color: pageText, fontSize: 19, fontWeight: 1000 }}>Immagine profilo</div>
                <div style={{ color: mutedText, fontSize: 11.5, marginTop: 3 }}>Scegli tra gli animali avvistati o catturati.</div>
              </div>
              <button onClick={() => setAvatarPickerOpen(false)} aria-label="Chiudi" style={{ width: 40, height: 40, borderRadius: 16, border: `1px solid ${panelBorder}`, background: isLightTheme ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.06)', color: pageText, fontSize: 22, fontWeight: 1000, cursor: 'pointer' }}>×</button>
            </div>
            {!!avatarAnimal && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, flexShrink: 0 }}>
                <div style={{ width: 92, height: 92, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(240,168,64,.42)', background: 'rgba(255,255,255,.06)', boxShadow: '0 10px 28px rgba(0,0,0,.24)' }}>
                  <ProfileAvatarImage animal={avatarAnimal} size={92} fallbackLetter={displayName} fallbackUrl={userProfile?.avatar_url || ''} />
                </div>
              </div>
            )}
            <div style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, paddingBottom: 4 }}>
              {avatarChoices.map(animal => {
                if (!animal?.id) return null;
                const active = String(animal.id) === String(profileAvatarAnimalId);
                const thumbUrl = getAnimalThumbUrl(animal);
                return (
                  <button key={animal.id} type="button" onClick={() => chooseProfileAvatar(animal)} style={{ minHeight: 118, borderRadius: 18, border: `2px solid ${active ? '#F0A840' : panelBorder}`, background: panelBg, color: pageText, fontFamily: 'inherit', padding: 8, cursor: 'pointer', boxShadow: active ? '0 0 0 3px rgba(240,168,64,.18)' : 'none' }}>
                    <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, boxSizing: 'border-box' }}>
                      {thumbUrl ? <img src={thumbUrl} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : null}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 10, fontWeight: 900, lineHeight: 1.15, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{animal.com || animal.sci || 'Animale'}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {navOpen && (
        <div onClick={() => setNavOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 420, background: 'rgba(0,0,0,.52)', display: 'flex', alignItems: 'stretch' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(82vw, 330px)', height: '100%', background: isLightTheme ? '#FBF7EF' : '#121417', borderRight: `1px solid ${panelBorder}`, boxShadow: '24px 0 80px rgba(0,0,0,.45)', padding: '18px 14px', boxSizing: 'border-box', color: pageText }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 18 }}>
              <button onClick={() => setNavOpen(false)} aria-label="Chiudi" style={{ width: 38, height: 38, borderRadius: 13, border: `1px solid ${panelBorder}`, background: 'transparent', color: pageText, fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ display: 'grid', gap: 9 }}>
              {drawerItems.map(item => (
                <button key={item.id} onClick={() => { setNavOpen(false); if (item.id === 'friends') openFriendsFromHome(); else onOpen(item.id); }} style={{ minHeight: 58, border: `1px solid ${panelBorder}`, borderRadius: 17, background: panelBg, color: pageText, cursor: 'pointer', padding: '0 13px', display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left', fontFamily: 'inherit' }}>
                  <span style={{ width: 38, height: 38, borderRadius: 14, background: isLightTheme ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 950, flex: 1 }}>{item.label}</span>
                  {item.id === 'friends' && <SocialCountBadge count={socialAlertCount} />}
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
