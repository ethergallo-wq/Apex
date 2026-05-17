import React, { useState, useEffect, useMemo, useRef } from "react";
import { ANIMALS as LOCAL_ANIMALS } from './animals-data';
import { supabase } from './supabaseClient';

let ANIMALS = LOCAL_ANIMALS;

// ── Config ────────────────────────────────────────────────────────────
const CLS = {
  Mammalia:       { mid:'#7D5E18', img:'#A07830', badge:'#3A2808', accent:'#F0C84E', detailTop:'#5A3A0A', detailBg:'#3A2206', label:'Mammifero',    icon:'🦁' },
  Aves:           { mid:'#1A5080', img:'#2A72A8', badge:'#0A1E3A', accent:'#5BBEF8', detailTop:'#0E3458', detailBg:'#081E38', label:'Uccello',       icon:'🦅' },
  Reptilia:       { mid:'#4A7A20', img:'#62A030', badge:'#243E0A', accent:'#90D84A', detailTop:'#2E5A10', detailBg:'#1A3808', label:'Rettile',       icon:'🦎' },
  Amphibia:       { mid:'#186860', img:'#228A7A', badge:'#083430', accent:'#4ED8BE', detailTop:'#0E4840', detailBg:'#082E28', label:'Anfibio',       icon:'🐸' },
  Actinopterygii: { mid:'#1C3A80', img:'#2A52A8', badge:'#0C1840', accent:'#6088F8', detailTop:'#102258', detailBg:'#081438', label:'Pesce',         icon:'🐟' },
  Insecta:        { mid:'#885820', img:'#A87030', badge:'#442C10', accent:'#F0A840', detailTop:'#603A10', detailBg:'#3A2008', label:'Insetto',       icon:'🦋' },
  Arachnida:      { mid:'#782020', img:'#982828', badge:'#3A0C0C', accent:'#F06060', detailTop:'#541414', detailBg:'#340A0A', label:'Aracnide',      icon:'🕷️' },
  Malacostraca:   { mid:'#883020', img:'#A84028', badge:'#441810', accent:'#F07850', detailTop:'#602010', detailBg:'#3A1408', label:'Crostaceo',     icon:'🦀' },
  Anthozoa:       { mid:'#782060', img:'#982878', badge:'#3A0C30', accent:'#F060B8', detailTop:'#541848', detailBg:'#340A2C', label:'Corallo',       icon:'🪸' },
  Asteroidea:     { mid:'#886020', img:'#A87A28', badge:'#443010', accent:'#F0B840', detailTop:'#604010', detailBg:'#3A2808', label:'Stella Marina', icon:'⭐' },
  Elasmobranchii: { mid:'#1A2E60', img:'#243E80', badge:'#0A1430', accent:'#4A78D8', detailTop:'#0E2050', detailBg:'#081430', label:'Squalo/Razza', icon:'🦈' },
  Cephalopoda:    { mid:'#5A2080', img:'#7428A8', badge:'#2A0C40', accent:'#B860F8', detailTop:'#3E1458', detailBg:'#280A38', label:'Cefalopode',   icon:'🐙' },
  Gastropoda:     { mid:'#6A5030', img:'#8A6840', badge:'#342818', accent:'#D8B070', detailTop:'#4A3420', detailBg:'#2E2010', label:'Gasteropode',  icon:'🐌' },
  Bivalvia:       { mid:'#4A6050', img:'#628068', badge:'#243028', accent:'#90C8A0', detailTop:'#2E4038', detailBg:'#1A2820', label:'Bivalve',      icon:'🐚' },
  Scyphozoa:      { mid:'#6A3070', img:'#884090', badge:'#341838', accent:'#E888F0', detailTop:'#4A2050', detailBg:'#2E1230', label:'Medusa',       icon:'🪼' },
  Chilopoda:      { mid:'#704020', img:'#905028', badge:'#382010', accent:'#E89050', detailTop:'#502A10', detailBg:'#301808', label:'Centopiedi',   icon:'🐛' },
  Holothuroidea:  { mid:'#5A4040', img:'#7A5858', badge:'#2E2020', accent:'#C89898', detailTop:'#3E2A2A', detailBg:'#281818', label:'Oloturia',     icon:'🪱' },
  Echinoidea:     { mid:'#605020', img:'#806828', badge:'#302810', accent:'#D0A848', detailTop:'#403418', detailBg:'#282008', label:'Riccio di mare',icon:'🟣' },
  Diplopoda:      { mid:'#584030', img:'#785840', badge:'#2C2018', accent:'#C09870', detailTop:'#3C2A1C', detailBg:'#241810', label:'Millepiedi',   icon:'🐛' },
  Clitellata:     { mid:'#604838', img:'#806050', badge:'#30241C', accent:'#C0A890', detailTop:'#403028', detailBg:'#281C14', label:'Anellide',     icon:'🪱' },
  Hydrozoa:       { mid:'#1A5A6A', img:'#228890', badge:'#0A2E38', accent:'#5CD8E8', detailTop:'#0E4050', detailBg:'#082830', label:'Idrozoo',      icon:'🫧' },
  Sphenodontia:   { mid:'#4A7A20', img:'#62A030', badge:'#243E0A', accent:'#90D84A', detailTop:'#2E5A10', detailBg:'#1A3808', label:'Sfenodonte',   icon:'🦎' },
  Merostomata:    { mid:'#3A5060', img:'#4A6878', badge:'#1C2830', accent:'#80B0C8', detailTop:'#283840', detailBg:'#182428', label:'Merostoma',    icon:'🦀' },
  Eutardigrada:   { mid:'#606060', img:'#808080', badge:'#303030', accent:'#C0C0C0', detailTop:'#404040', detailBg:'#282828', label:'Tardigrado',   icon:'🔬' },
  Coelacanthi:    { mid:'#1C3A80', img:'#2A52A8', badge:'#0C1840', accent:'#6088F8', detailTop:'#102258', detailBg:'#081438', label:'Celacanto',    icon:'🐟' },
};

const DEX = {
  bgApp:'#101216',
  bgDeep:'#0B0D10',
  surface1:'#171A20',
  surface2:'#1D222B',
  surface3:'#242A34',
  textMain:'#F5F1EA',
  textMuted:'rgba(245,241,234,.62)',
  borderSoft:'rgba(255,255,255,.08)',
  borderMedium:'rgba(255,255,255,.16)',
  status:{
    misterioso:'#45464C',
    ricercato:'#D8D2C4',
    avvistato:'#C87955',
    catturato:'#B84D3A',
  },
  glow:{
    misterioso:'none',
    ricercato:'0 0 18px rgba(216,210,196,.10)',
    avvistato:'0 0 20px rgba(200,121,85,.20)',
    catturato:'0 0 26px rgba(184,77,58,.30)',
  }
};

const ANIMALDEX_THEME_KEY = 'animaldex_theme';
const LIGHT_APP_BG = '#F3EFE6';
const LIGHT_HEADER_BG = '#F8F3EA';
const LIGHT_CARD_BG = '#FBF7EF';
const APP_FRAME_PROPS = { className:'animaldex-app-frame' };
function getInitialAnimaldexTheme() {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem(ANIMALDEX_THEME_KEY);
  return saved === 'light' ? 'light' : 'dark';
}
function applyAnimaldexThemeToDocument(theme) {
  if (typeof document === 'undefined') return;
  const normalized = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.animaldexTheme = normalized;
  document.body.dataset.animaldexTheme = normalized;
  document.body.style.background = normalized === 'light' ? LIGHT_APP_BG : '#1C1C1E';
  try { window.localStorage.setItem(ANIMALDEX_THEME_KEY, normalized); } catch {}
}
const lightText = (theme, dark='white') => theme === 'light' ? '#171717' : dark;
const lightMuted = (theme, dark='rgba(255,255,255,.62)') => theme === 'light' ? 'rgba(0,0,0,.60)' : dark;
const lightSurface = (theme, dark='#1C1C1E') => theme === 'light' ? LIGHT_CARD_BG : dark;

const TAXONOMY_CLASS_BY_ORDER = {
  Passeriformes:'Aves',
  Perciformes:'Actinopterygii',
  Acipenseriformes:'Actinopterygii',
  Siluriformes:'Actinopterygii',
  Amiiformes:'Actinopterygii',
  Anguilliformes:'Actinopterygii',
  Beryciformes:'Actinopterygii',
  Osteoglossiformes:'Actinopterygii',
  Lepisosteiformes:'Actinopterygii',
  Tetraodontiformes:'Actinopterygii',
  Cypriniformes:'Actinopterygii',
  Stomiiformes:'Actinopterygii',
  Clupeiformes:'Actinopterygii',
  Gymnotiformes:'Actinopterygii',
  Esociformes:'Actinopterygii',
  Saccopharyngiformes:'Actinopterygii',
  Beloniformes:'Actinopterygii',
  Gasterosteiformes:'Actinopterygii',
  Pleuronectiformes:'Actinopterygii',
  Gadiformes:'Actinopterygii',
  Osmeriformes:'Actinopterygii',
  Mugiliformes:'Actinopterygii',
  Cyprinodontiformes:'Actinopterygii',
  Polypteriformes:'Actinopterygii',
  Scorpaeniformes:'Actinopterygii',
  Characiformes:'Actinopterygii',
  Salmoniformes:'Actinopterygii',
  Lampriformes:'Actinopterygii',
  Zeiformes:'Actinopterygii',
};
const TAXONOMY_OVERRIDES_BY_SCI = {
  'Passer Sahari': { cls:'Aves', ord:'Passeriformes', fam:'Passeridae', gen:'Passer' },
};
function patchAnimalTaxonomy(raw = {}) {
  const next = { ...(raw || {}) };
  const sci = String(next.sci || next.scientific_name || '').trim();
  const override = TAXONOMY_OVERRIDES_BY_SCI[sci];
  if (override) {
    if (!String(next.gen || next.genus || '').trim() && override.gen) next.gen = override.gen;
    if (!String(next.fam || next.family || '').trim() && override.fam) next.fam = override.fam;
    if (!String(next.ord || next.order || '').trim() && override.ord) next.ord = override.ord;
    if (!String(next.cls || next.class || '').trim() && override.cls) next.cls = override.cls;
  }
  const ord = String(next.ord || next.order || '').trim();
  const cls = String(next.cls || next.class || '').trim();
  if (!cls && TAXONOMY_CLASS_BY_ORDER[ord]) next.cls = TAXONOMY_CLASS_BY_ORDER[ord];
  return next;
}

function hexToRgba(hex, alpha = 1) {
  const clean = String(hex || '#ffffff').replace('#','');
  const full = clean.length === 3 ? clean.split('').map(ch=>ch+ch).join('') : clean;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

// Icone silhouette per stato "non visto" — una per ogni classe
const CLASS_ICONS = {
  Mammalia:       '/icone_unknown/class-mammalia.png',
  Aves:           '/icone_unknown/class-aves.png',
  Reptilia:       '/icone_unknown/class-reptilia.png',
  Amphibia:       '/icone_unknown/class-amphibia.png',
  Actinopterygii: '/icone_unknown/class-actinopterygii.png',
  Elasmobranchii: '/icone_unknown/class-chondrichthyes.png',
  Insecta:        '/icone_unknown/class-insecta.png',
  Arachnida:      '/icone_unknown/class-arachnida.png',
  Malacostraca:   '/icone_unknown/class-malacostraca.png',
  Chilopoda:      '/icone_unknown/class-chilopoda.png',
  Diplopoda:      '/icone_unknown/class-diplopoda.png',
  Gastropoda:     '/icone_unknown/class-gastropoda.png',
  Cephalopoda:    '/icone_unknown/class-cephalopoda.png',
  Bivalvia:       '/icone_unknown/class-bivalvia.png',
};
const CONS = {
  EX: { lbl:'EX', full:'Extinct',                 c:'#FFFFFF', bg:'#1A1A1A' },
  EW: { lbl:'EW', full:'Extinct in the Wild',     c:'#FFFFFF', bg:'#1A1A1A' },
  CR: { lbl:'CR', full:'Critically Endangered',   c:'#FFFFFF', bg:'#DC143C' },
  EN: { lbl:'EN', full:'Endangered',              c:'#000000', bg:'#FF8C00' },
  VU: { lbl:'VU', full:'Vulnerable',              c:'#000000', bg:'#FFD700' },
  NT: { lbl:'NT', full:'Near Threatened',         c:'#FFFFFF', bg:'#20B2AA' },
  LC: { lbl:'LC', full:'Least Concern',           c:'#FFFFFF', bg:'#008B8B' },
  DD: { lbl:'DD', full:'Data Deficient',          c:'#FFFFFF', bg:'#808080' },
};
const RARITY = {
  'Comune':      { c:'#d0895c', bg:'#4a2412', s:1, label:'Comune', shield:'/shields/common_shield.png' },
  'Non comune':  { c:'#a1a8b2', bg:'#343a42', s:2, label:'Non comune', shield:'/shields/noncommon_shield.png' },
  'Raro':        { c:'#f0c449', bg:'#5f4200', s:3, label:'Raro', glow:true, shield:'/shields/rare_shield.png' },
  'Leggendario': { c:'#8f34f5', bg:'#25003f', s:4, label:'Leggendario', glow:true, animate:true, shield:'/shields/legendary_shield.png' },
};
const RARITY_CYCLE = ['Comune','Non comune','Raro','Leggendario'];
const RARITY_COLOR = {'Comune':'#d0895c','Non comune':'#a1a8b2','Raro':'#f0c449','Leggendario':'#8f34f5'};
const RARITY_BG = {'Comune':'#4a2412','Non comune':'#343a42','Raro':'#5f4200','Leggendario':'#25003f'};
const RARITY_BORDER = {'Comune':'#d0895c','Non comune':'#a1a8b2','Raro':'#f0c449','Leggendario':'#8f34f5'};

const SHIELD_PATHS = {
  'Comune': '/shields/common_shield.png',
  'Non comune': '/shields/noncommon_shield.png',
  'Raro': '/shields/rare_shield.png',
  'Leggendario': '/shields/legendary_shield.png',
};

const MYSTERY_PLACEHOLDER = '/icone_unknown/mystery_animal.png';
const GRID_IMAGE_SCALE = 0.759;
const GRID_MYSTERY_SCALE = 1.14;
const GRID_SILHOUETTE_SCALE = 0.74;

const ANIMAL_STATUS = {
  misterioso: { label:'Misterioso', short:'MIST.', c:'#b7bbc3', bg:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.18)', dot:'#b7bbc3', desc:'Identità non ancora rivelata.' },
  ricercato:  { label:'Ricercato',  short:'RIC.',  c:'#ffffff', bg:'rgba(255,255,255,.10)', border:'1.5px solid rgba(255,255,255,.24)', dot:'#ffffff', desc:'Specie ricercata nei tuoi territori, ma non ancora vista.' },
  avvistato:  { label:'Avvistato',  short:'AVV.',  c:'#C87955', bg:'rgba(200,121,85,.14)', border:'1.5px solid #C87955', dot:'#C87955', desc:'Dichiarata come vista dal vivo.' },
  catturato:  { label:'Catturato',  short:'CAT.',  c:'#F5F1EA', bg:'rgba(184,77,58,.86)', border:'1.5px solid rgba(184,77,58,.72)', dot:'#B84D3A', desc:'Registrato nel tuo Animaldex tramite foto o conferma.' },
};
const ANIMAL_STATUS_ORDER = ['misterioso','ricercato','avvistato','catturato'];
const ANIMAL_REVEALED_FIRST_ORDER = ['catturato','avvistato','ricercato','misterioso'];

function normalizeAnimalStatus(status) {
  const s = String(status || '').toLowerCase().trim();
  if (s === 'misterioso' || s === 'bloccato' || s === 'locked') return 'misterioso';
  if (s === 'ricercato' || s === 'non visto' || s === 'non_visto' || s === 'not_seen' || s === 'unknown' || s === 'unlocked') return 'ricercato';
  if (s === 'avvistato' || s === 'visto' || s === 'seen') return 'avvistato';
  if (s === 'catturato' || s === 'fotografato' || s === 'captured' || s === 'photographed' || s === 'collected') return 'catturato';
  return 'ricercato';
}
function isMysteryStatus(status) { return normalizeAnimalStatus(status) === 'misterioso'; }
function isRevealedStatus(status) {
  const s = normalizeAnimalStatus(status);
  return s === 'avvistato' || s === 'catturato';
}
function compareAnimalsRevealedFirst(a, b) {
  const sa = normalizeAnimalStatus(a?.status);
  const sb = normalizeAnimalStatus(b?.status);
  const statusRank = ANIMAL_REVEALED_FIRST_ORDER.indexOf(sa) - ANIMAL_REVEALED_FIRST_ORDER.indexOf(sb);
  if (statusRank) return statusRank;
  return getAnimalPowerScore(b) - getAnimalPowerScore(a) || Number(a?.no || a?.id || 0) - Number(b?.no || b?.id || 0);
}
function getStatusMeta(status) { return ANIMAL_STATUS[normalizeAnimalStatus(status)] || ANIMAL_STATUS.ricercato; }

const STATUS_CARD_STYLE = {
  misterioso: { border:'1.5px solid rgba(255,255,255,.10)', glow:'none', color:DEX.status.misterioso },
  // Ricercato e Avvistato: bordo al 60% dello spessore precedente, niente glow.
  ricercato: { border:`1.2px solid ${DEX.status.ricercato}`, glow:'none', color:DEX.status.ricercato },
  avvistato: { border:`1.2px solid ${DEX.status.avvistato}`, glow:'none', color:DEX.status.avvistato },
  catturato: { border:`2px solid ${DEX.status.catturato}`, glow:'none', color:DEX.status.catturato },
};
const XP_BY_RARITY = {
  seen:{ Comune:10, 'Non comune':20, Raro:50, Leggendario:120 },
  captured:{ Comune:25, 'Non comune':60, Raro:150, Leggendario:400 },
};
const QUICK_SEEN_DAILY_LIMIT = 20;

function getAnimalCountryCodes(animal) {
  return toArraySafe(animal?.distribution?.countries_present || animal?.geo?.iso?.primary || animal?.geo?.iso || animal?.iso || []);
}
function isAnimalInVisitedCountries(animal, visitedCountries = []) {
  const visited = new Set((visitedCountries || []).map(c => String(c).toUpperCase()));
  if (!visited.size) return false;
  return getAnimalCountryCodes(animal).some(code => visited.has(String(code).toUpperCase()));
}
function getResolvedAnimalStatus(animal, statusMap = {}, visitedCountries = []) {
  const manualStatus = normalizeAnimalStatus(statusMap?.[animal?.id] ?? animal?.status);
  if (manualStatus === 'avvistato' || manualStatus === 'catturato') return manualStatus;
  if (isAnimalInVisitedCountries(animal, visitedCountries)) return 'ricercato';
  return manualStatus === 'misterioso' ? 'misterioso' : (visitedCountries?.length ? 'misterioso' : manualStatus);
}
function countCountryMatches(animal, visitedSet) {
  return getAnimalCountryCodes(animal).filter(c => visitedSet.has(String(c).toUpperCase())).length;
}
function computeTotalXP({ animalsWithStatus = [], visitedCountries = [], earnedBadgeIds = [] }) {
  let xp = 0;
  for (const a of animalsWithStatus) {
    const rarity = a.rarity || 'Comune';
    if (a.status === 'avvistato') xp += XP_BY_RARITY.seen[rarity] || 10;
    if (a.status === 'catturato') xp += (XP_BY_RARITY.seen[rarity] || 10) + (XP_BY_RARITY.captured[rarity] || 25);
  }
  xp += visitedCountries?.length ? 100 + Math.max(0, visitedCountries.length - 1) * 40 : 0;
  xp += (earnedBadgeIds || []).length * 120;
  return Math.round(xp);
}
function xpForLevel(level) { return Math.round(100 * Math.pow(Math.max(1, level - 1), 1.65)); }
function computeLevelFromXP(totalXP) {
  let level = 1;
  while (totalXP >= xpForLevel(level + 1)) level++;
  return level;
}
function getNearlyCompletedBadges(statusMap, visitedCountries, earnedBadgeIds) {
  const metrics = computeAwardMetrics(statusMap, visitedCountries);
  const unlocked = new Set((earnedBadgeIds || []).map(normalizeBadgeId));
  return AWARD_RULES
    .map(rule => {
      const current = metrics[rule.metric] || 0;
      const target = rule.threshold || 1;
      const progress = Math.min(1, current / target);
      return { ...rule, current, target, progress };
    })
    .filter(rule => !unlocked.has(normalizeBadgeId(rule.badgeId)) && rule.progress >= 0.6 && rule.progress < 1)
    .sort((a,b)=>b.progress-a.progress)
    .slice(0,3);
}
function buildSimpleProgressState({ animals = ANIMALS, statusMap = {}, visitedCountries = [], earnedBadgeIds = [] }) {
  const animalsWithStatus = (animals || []).map(a => ({ ...a, status:getResolvedAnimalStatus(a, statusMap, visitedCountries) }));
  const searched = animalsWithStatus.filter(a => a.status === 'ricercato');
  const seen = animalsWithStatus.filter(a => a.status === 'avvistato');
  const captured = animalsWithStatus.filter(a => a.status === 'catturato');
  const xp = computeTotalXP({ animalsWithStatus, visitedCountries, earnedBadgeIds });
  return {
    animalsWithStatus,
    searchedCount: searched.length,
    seenCount: seen.length,
    capturedCount: captured.length,
    visitedCountriesCount: visitedCountries.length,
    nearlyCompletedBadges: getNearlyCompletedBadges(statusMap, visitedCountries, earnedBadgeIds),
    xp,
    level: computeLevelFromXP(xp),
  };
}
function getStatusActions(status) {
  const s = normalizeAnimalStatus(status);
  if (s === 'ricercato') return [{ label:'Ho avvistato', action:'mark-seen' }, { label:'Cattura', action:'capture' }];
  if (s === 'avvistato') return [{ label:'Cattura', action:'capture' }];
  return [];
}
function getQuickSeenStorageKey() {
  const d = new Date();
  return `animaldex_quick_seen_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getQuickSeenToday() {
  try { return JSON.parse(localStorage.getItem(getQuickSeenStorageKey()) || '[]'); } catch { return []; }
}
function saveQuickSeenToday(ids) {
  try { localStorage.setItem(getQuickSeenStorageKey(), JSON.stringify(Array.from(new Set(ids)))); } catch {}
}
function getLocalUserStatusKey(userId) {
  return `animaldex_user_status_${userId || 'guest'}`;
}
function getLocalUserStatusMap(userId) {
  if (typeof window === 'undefined' || !userId) return {};
  try {
    const raw = JSON.parse(localStorage.getItem(getLocalUserStatusKey(userId)) || '{}') || {};
    return Object.fromEntries(Object.entries(raw).map(([id, status]) => [id, normalizeAnimalStatus(status)]));
  } catch { return {}; }
}
function saveLocalUserStatusMap(userId, map = {}) {
  if (typeof window === 'undefined' || !userId) return;
  try {
    const clean = {};
    Object.entries(map || {}).forEach(([id, status]) => {
      if (id) clean[id] = normalizeAnimalStatus(status);
    });
    localStorage.setItem(getLocalUserStatusKey(userId), JSON.stringify(clean));
  } catch {}
}
function saveLocalUserAnimalStatus(userId, animalId, status) {
  if (!userId || !animalId) return;
  const next = { ...getLocalUserStatusMap(userId), [animalId]: normalizeAnimalStatus(status) };
  saveLocalUserStatusMap(userId, next);
}
function strongestAnimalStatus(...statuses) {
  return statuses
    .map(normalizeAnimalStatus)
    .filter(Boolean)
    .sort((a,b)=>ANIMAL_STATUS_ORDER.indexOf(b)-ANIMAL_STATUS_ORDER.indexOf(a))[0] || 'misterioso';
}
function mergeStatusMapsByRank(...maps) {
  const ids = new Set();
  maps.forEach(map => Object.keys(map || {}).forEach(id => ids.add(String(id))));
  const merged = {};
  ids.forEach(id => {
    merged[id] = strongestAnimalStatus(...maps.map(map => map?.[id]));
  });
  return merged;
}
const QUICK_SEEN_REJECT_COOLDOWN_DAYS = 14;
const QUICK_SEEN_REJECTED_KEY = 'animaldex_quick_seen_rejected_until';
function getQuickSeenRejectedMap() {
  try {
    const raw = JSON.parse(localStorage.getItem(QUICK_SEEN_REJECTED_KEY) || '{}') || {};
    const now = Date.now();
    const clean = {};
    Object.entries(raw).forEach(([id, until]) => {
      const ts = Number(until || 0);
      if (ts > now) clean[id] = ts;
    });
    if (Object.keys(clean).length !== Object.keys(raw).length) localStorage.setItem(QUICK_SEEN_REJECTED_KEY, JSON.stringify(clean));
    return clean;
  } catch { return {}; }
}
function rejectQuickSeenForCooldown(id) {
  if (!id) return;
  try {
    const map = getQuickSeenRejectedMap();
    const until = Date.now() + QUICK_SEEN_REJECT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    map[String(id)] = until;
    localStorage.setItem(QUICK_SEEN_REJECTED_KEY, JSON.stringify(map));
  } catch {}
}
function isQuickSeenRejected(id) {
  const map = getQuickSeenRejectedMap();
  return Number(map[String(id)] || 0) > Date.now();
}
function quickSeenDailyShuffleScore(animal) {
  const d = new Date();
  const seed = Number(`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`);
  const n = Number(animal?.id || animal?.no || 0);
  return ((n * 9301 + seed * 49297) % 233280) / 233280;
}
function getAnimalVisitedCountryMatches(animal, visitedCountries = []) {
  const visited = (visitedCountries || []).map(c => String(c).toUpperCase());
  const available = new Set(getAnimalCountryCodes(animal).map(c => String(c).toUpperCase()));
  return visited.filter(code => available.has(code));
}
function getQuickSeenCandidates(animals, statusMap, visitedCountries) {
  const visited = (visitedCountries || []).map(c => String(c).toUpperCase()).filter(Boolean);
  return (animals || [])
    .map(a => {
      const local = LOCAL_ANIMALS.find(x => Number(x.id) === Number(a.id) || x.sci === a.sci) || {};
      const merged = { ...local, ...a, image_url:a.image_url || local.image_url || local.img || '' };
      const matchedVisitedCountries = getAnimalVisitedCountryMatches(merged, visited);
      return {
        ...merged,
        status:getResolvedAnimalStatus(merged, statusMap, visitedCountries),
        matchedVisitedCountries,
        countryMatchCount:matchedVisitedCountries.length,
        observationCount:getObservationCount(merged),
        rarityScore:RARITY[merged.rarity]?.s || 1,
      };
    })
    .filter(a => a.status === 'ricercato')
    .filter(a => visited.length > 0 && a.countryMatchCount === visited.length)
    .filter(a => !isQuickSeenRejected(a.id))
    .filter(a => !!a.image_url)
    .sort((a,b) => (a.rarityScore - b.rarityScore) || (b.observationCount - a.observationCount) || (quickSeenDailyShuffleScore(a) - quickSeenDailyShuffleScore(b)))
    .slice(0, QUICK_SEEN_DAILY_LIMIT * 3);
}
function track(eventName, payload = {}) {
  try { console.log('[track]', eventName, payload); } catch {}
}



function appStatusToSupabase(status) {
  const s = normalizeAnimalStatus(status);
  if (s === 'misterioso') return 'locked';
  if (s === 'ricercato') return 'unlocked';
  if (s === 'avvistato') return 'seen';
  if (s === 'catturato') return 'collected';
  return 'locked';
}

function supabaseStatusToApp(status) {
  const s = String(status || '').toLowerCase().trim();
  if (s === 'locked') return 'misterioso';
  if (s === 'unlocked') return 'ricercato';
  if (s === 'seen') return 'avvistato';
  if (s === 'collected') return 'catturato';
  return normalizeAnimalStatus(s);
}

function getRawValue(raw, keys, fallback = undefined) {
  if (!raw || typeof raw !== 'object') return fallback;
  for (const k of keys) {
    if (raw[k] !== undefined && raw[k] !== null) return raw[k];
  }
  return fallback;
}

function toArraySafe(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') return value.split(/[;,|]/).map(v => v.trim()).filter(Boolean);
  return [];
}

function normalizeSupabaseAnimal(row, userAnimal) {
  const raw = patchAnimalTaxonomy(row?.raw && typeof row.raw === 'object' ? row.raw : {});
  const geoRow = Array.isArray(row?.animal_geo) ? row.animal_geo[0] : row?.animal_geo;
  const rawGeo = raw?.geo && typeof raw.geo === 'object' ? raw.geo : {};
  const rawGeoFromRow = geoRow?.raw_geo && typeof geoRow.raw_geo === 'object' ? geoRow.raw_geo : {};
  const geo = { ...rawGeo, ...rawGeoFromRow, ...(geoRow || {}) };
  const countries = toArraySafe(geo?.iso?.primary || geo?.iso || raw?.distribution?.countries_present || raw?.countries_present || raw?.iso);
  const categories = toArraySafe(getRawValue(raw, ['categories', 'category_ids', 'badges', 'abilities'], []));
  const status = supabaseStatusToApp(userAnimal?.unlock_status || 'locked');

  return {
    ...raw,
    ...row,
    desc: row?.description || raw.desc || raw.description || '',
    description: row?.description || raw.description || raw.desc || '',
    image_url: row?.image_url || raw.image_url || raw.img || '',
    com: row?.com || raw.com || raw.name || '',
    sci: row?.sci || raw.sci || raw.scientific_name || '',
    com_en: row?.com_en || raw.com_en || '',
    no: row?.no || raw.no || String(row?.id || '').padStart(3, '0'),
    cls: row?.cls || raw.cls || raw.class || '',
    ord: row?.ord || raw.ord || raw.order || '',
    fam: row?.fam || raw.fam || raw.family || '',
    gen: row?.gen || raw.gen || raw.genus || '',
    phy: row?.phy || raw.phy || raw.phylum || '',
    kin: row?.kin || raw.kin || raw.kingdom || 'Animalia',
    rarity: row?.rarity || raw.rarity || 'Comune',
    cons: raw.cons || raw.iucn || raw.conservation || 'DD',
    trophic: raw.trophic || raw.trophic_level || '2',
    wt: raw.wt || raw.weight || '',
    ln: raw.ln || raw.length || '',
    stats: raw.stats || {},
    categories,
    cat_curiosities: raw.cat_curiosities || raw.category_curiosities || {},
    distribution: {
      ...(raw.distribution || {}),
      countries_present: countries,
    },
    geo: geo || null,
    bioregions_v4: toArraySafe(geo?.bioregions_v4 || rawGeo?.bioregions_v4 || raw.bioregions_v4),
    map_bioregion_ids_v4: toArraySafe(geo?.map_bioregion_ids_v4 || rawGeo?.map_bioregion_ids_v4 || raw.map_bioregion_ids_v4),
    map_bioregion_domains_v4: toArraySafe(geo?.map_bioregion_domains_v4 || rawGeo?.map_bioregion_domains_v4 || raw.map_bioregion_domains_v4),
    map_profile: geo?.map_profile || raw.map_profile || '',
    confidence: geo?.confidence || geo?.bioregion_confidence || raw.confidence || '',
    bio_regions: toArraySafe(geo?.bio_regions || raw.bio_regions),
    game_regions: toArraySafe(geo?.game_regions || raw.game_regions),
    habitats: toArraySafe(geo?.habitats || geo?.habitat_ids || raw.habitats || raw.habitat),
    userStatus: userAnimal?.unlock_status || 'locked',
    userAnimal: userAnimal || null,
    status,
  };
}

function normalizeLocalAnimal(a) {
  const patched = patchAnimalTaxonomy(a || {});
  return {
    ...patched,
    geo: a.geo || null,
    bioregions_v4: toArraySafe(a.bioregions_v4 || a.geo?.bioregions_v4),
    map_bioregion_ids_v4: toArraySafe(a.map_bioregion_ids_v4 || a.geo?.map_bioregion_ids_v4),
    map_bioregion_domains_v4: toArraySafe(a.map_bioregion_domains_v4 || a.geo?.map_bioregion_domains_v4),
    confidence: a.confidence || a.geo?.confidence || a.geo?.bioregion_confidence || '',
    map_profile: a.map_profile || a.geo?.map_profile || '',
    bio_regions: toArraySafe(a.bio_regions || a.geo?.bio_regions),
    game_regions: toArraySafe(a.game_regions || a.geo?.game_regions),
    habitats: toArraySafe(a.habitats || a.habitat || a.geo?.habitats || a.geo?.habitat_ids),
    userStatus: appStatusToSupabase(a.status),
    status: normalizeAnimalStatus(a.status),
  };
}


const LOCAL_ANIMAL_BY_ID = Object.fromEntries(LOCAL_ANIMALS.map(a => [a.id, normalizeLocalAnimal(a)]));
function mergeRemoteWithLocalBioregions(remoteList = []) {
  return (remoteList || []).map(remote => {
    const local = LOCAL_ANIMAL_BY_ID[remote.id];
    if (!local) return remote;
    const remoteIds = getAnimalBioregionIdsV4(remote);
    const hasStats = remote.stats && Object.keys(remote.stats || {}).length > 0;
    const hasCats = remote.categories && remote.categories.length > 0;
    const enrichedRemote = {
      ...remote,
      foodweb: remote.foodweb || local.foodweb || null,
      lifespan: remote.lifespan ?? local.lifespan,
      wt: remote.wt || local.wt || '',
      ln: remote.ln || local.ln || '',
      trophic: remote.trophic || local.trophic,
      stats: hasStats ? remote.stats : (local.stats || {}),
      categories: hasCats ? remote.categories : (local.categories || []),
      cat_curiosities: Object.keys(remote.cat_curiosities || {}).length ? remote.cat_curiosities : (local.cat_curiosities || {}),
      distribution: remote.distribution?.countries_present?.length ? remote.distribution : local.distribution,
    };
    if (remoteIds.length) return enrichedRemote;
    return {
      ...enrichedRemote,
      geo:{ ...(remote.geo || {}), ...(local.geo || {}) },
      bioregions_v4: local.bioregions_v4 || [],
      map_bioregion_ids_v4: local.map_bioregion_ids_v4 || [],
      map_bioregion_domains_v4: local.map_bioregion_domains_v4 || [],
      bio_regions: remote.bio_regions?.length ? remote.bio_regions : local.bio_regions,
      game_regions: remote.game_regions?.length ? remote.game_regions : local.game_regions,
      habitats: remote.habitats?.length ? remote.habitats : local.habitats,
    };
  });
}
function applyCachedUserStatuses(list = [], userId) {
  const cached = getLocalUserStatusMap(userId);
  if (!Object.keys(cached).length) return list;
  return (list || []).map(a => {
    const cachedStatus = cached[a.id] ?? cached[String(a.id)];
    if (!cachedStatus) return a;
    const currentRank = ANIMAL_STATUS_ORDER.indexOf(normalizeAnimalStatus(a.status));
    const cachedRank = ANIMAL_STATUS_ORDER.indexOf(normalizeAnimalStatus(cachedStatus));
    if (cachedRank <= currentRank) return a;
    return { ...a, status:normalizeAnimalStatus(cachedStatus), userStatus:appStatusToSupabase(cachedStatus) };
  });
}

async function ensureUserProfile(user) {
  if (!user?.id) return false;

  const username = String(user.email || 'esploratore').split('@')[0] || 'esploratore';

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    if (data) return true;

    const { error: insertError } = await supabase
      .from('user_profiles')
      .upsert(
        { user_id: user.id, username },
        { onConflict:'user_id' }
      );

    // In signup con conferma email attiva Supabase può restituire un user non ancora utilizzabile
    // lato FK/RLS. Non blocchiamo l'app: riproveremo dopo login/sessione valida.
    if (insertError) {
      console.warn('[Animaldex] Profilo non ancora creabile:', insertError);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[Animaldex] ensureUserProfile skipped:', err);
    return false;
  }
}

async function fetchUserProfile(user) {
  if (!user?.id) return null;
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    const username = String(user.email || 'esploratore').split('@')[0] || 'esploratore';
    if (!data) {
      return mergeProfileDemographics({
        user_id: user.id,
        username,
        nickname: username,
        onboarding_completed: false,
        has_completed_tutorial: false,
        first_login_reward_shown: false,
      }, user.id);
    }

    return mergeProfileDemographics({
      ...data,
      nickname: data.nickname || data.username || username,
      onboarding_completed: Boolean(data.onboarding_completed),
      has_completed_tutorial: Boolean(data.has_completed_tutorial),
      tutorial_completed_at: data.tutorial_completed_at || null,
      first_login_reward_shown: Boolean(data.first_login_reward_shown),
    }, user.id);
  } catch (err) {
    console.warn('[Animaldex] fetchUserProfile fallback:', err);
    const username = String(user.email || 'esploratore').split('@')[0] || 'esploratore';
    return mergeProfileDemographics({
      user_id: user.id,
      username,
      nickname: username,
      onboarding_completed: false,
      has_completed_tutorial: false,
      first_login_reward_shown: false,
    }, user.id);
  }
}

function withTimeout(promiseLike, ms, fallbackValue, label='timeout') {
  let timer;
  const safePromise = Promise.resolve(promiseLike);
  return Promise.race([
    safePromise.finally(() => clearTimeout(timer)),
    new Promise(resolve => {
      timer = setTimeout(() => {
        console.warn(`[Animaldex] ${label} dopo ${ms}ms`);
        resolve(fallbackValue);
      }, ms);
    })
  ]);
}

const PROFILE_DEMOGRAPHICS_STORAGE_PREFIX = 'animaldex_profile_demographics_';
function getProfileDemographicsLocal(userId) {
  if (!userId || typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`${PROFILE_DEMOGRAPHICS_STORAGE_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) || {} : {};
  } catch {
    return {};
  }
}
function normalizeProfileQuestionnaire(data = {}) {
  return {
    date_of_birth: data?.date_of_birth || data?.dob || '',
    residence_country: data?.residence_country || data?.country || '',
    gender: data?.gender || '',
    nationality: data?.nationality || '',
    phone: data?.phone || '',
    onboarding_objectives: Array.isArray(data?.onboarding_objectives) ? data.onboarding_objectives : Array.isArray(data?.objectives) ? data.objectives : [],
    onboarding_objective_other: data?.onboarding_objective_other || data?.objective_other || '',
    is_collector: data?.is_collector ?? data?.collector ?? null,
    annual_abroad_vacations: data?.annual_abroad_vacations || data?.vacations_abroad || '',
    pokemon_affinity: data?.pokemon_affinity || '',
    consent_terms_privacy: Boolean(data?.consent_terms_privacy || data?.termsAccepted),
    consent_analytics: Boolean(data?.consent_analytics),
    consent_marketing: Boolean(data?.consent_marketing),
    consent_personalization: Boolean(data?.consent_personalization),
    consent_newsletter: Boolean(data?.consent_newsletter),
  };
}
function persistProfileDemographicsLocal(userId, data = {}) {
  if (!userId || typeof window === 'undefined') return;
  try {
    const current = getProfileDemographicsLocal(userId);
    localStorage.setItem(`${PROFILE_DEMOGRAPHICS_STORAGE_PREFIX}${userId}`, JSON.stringify({
      ...current,
      ...normalizeProfileQuestionnaire(data),
    }));
  } catch {}
}
function mergeProfileDemographics(profile = {}, userId) {
  const local = getProfileDemographicsLocal(userId || profile?.user_id);
  const normalizedLocal = normalizeProfileQuestionnaire(local);
  return {
    ...profile,
    date_of_birth: profile?.date_of_birth || normalizedLocal.date_of_birth || '',
    residence_country: profile?.residence_country || profile?.country || normalizedLocal.residence_country || '',
    gender: profile?.gender || normalizedLocal.gender || '',
    nationality: profile?.nationality || normalizedLocal.nationality || '',
    phone: profile?.phone || normalizedLocal.phone || '',
    onboarding_objectives: profile?.onboarding_objectives || normalizedLocal.onboarding_objectives || [],
    onboarding_objective_other: profile?.onboarding_objective_other || normalizedLocal.onboarding_objective_other || '',
    is_collector: profile?.is_collector ?? normalizedLocal.is_collector,
    annual_abroad_vacations: profile?.annual_abroad_vacations || normalizedLocal.annual_abroad_vacations || '',
    pokemon_affinity: profile?.pokemon_affinity || normalizedLocal.pokemon_affinity || '',
    consent_terms_privacy: Boolean(profile?.consent_terms_privacy || normalizedLocal.consent_terms_privacy),
    consent_analytics: Boolean(profile?.consent_analytics || normalizedLocal.consent_analytics),
    consent_marketing: Boolean(profile?.consent_marketing || normalizedLocal.consent_marketing),
    consent_personalization: Boolean(profile?.consent_personalization || normalizedLocal.consent_personalization),
    consent_newsletter: Boolean(profile?.consent_newsletter || normalizedLocal.consent_newsletter),
  };
}
async function persistOnboardingQuestionnaire(user, payload = {}) {
  if (!user?.id) return;
  const q = normalizeProfileQuestionnaire(payload);
  persistProfileDemographicsLocal(user.id, q);
  const answers = {
    ...q,
    email: user?.email || '',
    auth_provider: user?.app_metadata?.provider || user?.identities?.[0]?.provider || 'email',
    updated_at: new Date().toISOString(),
  };
  try {
    await supabase.from('user_profiles').upsert({
      user_id: user.id,
      email: user?.email || null,
      auth_provider: user?.app_metadata?.provider || user?.identities?.[0]?.provider || 'email',
      date_of_birth: q.date_of_birth || null,
      residence_country: q.residence_country || null,
      gender: q.gender || null,
      nationality: q.nationality || null,
      phone: q.phone || null,
      onboarding_objectives: q.onboarding_objectives,
      onboarding_objective_other: q.onboarding_objective_other || null,
      is_collector: q.is_collector,
      annual_abroad_vacations: q.annual_abroad_vacations || null,
      pokemon_affinity: q.pokemon_affinity || null,
      consent_terms_privacy: q.consent_terms_privacy,
      consent_analytics: q.consent_analytics,
      consent_marketing: q.consent_marketing,
      consent_personalization: q.consent_personalization,
      consent_newsletter: q.consent_newsletter,
      onboarding_answers: answers,
      updated_at: new Date().toISOString(),
    }, { onConflict:'user_id' });
  } catch (err) {
    console.warn('[Animaldex] Questionario onboarding salvato solo localmente:', err);
  }
}

function buildFallbackProfile(user, onboardingCompleted = true) {
  const username = String(user?.email || 'esploratore').split('@')[0] || 'esploratore';
  return mergeProfileDemographics({
    user_id: user?.id,
    username,
    nickname: username,
    onboarding_completed: onboardingCompleted,
    has_completed_tutorial: true,
    first_login_reward_shown: false,
  }, user?.id);
}

async function fetchAnimalsFromSupabase(userId) {
  const { data: animals, error: animalsError } = await supabase
    .from('animals')
    .select(`
      *,
      animal_geo (*)
    `);

  if (animalsError) throw animalsError;

  const { data: userAnimals, error: userAnimalsError } = await supabase
    .from('user_animals')
    .select('*')
    .eq('user_id', userId);

  if (userAnimalsError) throw userAnimalsError;

  const userAnimalsById = Object.fromEntries((userAnimals || []).map(row => [row.animal_id, row]));
  return (animals || []).map(a => normalizeSupabaseAnimal(a, userAnimalsById[a.id]));
}

async function fetchUserDestinations(userId) {
  const { data, error } = await supabase
    .from('user_destinations')
    .select('iso')
    .eq('user_id', userId);
  if (error) throw error;
  return Array.from(new Set((data || []).map(r => String(r.iso || '').toUpperCase()).filter(Boolean))).sort();
}

async function saveUserAnimalStatus(userId, animal, status) {
  const nextAppStatus = normalizeAnimalStatus(status);
  const unlock_status = appStatusToSupabase(nextAppStatus);
  const now = new Date().toISOString();
  const existing = animal?.userAnimal || null;
  const payload = {
    user_id: userId,
    animal_id: animal.id,
    unlock_status,
    updated_at: now,
  };

  if (unlock_status !== 'locked' && !existing?.unlocked_at) payload.unlocked_at = now;
  if (unlock_status === 'seen') payload.seen_at = now;
  if (unlock_status === 'collected') payload.collected_at = now;

  const { error } = await supabase
    .from('user_animals')
    .upsert(payload, { onConflict:'user_id,animal_id' });
  if (error) throw error;
  return true;
}

async function fetchUserBadgeIds(userId) {
  const { data, error } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  if (error) throw error;
  return Array.from(new Set((data || []).map(row => normalizeBadgeId(row.badge_id)).filter(Boolean)));
}

async function persistEarnedBadges(userId, badgeIds = []) {
  const cleanIds = Array.from(new Set((badgeIds || []).map(normalizeBadgeId).filter(Boolean)));
  if (!userId || !cleanIds.length) return [];

  const { data: existingRows, error: existingError } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)
    .in('badge_id', cleanIds);

  if (existingError) throw existingError;

  const existing = new Set((existingRows || []).map(row => normalizeBadgeId(row.badge_id)));
  const missing = cleanIds.filter(id => !existing.has(id));
  if (!missing.length) return cleanIds;

  const now = new Date().toISOString();
  const payload = missing.map(badge_id => ({
    user_id: userId,
    badge_id,
    earned_at: now,
  }));

  const { error } = await supabase
    .from('user_badges')
    .insert(payload);

  if (error) throw error;
  return cleanIds;
}

async function persistUserDestination(userId, iso, tripTags = []) {
  const cleanIso = String(iso || '').toUpperCase().trim();
  if (!userId || !cleanIso) return false;

  const { error } = await supabase
    .from('user_destinations')
    .insert({
      user_id: userId,
      iso: cleanIso,
      trip_tags: tripTags,
      visited_at: new Date().toISOString().slice(0,10),
    });

  // 23505 = duplicate key. Se hai una unique(user_id, iso, visited_at) o simile,
  // non blocchiamo la RPC: la destinazione risulta già registrata.
  if (error && error.code !== '23505') throw error;
  return true;
}

function normalizeSocialProfile(row = {}) {
  const profile = row.profile || row;
  const username = profile?.username || profile?.nickname || String(profile?.email || 'esploratore').split('@')[0] || 'esploratore';
  return {
    user_id: profile?.user_id || profile?.id || row.user_id || row.id,
    username,
    nickname: profile?.nickname || username,
    avatar_url: profile?.avatar_url || '',
  };
}

const FRIEND_REACTIONS = [
  { key:'wow', emoji:'🤩', label:'Pazzesco' },
  { key:'trophy', emoji:'🏆', label:'Da record' },
  { key:'spark', emoji:'✨', label:'Magia pura' },
  { key:'tracks', emoji:'🐾', label:'Che traccia' },
  { key:'roar', emoji:'🦁', label:'Leggendario' },
  { key:'gem', emoji:'💎', label:'Rarissimo' },
];

function buildSocialFallback(user, profile, progress = {}) {
  return {
    friends: [],
    requestsIn: [],
    requestsOut: [],
    leaderboard: [{ ...(normalizeSocialProfile(profile || user || {})), user_id:user?.id || profile?.user_id || 'me', nickname:profile?.nickname || profile?.username || 'Tu', username:profile?.username || 'tu', isMe:true, level:progress.level || 1, xp:progress.xp || 0, seenCount:progress.seenCount || 0, capturedCount:progress.capturedCount || 0, badgeCount:0, completionPct:0 }],
    events: [],
    notifications: [],
    unreadCount:0,
    socialReady:false,
  };
}

function getSocialEventCopy(event = {}) {
  const rarity = event.rarity || '';
  if (event.event_type === 'legendary_capture') return { title:'Cattura leggendaria', tone:'#F0C449', text:`ha registrato ${event.animal_name || 'una specie leggendaria'}` };
  if (event.event_type === 'rare_capture') return { title:'Cattura rara', tone:'#B860F8', text:`ha registrato ${event.animal_name || 'una specie rara'}` };
  if (event.event_type === 'badge_earned') return { title:'Nuovo badge', tone:'#90D84A', text:`ha ottenuto ${event.badge_name || event.badge_id || 'un badge'}` };
  return { title:'Progressi', tone:'#5BBEF8', text:rarity ? `ha fatto un progresso ${rarity}` : 'ha fatto progressi' };
}

function summarizeUserAnimalRows(rows = []) {
  const seenStatuses = new Set(['seen','collected','avvistato','catturato']);
  const capturedStatuses = new Set(['collected','captured','catturato']);
  const seenCount = rows.filter(r => seenStatuses.has(String(r.unlock_status || r.status || '').toLowerCase())).length;
  const capturedCount = rows.filter(r => capturedStatuses.has(String(r.unlock_status || r.status || '').toLowerCase())).length;
  return { seenCount, capturedCount };
}

function decorateFriendStats(profile, animalRows = [], badgeRows = []) {
  const counts = summarizeUserAnimalRows(animalRows);
  const badgeCount = new Set((badgeRows || []).map(r => normalizeBadgeId(r.badge_id)).filter(Boolean)).size;
  const xp = computeTotalXP({
    animalsWithStatus:[
      ...Array.from({ length:counts.seenCount }, () => ({ status:'avvistato', rarity:'Comune' })),
      ...Array.from({ length:counts.capturedCount }, () => ({ status:'catturato', rarity:'Comune' })),
    ],
    visitedCountries:[],
    earnedBadgeIds:Array.from({ length:badgeCount }, (_, i) => `FRIEND-${i}`),
  });
  return {
    ...profile,
    ...counts,
    badgeCount,
    xp,
    level:computeLevelFromXP(xp),
    completionPct:Math.min(100, Math.round((counts.capturedCount / Math.max(1, ANIMALS.length)) * 100)),
  };
}

async function fetchSocialSnapshot(userId, currentProfile, progress) {
  if (!userId) return buildSocialFallback(null, currentProfile, progress);
  try {
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .order('updated_at', { ascending:false });
    if (error) throw error;

    const rows = friendships || [];
    const otherIds = Array.from(new Set(rows.map(r => r.requester_id === userId ? r.addressee_id : r.requester_id).filter(Boolean)));
    const { data: profiles, error: profileError } = otherIds.length
      ? await supabase.from('user_profiles').select('user_id, username, nickname, avatar_url').in('user_id', otherIds)
      : { data:[], error:null };
    if (profileError) throw profileError;
    const byId = Object.fromEntries((profiles || []).map(p => [p.user_id, normalizeSocialProfile(p)]));
    const decorate = (row) => {
      const otherId = row.requester_id === userId ? row.addressee_id : row.requester_id;
      return { ...row, profile:byId[otherId] || normalizeSocialProfile({ user_id:otherId, username:'Esploratore' }) };
    };
    const accepted = rows.filter(r => r.status === 'accepted').map(decorate);
    const incoming = rows.filter(r => r.status === 'pending' && r.addressee_id === userId).map(decorate);
    const outgoing = rows.filter(r => r.status === 'pending' && r.requester_id === userId).map(decorate);
    const friendIds = accepted.map(r => r.profile.user_id).filter(Boolean);
    const socialIds = Array.from(new Set([userId, ...friendIds]));
    const [{ data: animalRows }, { data: badgeRows }, { data: events }, { data: reactions }, { data: notifications }] = await Promise.all([
      socialIds.length ? supabase.from('user_animals').select('user_id, unlock_status').in('user_id', socialIds) : { data:[] },
      socialIds.length ? supabase.from('user_badges').select('user_id, badge_id').in('user_id', socialIds) : { data:[] },
      socialIds.length ? supabase.from('social_events').select('*').in('user_id', socialIds).order('created_at', { ascending:false }).limit(30) : { data:[] },
      supabase.from('social_event_reactions').select('event_id, user_id, reaction_key, created_at').order('created_at', { ascending:false }).limit(160),
      supabase.from('social_notifications').select('*').eq('user_id', userId).order('created_at', { ascending:false }).limit(40),
    ]);
    const animalsByUser = (animalRows || []).reduce((acc, row) => { (acc[row.user_id] ||= []).push(row); return acc; }, {});
    const badgesByUser = (badgeRows || []).reduce((acc, row) => { (acc[row.user_id] ||= []).push(row); return acc; }, {});
    const friends = accepted.map(r => ({
      ...decorateFriendStats(r.profile, animalsByUser[r.profile.user_id] || [], badgesByUser[r.profile.user_id] || []),
      friendship_id:r.id,
      since:r.accepted_at || r.created_at,
    }));
    const me = decorateFriendStats(normalizeSocialProfile({ ...currentProfile, user_id:userId, username:currentProfile?.username || 'tu', nickname:currentProfile?.nickname || 'Tu' }), animalsByUser[userId] || [], badgesByUser[userId] || []);
    const reactionByEvent = (reactions || []).reduce((acc, row) => { (acc[row.event_id] ||= []).push(row); return acc; }, {});
    const visibleEvents = (events || [])
      .filter(e => e.user_id === userId || friendIds.includes(e.user_id))
      .map(e => ({
        ...e,
        profile:e.user_id === userId ? { ...me, isMe:true } : (friends.find(f => f.user_id === e.user_id) || byId[e.user_id] || normalizeSocialProfile({ user_id:e.user_id })),
        reactions:reactionByEvent[e.id] || [],
      }));
    const unreadCount = (notifications || []).filter(n => !n.read_at).length;
    return {
      friends,
      requestsIn: incoming,
      requestsOut: outgoing,
      leaderboard:[{ ...me, isMe:true }, ...friends].sort((a,b)=>(b.xp || 0) - (a.xp || 0)).map((row, idx) => ({ ...row, rank:idx + 1 })),
      events:visibleEvents,
      notifications:notifications || [],
      unreadCount,
      socialReady:true,
    };
  } catch (err) {
    console.warn('[Animaldex] Social fallback:', err);
    return buildSocialFallback({ id:userId }, currentProfile, progress);
  }
}

async function searchSocialProfiles(userId, query) {
  const q = String(query || '').trim();
  if (!q || q.length < 3) return [];
  const safe = q.replace(/[%_]/g, '');
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, username, nickname, avatar_url')
    .neq('user_id', userId)
    .ilike('username', `${safe}%`)
    .limit(12);
  if (error) throw error;
  return (data || []).map(normalizeSocialProfile);
}

async function requestFriendship(userId, friendId) {
  if (!userId || !friendId || userId === friendId) return false;
  const { data, error } = await supabase.from('friendships').insert({
    requester_id:userId,
    addressee_id:friendId,
    status:'pending',
  }).select('id').maybeSingle();
  if (error && error.code !== '23505') throw error;
  if (data?.id) {
    await supabase.from('social_notifications').insert({
      user_id:friendId,
      actor_id:userId,
      notification_type:'friend_request',
      friendship_id:data.id,
    }).catch(() => {});
  }
  return true;
}

async function updateFriendshipStatus(friendshipId, status, userId) {
  const payload = { status, updated_at:new Date().toISOString() };
  if (status === 'accepted') payload.accepted_at = new Date().toISOString();
  const { data, error } = await supabase.from('friendships').update(payload).eq('id', friendshipId).select('*').maybeSingle();
  if (error) throw error;
  const otherId = data?.requester_id === userId ? data?.addressee_id : data?.requester_id;
  if (status === 'accepted' && otherId) {
    await supabase.from('social_notifications').insert({
      user_id:otherId,
      actor_id:userId,
      notification_type:'friend_accepted',
      friendship_id:friendshipId,
    }).catch(() => {});
  }
  return true;
}

async function deleteFriendship(friendshipId) {
  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
  if (error) throw error;
  return true;
}

async function blockSocialUser(userId, blockedId, friendshipId = null) {
  if (!userId || !blockedId || userId === blockedId) return false;
  const { error } = await supabase.from('user_blocks').insert({ blocker_id:userId, blocked_id:blockedId });
  if (error && error.code !== '23505') throw error;
  if (friendshipId) await deleteFriendship(friendshipId).catch(() => {});
  return true;
}

async function reportSocialUser(userId, reportedUserId, reason = 'other', eventId = null) {
  if (!userId) return false;
  const { error } = await supabase.from('user_reports').insert({
    reporter_id:userId,
    reported_user_id:reportedUserId || null,
    event_id:eventId || null,
    reason,
  });
  if (error) throw error;
  return true;
}

function isSocialCaptureEventWorthy(animal, nextStatus, previousStatus) {
  if (nextStatus !== 'catturato' || previousStatus === 'catturato') return false;
  return ['Raro','Leggendario'].includes(animal?.rarity);
}

async function createSocialCaptureEvent(userId, animal) {
  if (!userId || !animal?.id || !['Raro','Leggendario'].includes(animal?.rarity)) return null;
  const event_type = animal.rarity === 'Leggendario' ? 'legendary_capture' : 'rare_capture';
  const { data, error } = await supabase.from('social_events').upsert({
    user_id:userId,
    event_type,
    animal_id:animal.id,
    animal_name:animal.com || animal.sci || 'Specie rara',
    rarity:animal.rarity,
    metadata:{ class:animal.cls || null, scientific_name:animal.sci || null, conservation:animal.cons || null },
  }, { onConflict:'user_id,event_type,animal_id' }).select('*').maybeSingle();
  if (error) throw error;
  if (data?.id) {
    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
    const friendIds = (friendships || []).map(f => f.requester_id === userId ? f.addressee_id : f.requester_id).filter(Boolean);
    if (friendIds.length) {
      await supabase.from('social_notifications').insert(friendIds.map(friendId => ({
        user_id:friendId,
        actor_id:userId,
        notification_type:event_type,
        event_id:data.id,
      }))).catch(() => {});
    }
  }
  return data;
}

async function createSocialBadgeEvent(userId, award) {
  if (!userId || !award?.badgeId) return null;
  const { data, error } = await supabase.from('social_events').upsert({
    user_id:userId,
    event_type:'badge_earned',
    badge_id:normalizeBadgeId(award.badgeId),
    badge_name:award.name || award.badgeId,
    metadata:{ macro:award.macro || null, level:award.level || null, goal:award.goal || null },
  }, { onConflict:'user_id,event_type,badge_id' }).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

async function reactToSocialEvent(userId, event, reactionKey) {
  if (!userId || !event?.id || !reactionKey) return false;
  const { error } = await supabase.from('social_event_reactions').insert({
    event_id:event.id,
    user_id:userId,
    reaction_key:reactionKey,
  });
  if (error && error.code !== '23505') throw error;
  if (event.user_id && event.user_id !== userId) {
    await supabase.from('social_notifications').insert({
      user_id:event.user_id,
      actor_id:userId,
      notification_type:'reaction',
      event_id:event.id,
      reaction_key:reactionKey,
    }).catch(() => {});
  }
  return true;
}

async function markSocialNotificationsRead(userId) {
  if (!userId) return false;
  const { error } = await supabase
    .from('social_notifications')
    .update({ read_at:new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) throw error;
  return true;
}

function normalizeBadgeId(id) {
  return String(id || '').trim().toUpperCase();
}
const TROPHIC = {
  1:{ label:'Produttore',      c:'#5CC85A', bg:'#123819', desc:'Organismi autotrofi alla base della rete.' },
  2:{ label:'Erbivoro',        c:'#A8D84A', bg:'#263714', desc:'Consumatori primari che si nutrono di piante, semi, frutti o alghe.' },
  3:{ label:'Predatore',       c:'#F5A828', bg:'#3B2205', desc:'Carnivori e onnivori predatori intermedi.' },
  4:{ label:'Predatore Apex',  c:'#F55454', bg:'#3B0B0B', desc:'Vertice della catena alimentare nel suo contesto.' },
  D:{ label:'Decompositore',   c:'#B47A3C', bg:'#3B2410', desc:'Ricicla detrito, carcasse e materia organica.' },
  F:{ label:'Filtratore',      c:'#A8D84A', bg:'#263714', desc:'Filtra particelle, plankton o micro-risorse dall’acqua.' },
};
const PYRAMID_LEVELS = [
  { key:'4', value:4, label:'Predatore Apex', c:'#F55454', bg:'#3B0B0B', desc:'Vertice della catena alimentare.' },
  { key:'3', value:3, label:'Predatore', c:'#F5A828', bg:'#3B2205', desc:'Carnivoro o onnivoro predatore.' },
  { key:'2F', value:'2F', label:'Erbivori e Filtratori', c:'#A8D84A', bg:'#263714', desc:'Consumatori primari: si nutrono di piante, alghe, plankton o particelle filtrate.' },
  { key:'1', value:1, label:'Produttori', c:'#5CC85A', bg:'#123819', desc:'Organismi autotrofi alla base della rete.' },
  { key:'D', value:'D', label:'Decompositori', c:'#B47A3C', bg:'#3B2410', desc:'Riciclano detrito, carcasse e materia organica.' },
];
function getPyramidKey(trophic) {
  const t = String(trophic ?? '').toUpperCase();
  if (t === '4') return '4';
  if (t === '3') return '3';
  if (t === '2' || t === 'F') return '2F';
  if (t === '1') return '1';
  if (t === 'D') return 'D';
  return '3';
}
function getPyramidLevel(trophic) {
  const key = getPyramidKey(trophic);
  return PYRAMID_LEVELS.find(l => l.key === key) || PYRAMID_LEVELS[1];
}

const CATEGORY_META = {
  OFF_PERFECT_STRIKE:       { label:'Colpo Perfetto',        icon:'🎯', color:'#FF4444' },
  OFF_VENOM_TOXINS:         { label:'Veleno & Tossine',      icon:'☠️', color:'#9B59B6' },
  OFF_BIO_BLADES:           { label:'Lame Biologiche',       icon:'🗡️', color:'#E74C3C' },
  OFF_TUSKS_PIERCERS:       { label:'Zanne & Perforatori',   icon:'🦷', color:'#E67E22' },
  DEF_ACTIVE_CAMOUFLAGE:    { label:'Mimetismo Attivo',      icon:'🎭', color:'#2ECC71' },
  DEF_SHELL_ARMOR:          { label:'Corazza & Armatura',     icon:'🛡️', color:'#95A5A6' },
  DEF_SPURS_SPINES:         { label:'Spine & Speroni',       icon:'🌵', color:'#F39C12' },
  DEF_TOUGH_SKIN:           { label:'Pelle Coriacea',        icon:'🧱', color:'#8B7355' },
  SENS_EXTREME_SENSORY:     { label:'Sensi Estremi',         icon:'👁️', color:'#3498DB' },
  SENS_NOCTURNAL_SPECIALISTS:{ label:'Specialisti Notturni', icon:'🌙', color:'#2C3E50' },
  COG_HIGH_INTELLIGENCE:    { label:'Alta Intelligenza',     icon:'🧠', color:'#E91E63' },
  COG_NETWORK_MINDS:        { label:'Menti Collettive',      icon:'🕸️', color:'#9C27B0' },
  PHYS_EXTREME_SPEED:       { label:'Velocità Estrema',      icon:'⚡', color:'#F1C40F' },
  PHYS_FEATHERWEIGHTS:      { label:'Pesi Piuma',            icon:'🪶', color:'#AED6F1' },
  PHYS_HEAVYWEIGHTS:        { label:'Pesi Massimi',          icon:'🏋️', color:'#7F8C8D' },
  PHYS_RECORD_BREAKERS:     { label:'Record del Mondo',      icon:'🏆', color:'#FFD700' },
  BEH_LONG_MIGRATION:       { label:'Grandi Migrazioni',     icon:'🧭', color:'#1ABC9C' },
  BEH_PAIR_BONDING:         { label:'Legame di Coppia',      icon:'💕', color:'#FF69B4' },
  BEH_PARENTAL_CARE:        { label:'Cure Parentali',        icon:'🤱', color:'#FF8A80' },
  SURV_EXTREME_RESILIENCE:  { label:'Resilienza Estrema',    icon:'💪', color:'#E67E22' },
  ECO_ENGINEERS:            { label:'Ingegneri Ecosistemici', icon:'🏗️', color:'#27AE60' },
  ECO_GLOBAL_DISPERSERS:    { label:'Dispersori Globali',    icon:'🌍', color:'#2980B9' },
  ECO_INVISIBLE_HOSTS:      { label:'Ospiti Invisibili',     icon:'🔬', color:'#8E44AD' },
  EVO_DOMESTICATION:        { label:'Addomesticamento',      icon:'🏠', color:'#D35400' },
  EVO_ENDEMIC_SPECIES:      { label:'Specie Endemica',       icon:'📍', color:'#C0392B' },
  EVO_EXTREME_DIMORPHISM:   { label:'Dimorfismo Estremo',    icon:'♀️', color:'#E84393' },
  EVO_INSULAR_DWARFISM:     { label:'Nanismo Insulare',      icon:'🏝️', color:'#00B894' },
  EVO_INSULAR_GIGANTISM:    { label:'Gigantismo Insulare',   icon:'🗿', color:'#6C5CE7' },
  EVO_LIVING_FOSSILS:       { label:'Fossili Viventi',       icon:'🪨', color:'#636E72' },
  LIFESPAN_LONGEVITY:       { label:'Longevità',             icon:'⏳', color:'#FDCB6E' },
  HAB_DEEP_ABYSS:           { label:'Abissi Profondi',       icon:'🌊', color:'#0C2461' },
};

// ANIMALS importato da './animals-data' (1080 animali)


const ABILITY_GROUPS = [
  { id:'offense', label:'Offesa', color:'#FF6B6B', prefixes:['OFF_'] },
  { id:'defense', label:'Difesa', color:'#4ECDC4', prefixes:['DEF_'] },
  { id:'senses', label:'Sensi', color:'#5DADE2', prefixes:['SENS_'] },
  { id:'cognition', label:'Cognizione', color:'#D980FA', prefixes:['COG_'] },
  { id:'physical', label:'Prestazioni fisiche', color:'#F5B041', prefixes:['PHYS_'] },
  { id:'behavior', label:'Comportamento', color:'#58D68D', prefixes:['BEH_'] },
  { id:'ecology', label:'Ecologia', color:'#45B39D', prefixes:['ECO_'] },
  { id:'evolution', label:'Evoluzione', color:'#EC7063', prefixes:['EVO_'] },
  { id:'special', label:'Speciali', color:'#D8B070', prefixes:['SURV_','RES_','LIFESPAN_','HAB_'] },
];
function getAbilityGroupId(categoryId='') {
  const id = String(categoryId || '').toUpperCase();
  const found = ABILITY_GROUPS.find(group => group.prefixes.some(prefix => id.startsWith(prefix)));
  return found?.id || 'special';
}
function getAbilityGroupMeta(categoryId='') {
  const gid = getAbilityGroupId(categoryId);
  return ABILITY_GROUPS.find(group => group.id === gid) || ABILITY_GROUPS[ABILITY_GROUPS.length - 1];
}
const BADGE_LEVEL_COLORS = {
  1: '#CD7F32',
  2: '#C0C0C0',
  3: '#FFD700',
  4: '#8F34F5',
};

const STATS_DEF = [
  {k:'velocita',l:'Velocità', u:'km/h'},{k:'morso',l:'Morso', u:'PSI'},{k:'forza',l:'Forza', u:'%'},
  {k:'resistenza',l:'Resistenza', u:'%'},{k:'intelligenza',l:'Intelligenza', u:'%'},{k:'agilita',l:'Agilità', u:'%'},
];

const STAT_MAXES = {
  velocita: 80,
  morso: 1200,
  forza: 100,
  resistenza: 100,
  intelligenza: 100,
  agilita: 100
};
const SCALE = { Min:0.7, Base:1, Max:1.3 };

// ── Rarity CSS injection ──────────────────────────────────────────────
const RARITY_CSS = `
/* ── Tab slide transitions ── */
@keyframes tabFromRight {
  from { transform: translateX(56px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
@keyframes tabFromLeft {
  from { transform: translateX(-56px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}
.tab-from-right { animation: tabFromRight 0.22s cubic-bezier(.25,.46,.45,.94) forwards; }
.tab-from-left  { animation: tabFromLeft  0.22s cubic-bezier(.25,.46,.45,.94) forwards; }

/* rarità: barra con stemma e lastra metallica/amethyst */
.rarity-badge {
  position: relative;
  isolation: isolate;
  min-height: 34px;
  border-radius: 13px;
  padding: 8px 14px 8px 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  color: #fff;
  font-weight: 900;
  letter-spacing: .2px;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0,0,0,.75), 0 0 8px rgba(255,255,255,.12);
  border: 1.5px solid rgba(242,242,242,.62);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.72), inset 0 -2px 5px rgba(0,0,0,.45), 0 5px 12px rgba(0,0,0,.28);
}
.rarity-badge::before {
  content: '';
  position: absolute;
  inset: 3px 4px 3px 24px;
  border-radius: 10px;
  z-index: -1;
  opacity: .98;
  border: 1px solid rgba(255,255,255,.18);
  box-shadow: inset 0 1px 2px rgba(255,255,255,.24), inset 0 -3px 9px rgba(0,0,0,.36);
}
.rarity-badge::after {
  content: '';
  position: absolute;
  inset: 2px 5px 2px 25px;
  border-radius: 10px;
  z-index: 3;
  background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,.006) 22%, rgba(255,255,255,.078) 42%, rgba(255,255,255,.012) 58%, transparent 76%);
  mix-blend-mode: screen;
  pointer-events: none;
}
.rarity-shield-wrap {
  position: absolute;
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  z-index: 2;
  pointer-events: none;
}
.rarity-shield {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 3px 4px rgba(0,0,0,.55));
}
.rarity-shield-sheen {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(115deg, transparent 18%, rgba(255,255,255,.07) 40%, rgba(255,255,255,.015) 54%, transparent 70%);
  mix-blend-mode: screen;
}
.rarity-badge.compact { min-height: 24px; padding: 3px 8px 3px 34px; border-radius: 999px; font-size: 11px; }
.rarity-badge.compact::before { inset: 2px 4px 2px 18px; border-radius: 999px; }
.rarity-badge.compact::after { inset: 1px 5px 1px 19px; border-radius: 999px; }
.rarity-badge.compact .rarity-shield-wrap { width: 30px; height: 30px; left: -2px; }
.rarity-badge.small { min-height: 30px; padding: 4px 9px 4px 34px; font-size: 10.5px; border-radius: 999px; overflow:hidden; }
.rarity-badge.small::before { inset: 3px 4px 3px 18px; border-radius: 999px; }
.rarity-badge.small::after { inset: 2px 5px 2px 19px; border-radius: 999px; }
.rarity-badge.small .rarity-shield-wrap { width: 28px; height: 28px; left: 0px; }
.rarity-badge.full { width: 100%; box-sizing: border-box; padding-left:70px; min-height:34px; font-size:12px; }
.rarity-badge.full::before { left: 40px; }
.rarity-badge.full::after { left: 41px; }
.rarity-badge.full .rarity-shield-wrap { left: 4px; width:46px; height:46px; }
.rarity-metal-comune { background: linear-gradient(180deg,#f4c39a 0%,#d0895c 45%,#7b3c1d 100%); }
.rarity-metal-comune::before { background: radial-gradient(circle at 25% 20%, rgba(255,238,210,.42), transparent 28%), linear-gradient(135deg,#532311,#d0895c 38%,#ffd0a4 50%,#8a421f 72%,#3b170a 100%); }
.rarity-metal-non-comune { background: linear-gradient(180deg,#eef2f6 0%,#a1a8b2 48%,#4e5660 100%); }
.rarity-metal-non-comune::before { background: radial-gradient(circle at 22% 22%, rgba(255,255,255,.44), transparent 30%), linear-gradient(135deg,#3d454d,#a1a8b2 40%,#ffffff 50%,#67717c 72%,#252a30 100%); }
.rarity-metal-raro { background: linear-gradient(180deg,#fff0a5 0%,#f0c449 46%,#8c6500 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.75), inset 0 -2px 5px rgba(0,0,0,.45), 0 0 12px rgba(240,196,73,.35), 0 5px 12px rgba(0,0,0,.28); }
.rarity-metal-raro::before { background: radial-gradient(circle at 26% 20%, rgba(255,247,190,.42), transparent 30%), linear-gradient(135deg,#5a3900,#f0c449 38%,#fff5b8 50%,#a77b00 72%,#3b2500 100%); }
.rarity-metal-leggendario { background: linear-gradient(180deg,#d2a9ff 0%,#8f34f5 48%,#2d064e 100%); border-color: rgba(220,220,235,.86); box-shadow: inset 0 1px 0 rgba(255,255,255,.82), inset 0 -2px 5px rgba(0,0,0,.48), 0 0 16px rgba(143,52,245,.38), 0 0 32px rgba(143,52,245,.15), 0 5px 12px rgba(0,0,0,.28); }
.rarity-metal-leggendario::before { background: radial-gradient(circle at 28% 22%, rgba(255,255,255,.44), transparent 18%), radial-gradient(circle at 72% 64%, rgba(255,255,255,.14), transparent 14%), linear-gradient(135deg,#210036 0%,#8f34f5 34%,#f4d9ff 50%,#7b1de1 66%,#260046 100%); }

/* rarità essenziale: solo piastra + testo, niente pallino interno o riquadro intermedio */
.rarity-badge::before,
.rarity-badge::after { content:none !important; display:none !important; }

/* pallino rarità nella griglia: fisso, nessun glow */
.rarity-dot { position: relative; overflow: hidden; box-shadow: none !important; border:1px solid rgba(255,255,255,.2); }
.rarity-dot::after {
  content:'';
  position:absolute;
  inset: 1px 2px auto 2px;
  height: 35%;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255,255,255,.36), rgba(255,255,255,0));
  pointer-events:none;
}
.rarity-dot-comune     { background:#d0895c; box-shadow:none !important; }
.rarity-dot-non-comune { background:#a1a8b2; box-shadow:none !important; }
.rarity-dot-raro       { background:#f0c449; box-shadow:none !important; }
.rarity-dot-leggendario{ background:#8f34f5; box-shadow:0 0 8px rgba(143,52,245,.65), 0 0 14px rgba(143,52,245,.28) !important; }

.award-toast-sparkles::before,
.award-toast-sparkles::after {
  content:'';
  position:absolute;
  inset:-12px;
  background:
    radial-gradient(circle at 10% 22%, rgba(255,255,255,.9) 0 2px, transparent 3px),
    radial-gradient(circle at 82% 18%, rgba(255,255,255,.72) 0 2px, transparent 3px),
    radial-gradient(circle at 18% 78%, rgba(255,255,255,.75) 0 2px, transparent 3px),
    radial-gradient(circle at 88% 84%, rgba(255,255,255,.9) 0 2px, transparent 3px),
    radial-gradient(circle at 56% 8%, rgba(255,225,120,.8) 0 2px, transparent 3px),
    radial-gradient(circle at 42% 92%, rgba(255,225,120,.7) 0 2px, transparent 3px);
  pointer-events:none;
  animation: awardPulse 1.8s ease-in-out infinite;
}
@keyframes awardPulse {
  0%,100% { transform: scale(1); opacity:.55; }
  50% { transform: scale(1.04); opacity:1; }
}
@keyframes interactiveWiggle {
  0%,100% { transform: translateZ(0) rotate(0deg); }
  18% { transform: translateZ(0) rotate(.8deg) translateX(1px); }
  36% { transform: translateZ(0) rotate(-.8deg) translateX(-1px); }
  54% { transform: translateZ(0) rotate(.45deg) translateX(.5px); }
  72% { transform: translateZ(0) rotate(-.35deg) translateX(-.5px); }
}
.interactive-hint {
  animation: interactiveWiggle .46s ease-in-out .55s 1;
}


@keyframes rarityContinuousSweep {
  0%   { transform: translateX(-105%) skewX(-18deg); opacity:.10; }
  35%  { opacity:.42; }
  100% { transform: translateX(105%) skewX(-18deg); opacity:.10; }
}
@keyframes rarityGemDrift {
  0%   { transform: translateX(-18%); opacity:.48; }
  100% { transform: translateX(18%); opacity:.92; }
}
@keyframes rarityWaterCaustics {
  0%   { transform: translate3d(-16%,-10%,0) rotate(0deg); background-position:0% 50%, 100% 30%, 0% 0%; opacity:.22; }
  50%  { opacity:.46; }
  100% { transform: translate3d(16%,10%,0) rotate(.001deg); background-position:100% 50%, 0% 70%, 220% 0%; opacity:.22; }
}
.rarity-silver-sheen { animation: rarityContinuousSweep 5.6s linear infinite; }
.rarity-legendary-water { animation: rarityWaterCaustics 7.8s linear infinite; }
.rarity-rare-gems { animation: rarityGemDrift 6.4s linear infinite; }
.gebco-map-label {
  position:absolute; left:10px; bottom:8px; z-index:4; pointer-events:none;
  color:rgba(180,226,255,.58); font-size:9px; font-weight:1000; letter-spacing:.7px; text-transform:uppercase;
  text-shadow:0 2px 8px rgba(0,0,0,.75);
}

#animaldex-app-root[data-theme="light"] { background:#F3EFE6 !important; color:#171717 !important; }
#animaldex-app-root[data-theme="light"] * { text-shadow:none !important; }
#animaldex-app-root[data-theme="light"] input::placeholder { color:rgba(0,0,0,.42) !important; }
#animaldex-app-root[data-theme="light"] input { color:#171717; }
#animaldex-app-root[data-theme="light"] .rarity-badge span { color:inherit; }
#animaldex-app-root[data-theme="light"] .light-surface-card {
  background:#FBF7EF !important;
  border-color:rgba(0,0,0,.10) !important;
  box-shadow:0 14px 34px rgba(20,20,20,.08) !important;
}
#animaldex-app-root[data-theme="light"] .light-readable-text { color:#171717 !important; }
#animaldex-app-root[data-theme="light"] .light-readable-muted { color:rgba(0,0,0,.58) !important; }

`;

// ── Flag Emoji Generator ──────────────────────────────────────────────
const getFlagEmoji = (code) => {
  const clean = String(code || '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(clean)) return '🌍';
  try {
    return String.fromCodePoint(...[...clean].map(char => 127397 + char.charCodeAt(0)));
  } catch {
    return '🌍';
  }
};

// ── ISO to English Country Names ──────────────────────────────────────
const ISO_TO_EN = {
  'IT':'Italy','ES':'Spain','FR':'France','DE':'Germany','GB':'United Kingdom',
  'PT':'Portugal','NL':'Netherlands','BE':'Belgium','CH':'Switzerland','AT':'Austria',
  'SE':'Sweden','NO':'Norway','DK':'Denmark','FI':'Finland','PL':'Poland',
  'CZ':'Czech Republic','SK':'Slovakia','HU':'Hungary','RO':'Romania','BG':'Bulgaria',
  'HR':'Croatia','SI':'Slovenia','GR':'Greece','TR':'Turkey','UA':'Ukraine',
  'RU':'Russia','US':'United States','CA':'Canada','MX':'Mexico','BR':'Brazil',
  'AR':'Argentina','CL':'Chile','CO':'Colombia','PE':'Peru','VE':'Venezuela',
  'EC':'Ecuador','BO':'Bolivia','PY':'Paraguay','UY':'Uruguay','CR':'Costa Rica',
  'PA':'Panama','JM':'Jamaica','CU':'Cuba','DO':'Dominican Republic','HT':'Haiti',
  'AU':'Australia','NZ':'New Zealand','JP':'Japan','CN':'China','IN':'India',
  'ZA':'South Africa','KE':'Kenya','NG':'Nigeria','EG':'Egypt','MA':'Morocco',
  'GH':'Ghana','TZ':'Tanzania','UG':'Uganda','ET':'Ethiopia','SN':'Senegal',
  'CI':'Côte d\'Ivoire','CM':'Cameroon','ZM':'Zambia','ZW':'Zimbabwe','BW':'Botswana',
  'NA':'Namibia','AO':'Angola','MZ':'Mozambique','MW':'Malawi','BI':'Burundi',
  'RW':'Rwanda','SG':'Singapore','MY':'Malaysia','TH':'Thailand','ID':'Indonesia',
  'PH':'Philippines','VN':'Vietnam','KH':'Cambodia','LA':'Laos','MM':'Myanmar',
  'PK':'Pakistan','BD':'Bangladesh','LK':'Sri Lanka','NP':'Nepal','BT':'Bhutan',
  'KR':'South Korea','KP':'North Korea','TW':'Taiwan','MN':'Mongolia','KZ':'Kazakhstan',
  'UZ':'Uzbekistan','TJ':'Tajikistan','TM':'Turkmenistan','KG':'Kyrgyzstan','AF':'Afghanistan',
  'IR':'Iran','IQ':'Iraq','SA':'Saudi Arabia','AE':'United Arab Emirates','QA':'Qatar',
  'KW':'Kuwait','BH':'Bahrain','OM':'Oman','YE':'Yemen','IL':'Israel',
  'JO':'Jordan','LB':'Lebanon','SY':'Syria','TN':'Tunisia','DZ':'Algeria',
  'LY':'Libya','SD':'Sudan','SS':'South Sudan','SO':'Somalia','DJ':'Djibouti',
  'ER':'Eritrea','MG':'Madagascar','MU':'Mauritius','SC':'Seychelles','KM':'Comoros',
  'MR':'Mauritania','ML':'Mali','BF':'Burkina Faso','NE':'Niger','CD':'Democratic Republic of the Congo',
  'CG':'Republic of the Congo','CF':'Central African Republic','TD':'Chad','GA':'Gabon','GQ':'Equatorial Guinea',
  'STP':'São Tomé and Príncipe','LR':'Liberia','SL':'Sierra Leone','GM':'Gambia','GW':'Guinea-Bissau',
  'GN':'Guinea','BJ':'Benin','TG':'Togo','LV':'Latvia','LT':'Lithuania',
  'EE':'Estonia','BY':'Belarus','MD':'Moldova','RS':'Serbia','BA':'Bosnia and Herzegovina',
  'PR':'Puerto Rico','PG':'Papua New Guinea'
};

const COUNTRIES = [
  {code:'IT',name:'Italia'},{code:'ES',name:'Spagna'},{code:'FR',name:'Francia'},{code:'DE',name:'Germania'},{code:'GB',name:'Regno Unito'},
  {code:'PT',name:'Portogallo'},{code:'NL',name:'Paesi Bassi'},{code:'BE',name:'Belgio'},{code:'CH',name:'Svizzera'},{code:'AT',name:'Austria'},
  {code:'SE',name:'Svezia'},{code:'NO',name:'Norvegia'},{code:'DK',name:'Danimarca'},{code:'FI',name:'Finlandia'},{code:'PL',name:'Polonia'},
  {code:'CZ',name:'Repubblica Ceca'},{code:'SK',name:'Slovacchia'},{code:'HU',name:'Ungheria'},{code:'RO',name:'Romania'},{code:'BG',name:'Bulgaria'},
  {code:'HR',name:'Croazia'},{code:'SI',name:'Slovenia'},{code:'GR',name:'Grecia'},{code:'TR',name:'Turchia'},{code:'UA',name:'Ucraina'},
  {code:'RU',name:'Russia'},{code:'US',name:'Stati Uniti'},{code:'CA',name:'Canada'},{code:'MX',name:'Messico'},{code:'BR',name:'Brasile'},
  {code:'AR',name:'Argentina'},{code:'CL',name:'Cile'},{code:'CO',name:'Colombia'},{code:'PE',name:'Perù'},{code:'VE',name:'Venezuela'},
  {code:'EC',name:'Ecuador'},{code:'BO',name:'Bolivia'},{code:'PY',name:'Paraguay'},{code:'UY',name:'Uruguay'},{code:'CR',name:'Costa Rica'},
  {code:'PA',name:'Panama'},{code:'JM',name:'Giamaica'},{code:'CU',name:'Cuba'},{code:'DO',name:'Repubblica Dominicana'},{code:'HT',name:'Haiti'},
  {code:'AU',name:'Australia'},{code:'NZ',name:'Nuova Zelanda'},{code:'JP',name:'Giappone'},{code:'CN',name:'Cina'},{code:'IN',name:'India'},
  {code:'ZA',name:'Sud Africa'},{code:'KE',name:'Kenya'},{code:'NG',name:'Nigeria'},{code:'EG',name:'Egitto'},{code:'MA',name:'Marocco'},
  {code:'GH',name:'Ghana'},{code:'TZ',name:'Tanzania'},{code:'UG',name:'Uganda'},{code:'ET',name:'Etiopia'},{code:'SN',name:'Senegal'},
  {code:'CI',name:'Costa d\'Avorio'},{code:'CM',name:'Camerun'},{code:'ZM',name:'Zambia'},{code:'ZW',name:'Zimbabwe'},{code:'BW',name:'Botswana'},
  {code:'NA',name:'Namibia'},{code:'AO',name:'Angola'},{code:'MZ',name:'Mozambico'},{code:'MW',name:'Malawi'},{code:'BI',name:'Burundi'},
  {code:'RW',name:'Ruanda'},{code:'SG',name:'Singapore'},{code:'MY',name:'Malesia'},{code:'TH',name:'Tailandia'},{code:'ID',name:'Indonesia'},
  {code:'PH',name:'Filippine'},{code:'VN',name:'Vietnam'},{code:'KH',name:'Cambogia'},{code:'LA',name:'Laos'},{code:'MM',name:'Myanmar'},
  {code:'PK',name:'Pakistan'},{code:'BD',name:'Bangladesh'},{code:'LK',name:'Sri Lanka'},{code:'NP',name:'Nepal'},{code:'BT',name:'Bhutan'},
  {code:'KR',name:'Corea del Sud'},{code:'KP',name:'Corea del Nord'},{code:'TW',name:'Taiwan'},{code:'MN',name:'Mongolia'},{code:'KZ',name:'Kazakistan'},
  {code:'UZ',name:'Uzbekistan'},{code:'TJ',name:'Tagikistan'},{code:'TM',name:'Turkmenistan'},{code:'KG',name:'Kirghizistan'},{code:'AF',name:'Afghanistan'},
  {code:'IR',name:'Iran'},{code:'IQ',name:'Iraq'},{code:'SA',name:'Arabia Saudita'},{code:'AE',name:'Emirati Arabi Uniti'},{code:'QA',name:'Qatar'},
  {code:'KW',name:'Kuwait'},{code:'BH',name:'Bahrein'},{code:'OM',name:'Oman'},{code:'YE',name:'Yemen'},{code:'IL',name:'Israele'},
  {code:'JO',name:'Giordania'},{code:'LB',name:'Libano'},{code:'SY',name:'Siria'},{code:'TN',name:'Tunisia'},{code:'DZ',name:'Algeria'},
  {code:'LY',name:'Libia'},{code:'SD',name:'Sudan'},{code:'SS',name:'Sud Sudan'},{code:'SO',name:'Somalia'},{code:'DJ',name:'Gibuti'},
  {code:'ER',name:'Eritrea'},{code:'MG',name:'Madagascar'},{code:'MU',name:'Mauritius'},{code:'SC',name:'Seychelles'},{code:'KM',name:'Comore'},
  {code:'MR',name:'Mauritania'},{code:'ML',name:'Mali'},{code:'BF',name:'Burkina Faso'},{code:'NE',name:'Niger'},{code:'TD',name:'Ciad'},
  {code:'CF',name:'Repubblica Centrafricana'},{code:'CG',name:'Congo'},{code:'CD',name:'Rep. Democratica del Congo'},{code:'GA',name:'Gabon'},{code:'GQ',name:'Guinea Equatoriale'},
  {code:'ST',name:'São Tomé e Príncipe'},{code:'LR',name:'Liberia'},{code:'SL',name:'Sierra Leone'},{code:'GM',name:'Gambia'},{code:'GW',name:'Guinea-Bissau'},
  {code:'GN',name:'Guinea'},{code:'BJ',name:'Benin'},{code:'TG',name:'Togo'},{code:'LV',name:'Lettonia'},{code:'LT',name:'Lituania'},
  {code:'EE',name:'Estonia'},{code:'BY',name:'Bielorussia'},{code:'MD',name:'Moldavia'},{code:'RS',name:'Serbia'},{code:'BA',name:'Bosnia ed Erzegovina'},
  {code:'ME',name:'Montenegro'},{code:'MK',name:'Macedonia del Nord'},{code:'AL',name:'Albania'},{code:'XK',name:'Kosovo'},{code:'IE',name:'Irlanda'},
  {code:'IS',name:'Islanda'},{code:'MT',name:'Malta'},{code:'CY',name:'Cipro'},{code:'PR',name:'Portorico'},{code:'VI',name:'Isole Vergini USA'},
  {code:'BS',name:'Bahamas'},{code:'BB',name:'Barbados'},{code:'TT',name:'Trinidad e Tobago'},{code:'BZ',name:'Belize'},{code:'SV',name:'El Salvador'},
  {code:'GT',name:'Guatemala'},{code:'HN',name:'Honduras'},{code:'NI',name:'Nicaragua'},{code:'SR',name:'Suriname'},{code:'GY',name:'Guyana'},
  {code:'FJ',name:'Fiji'},{code:'PG',name:'Papua Nuova Guinea'},{code:'SB',name:'Isole Salomone'},{code:'VU',name:'Vanuatu'},{code:'WS',name:'Samoa'},
  {code:'KI',name:'Kiribati'},{code:'TO',name:'Tonga'},{code:'PW',name:'Palau'},{code:'FM',name:'Micronesia'},{code:'MH',name:'Isole Marshall'},
  {code:'NR',name:'Nauru'},{code:'TL',name:'Timor Est'},{code:'BN',name:'Brunei'},
];


const uniqIso = (...lists) => Array.from(new Set(lists.flat().filter(Boolean)));

// Bioregioni v4: 53 ecoregioni terrestri + 12 reami marini.
// Le geometrie complete sono caricate da /geo/bioregions-v4-terrestrial-marine-kepler.geojson.
const BIOREGION_V4_CONTINENTS = [{"id":"america","label":"America","source_continente":"Americhe","image":["/regions/continents/america.jpg","/regions/america.jpg","/regions/America_tropicale.jpg"],"realmType":"terrestrial","regions":[{"id":"nord-america-boreale","label":"Nord America Boreale","image":["/regions/regions/nord-america-boreale.jpg","/regions/nord-america-boreale.jpg","/regions/nord_America_boreale.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_003","label":"Alaska","display_name":"Alaska","name_en":"Alaska","bioregionId":"TER_SR_003","image":["/regions/ecoregions/alaska.jpg","/regions/alaska.jpg","/regions/nord_America_boreale.jpg"],"iso":["CA","US"],"source_ecoregions":"Ahklun and Kilbuck Upland Tundra;Alaska Peninsula montane taiga;Alaska-St. Elias Range tundra;Aleutian Islands tundra;Arctic coastal tundra;Arctic foothills tundra;Beringia lowland tundra;Beringia upland tundra;Brooks-British Range tundra;Cook Inlet taiga;Copper Plateau taiga;Interior Alaska-Yukon lowland taiga;Interior Yukon-Alaska alpine tundra;Northern Pacific Alaskan coastal forests;Pacific Coastal Mountain icefields and tundra","area_km2":1614916.157,"realmType":"terrestrial"},{"id":"TER_SR_001","label":"Groenlandia","display_name":"Groenlandia","name_en":"Greenland","bioregionId":"TER_SR_001","image":["/regions/ecoregions/groenlandia.jpg","/regions/groenlandia.jpg","/regions/artide.jpg","/regions/Nord_America_desertico.jpg"],"iso":["GL"],"source_ecoregions":"Kalaallit Nunaat Arctic steppe;Kalaallit Nunaat High Arctic tundra","area_km2":476846.409,"realmType":"terrestrial"},{"id":"TER_SR_004","label":"Foreste boreali canadesi","display_name":"Foreste boreali canadesi","name_en":"Canadian Boreal Forests","bioregionId":"TER_SR_004","image":["/regions/ecoregions/foreste-boreali-canadesi.jpg","/regions/foreste-boreali-canadesi.jpg","/regions/nord_America_boreale.jpg"],"iso":["CA","US"],"source_ecoregions":"Alberta-British Columbia foothills forests;Canadian Aspen forests and parklands;Central British Columbia Mountain forests;Central Canadian Shield forests;Eastern Canadian Forest-Boreal transition;Eastern Canadian Shield taiga;Eastern Canadian forests;Fraser Plateau and Basin conifer forests;Mid-Canada Boreal Plains forests;Midwest Canadian Shield forests;Muskwa-Slave Lake taiga;Northern Cordillera forests;Northern Rockies conifer forests;Okanogan dry forests;Southern Hudson Bay taiga;Torngat Mountain tundra","area_km2":5045811.842,"realmType":"terrestrial"},{"id":"TER_SR_002","label":"Tundra canadese","display_name":"Tundra canadese","name_en":"Canadian Tundra","bioregionId":"TER_SR_002","image":["/regions/ecoregions/tundra-canadese.jpg","/regions/tundra-canadese.jpg","/regions/nord_America_boreale.jpg"],"iso":["CA","US"],"source_ecoregions":"Canadian High Arctic tundra;Canadian Low Arctic tundra;Canadian Middle Arctic Tundra;Davis Highlands tundra;Northern Canadian Shield taiga;Northwest Territories taiga;Ogilvie-MacKenzie alpine tundra;Watson Highlands taiga","area_km2":4082662.608,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_003","TER_SR_001","TER_SR_004","TER_SR_002"],"iso":["CA","GL","US"]},{"id":"nord-america-temperato","label":"Nord America Temperato","image":["/regions/regions/nord-america-temperato.jpg","/regions/nord-america-temperato.jpg","/regions/nord_america_temperato.jpg","/regions/America_temperato.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_005","label":"Costa del Pacifico settentrionale","display_name":"Costa del Pacifico settentrionale","name_en":"North Pacific Coast","bioregionId":"TER_SR_005","image":["/regions/ecoregions/costa-del-pacifico-settentrionale.jpg","/regions/costa-del-pacifico-settentrionale.jpg","/regions/nord_america_temperato.jpg"],"iso":["CA","MX","US"],"source_ecoregions":"British Columbia coastal conifer forests;California coastal sage and chaparral;Central Pacific Northwest coastal forests;Central-Southern Cascades Forests;Eastern Cascades forests;Klamath-Siskiyou forests;North Cascades conifer forests;Northern California coastal forests;Puget lowland forests;Queen Charlotte Islands conifer forests;Sierra Nevada forests","area_km2":530154.927,"realmType":"terrestrial"},{"id":"TER_SR_009","label":"Foreste nordamericane","display_name":"Foreste nordamericane","name_en":"Northeast American Forests","bioregionId":"TER_SR_009","image":["/regions/ecoregions/foreste-nordamericane.jpg","/regions/foreste-nordamericane.jpg","/regions/nord_america_temperato.jpg"],"iso":["CA","US"],"source_ecoregions":"Allegheny Highlands forests;Appalachian Piedmont forests;Appalachian mixed mesophytic forests;Appalachian-Blue Ridge forests;Eastern Great Lakes lowland forests;New England-Acadian forests;Northeast US Coastal forests;Western Great Lakes forests","area_km2":1411819.674,"realmType":"terrestrial"},{"id":"TER_SR_008","label":"Grandi Pianure","display_name":"Grandi Pianure","name_en":"Great Plains","bioregionId":"TER_SR_008","image":["/regions/ecoregions/grandi-pianure.jpg","/regions/grandi-pianure.jpg","/regions/America_temperato.jpg"],"iso":["CA","MX","US"],"source_ecoregions":"California Central Valley grasslands;Central Tallgrass prairie;Central US forest-grasslands transition;Central-Southern US mixed grasslands;Cross-Timbers savanna-woodland;Edwards Plateau savanna;Flint Hills tallgrass prairie;Montana Valley and Foothill grasslands;Nebraska Sand Hills mixed grasslands;Northern Shortgrass prairie;Northern Tallgrass prairie;Palouse prairie;Texas blackland prairies;Western Gulf coastal grasslands;Western shortgrass prairie","area_km2":2750181.708,"realmType":"terrestrial"},{"id":"TER_SR_006","label":"Ovest americano","display_name":"Ovest americano","name_en":"American West","bioregionId":"TER_SR_006","image":["/regions/ecoregions/ovest-americano.jpg","/regions/ovest-americano.jpg","/regions/nord_america_temperato.jpg"],"iso":["CA","MX","US"],"source_ecoregions":"Arizona Mountains forests;Blue Mountains forests;California interior chaparral and woodlands;California montane chaparral and woodlands;Colorado Plateau shrublands;Colorado Rockies forests;East Central Texas forests;Great Basin montane forests;Great Basin shrub steppe;Gulf of California xeric scrub;Gulf of St. Lawrence lowland forests;Mojave desert;Ozark Highlands mixed forests;Ozark Mountain forests;Santa Lucia Montane Chaparral & Woodlands;Snake-Columbia shrub steppe;South Central Rockies forests;Upper Midwest US forest-savanna transition;Wasatch and Uinta montane forests;Willamette Valley oak savanna;Wyoming Basin shrub steppe","area_km2":2135396.38,"realmType":"terrestrial"},{"id":"TER_SR_010","label":"Savane e foreste del sud-est degli Stati Uniti","display_name":"Savane e foreste del sud-est degli Stati Uniti","name_en":"Southeast US Savannas & Forests","bioregionId":"TER_SR_010","image":["/regions/ecoregions/savane-e-foreste-del-sud-est-degli-stati-uniti.jpg","/regions/savane-e-foreste-del-sud-est-degli-stati-uniti.jpg","/regions/nord_america_temperato.jpg"],"iso":["CA","US"],"source_ecoregions":"Atlantic coastal pine barrens;Interior Plateau US Hardwood Forests;Mid-Atlantic US coastal savannas;Mississippi lowland forests;Piney Woods;Southeast US conifer savannas;Southeast US mixed woodlands and savannas;Southern Great Lakes forests","area_km2":1233314.96,"realmType":"terrestrial"},{"id":"TER_SR_007","label":"Zone aride messicane","display_name":"Zone aride messicane","name_en":"Mexican Drylands","bioregionId":"TER_SR_007","image":["/regions/ecoregions/zone-aride-messicane.jpg","/regions/zone-aride-messicane.jpg","/regions/Nord_America_desertico.jpg"],"iso":["MX","US"],"source_ecoregions":"Baja California desert;Bajío dry forests;Balsas dry forests;Central Mexican matorral;Chihuahuan desert;Islas Revillagigedo dry forests;Jalisco dry forests;Meseta Central matorral;Northern Mesoamerican Pacific mangroves;Oaxacan montane forests;San Lucan xeric scrub;Sierra Madre Occidental pine-oak forests;Sierra Madre Oriental pine-oak forests;Sierra Madre de Oaxaca pine-oak forests;Sierra Madre del Sur pine-oak forests;Sierra de la Laguna dry forests;Sierra de la Laguna pine-oak forests;Sinaloan dry forests;Sonoran desert;Sonoran-Sinaloan subtropical dry forest;Southern Pacific dry forests;Tamaulipan matorral;Tamaulipan mezquital;Tehuacán Valley matorral;Trans-Mexican Volcanic Belt pine-oak forests;Veracruz dry forests","area_km2":1915739.33,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_005","TER_SR_009","TER_SR_008","TER_SR_006","TER_SR_010","TER_SR_007"],"iso":["CA","MX","US"]},{"id":"america-centrale-e-caraibi","label":"America Centrale e Caraibi","image":["/regions/regions/america-centrale-e-caraibi.jpg","/regions/america-centrale-e-caraibi.jpg","/regions/America_tropicale.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_012","label":"America Centrale","display_name":"America Centrale","name_en":"Central America","bioregionId":"TER_SR_012","image":["/regions/ecoregions/america-centrale.jpg","/regions/america-centrale.jpg","/regions/America_tropicale.jpg"],"iso":["BZ","CO","CR","GT","HN","MX","NI","PA","SV"],"source_ecoregions":"Belizian pine savannas;Central American Atlantic moist forests;Central American dry forests;Central American montane forests;Central American pine-oak forests;Chiapas Depression dry forests;Chiapas montane forests;Costa Rican seasonal moist forests;Eastern Panamanian montane forests;Isthmian-Atlantic moist forests;Isthmian-Pacific moist forests;Motagua Valley thornscrub;Panamanian dry forests;Petén-Veracruz moist forests;Sierra Madre de Chiapas moist forests;Sierra de los Tuxtlas;Veracruz moist forests;Veracruz montane forests;Yucatán dry forests;Yucatán moist forests","area_km2":769691.265,"realmType":"terrestrial"},{"id":"TER_SR_011","label":"Caraibi","display_name":"Caraibi","name_en":"Caribbean","bioregionId":"TER_SR_011","image":["/regions/ecoregions/caraibi.jpg","/regions/caraibi.jpg","/regions/America_tropicale.jpg"],"iso":["AG","BB","BR","BS","BZ","CO","CR","CU","DM","DO","GD","GT","GY","HN","HT","JM","KN","LC","MX","NI","PA","PR","SR","TT","US","VC","VE"],"source_ecoregions":"Amazon-Orinoco-Southern Caribbean mangroves;Bahamian pineyards;Bahamian-Antillean mangroves;Bermuda subtropical conifer forests;Caribbean shrublands;Cordillera La Costa montane forests;Cordillera de Merida páramo;Cuban cactus scrub;Cuban dry forests;Cuban moist forests;Cuban pine forests;Cuban wetlands;Guajira-Barranquilla xeric scrub;Hispaniolan dry forests;Hispaniolan moist forests;Hispaniolan pine forests;Jamaican dry forests;Jamaican moist forests;Lara-Falcón dry forests;Leeward Islands moist forests;Lesser Antillean dry forests;Mesoamerican Gulf-Caribbean mangroves;Paraguaná xeric scrub;Puerto Rican dry forests;Puerto Rican moist forests;Santa Marta montane forests;Santa Marta páramo;Sinú Valley dry forests;Trinidad and Tobago dry forest;Trinidad and Tobago moist forest;Windward Islands moist forests","area_km2":412090.603,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_012","TER_SR_011"],"iso":["AG","BB","BR","BS","BZ","CO","CR","CU","DM","DO","GD","GT","GY","HN","HT","JM","KN","LC","MX","NI","PA","PR","SR","SV","TT","US","VC","VE"]},{"id":"sud-america-tropicale","label":"Sud America Tropicale","image":["/regions/regions/sud-america-tropicale.jpg","/regions/sud-america-tropicale.jpg","/regions/America_tropicale.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_014","label":"Amazzonia","display_name":"Amazzonia","name_en":"Amazonia","bioregionId":"TER_SR_014","image":["/regions/ecoregions/amazzonia.jpg","/regions/amazzonia.jpg","/regions/America_tropicale.jpg"],"iso":["BO","BR","CO","EC","PE","VE"],"source_ecoregions":"Beni savanna;Chiquitano dry forests;Gurupa várzea;Iquitos várzea;Japurá-Solimões-Negro moist forests;Juruá-Purus moist forests;Madeira-Tapajós moist forests;Napo moist forests;Negro-Branco moist forests;Purus várzea;Purus-Madeira moist forests;Rio Negro campinarana;Southwest Amazon moist forests;Tapajós-Xingu moist forests;Tocantins/Pindare moist forests;Ucayali moist forests;Xingu-Tocantins-Araguaia moist forests","area_km2":4257547.418,"realmType":"terrestrial"},{"id":"TER_SR_013","label":"America meridionale settentrionale","display_name":"America meridionale settentrionale","name_en":"Upper South America","bioregionId":"TER_SR_013","image":["/regions/ecoregions/america-meridionale-settentrionale.jpg","/regions/america-meridionale-settentrionale.jpg"],"iso":["BR","CO","GY","PE","SR","VE"],"source_ecoregions":"Apure-Villavicencio dry forests;Caqueta moist forests;Catatumbo moist forests;Cordillera Oriental montane forests;Guianan freshwater swamp forests;Guianan piedmont moist forests;Guianan savanna;Llanos;Magdalena Valley montane forests;Maracaibo dry forests;Marajó várzea;Maranhão Babaçu forests;Orinoco Delta swamp forests;Solimões-Japurá moist forests;Uatumã-Trombetas moist forests","area_km2":2090004.134,"realmType":"terrestrial"},{"id":"TER_SR_015","label":"Cerrado brasiliano e costa atlantica","display_name":"Cerrado brasiliano e costa atlantica","name_en":"Brazil Cerrado & Atlantic Coast","bioregionId":"TER_SR_015","image":["/regions/ecoregions/cerrado-brasiliano-e-costa-atlantica.jpg","/regions/cerrado-brasiliano-e-costa-atlantica.jpg","/regions/America_temperato.jpg"],"iso":["AR","BO","BR","PY","UY"],"source_ecoregions":"Alto Paraná Atlantic forests;Araucaria moist forests;Atlantic Coast restingas;Bahia coastal forests;Bahia interior forests;Brazilian Atlantic dry forests;Caatinga;Caatinga Enclaves moist forests;Campos Rupestres montane savanna;Cerrado;Fernando de Noronha-Atol das Rocas moist forests;Mato Grosso tropical dry forests;Northeast Brazil restingas;Pantanal;Pernambuco coastal forests;Pernambuco interior forests;Serra do Mar coastal forests;Southern Atlantic Brazilian mangroves;St. Peter and St. Paul Rocks","area_km2":4579579.052,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_014","TER_SR_013","TER_SR_015"],"iso":["AR","BO","BR","CO","EC","GY","PE","PY","SR","UY","VE"]},{"id":"sud-america-andino-e-temperato","label":"Sud America Andino e Temperato","image":["/regions/regions/sud-america-andino-e-temperato.jpg","/regions/sud-america-andino-e-temperato.jpg","/regions/America_temperato.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_017","label":"Ande e costa del Pacifico","display_name":"Ande e costa del Pacifico","name_en":"Andes Mountains & Pacific Coast","bioregionId":"TER_SR_017","image":["/regions/ecoregions/ande-e-costa-del-pacifico.jpg","/regions/ande-e-costa-del-pacifico.jpg"],"iso":["AR","BO","BR","CL","CO","CR","DO","EC","GT","GY","HN","HT","MX","NI","PA","PE","SR","SV","US","VE"],"source_ecoregions":"Araya and Paria xeric scrub;Atacama desert;Bolivian Yungas;Bolivian montane dry forests;Cauca Valley dry forests;Cauca Valley montane forests;Cayos Miskitos-San Andrés and Providencia moist forests;Central Andean dry puna;Central Andean puna;Central Andean wet puna;Chilean Matorral;Chimalapas montane forests;Chocó-Darién moist forests;Clipperton Island shrub and grasslands;Cocos Island moist forests;Cordillera Central páramo;Eastern Cordillera Real montane forests;Ecuadorian dry forests;Enriquillo wetlands;Everglades flooded grasslands;Galápagos Islands xeric scrub;Guayaquil flooded grasslands;Guianan Highlands moist forests;Guianan lowland moist forests;Juan Fernández Islands temperate forests;La Costa xeric shrublands;Magdalena Valley dry forests;Magdalena-Urabá moist forests;Magellanic subpolar forests;Malpelo Island xeric scrub;Marañón dry forests;Miskito pine forests;Northern Andean páramo;Northwest Andean montane forests;Orinoco wetlands;Pantanos de Centla;Pantepui forests & shrublands;Patía valley dry forests;Peruvian Yungas;San Félix-San Ambrosio Islands temperate forests;Sechura desert;South American Pacific mangroves;Southern Andean Yungas;Southern Andean steppe;Southern Mesoamerican Pacific mangroves;Talamancan montane forests;Trindade-Martin Vaz Islands tropical forests;Tumbes-Piura dry forests;Valdivian temperate forests;Venezuelan Andes montane forests;Western Ecuador moist forests","area_km2":3415826.95,"realmType":"terrestrial"},{"id":"TER_SR_016","label":"Praterie sudamericane","display_name":"Praterie sudamericane","name_en":"South American Grasslands","bioregionId":"TER_SR_016","image":["/regions/ecoregions/praterie-sudamericane.jpg","/regions/praterie-sudamericane.jpg","/regions/America_temperato.jpg"],"iso":["AR","BO","BR","CL","FK","PY","UY"],"source_ecoregions":"Dry Chaco;Espinal;High Monte;Humid Chaco;Humid Pampas;Low Monte;Monte Alegre várzea;Paraná flooded savanna;Patagonian steppe;Southern Cone Mesopotamian savanna;Uruguayan savanna","area_km2":3305054.491,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_017","TER_SR_016"],"iso":["AR","BO","BR","CL","CO","CR","DO","EC","FK","GT","GY","HN","HT","MX","NI","PA","PE","PY","SR","SV","US","UY","VE"]}],"bioregionIds":["TER_SR_003","TER_SR_001","TER_SR_004","TER_SR_002","TER_SR_005","TER_SR_009","TER_SR_008","TER_SR_006","TER_SR_010","TER_SR_007","TER_SR_012","TER_SR_011","TER_SR_014","TER_SR_013","TER_SR_015","TER_SR_017","TER_SR_016"],"iso":["AG","AR","BB","BO","BR","BS","BZ","CA","CL","CO","CR","CU","DM","DO","EC","FK","GD","GL","GT","GY","HN","HT","JM","KN","LC","MX","NI","PA","PE","PR","PY","SR","SV","TT","US","UY","VC","VE"]},{"id":"eurasia","label":"Eurasia","source_continente":"Eurasia","image":["/regions/continents/eurasia.jpg","/regions/eurasia.jpg","/regions/asia.jpg","/regions/europa.jpg"],"realmType":"terrestrial","regions":[{"id":"eurasia-occidentale","label":"Eurasia Occidentale","image":["/regions/regions/eurasia-occidentale.jpg","/regions/eurasia-occidentale.jpg","/regions/europa.jpg","/regions/Europa-temperata.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_027","label":"Mediterraneo","display_name":"Mediterraneo","name_en":"Mediterranean","bioregionId":"TER_SR_027","image":["/regions/ecoregions/mediterraneo.jpg","/regions/mediterraneo.jpg","/regions/Europa_mediterranea.jpg"],"iso":["BG","CY","DZ","EG","ES","GR","HR","IL","IQ","IT","JO","LB","LY","MA","MK","PS","PT","RS","RU","SA","SY","TN","TR"],"source_ecoregions":"Aegean and Western Turkey sclerophyllous and mixed forests;Azores temperate mixed forests;Corsican montane broadleaf and mixed forests;Crete Mediterranean forests;Crimean Submediterranean forest complex;Cyprus Mediterranean forests;Eastern Mediterranean conifer-broadleaf forests;Iberian conifer forests;Iberian sclerophyllous and semi-deciduous forests;Italian sclerophyllous and semi-deciduous forests;Madeira evergreen forests;Mediterranean High Atlas juniper steppe;Mediterranean conifer and mixed forests;Mediterranean dry woodlands and steppe;Mediterranean woodlands and forests;Northeast Spain and Southern France Mediterranean forests;Northwest Iberian montane forests;Rodope montane mixed forests;Southeast Iberian shrubs and woodlands;Southwest Iberian Mediterranean sclerophyllous and mixed forests;Tyrrhenian-Adriatic sclerophyllous and mixed forests","area_km2":1783068.96,"realmType":"terrestrial"},{"id":"TER_SR_030","label":"Europa Temperata","display_name":"Europa Temperata","name_en":"Greater European Forests","bioregionId":"TER_SR_030","image":["/regions/ecoregions/europa-temperata.jpg","/regions/europa-temperata.jpg","/regions/Europa-temperata.jpg"],"iso":["AT","BA","BE","BY","CH","CZ","DE","DK","GB","HR","HU","IT","LT","LU","MD","NL","PL","RO","RS","RU","SE","SI","SK","UA"],"source_ecoregions":"Baltic mixed forests;Central European mixed forests;English Lowlands beech forests;European Atlantic mixed forests;Pannonian mixed forests;Po Basin mixed forests;Western European broadleaf forests","area_km2":2124879.763,"realmType":"terrestrial"},{"id":"TER_SR_029","label":"Foreste montane europee","display_name":"Foreste montane europee","name_en":"European Mountain Forests","bioregionId":"TER_SR_029","image":["/regions/ecoregions/foreste-montane-europee.jpg","/regions/foreste-montane-europee.jpg"],"iso":["AL","AT","BA","BG","CH","CZ","DE","ES","GR","HR","HU","IT","ME","MK","PL","PT","RO","RS","SI","SK","TR","UA"],"source_ecoregions":"Alps conifer and mixed forests;Appenine deciduous montane forests;Balkan mixed forests;Cantabrian mixed forests;Carpathian montane forests;Dinaric Mountains mixed forests;Illyrian deciduous forests;Pindus Mountains mixed forests;Pyrenees conifer and mixed forests;South Apennine mixed montane forests","area_km2":789972.546,"realmType":"terrestrial"},{"id":"TER_SR_031","label":"Isole anglo-celtiche","display_name":"Isole anglo-celtiche","name_en":"Anglo-Celtic Isles","bioregionId":"TER_SR_031","image":["/regions/ecoregions/isole-anglo-celtiche.jpg","/regions/isole-anglo-celtiche.jpg"],"iso":["GB","IE","IS"],"source_ecoregions":"Celtic broadleaf forests;Faroe Islands boreal grasslands;Iceland boreal birch forests and alpine tundra;North Atlantic moist mixed forests","area_km2":343045.945,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_027","TER_SR_030","TER_SR_029","TER_SR_031"],"iso":["AL","AT","BA","BE","BG","BY","CH","CY","CZ","DE","DK","DZ","EG","ES","GB","GR","HR","HU","IE","IL","IQ","IS","IT","JO","LB","LT","LU","LY","MA","MD","ME","MK","NL","PL","PS","PT","RO","RS","RU","SA","SE","SI","SK","SY","TN","TR","UA"]},{"id":"eurasia-settentrionale","label":"Eurasia Settentrionale","image":["/regions/regions/eurasia-settentrionale.jpg","/regions/eurasia-settentrionale.jpg","/regions/Europa_boreale.jpg","/regions/asia_boreale_steppa.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_035","label":"Mare di Okhotsk e tundra/taiga di Bering","display_name":"Mare di Okhotsk e tundra/taiga di Bering","name_en":"Sea of Okhotsk & Bering Tundra-Taiga","bioregionId":"TER_SR_035","image":["/regions/ecoregions/mare-di-okhotsk-e-tundra-taiga-di-bering.jpg","/regions/mare-di-okhotsk-e-tundra-taiga-di-bering.jpg"],"iso":["RU"],"source_ecoregions":"Cherskii-Kolyma mountain tundra;Chukchi Peninsula tundra;Kamchatka taiga;Kamchatka tundra;Kamchatka-Kurile meadows and sparse forests;Russian Bering tundra;Sakhalin Island taiga;Wrangel Island Arctic desert","area_km2":1696996.247,"realmType":"terrestrial"},{"id":"TER_SR_033","label":"Scandinavia e foreste boreali occidentali","display_name":"Scandinavia e foreste boreali occidentali","name_en":"Scandinavian Boreal Forests","bioregionId":"TER_SR_033","image":["/regions/ecoregions/scandinavia-e-foreste-boreali-occidentali.jpg","/regions/scandinavia-e-foreste-boreali-occidentali.jpg","/regions/Europa_boreale.jpg"],"iso":["BY","EE","FI","GB","LT","LV","RU","SE"],"source_ecoregions":"Caledon conifer forests;Sarmatic mixed forests;Scandinavian Montane Birch forest and grasslands;Scandinavian and Russian taiga","area_km2":3288083.739,"realmType":"terrestrial"},{"id":"TER_SR_034","label":"Siberia e foreste boreali orientali","display_name":"Siberia e foreste boreali orientali","name_en":"Siberian Boreal Forests","bioregionId":"TER_SR_034","image":["/regions/ecoregions/siberia-e-foreste-boreali-orientali.jpg","/regions/siberia-e-foreste-boreali-orientali.jpg","/regions/asia_boreale_steppa.jpg"],"iso":["CN","RU"],"source_ecoregions":"East Siberian taiga;Northeast Siberian coastal tundra;Northeast Siberian taiga;South Siberian forest steppe;West Siberian taiga","area_km2":7122827.2,"realmType":"terrestrial"},{"id":"TER_SR_032","label":"Tundra paleartica","display_name":"Tundra paleartica","name_en":"Palearctic Tundra","bioregionId":"TER_SR_032","image":["/regions/ecoregions/tundra-paleartica.jpg","/regions/tundra-paleartica.jpg"],"iso":["RU"],"source_ecoregions":"Kola Peninsula tundra;Northwest Russian-Novaya Zemlya tundra;Novosibirsk Islands Arctic desert;Russian Arctic desert;Scandinavian coastal conifer forests;Taimyr-Central Siberian tundra;Yamal-Gydan tundra","area_km2":1941307.834,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_035","TER_SR_033","TER_SR_034","TER_SR_032"],"iso":["BY","CN","EE","FI","GB","LT","LV","RU","SE"]},{"id":"eurasia-centrale","label":"Eurasia Centrale","image":["/regions/regions/eurasia-centrale.jpg","/regions/eurasia-centrale.jpg","/regions/asia_occidentale_centrale.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_025","label":"Grande penisola arabica","display_name":"Grande penisola arabica","name_en":"Greater Arabian Peninsula","bioregionId":"TER_SR_025","image":["/regions/ecoregions/grande-penisola-arabica.jpg","/regions/grande-penisola-arabica.jpg"],"iso":["AE","EG","IL","IQ","IR","JO","KW","OM","PS","SA","SD","SY","TR","YE"],"source_ecoregions":"Al-Hajar foothill xeric woodlands and shrublands;Al-Hajar montane woodlands and shrublands;Arabian desert;Arabian sand desert;East Arabian fog shrublands and sand desert;North Arabian desert;North Arabian highland shrublands;Red Sea coastal desert;Red Sea-Arabian Desert shrublands;South Arabian plains and plateau desert;Syrian xeric grasslands and shrublands;Tigris-Euphrates alluvial salt marsh","area_km2":2988797.314,"realmType":"terrestrial"},{"id":"TER_SR_044","label":"Mar Caspio e deserti dell'Asia centrale","display_name":"Mar Caspio e deserti dell'Asia centrale","name_en":"Caspian Sea & Central Asian Deserts","bioregionId":"TER_SR_044","image":["/regions/ecoregions/mar-caspio-e-deserti-dell-asia-centrale.jpg","/regions/mar-caspio-e-deserti-dell-asia-centrale.jpg"],"iso":["AF","AZ","IQ","IR","KG","KZ","PK","RU","TJ","TM","UZ"],"source_ecoregions":"Afghan Mountains semi-desert;Badghyz and Karabil semi-desert;Caspian Hyrcanian mixed forests;Caspian lowland desert;Central Asian northern desert;Central Asian riparian woodlands;Central Asian southern desert;Gissaro-Alai open woodlands;Kopet Dag semi-desert;Kopet Dag woodlands and forest steppe;Paropamisus xeric woodlands;South Iran Nubo-Sindian desert and semi-desert","area_km2":2486784.154,"realmType":"terrestrial"},{"id":"TER_SR_042","label":"Monti Altai-Sayan","display_name":"Monti Altai-Sayan","name_en":"Altai-Sayan Mountains","bioregionId":"TER_SR_042","image":["/regions/ecoregions/monti-altai-sayan.jpg","/regions/monti-altai-sayan.jpg"],"iso":["CN","KZ","MN","RU"],"source_ecoregions":"Altai alpine meadow and tundra;Altai montane forest and forest steppe;Altai steppe and semi-desert;Sayan Intermontane steppe;Sayan alpine meadows and tundra;Sayan montane conifer forests;Trans-Baikal Bald Mountain tundra;Trans-Baikal conifer forests","area_km2":1210394.391,"realmType":"terrestrial"},{"id":"TER_SR_045","label":"Monti Tien Shan","display_name":"Monti Tien Shan","name_en":"Tien Shan Mountains","bioregionId":"TER_SR_045","image":["/regions/ecoregions/monti-tien-shan.jpg","/regions/monti-tien-shan.jpg"],"iso":["CN","KG","KZ","TJ","TM","UZ"],"source_ecoregions":"Alai-Western Tian Shan steppe;Emin Valley steppe;Tian Shan foothill arid steppe;Tian Shan montane conifer forests;Tian Shan montane steppe and meadows","area_km2":630237.048,"realmType":"terrestrial"},{"id":"TER_SR_043","label":"Steppe kazake e foreste emiboreali","display_name":"Steppe kazake e foreste emiboreali","name_en":"Kazakh Steppes & Hemiboreal Forests","bioregionId":"TER_SR_043","image":["/regions/ecoregions/steppe-kazake-e-foreste-emiboreali.jpg","/regions/steppe-kazake-e-foreste-emiboreali.jpg"],"iso":["BG","KZ","MD","RO","RU","UA"],"source_ecoregions":"East European forest steppe;Kazakh forest steppe;Kazakh semi-desert;Kazakh steppe;Kazakh upland steppe;Urals montane forest and taiga;Western Siberian hemiboreal forests","area_km2":3112802.985,"realmType":"terrestrial"},{"id":"TER_SR_046","label":"Deserti e foreste persiane","display_name":"Deserti e foreste persiane","name_en":"Persian Deserts & Forests","bioregionId":"TER_SR_046","image":["/regions/ecoregions/deserti-e-foreste-persiane.jpg","/regions/deserti-e-foreste-persiane.jpg"],"iso":["AE","AF","AM","AZ","EG","IL","IN","IQ","IR","JO","KW","OM","PK","PS","QA","SA","SY","TR"],"source_ecoregions":"Arabian-Persian Gulf coastal plain desert;Baluchistan xeric woodlands;Central Afghan Mountains xeric woodlands;Central Persian desert basins;East Afghan montane conifer forests;Elburz Range forest steppe;Ghorat-Hazarajat alpine meadow;Kuh Rud and Eastern Iran montane woodlands;Mesopotamian shrub desert;Registan-North Pakistan sandy desert;Sulaiman Range alpine meadows;Zagros Mountains forest steppe","area_km2":2308332.586,"realmType":"terrestrial"},{"id":"TER_SR_028","label":"Foreste e steppe del Mar Nero","display_name":"Foreste e steppe del Mar Nero","name_en":"Black Sea Forests & Steppe","bioregionId":"TER_SR_028","image":["/regions/ecoregions/foreste-e-steppe-del-mar-nero.jpg","/regions/foreste-e-steppe-del-mar-nero.jpg"],"iso":["AM","AZ","BG","GE","IL","IR","KZ","LB","MD","RO","RU","SY","TR","UA"],"source_ecoregions":"Anatolian conifer and deciduous mixed forests;Azerbaijan shrub desert and steppe;Caucasus mixed forests;Central Anatolian steppe;Central Anatolian steppe and woodlands;Eastern Anatolian deciduous forests;Eastern Anatolian montane steppe;Euxine-Colchic broadleaf forests;Northern Anatolian conifer and deciduous forests;Pontic steppe;Southern Anatolian montane conifer and deciduous forests","area_km2":1946936.463,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_025","TER_SR_044","TER_SR_042","TER_SR_045","TER_SR_043","TER_SR_046","TER_SR_028"],"iso":["AE","AF","AM","AZ","BG","CN","EG","GE","IL","IN","IQ","IR","JO","KG","KW","KZ","LB","MD","MN","OM","PK","PS","QA","RO","RU","SA","SD","SY","TJ","TM","TR","UA","UZ","YE"]},{"id":"eurasia-orientale","label":"Eurasia Orientale","image":["/regions/regions/eurasia-orientale.jpg","/regions/eurasia-orientale.jpg","/regions/asia_orientale.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_036","label":"Isole giapponesi","display_name":"Isole giapponesi","name_en":"Japanese Islands","bioregionId":"TER_SR_036","image":["/regions/ecoregions/isole-giapponesi.jpg","/regions/isole-giapponesi.jpg"],"iso":["JP","RU"],"source_ecoregions":"Hokkaido deciduous forests;Hokkaido montane conifer forests;Honshu alpine conifer forests;Nihonkai evergreen forests;Nihonkai montane deciduous forests;Taiheiyo evergreen forests","area_km2":337776.098,"realmType":"terrestrial"},{"id":"TER_SR_040","label":"Altopiano tibetano","display_name":"Altopiano tibetano","name_en":"Tibetan Plateau","bioregionId":"TER_SR_040","image":["/regions/ecoregions/altopiano-tibetano.jpg","/regions/altopiano-tibetano.jpg"],"iso":["AF","BT","CN","IN","KG","MM","NP","PK","TJ","UZ"],"source_ecoregions":"Central Tibetan Plateau alpine steppe;Eastern Himalayan alpine shrub and meadows;Hengduan Mountains subalpine conifer forests;Hindu Kush alpine meadow;Karakoram-West Tibetan Plateau alpine steppe;North Tibetan Plateau-Kunlun Mountains alpine desert;Northeast Himalayan subalpine conifer forests;Northwestern Himalayan alpine shrub and meadows;Nujiang Langcang Gorge alpine conifer and mixed forests;Pamir alpine desert and tundra;Qilian Mountains conifer forests;Qilian Mountains subalpine meadows;Southeast Tibet shrublands and meadows;Tarim Basin deciduous forests and steppe;Tibetan Plateau alpine shrublands and meadows;Western Himalayan alpine shrub and meadows;Yarlung Zanbo arid steppe","area_km2":2698629.164,"realmType":"terrestrial"},{"id":"TER_SR_041","label":"Deserti dell'Asia orientale","display_name":"Deserti dell'Asia orientale","name_en":"East Asian Deserts","bioregionId":"TER_SR_041","image":["/regions/ecoregions/deserti-dell-asia-orientale.jpg","/regions/deserti-dell-asia-orientale.jpg"],"iso":["CN","KZ","MN","RU"],"source_ecoregions":"Alashan Plateau semi-desert;Eastern Gobi desert steppe;Gobi Lakes Valley desert steppe;Great Lakes Basin desert steppe;Helanshan montane conifer forests;Junggar Basin semi-desert;Ordos Plateau steppe;Qaidam Basin semi-desert;Taklimakan desert","area_km2":2734207.512,"realmType":"terrestrial"},{"id":"TER_SR_039","label":"Foreste dell'Asia centro-orientale","display_name":"Foreste dell'Asia centro-orientale","name_en":"Central East Asian Forests","bioregionId":"TER_SR_039","image":["/regions/ecoregions/foreste-dell-asia-centro-orientale.jpg","/regions/foreste-dell-asia-centro-orientale.jpg"],"iso":["CN","JP"],"source_ecoregions":"Bohai Sea saline meadow;Central China Loess Plateau mixed forests;Changjiang Plain evergreen forests;Daba Mountains evergreen forests;Guizhou Plateau broadleaf and mixed forests;Huang He Plain mixed forests;Qin Ling Mountains deciduous forests;Qionglai-Minshan conifer forests;Sichuan Basin evergreen broadleaf forests;Taiheiyo montane deciduous forests;Yunnan Plateau subtropical evergreen forests","area_km2":2263771.486,"realmType":"terrestrial"},{"id":"TER_SR_037","label":"Foreste dell'Asia nord-orientale","display_name":"Foreste dell'Asia nord-orientale","name_en":"Northeast Asian Forests","bioregionId":"TER_SR_037","image":["/regions/ecoregions/foreste-dell-asia-nord-orientale.jpg","/regions/foreste-dell-asia-nord-orientale.jpg"],"iso":["CN","KP","KR","MN","RU"],"source_ecoregions":"Amur meadow steppe;Central Korean deciduous forests;Changbai Mountains mixed forests;Da Hinggan-Dzhagdy Mountains conifer forests;Manchurian mixed forests;Mongolian-Manchurian grassland;Nenjiang River grassland;Northeast China Plain deciduous forests;Okhotsk-Manchurian taiga;Southern Korea evergreen forests;Suiphun-Khanka meadows and forest meadows;Ussuri broadleaf and mixed forests;Yellow Sea saline meadow","area_km2":2877380.271,"realmType":"terrestrial"},{"id":"TER_SR_038","label":"Praterie mongole","display_name":"Praterie mongole","name_en":"Mongolian Grasslands","bioregionId":"TER_SR_038","image":["/regions/ecoregions/praterie-mongole.jpg","/regions/praterie-mongole.jpg"],"iso":["CN","MN","RU"],"source_ecoregions":"Daurian forest steppe;Khangai Mountains alpine meadow;Khangai Mountains conifer forests;Selenge-Orkhon forest steppe","area_km2":478049.12,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_036","TER_SR_040","TER_SR_041","TER_SR_039","TER_SR_037","TER_SR_038"],"iso":["AF","BT","CN","IN","JP","KG","KP","KR","KZ","MM","MN","NP","PK","RU","TJ","UZ"]},{"id":"eurasia-meridionale-e-sud-est","label":"Eurasia Meridionale e Sud-Est","image":["/regions/regions/eurasia-meridionale-e-sud-est.jpg","/regions/eurasia-meridionale-e-sud-est.jpg","/regions/sudest_asiatico.jpg","/regions/asia_meridionale.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_049","label":"Malesia e Indonesia occidentale","display_name":"Malesia e Indonesia occidentale","name_en":"Malaysia & Western Indonesia","bioregionId":"TER_SR_049","image":["/regions/ecoregions/malesia-e-indonesia-occidentale.jpg","/regions/malesia-e-indonesia-occidentale.jpg","/regions/sudest_asiatico.jpg"],"iso":["BN","ID","MY","TH"],"source_ecoregions":"Borneo lowland rain forests;Borneo montane rain forests;Borneo peat swamp forests;Christmas and Cocos Islands tropical forests;Eastern Java-Bali montane rain forests;Eastern Java-Bali rain forests;Kinabalu montane alpine meadows;Mentawai Islands rain forests;Nicobar Islands rain forests;Peninsular Malaysian montane rain forests;Peninsular Malaysian peat swamp forests;Peninsular Malaysian rain forests;Southwest Borneo freshwater swamp forests;Sulu Archipelago rain forests;Sumatran freshwater swamp forests;Sumatran lowland rain forests;Sumatran montane rain forests;Sumatran peat swamp forests;Sumatran tropical pine forests;Sunda Shelf mangroves;Sundaland heath forests;Western Java montane rain forests;Western Java rain forests","area_km2":1493190.732,"realmType":"terrestrial"},{"id":"TER_SR_047","label":"Subcontinente indiano","display_name":"Subcontinente indiano","name_en":"Indian Subcontinent","bioregionId":"TER_SR_047","image":["/regions/ecoregions/subcontinente-indiano.jpg","/regions/subcontinente-indiano.jpg","/regions/asia_meridionale.jpg"],"iso":["AE","AF","BD","BT","CN","IN","LK","MM","NP","PK","QA","SA"],"source_ecoregions":"Aravalli west thorn scrub forests;Brahmaputra Valley semi-evergreen forests;Central Deccan Plateau dry deciduous forests;Chhota-Nagpur dry deciduous forests;Deccan thorn scrub forests;East Deccan dry-evergreen forests;East Deccan moist deciduous forests;Eastern Himalayan broadleaf forests;Eastern Himalayan subalpine conifer forests;Godavari-Krishna mangroves;Himalayan subtropical broadleaf forests;Himalayan subtropical pine forests;Indus River Delta-Arabian Sea mangroves;Indus Valley desert;Khathiar-Gir dry deciduous forests;Lower Gangetic Plains moist deciduous forests;Malabar Coast moist forests;Maldives-Lakshadweep-Chagos Archipelago tropical moist forests;Meghalaya subtropical forests;Mizoram-Manipur-Kachin rain forests;Narmada Valley dry deciduous forests;North Deccan dry deciduous forests;North Western Ghats moist deciduous forests;North Western Ghats montane rain forests;Northeast India-Myanmar pine forests;Orissa semi-evergreen forests;Rann of Kutch seasonal salt marsh;South Deccan Plateau dry deciduous forests;South Western Ghats moist deciduous forests;South Western Ghats montane rain forests;Sri Lanka dry-zone dry evergreen forests;Sri Lanka lowland rain forests;Sri Lanka montane rain forests;Sundarbans freshwater swamp forests;Sundarbans mangroves;Terai-Duar savanna and grasslands;Thar desert;Upper Gangetic Plains moist deciduous forests;Western Himalayan broadleaf forests;Western Himalayan subalpine conifer forests","area_km2":3823426.749,"realmType":"terrestrial"},{"id":"TER_SR_048","label":"Foreste del sud-est asiatico","display_name":"Foreste del sud-est asiatico","name_en":"Southeast Asian Forests","bioregionId":"TER_SR_048","image":["/regions/ecoregions/foreste-del-sud-est-asiatico.jpg","/regions/foreste-del-sud-est-asiatico.jpg","/regions/sudest_asiatico.jpg"],"iso":["BD","CN","IN","KH","LA","MM","MY","PH","PK","TH","TW","VN"],"source_ecoregions":"Andaman Islands rain forests;Cardamom Mountains rain forests;Central Indochina dry forests;Chao Phraya freshwater swamp forests;Chao Phraya lowland moist deciduous forests;Chin Hills-Arakan Yoma montane forests;Greater Negros-Panay rain forests;Hainan Island monsoon rain forests;Indochina mangroves;Irrawaddy dry forests;Irrawaddy freshwater swamp forests;Irrawaddy moist deciduous forests;Jian Nan subtropical evergreen forests;Kayah-Karen montane rain forests;Luang Prabang montane rain forests;Luzon montane rain forests;Luzon rain forests;Luzon tropical pine forests;Mindanao montane rain forests;Mindanao-Eastern Visayas rain forests;Mindoro rain forests;Myanmar Coast mangroves;Myanmar coastal rain forests;Nansei Islands subtropical evergreen forests;Northern Annamites rain forests;Northern Indochina subtropical forests;Northern Khorat Plateau moist deciduous forests;Northern Thailand-Laos moist deciduous forests;Northern Triangle subtropical forests;Northern Triangle temperate forests;Northern Vietnam lowland rain forests;Palawan rain forests;Red River freshwater swamp forests;South China Sea Islands;South China-Vietnam subtropical evergreen forests;South Taiwan monsoon rain forests;Southeast Indochina dry evergreen forests;Southern Annamites montane rain forests;Southern Vietnam lowland dry forests;Taiwan subtropical evergreen forests;Tenasserim-South Thailand semi-evergreen rain forests;Tonle Sap freshwater swamp forests;Tonle Sap-Mekong peat swamp forests","area_km2":3179841.066,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_049","TER_SR_047","TER_SR_048"],"iso":["AE","AF","BD","BN","BT","CN","ID","IN","KH","LA","LK","MM","MY","NP","PH","PK","QA","SA","TH","TW","VN"]}],"bioregionIds":["TER_SR_027","TER_SR_030","TER_SR_029","TER_SR_031","TER_SR_035","TER_SR_033","TER_SR_034","TER_SR_032","TER_SR_025","TER_SR_044","TER_SR_042","TER_SR_045","TER_SR_043","TER_SR_046","TER_SR_028","TER_SR_036","TER_SR_040","TER_SR_041","TER_SR_039","TER_SR_037","TER_SR_038","TER_SR_049","TER_SR_047","TER_SR_048"],"iso":["AE","AF","AL","AM","AT","AZ","BA","BD","BE","BG","BN","BT","BY","CH","CN","CY","CZ","DE","DK","DZ","EE","EG","ES","FI","GB","GE","GR","HR","HU","ID","IE","IL","IN","IQ","IR","IS","IT","JO","JP","KG","KH","KP","KR","KW","KZ","LA","LB","LK","LT","LU","LV","LY","MA","MD","ME","MK","MM","MN","MY","NL","NP","OM","PH","PK","PL","PS","PT","QA","RO","RS","RU","SA","SD","SE","SI","SK","SY","TH","TJ","TM","TN","TR","TW","UA","UZ","VN","YE"]},{"id":"africa","label":"Africa","source_continente":"Africa","image":["/regions/continents/africa.jpg","/regions/africa.jpg"],"realmType":"terrestrial","regions":[{"id":"africa-settentrionale","label":"Africa Settentrionale","image":["/regions/regions/africa-settentrionale.jpg","/regions/africa-settentrionale.jpg","/regions/africa_arida.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_026","label":"Nord Africa","display_name":"Nord Africa","name_en":"North Africa","bioregionId":"TER_SR_026","image":["/regions/ecoregions/nord-africa.jpg","/regions/nord-africa.jpg","/regions/africa_arida.jpg"],"iso":["DZ","EG","EH","LY","MA","ML","MR","NE","SD","TD","TN"],"source_ecoregions":"Canary Islands dry woodlands and forests;East Sahara Desert;East Saharan montane xeric woodlands;Mediterranean Acacia-Argania dry woodlands and succulent thickets;Nile Delta flooded savanna;North Saharan Xeric Steppe and Woodland;Saharan Atlantic coastal desert;Saharan halophytics;South Sahara desert;Tibesti-Jebel Uweinat montane xeric woodlands;West Sahara desert;West Saharan montane xeric woodlands","area_km2":7411104.74,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_026"],"iso":["DZ","EG","EH","LY","MA","ML","MR","NE","SD","TD","TN"]},{"id":"africa-centrale-e-orientale","label":"Africa Centrale e Orientale","image":["/regions/regions/africa-centrale-e-orientale.jpg","/regions/africa-centrale-e-orientale.jpg","/regions/africa_tropicale.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_022","label":"Afrotropici equatoriali","display_name":"Afrotropici equatoriali","name_en":"Equatorial Afrotropics","bioregionId":"TER_SR_022","image":["/regions/ecoregions/afrotropici-equatoriali.jpg","/regions/afrotropici-equatoriali.jpg","/regions/africa_tropicale.jpg"],"iso":["AO","BJ","CD","CF","CG","CI","CM","GA","GH","GN","GQ","LR","ML","NG","RW","SL","SS","TG","UG"],"source_ecoregions":"Cameroon Highlands forests;Central African mangroves;Central Congolian lowland forests;Congolian coastal forests;Cross-Niger transition forests;Cross-Sanaga-Bioko coastal forests;Eastern Congolian swamp forests;Eastern Guinean forests;Guinean montane forests;Inner Niger Delta flooded savanna;Mount Cameroon and Bioko montane forests;Niger Delta swamp forests;Nigerian lowland forests;Northeast Congolian lowland forests;Northern Congolian Forest-Savanna;Northwest Congolian lowland forests;Rwenzori-Virunga montane moorlands;Southern Congolian forest-savanna;São Tomé, Príncipe, and Annobón forests;Western Congolian forest-savanna;Western Congolian swamp forests;Western Guinean lowland forests","area_km2":4104173.294,"realmType":"terrestrial"},{"id":"TER_SR_023","label":"Afrotropici sub-sahariani","display_name":"Afrotropici sub-sahariani","name_en":"Sub-Saharan Afrotropics","bioregionId":"TER_SR_023","image":["/regions/ecoregions/afrotropici-sub-sahariani.jpg","/regions/afrotropici-sub-sahariani.jpg","/regions/africa_tropicale.jpg"],"iso":["BF","BJ","CD","CF","CI","CM","DZ","ER","ET","GH","GM","GN","GW","KE","LR","ML","MR","NE","NG","SD","SL","SN","SS","TD","TG","UG"],"source_ecoregions":"Cape Verde Islands dry forests;East Sudanian savanna;Guinean forest-savanna;Guinean mangroves;Jos Plateau forest-grassland;Lake Chad flooded savanna;Mandara Plateau woodlands;Sahelian Acacia savanna;Sudd flooded grasslands;West Sudanian savanna","area_km2":7296624.863,"realmType":"terrestrial"},{"id":"TER_SR_024","label":"Corno d'Africa","display_name":"Corno d'Africa","name_en":"Horn of Africa","bioregionId":"TER_SR_024","image":["/regions/ecoregions/corno-d-africa.jpg","/regions/corno-d-africa.jpg","/regions/africa_tropicale.jpg"],"iso":["BI","CD","DJ","EG","ER","ET","KE","OM","RW","SA","SD","SO","SS","TZ","UG","YE"],"source_ecoregions":"Djibouti xeric shrublands;East African halophytics;East African montane forests;East African montane moorlands;Eritrean coastal desert;Ethiopian montane forests;Ethiopian montane grasslands and woodlands;Ethiopian montane moorlands;Hobyo grasslands and shrublands;Horn of Africa xeric bushlands;Masai xeric grasslands and shrublands;Northern Acacia-Commiphora bushlands and thickets;Red Sea mangroves;Serengeti volcanic grasslands;Socotra Island xeric shrublands;Somali Acacia-Commiphora bushlands and thickets;Somali montane xeric woodlands;South Arabian fog woodlands, shrublands, and dune;Southern Acacia-Commiphora bushlands and thickets;Southwest Arabian Escarpment shrublands and woodlands;Southwest Arabian coastal xeric shrublands;Southwest Arabian highland xeric scrub;Southwest Arabian montane woodlands and grasslands;Victoria Basin forest-savanna","area_km2":2739151.806,"realmType":"terrestrial"},{"id":"TER_SR_019","label":"Madagascar e costa dell'Africa orientale","display_name":"Madagascar e costa dell'Africa orientale","name_en":"Madagascar & East African Coast","bioregionId":"TER_SR_019","image":["/regions/ecoregions/madagascar-e-costa-dell-africa-orientale.jpg","/regions/madagascar-e-costa-dell-africa-orientale.jpg","/regions/madagascar.jpg"],"iso":["KE","KM","MG","MU","MZ","SC","SO","TZ"],"source_ecoregions":"Aldabra Island xeric scrub;Comoros forests;East African mangroves;Granitic Seychelles forests;Madagascar dry deciduous forests;Madagascar ericoid thickets;Madagascar humid forests;Madagascar mangroves;Madagascar spiny thickets;Madagascar subhumid forests;Madagascar succulent woodlands;Mascarene forests;Northern Swahili coastal forests;Southern Swahili coastal forests and woodlands;Zambezian coastal flooded savanna","area_km2":912762.925,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_022","TER_SR_023","TER_SR_024","TER_SR_019"],"iso":["AO","BF","BI","BJ","CD","CF","CG","CI","CM","DJ","DZ","EG","ER","ET","GA","GH","GM","GN","GQ","GW","KE","KM","LR","MG","ML","MR","MU","MZ","NE","NG","OM","RW","SA","SC","SD","SL","SN","SO","SS","TD","TG","TZ","UG","YE"]},{"id":"africa-meridionale","label":"Africa Meridionale","image":["/regions/regions/africa-meridionale.jpg","/regions/africa-meridionale.jpg","/regions/africa_australe.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_020","label":"Afrotropici meridionali","display_name":"Afrotropici meridionali","name_en":"Southern Afrotropics","bioregionId":"TER_SR_020","image":["/regions/ecoregions/afrotropici-meridionali.jpg","/regions/afrotropici-meridionali.jpg","/regions/africa_australe.jpg"],"iso":["AO","BW","LS","MZ","NA","SZ","ZA","ZW"],"source_ecoregions":"Albany thickets;Amsterdam-Saint Paul Islands temperate grasslands;Ascension scrub and grasslands;Central bushveld;Drakensberg Escarpment savanna and thicket;Drakensberg grasslands;Etosha Pan halophytics;Fynbos shrubland;Gariep Karoo;Highveld grasslands;Ile Europa and Bassas da India xeric scrub;Kalahari Acacia woodlands;Kalahari xeric savanna;Knysna-Amatole montane forests;Kwazulu Natal-Cape coastal forests;Limpopo lowveld;Makgadikgadi halophytics;Maputaland coastal forests and woodlands;Nama Karoo shrublands;Namaqualand-Richtersveld steppe;Namib Desert;Namibian savanna woodlands;Renosterveld shrubland;Southern Africa mangroves;St. Helena scrub and woodlands;Succulent Karoo xeric shrublands;Tristan Da Cunha-Gough Islands shrub and grasslands","area_km2":2315030.74,"realmType":"terrestrial"},{"id":"TER_SR_021","label":"Afrotropici subequatoriali","display_name":"Afrotropici subequatoriali","name_en":"Sub-Equatorial Afrotropics","bioregionId":"TER_SR_021","image":["/regions/ecoregions/afrotropici-subequatoriali.jpg","/regions/afrotropici-subequatoriali.jpg","/regions/africa_australe.jpg"],"iso":["AO","BI","BW","CD","KE","MW","MZ","NA","RW","TZ","UG","ZA","ZM","ZW"],"source_ecoregions":"Albertine Rift montane forests;Angolan montane forest-grassland;Angolan mopane woodlands;Angolan scarp savanna and woodlands;Angolan wet miombo woodlands;Central Zambezian wet miombo woodlands;Dry miombo woodlands;Eastern Arc forests;Itigi-Sumbu thicket;Kaokoveld desert;Mulanje Montane forest-grassland;Nyanga-Chimanimani Montane forest-grassland;Southern Rift Montane forest-grassland;Zambezian Baikiaea woodlands;Zambezian evergreen dry forests;Zambezian flooded grasslands;Zambezian mopane woodlands;Zambezian-Limpopo mixed woodlands","area_km2":4394307.657,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_020","TER_SR_021"],"iso":["AO","BI","BW","CD","KE","LS","MW","MZ","NA","RW","SZ","TZ","UG","ZA","ZM","ZW"]}],"bioregionIds":["TER_SR_026","TER_SR_022","TER_SR_023","TER_SR_024","TER_SR_019","TER_SR_020","TER_SR_021"],"iso":["AO","BF","BI","BJ","BW","CD","CF","CG","CI","CM","DJ","DZ","EG","EH","ER","ET","GA","GH","GM","GN","GQ","GW","KE","KM","LR","LS","LY","MA","MG","ML","MR","MU","MW","MZ","NA","NE","NG","OM","RW","SA","SC","SD","SL","SN","SO","SS","SZ","TD","TG","TN","TZ","UG","YE","ZA","ZM","ZW"]},{"id":"oceania-australasia","label":"Oceania & Australasia","source_continente":"Oceania & Australasia","image":["/regions/continents/oceania-australasia.jpg","/regions/oceania-australasia.jpg","/regions/oceania.jpg"],"realmType":"terrestrial","regions":[{"id":"australasia","label":"Australasia","image":["/regions/regions/australasia.jpg","/regions/australasia.jpg","/regions/australia.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_050","label":"Isole australasiatiche e Indonesia orientale","display_name":"Isole australasiatiche e Indonesia orientale","name_en":"Australasian Islands & East Indonesia","bioregionId":"TER_SR_050","image":["/regions/ecoregions/isole-australasiatiche-e-indonesia-orientale.jpg","/regions/isole-australasiatiche-e-indonesia-orientale.jpg"],"iso":["ID","NC","NZ","PG","SB","TL","VU"],"source_ecoregions":"Admiralty Islands lowland rain forests;Banda Sea Islands moist deciduous forests;Biak-Numfoor rain forests;Buru rain forests;Central Range Papuan montane rain forests;Halmahera rain forests;Huon Peninsula montane rain forests;Lesser Sundas deciduous forests;Lord Howe Island subtropical forests;New Britain-New Ireland lowland rain forests;New Britain-New Ireland montane rain forests;New Caledonia dry forests;New Caledonia rain forests;New Guinea mangroves;Norfolk Island subtropical forests;Northern New Guinea lowland rain and freshwater swamp forests;Northern New Guinea montane rain forests;Northland temperate kauri forests;Papuan Central Range sub-alpine grasslands;Seram rain forests;Solomon Islands rain forests;Southeast Papuan rain forests;Southern New Guinea freshwater swamp forests;Southern New Guinea lowland rain forests;Sulawesi lowland rain forests;Sulawesi montane rain forests;Sumba deciduous forests;Timor and Wetar deciduous forests;Trans Fly savanna and grasslands;Trobriand Islands rain forests;Vanuatu rain forests;Vogelkop montane rain forests;Vogelkop-Aru lowland rain forests;Yapen rain forests","area_km2":1302739.455,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_050"],"iso":["ID","NC","NZ","PG","SB","TL","VU"]},{"id":"oceania","label":"Oceania","image":["/regions/regions/oceania.jpg","/regions/oceania.jpg","/regions/pacifico_tropicale.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_018","label":"Isole oceaniche","display_name":"Isole oceaniche","name_en":"Oceanian Islands","bioregionId":"TER_SR_018","image":["/regions/ecoregions/isole-oceaniche.jpg","/regions/isole-oceaniche.jpg","/regions/pacifico_tropicale.jpg"],"iso":["FJ","FM","KI","MH","NR","PG","PW","SB","TO","TV","US","VU","WS"],"source_ecoregions":"Carolines tropical moist forests;Central Polynesian tropical moist forests;Cook Islands tropical moist forests;Eastern Micronesia tropical moist forests;Fiji tropical dry forests;Fiji tropical moist forests;Hawai'i tropical dry forests;Hawai'i tropical high shrublands;Hawai'i tropical low shrublands;Hawai'i tropical moist forests;Kermadec Islands subtropical moist forests;Marianas tropical dry forests;Marquesas tropical moist forests;Northwest Hawai'i scrub;Ogasawara subtropical moist forests;Palau tropical moist forests;Rapa Nui and Sala y Gómez subtropical forests;Samoan tropical moist forests;Society Islands tropical moist forests;Tongan tropical moist forests;Tuamotu tropical moist forests;Tubuai tropical moist forests;Western Polynesian tropical moist forests;Yap tropical dry forests","area_km2":44398.72,"realmType":"terrestrial"},{"id":"TER_SR_051","label":"Australia","display_name":"Australia","name_en":"Australia","bioregionId":"TER_SR_051","image":["/regions/ecoregions/australia.jpg","/regions/australia.jpg"],"iso":["AU"],"source_ecoregions":"Arnhem Land tropical savanna;Australian Alps montane grasslands;Brigalow tropical savanna;Cape York Peninsula tropical savanna;Carnarvon xeric shrublands;Carpentaria tropical savanna;Central Ranges xeric scrub;Coolgardie woodlands;Eastern Australia mulga shrublands;Eastern Australian temperate forests;Einasleigh upland savanna;Esperance mallee;Eyre and York mallee;Flinders-Lofty montane woodlands;Gibson desert;Great Sandy-Tanami desert;Great Victoria desert;Hampton mallee and woodlands;Jarrah-Karri forest and shrublands;Kimberly tropical savanna;Louisiade Archipelago rain forests;Mitchell Grass Downs;Murray-Darling woodlands and mallee;Naracoorte woodlands;Nullarbor Plains xeric shrublands;Pilbara shrublands;Queensland tropical rain forests;Simpson desert;Southeast Australia temperate forests;Southeast Australia temperate savanna;Southwest Australia savanna;Southwest Australia woodlands;Tasmanian Central Highland forests;Tasmanian temperate forests;Tasmanian temperate rain forests;Tirari-Sturt stony desert;Victoria Plains tropical savanna;Western Australian Mulga shrublands","area_km2":7687590.313,"realmType":"terrestrial"},{"id":"TER_SR_052","label":"Nuova Zelanda","display_name":"Nuova Zelanda","name_en":"New Zealand","bioregionId":"TER_SR_052","image":["/regions/ecoregions/nuova-zelanda.jpg","/regions/nuova-zelanda.jpg","/regions/nuova_zelanda.jpg"],"iso":["NZ"],"source_ecoregions":"Antipodes Subantarctic Islands tundra;Canterbury-Otago tussock grasslands;Chatham Island temperate forests;Fiordland temperate forests;Nelson Coast temperate forests;New Zealand North Island temperate forests;New Zealand South Island montane grasslands;New Zealand South Island temperate forests;Rakiura Island temperate forests;Richmond temperate forests;Westland temperate forests","area_km2":237518.051,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_018","TER_SR_051","TER_SR_052"],"iso":["AU","FJ","FM","KI","MH","NR","NZ","PG","PW","SB","TO","TV","US","VU","WS"]}],"bioregionIds":["TER_SR_050","TER_SR_018","TER_SR_051","TER_SR_052"],"iso":["AU","FJ","FM","ID","KI","MH","NC","NR","NZ","PG","PW","SB","TL","TO","TV","US","VU","WS"]},{"id":"antartide","label":"Antartide","source_continente":"Antartide","image":["/regions/continents/antartide.jpg","/regions/antartide.jpg"],"realmType":"terrestrial","regions":[{"id":"antartide","label":"Antartide","image":["/regions/regions/antartide.jpg","/regions/antartide.jpg"],"realmType":"terrestrial","ecoregions":[{"id":"TER_SR_053","label":"Continente e isole antartiche","display_name":"Continente e isole antartiche","name_en":"Antarctica (Continent & Islands)","bioregionId":"TER_SR_053","image":["/regions/ecoregions/continente-e-isole-antartiche.jpg","/regions/continente-e-isole-antartiche.jpg","/regions/antartide.jpg"],"iso":["AF","AQ","AR","BT","CA","CL","CN","GL","IN","IS","KG","NP","PK","TF","TJ","US"],"source_ecoregions":"Adelie Land tundra;Central South Antarctic Peninsula tundra;Dronning Maud Land tundra;East Antarctic tundra;Ellsworth Land tundra;Ellsworth Mountains tundra;Enderby Land tundra;Marie Byrd Land tundra;North Victoria Land tundra;Northeast Antarctic Peninsula tundra;Northwest Antarctic Peninsula tundra;Prince Charles Mountains tundra;Rock and Ice;Scotia Sea Islands tundra;South Antarctic Peninsula tundra;South Orkney Islands tundra;South Victoria Land tundra;Southern Indian Ocean Islands tundra;Transantarctic Mountains tundra","area_km2":14273473.359,"realmType":"terrestrial"}],"bioregionIds":["TER_SR_053"],"iso":["AF","AQ","AR","BT","CA","CL","CN","GL","IN","IS","KG","NP","PK","TF","TJ","US"]}],"bioregionIds":["TER_SR_053"],"iso":["AF","AQ","AR","BT","CA","CL","CN","GL","IN","IS","KG","NP","PK","TF","TJ","US"]}];

const MARINE_REALMS = [{"id":"MAR_R_001","label":"Artico","name_en":"Arctic","bioregionId":"MAR_R_001","bioregionIds":["MAR_R_001"],"image":["/regions/marine/artico.jpg","/regions/artico.jpg"],"iso":["CA","GL","IS","NO","RU","SJ","US"],"realmType":"marine"},{"id":"MAR_R_002","label":"Atlantico settentrionale temperato","name_en":"Temperate Northern Atlantic","bioregionId":"MAR_R_002","bioregionIds":["MAR_R_002"],"image":["/regions/marine/atlantico-settentrionale-temperato.jpg","/regions/atlantico-settentrionale-temperato.jpg"],"iso":["AL","BA","BE","BG","CA","CY","DE","DK","DZ","EE","EG","EH","ES","FI","FO","FR","GB","GE","GG","GI","GR","HR","IE","IL","IM","IS","IT","JE","LB","LT","LV","LY","MA","MC","ME","MR","MT","MX","NL","NO","PL","PM","PS","PT","RO","RU","SE","SI","SY","TN","TR","UA","US"],"realmType":"marine"},{"id":"MAR_R_003","label":"Pacifico settentrionale temperato","name_en":"Temperate Northern Pacific","bioregionId":"MAR_R_003","bioregionIds":["MAR_R_003"],"image":["/regions/marine/pacifico-settentrionale-temperato.jpg","/regions/pacifico-settentrionale-temperato.jpg"],"iso":["CA","CN","JP","KP","KR","MX","RU","TW","US"],"realmType":"marine"},{"id":"MAR_R_004","label":"Atlantico tropicale","name_en":"Tropical Atlantic","bioregionId":"MAR_R_004","bioregionIds":["MAR_R_004"],"image":["/regions/marine/atlantico-tropicale.jpg","/regions/atlantico-tropicale.jpg"],"iso":["AG","AI","AO","AW","BB","BL","BM","BQ","BR","BS","BZ","CD","CG","CM","CO","CR","CU","CV","CW","DM","DO","GA","GD","GF","GH","GM","GP","GQ","GT","GW","GY","HN","HT","JM","KN","KY","LC","LR","MF","MQ","MR","MS","MX","NG","NI","PA","PR","SH","SL","SN","SR","ST","SX","TC","TG","TT","US","VC","VE","VG","VI"],"realmType":"marine"},{"id":"MAR_R_005","label":"Indo-Pacifico occidentale","name_en":"Western Indo-Pacific","bioregionId":"MAR_R_005","bioregionIds":["MAR_R_005"],"image":["/regions/marine/indo-pacifico-occidentale.jpg","/regions/indo-pacifico-occidentale.jpg"],"iso":["AE","BD","BH","DJ","EG","ER","ID","IL","IN","IO","IQ","IR","JO","KE","KM","KW","LK","MG","MM","MU","MV","MZ","OM","PK","QA","RE","SA","SC","SD","SO","TF","TH","TZ","YE","YT","ZA"],"realmType":"marine"},{"id":"MAR_R_006","label":"Indo-Pacifico centrale","name_en":"Central Indo-Pacific","bioregionId":"MAR_R_006","bioregionIds":["MAR_R_006"],"image":["/regions/marine/indo-pacifico-centrale.jpg","/regions/indo-pacifico-centrale.jpg"],"iso":["AU","BN","CC","CN","CX","FJ","FM","GU","HK","ID","JP","KH","MO","MP","MY","NC","NF","NU","PG","PH","PW","SB","SG","TH","TL","TO","TW","VN","VU"],"realmType":"marine"},{"id":"MAR_R_007","label":"Indo-Pacifico orientale","name_en":"Eastern Indo-Pacific","bioregionId":"MAR_R_007","bioregionIds":["MAR_R_007"],"image":["/regions/marine/indo-pacifico-orientale.jpg","/regions/indo-pacifico-orientale.jpg"],"iso":["AS","CK","CL","KI","MH","NR","PF","PN","TK","TV","US","WF","WS"],"realmType":"marine"},{"id":"MAR_R_008","label":"Pacifico orientale tropicale","name_en":"Tropical Eastern Pacific","bioregionId":"MAR_R_008","bioregionIds":["MAR_R_008"],"image":["/regions/marine/pacifico-orientale-tropicale.jpg","/regions/pacifico-orientale-tropicale.jpg"],"iso":["CO","CR","EC","FR","GT","HN","MX","NI","PA","PE","SV"],"realmType":"marine"},{"id":"MAR_R_009","label":"Sud America temperato","name_en":"Temperate South America","bioregionId":"MAR_R_009","bioregionIds":["MAR_R_009"],"image":["/regions/marine/sud-america-temperato.jpg","/regions/sud-america-temperato.jpg"],"iso":["AR","BR","CL","FK","PE","SH","UY"],"realmType":"marine"},{"id":"MAR_R_010","label":"Africa meridionale temperata","name_en":"Temperate Southern Africa","bioregionId":"MAR_R_010","bioregionIds":["MAR_R_010"],"image":["/regions/marine/africa-meridionale-temperata.jpg","/regions/africa-meridionale-temperata.jpg"],"iso":["AO","MZ","NA","TF","ZA"],"realmType":"marine"},{"id":"MAR_R_011","label":"Australasia temperata","name_en":"Temperate Australasia","bioregionId":"MAR_R_011","bioregionIds":["MAR_R_011"],"image":["/regions/marine/australasia-temperata.jpg","/regions/australasia-temperata.jpg"],"iso":["AU","NZ"],"realmType":"marine"},{"id":"MAR_R_012","label":"Oceano Australe","name_en":"Southern Ocean","bioregionId":"MAR_R_012","bioregionIds":["MAR_R_012"],"image":["/regions/marine/oceano-australe.jpg","/regions/oceano-australe.jpg"],"iso":["AQ","AU","BV","GS","HM","NZ","TF","ZA"],"realmType":"marine"}];

const TERRESTRIAL_REALMS = BIOREGION_V4_CONTINENTS;
const GEO_REGION_GROUPS = TERRESTRIAL_REALMS;
const BIOREGION_V4_ECOREGIONS = BIOREGION_V4_CONTINENTS.flatMap(cont => cont.regions.flatMap(reg => reg.ecoregions.map(eco => ({ ...eco, parentRegionId:reg.id, parentRegionLabel:reg.label, continentId:cont.id, continentLabel:cont.label }))));
const BIOREGION_V4_REGIONS = BIOREGION_V4_CONTINENTS.flatMap(cont => cont.regions.map(reg => ({ ...reg, type:'terrestrial_region', continentId:cont.id, continentLabel:cont.label })));
const GEO_REGION_MAP = [
  ...BIOREGION_V4_ECOREGIONS.map(eco => ({ ...eco, type:'ecoregion', realmType:'terrestrial', label:eco.label, id:eco.id, bioregionIds:[eco.id] })),
  ...MARINE_REALMS.map(region => ({ ...region, type:'marine', continentId:'marine-realms', continentLabel:'Dominio marino', realmId:'marine-realms', realmLabel:'Dominio marino', realmType:'marine', bioregionIds:[region.id] })),
];
const GEO_REGION_BY_ID = Object.fromEntries(GEO_REGION_MAP.map(r => [r.id, r]));
const GEO_REALM_BY_ID = new Map([
  ...BIOREGION_V4_CONTINENTS.map(r => [r.id, r]),
  ['marine-realms', { id:'marine-realms', label:'Dominio marino', image:null, regions:MARINE_REALMS, realmType:'marine', bioregionIds:MARINE_REALMS.map(r=>r.id) }]
]);
const BIOREGION_V4_BY_ID = Object.fromEntries([...BIOREGION_V4_ECOREGIONS, ...MARINE_REALMS].map(r => [r.id, r]));
const BIOREGION_IDS_BY_ISO = BIOREGION_V4_ECOREGIONS.reduce((acc, eco) => {
  (eco.iso || []).forEach(code => {
    const key = String(code).toUpperCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(eco.id);
  });
  return acc;
}, {});

const GEO_FILTER_OPTIONS = [
  { value:'realm-group:terrestrial', label:'Dominio terrestre', c:'#6CE5C7', bg:'rgba(108,229,199,.14)', iso: BIOREGION_V4_CONTINENTS.flatMap(c=>c.iso || []), bioregionIds:BIOREGION_V4_ECOREGIONS.map(e=>e.id), matchLabels:['terrestrial','reami terrestri','ecoregioni terrestri'] },
  { value:'realm-group:marine', label:'Dominio marino', c:'#4FB3FF', bg:'rgba(79,179,255,.14)', iso: [], bioregionIds:MARINE_REALMS.map(r=>r.id), matchLabels:['marine','reami marini'] },
  ...BIOREGION_V4_CONTINENTS.map(cont => ({ value:`continent:${cont.id}`, label:cont.label, c:'#6CE5C7', bg:'rgba(108,229,199,.14)', iso:cont.iso || [], bioregionIds:cont.bioregionIds || [], matchLabels:[cont.label, cont.source_continente, cont.id] })),
  ...BIOREGION_V4_REGIONS.map(reg => ({ value:`territory-region:${reg.id}`, label:reg.label, c:'#20B2AA', bg:'rgba(32,178,170,.15)', iso:reg.iso || [], bioregionIds:reg.bioregionIds || [], matchLabels:[reg.label, reg.id, reg.continentLabel] })),
  ...BIOREGION_V4_ECOREGIONS.map(eco => ({ value:`ecoregion:${eco.id}`, label:eco.label, c:'#90D84A', bg:'rgba(144,216,74,.15)', iso:eco.iso || [], bioregionIds:[eco.id], matchLabels:[eco.label, eco.display_name, eco.name_en, eco.id] })),
  ...MARINE_REALMS.map(region => ({ value:`marine:${region.id}`, label:region.label, c:'#4FB3FF', bg:'rgba(79,179,255,.15)', iso:[], bioregionIds:[region.id], matchLabels:[region.label, region.name_en, region.id, 'marine'] }))
];


function normalizeCoverKey(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/&/g,' e ')
    .replace(/['’]/g,'')
    .replace(/[^a-z0-9]+/g,' ')
    .trim();
}

function pushUnique(list, value) {
  if (!value) return;
  if (!list.includes(value)) list.push(value);
}

const REGION_COVER_OVERRIDES = (() => {
  const map = {};
  const add = (keys, paths) => {
    const arr = Array.isArray(paths) ? paths : [paths];
    (Array.isArray(keys) ? keys : [keys]).forEach(key => {
      const k = normalizeCoverKey(key);
      if (!k) return;
      if (!map[k]) map[k] = [];
      arr.forEach(path => pushUnique(map[k], path));
    });
  };

  // ── Continenti / macroaree ───────────────────────────────────────────
  add(['America','america'], ['/regions/america.jpg']);
  add(['Eurasia','eurasia'], ['/regions/Eurasia.jpg','/regions/eurasia.jpg']);
  add(['Africa','africa'], ['/regions/africa.jpg']);
  add(['Oceania & Australasia','Oceania e Australasia','oceania-australasia','oceania australasia'], ['/regions/oceania_australasia.jpg','/regions/oceania.jpg']);
  add(['Antartide','Antarctic','Antarctica'], ['/regions/antartide.jpg']);

  // ── Regioni terrestri ────────────────────────────────────────────────
  add(['Nord America Boreale','nord-america-boreale'], ['/regions/region-nord-america-boreale.jpg']);
  add(['Nord America Temperato','nord america temperato'], ['/regions/nord_america_temperato.jpg','/regions/region-nord-america-temperato.jpg']);
  add(['America Centrale e Caraibi','America Centrale & Caraibi'], ['/regions/region-america-centrale-caraibi.jpg']);
  add(['Sud America Tropicale'], ['/regions/region-sud-america-tropicale.jpg']);
  add(['Sud America Andino e Temperato'], ['/regions/region-sud-america-andino-temperato.jpg']);

  add(['Eurasia Occidentale'], ['/regions/region-eurasia-occidentale.jpg','/regions/Eurasia_Occidentale.jpg']);
  add(['Eurasia Settentrionale'], ['/regions/region-eurasia-settentrionale.jpg']);
  add(['Eurasia Centrale'], ['/regions/region-eurasia-centrale.jpg']);
  add(['Eurasia Orientale'], ['/regions/region-eurasia-orientale.jpg']);
  add(['Eurasia Meridionale e Sud-Est','Eurasia Meridionale e Sud Est'], ['/regions/foreste_sudest_asiatico.jpg','/regions/malesia_indonesia_occ.jpg']);

  add(['Africa Settentrionale'], ['/regions/Nord_Africa.jpg','/regions/nord_africa.jpg']);
  add(['Africa Centrale e Orientale'], ['/regions/region-africa-centrale-orientale.jpg']);
  add(['Africa Meridionale'], ['/regions/region-africa-meridionale.jpg']);

  add(['Australasia'], ['/regions/oceania_australasia.jpg','/regions/australia.jpg']);
  add(['Oceania'], ['/regions/oceania.jpg','/regions/Isole_oceaniche.jpg']);
  add(['Antartide'], ['/regions/antartide.jpg']);

  // ── Ecoregioni terrestri ─────────────────────────────────────────────
  add(['Alaska'], ['/regions/eco-alaska.jpg']);
  add(['Groenlandia'], ['/regions/groenlandia.jpg']);
  add(['Foreste boreali canadesi'], ['/regions/foreste_boreali_canadesi.jpg']);
  add(['Tundra canadese'], ['/regions/eco-tundra-canadese.jpg']);
  add(['Costa del Pacifico settentrionale'], ['/regions/eco-costa-pacifico-settentrionale.jpg']);
  add(['Foreste nordamericane'], ['/regions/eco-foreste-nordamericane.jpg']);
  add(['Grandi Pianure'], ['/regions/grandi_pianure.jpg']);
  add(['Ovest americano'], ['/regions/Ovest_americano.jpg','/regions/ovest_americano.jpg']);
  add(['Savane e foreste del sud-est degli Stati Uniti','Savane e foreste sud-est Stati Uniti'], ['/regions/eco-savana-foreste-sud-est-stati-uniti.jpg']);
  add(['Zone aride messicane'], ['/regions/eco-zone-aride-messicane.jpg']);
  add(['America Centrale'], ['/regions/eco-america-centrale.jpg']);
  add(['Caraibi'], ['/regions/eco-caraibi.jpg']);
  add(['Amazzonia'], ['/regions/amazzonia.jpg']);
  add(['America meridionale settentrionale'], ['/regions/eco-america-meridionale-settentrionale.jpg']);
  add(['Cerrado brasiliano e costa atlantica'], ['/regions/eco-cerrado-brasiliano-costa-atlantica.jpg']);
  add(['Ande e costa del Pacifico'], ['/regions/eco-ande-costa-pacifico.jpg']);
  add(['Praterie sudamericane'], ['/regions/eco-praterie-sudamericane.jpg']);

  add(['Mediterraneo'], ['/regions/mediterraneao.jpg','/regions/mediterraneo.jpg']);
  add(['Europa Temperata'], ['/regions/Europa_temperata.jpg','/regions/europa_temperata.jpg']);
  add(['Foreste montane europee'], ['/regions/eco-foreste-montane-europee.jpg']);
  add(['Isole anglo-celtiche'], ['/regions/eco-isole-anglo-celtiche.jpg']);
  add(['Mare di Okhotsk e tundra/taiga di Bering','Mare di Okhotsk e tundra taiga di Bering'], ['/regions/eco-mare-okhotsk-tundra-taiga-bering.jpg']);
  add(['Scandinavia e foreste boreali occidentali'], ['/regions/Scandinavia_foreste_boreali','/regions/Scandinavia_foreste_boreali.jpg','/regions/scandinavia_foreste_boreali.jpg']);
  add(['Siberia e foreste boreali orientali'], ['/regions/eco-siberia-foreste-boreali-orientali.jpg']);
  add(['Tundra paleartica'], ['/regions/eco-tundra-palearctica.jpg','/regions/eco-tundra-paleartica.jpg']);
  add(['Grande penisola arabica'], ['/regions/eco-grande-penisola-arabica.jpg']);
  add(["Mar Caspio e deserti dell'Asia centrale",'Mar Caspio e deserti Asia centrale'], ['/regions/caspio_asia_centrale','/regions/caspio_asia_centrale.jpg']);
  add(['Monti Altai-Sayan'], ['/regions/eco-monti-altai-sayan.jpg']);
  add(['Monti Tien Shan'], ['/regions/eco-monti-tien-shan.jpg']);
  add(['Steppe kazake e foreste emiboreali'], ['/regions/Steppe_kazake_foreste.jpg','/regions/steppe_kazake_foreste.jpg']);
  add(['Deserti e foreste persiane'], ['/regions/eco-deserti-foreste-persiane.jpg']);
  add(['Foreste e steppe del Mar Nero'], ['/regions/eco-foreste-steppe-mar-nero.jpg']);
  add(['Isole giapponesi'], ['/regions/Isole_giapponesi.jpg','/regions/isole_giapponesi.jpg']);
  add(['Altopiano tibetano'], ['/regions/eco-altopiano-tibetano.jpg']);
  add(["Deserti dell'Asia orientale",'Deserti Asia orientale'], ['/regions/eco-deserti-asia-orientale.jpg']);
  add(["Foreste dell'Asia centro-orientale",'Foreste Asia centro orientale'], ['/regions/eco-foreste-asia-centro-orientale.jpg']);
  add(["Foreste dell'Asia nord-orientale",'Foreste Asia nord orientale'], ['/regions/eco-foreste-asia-nord-orientale.jpg']);
  add(['Praterie mongole'], ['/regions/eco-praterie-mongole.jpg']);
  add(['Malesia e Indonesia occidentale'], ['/regions/malesia_indonesia_occ.jpg']);
  add(['Subcontinente indiano'], ['/regions/subcontinente_indiano','/regions/subcontinente_indiano.jpg']);
  add(['Foreste del sud-est asiatico','Foreste sud-est asiatico'], ['/regions/foreste_sudest_asiatico.jpg']);

  add(['Nord Africa'], ['/regions/Nord_Africa.jpg','/regions/nord_africa.jpg']);
  add(['Afrotropici equatoriali'], ['/regions/afrotropici_equatoriali.jpg']);
  add(['Afrotropici sub-sahariani'], ['/regions/eco-afrotropici-sub-sahariani.jpg']);
  add(["Corno d'Africa",'Corno Africa'], ['/regions/eco-corno-africa.jpg']);
  add(["Madagascar e costa dell'Africa orientale",'Madagascar e costa Africa orientale'], ['/regions/madagascar.jpg']);
  add(['Afrotropici meridionali'], ['/regions/afrotropici_meridionali.jpg']);
  add(['Afrotropici subequatoriali'], ['/regions/eco-afrotropici-subequatoriali.jpg']);

  add(['Isole australasiatiche e Indonesia orientale'], ['/regions/Isole_australasiatiche_Indonesia_orientale.jpg','/regions/isole_australasiatiche_indonesia_orientale.jpg']);
  add(['Isole oceaniche'], ['/regions/Isole_oceaniche.jpg','/regions/isole_oceaniche.jpg']);
  add(['Australia'], ['/regions/australia.jpg']);
  add(['Nuova Zelanda'], ['/regions/nuova_zelanda.jpg']);
  add(['Continente e isole antartiche'], ['/regions/eco-antartide.jpg','/regions/antartide.jpg']);

  // ── Domini e reami marini: immagini dedicate aggiunte in public/regions ──
  add(['Dominio terrestre','Reami terrestri','realm-group:terrestrial','terrestrial domain','terrestrial_domain'], ['/regions/terrestrial_domain.jpg']);
  add(['Dominio marino','Reami marini','marine-realms','realm-group:marine','marine domain','marine_domain'], ['/regions/marine_domain.jpg']);
  add(['Artico','Arctic','MAR_R_001'], ['/regions/artic_sea.jpg','/regions/arctic_sea.jpg','/regions/artide.jpg']);
  add(['Atlantico settentrionale temperato','Temperate Northern Atlantic','MAR_R_002'], ['/regions/temperate_northern_atlantic.jpg','/regions/Temperate_Northern_Atlantic.jpg']);
  add(['Pacifico settentrionale temperato','Temperate Northern Pacific','MAR_R_003'], ['/regions/Temperate_Northern_Pacific.jpg','/regions/temperate_northern_pacific.jpg']);
  add(['Atlantico tropicale','Tropical Atlantic','MAR_R_004'], ['/regions/Tropical_Atlantic.jpg','/regions/tropical_atlantic.jpg']);
  add(['Indo-Pacifico occidentale','Western Indo-Pacific','Western Indo Pacific','MAR_R_005'], ['/regions/Western_Indo-Pacific.jpg','/regions/western_indo_pacific.jpg']);
  add(['Indo-Pacifico centrale','Central Indo-Pacific','Central Indo Pacific','MAR_R_006'], ['/regions/central_indo_pacific.jpg','/regions/Central_Indo_Pacific.jpg']);
  add(['Indo-Pacifico orientale','Eastern Indo-Pacific','Eastern Indo Pacific','MAR_R_007'], ['/regions/eastern_indo_pacific.jpg','/regions/Eastern_Indo_Pacific.jpg']);
  add(['Pacifico orientale tropicale','Tropical Eastern Pacific','MAR_R_008'], ['/regions/Tropical_eastern_pacific.jpg','/regions/tropical_eastern_pacific.jpg']);
  add(['Sud America temperato','Temperate South America','Temperate Southamerica','MAR_R_009'], ['/regions/temperate_southamerica.jpg','/regions/temperate_south_america.jpg']);
  add(['Africa meridionale temperata','Temperate Southern Africa','MAR_R_010'], ['/regions/temperate_southern_africa.jpg']);
  add(['Australasia temperata','Temperate Australasia','MAR_R_011'], ['/regions/temperate_australasia.jpg']);
  add(['Oceano Australe','Southern Ocean','MAR_R_012'], ['/regions/southern_ocean.jpg']);

  // ── Reami marini: per ora fallback oceanici se non arrivano immagini dedicate ──
  add(['Reami marini','marine-realms'], ['/regions/oceania.jpg']);
  add(['Artico'], ['/regions/artide.jpg','/regions/antartide.jpg']);
  add(['Atlantico settentrionale temperato','Temperate Northern Atlantic'], ['/regions/atlantico-settentrionale-temperato.jpg','/regions/oceania.jpg']);
  add(['Pacifico settentrionale temperato','Temperate Northern Pacific'], ['/regions/pacifico-settentrionale-temperato.jpg','/regions/oceania.jpg']);
  add(['Atlantico tropicale','Tropical Atlantic'], ['/regions/atlantico-tropicale.jpg','/regions/oceania.jpg']);
  add(['Indo-Pacifico occidentale','Western Indo-Pacific'], ['/regions/indo-pacifico-occidentale.jpg','/regions/oceania.jpg']);
  add(['Indo-Pacifico centrale','Central Indo-Pacific'], ['/regions/indo-pacifico-centrale.jpg','/regions/oceania.jpg']);
  add(['Indo-Pacifico orientale','Eastern Indo-Pacific'], ['/regions/indo-pacifico-orientale.jpg','/regions/oceania.jpg']);
  add(['Pacifico orientale tropicale','Tropical Eastern Pacific'], ['/regions/pacifico-orientale-tropicale.jpg','/regions/oceania.jpg']);
  add(['Sud America temperato','Temperate South America'], ['/regions/sud-america-temperato.jpg','/regions/region-sud-america-andino-temperato.jpg']);
  add(['Africa meridionale temperata','Temperate Southern Africa'], ['/regions/africa-meridionale-temperata.jpg','/regions/region-africa-meridionale.jpg']);
  add(['Australasia temperata','Temperate Australasia'], ['/regions/australasia-temperata.jpg','/regions/australia.jpg']);
  add(['Oceano Australe','Southern Ocean'], ['/regions/oceano-australe.jpg','/regions/antartide.jpg']);

  return map;
})();

function autoRegionCoverCandidates(label) {
  const clean = normalizeCoverKey(label);
  if (!clean) return [];
  const hyphen = clean.replace(/\s+/g,'-');
  const underscore = clean.replace(/\s+/g,'_');
  return [
    `/regions/${underscore}.jpg`,
    `/regions/${hyphen}.jpg`,
    `/regions/eco-${hyphen}.jpg`,
    `/regions/region-${hyphen}.jpg`,
    `/regions/ecoregions/${hyphen}.jpg`,
    `/regions/regions/${hyphen}.jpg`,
    `/regions/continents/${hyphen}.jpg`,
  ];
}

function getRegionCoverSources(item, provided) {
  const out = [];
  const addSources = (sources) => {
    (Array.isArray(sources) ? sources : (sources ? [sources] : [])).forEach(src => pushUnique(out, src));
  };

  const keys = [
    item?.id,
    item?.label,
    item?.display_name,
    item?.name_en,
    item?.source_continente,
    item?.bioregionId,
  ].filter(Boolean);

  keys.forEach(key => addSources(REGION_COVER_OVERRIDES[normalizeCoverKey(key)]));
  keys.forEach(key => addSources(autoRegionCoverCandidates(key)));
  addSources(provided || item?.image);

  return out;
}



function normalizeIsoList(list = []) {
  return Array.from(new Set((list || [])
    .map(c => String(c || '').trim().toUpperCase())
    .filter(c => /^[A-Z]{2}$/.test(c))
  )).sort((a,b)=>getCountryDisplayName(a).localeCompare(getCountryDisplayName(b),'it'));
}
function getVisitedCountries() {
  if (typeof window === 'undefined') return [];
  try { return normalizeIsoList(JSON.parse(window.localStorage.getItem('animaldex_visited_countries') || '[]')); } catch { return []; }
}
function saveVisitedCountries(list = []) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem('animaldex_visited_countries', JSON.stringify(normalizeIsoList(list))); } catch {}
}
function getCountryDisplayName(code) {
  const c = String(code || '').toUpperCase();
  const local = COUNTRIES.find(x => x.code === c)?.name;
  if (local) return local;
  try {
    const n = new Intl.DisplayNames(['it'], { type:'region' }).of(c);
    if (n && n !== c) return n;
  } catch {}
  const overrides = {
    AX:'Isole Åland', FO:'Isole Fær Øer', GG:'Guernsey', IM:'Isola di Man', JE:'Jersey', LU:'Lussemburgo',
    LI:'Liechtenstein', MC:'Monaco', AD:'Andorra', SM:'San Marino', VA:'Città del Vaticano', GI:'Gibilterra',
    BM:'Bermuda', PM:'Saint-Pierre e Miquelon', GL:'Groenlandia', VG:'Isole Vergini Britanniche', AI:'Anguilla',
    AG:'Antigua e Barbuda', BL:'Saint-Barthélemy', MF:'Saint-Martin', SX:'Sint Maarten', KN:'Saint Kitts e Nevis',
    LC:'Saint Lucia', VC:'Saint Vincent e Grenadine', DM:'Dominica', GP:'Guadalupa', MQ:'Martinica', MS:'Montserrat',
    GD:'Grenada', TC:'Turks e Caicos', AW:'Aruba', CW:'Curaçao', BQ:'Caraibi olandesi', GF:'Guyana francese',
    EH:'Sahara Occidentale', CV:'Capo Verde', ST:'São Tomé e Príncipe', PS:'Palestina', HK:'Hong Kong', MO:'Macao',
    MV:'Maldive', NF:'Isola Norfolk', CX:'Isola di Natale', CC:'Isole Cocos', NC:'Nuova Caledonia', GU:'Guam',
    MP:'Isole Marianne Settentrionali', UM:'Isole minori esterne USA', AS:'Samoa Americane', CK:'Isole Cook',
    NU:'Niue', PF:'Polinesia Francese', PN:'Pitcairn', TK:'Tokelau', TV:'Tuvalu', WF:'Wallis e Futuna',
    RE:'Riunione', YT:'Mayotte', IO:'Territorio Britannico dell’Oceano Indiano', SJ:'Svalbard e Jan Mayen',
    AQ:'Antartide', BV:'Isola Bouvet', GS:'Georgia del Sud e Sandwich Australi', HM:'Heard e McDonald',
    TF:'Terre australi francesi', SH:'Sant’Elena'
  };
  return overrides[c] || (/^[A-Z]{2}$/.test(c) ? c : String(code || ''));
}
function getAllScratchCountries() {
  const set = new Set([
    ...COUNTRIES.map(c => c.code),
    ...GEO_REGION_MAP.flatMap(r => r.iso),
  ]);
  return normalizeIsoList(Array.from(set));
}

function getGeoOptionIsoCodes(value) {
  if (!value) return [];
  const opt = GEO_FILTER_OPTIONS.find(o => o.value === value);
  return opt?.iso || [];
}
function getGeoOptionMatchLabels(value) {
  const opt = GEO_FILTER_OPTIONS.find(o => o.value === value);
  return (opt?.matchLabels || []).map(v => String(v).toLowerCase());
}
function getGeoOptionBioregionIds(value) {
  if (!value) return [];
  const opt = GEO_FILTER_OPTIONS.find(o => o.value === value);
  return opt?.bioregionIds || [];
}
function getAnimalBioregionEntriesV4(animal) {
  const direct = [animal?.bioregions_v4, animal?.geo?.bioregions_v4, animal?.raw?.geo?.bioregions_v4].flat().filter(Boolean);
  return direct.filter(v => v && typeof v === 'object');
}
function getAnimalBioregionIdsV4(animal) {
  const ids = [
    animal?.map_bioregion_ids_v4,
    animal?.geo?.map_bioregion_ids_v4,
    getAnimalBioregionEntriesV4(animal).map(e => e.id || e.bioregion_id || e.unit_id),
  ].flat().filter(Boolean).map(v => String(v));
  return Array.from(new Set(ids));
}
function getAnimalBioregionNamesV4(animal) {
  return getAnimalBioregionIdsV4(animal).map(id => BIOREGION_V4_BY_ID[id]?.label || BIOREGION_V4_BY_ID[id]?.display_name || id);
}
function getAnimalRegionTokens(animal) {
  const entries = getAnimalBioregionEntriesV4(animal);
  const raw = [
    animal.geo?.game_regions,
    animal.geo?.bio_regions,
    animal.game_regions,
    animal.bio_regions,
    animal.map_profile,
    animal.geo?.map_profile,
    animal.habitats,
    animal.geo?.habitats,
    getAnimalBioregionIdsV4(animal),
    entries.map(e => [e.continente, e.regione, e.ecoregione, e.name_en, e.id, e.bioregion_id]).flat(),
  ].flat().filter(Boolean);
  return raw.map(v => String(v).toLowerCase());
}
function matchGeographySelection(animal, selections = []) {
  if (!selections.length) return true;
  const countries = animal.distribution?.countries_present || animal.geo?.iso?.primary || animal.geo?.iso || animal.iso || [];
  const regionTokens = getAnimalRegionTokens(animal);
  const animalBioregionIds = getAnimalBioregionIdsV4(animal);
  return selections.some(sel => {
    if (!sel) return false;
    if (sel.startsWith('region:')) sel = sel.replace('region:', 'territory-region:');
    if (sel.startsWith('subrealm:')) sel = sel.replace('subrealm:', 'ecoregion:');
    if (sel.startsWith('realm:')) sel = sel.replace('realm:', 'continent:');
    if (sel.startsWith('continent:') || sel.startsWith('territory-region:') || sel.startsWith('ecoregion:') || sel.startsWith('marine:') || sel.startsWith('realm-group:')) {
      const wantedIds = getGeoOptionBioregionIds(sel);
      if (wantedIds.length && animalBioregionIds.some(id => wantedIds.includes(id))) return true;
      const iso = getGeoOptionIsoCodes(sel);
      if (iso.length && countries.some(code => iso.includes(code))) return true;
      const labels = getGeoOptionMatchLabels(sel);
      return labels.some(label => regionTokens.some(token => token.includes(label) || label.includes(token)));
    }
    return countries.includes(sel);
  });
}
function matchExactBioregion(animal, bioregionId) {
  if (!bioregionId) return false;
  return getAnimalBioregionIdsV4(animal).includes(String(bioregionId));
}
function extractAverageWeightKg(wt) {
  if (!wt) return 0;
  const s = String(wt).toLowerCase();
  const nums = (s.match(/[\d.]+/g) || []).map(Number).filter(Boolean);
  if (!nums.length) return 0;
  const avg = (nums[0] + nums[nums.length - 1]) / 2;
  if (s.includes(' g')) return avg / 1000;
  return avg;
}
function getObservationCount(a) {
  const keys = ['obs_total','observations_total','observations','gbif_obs','occurrence_count','obs'];
  for (const key of keys) {
    const val = a?.[key] ?? a?.distribution?.[key];
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && /^\d/.test(val)) return Number(val.replace(/[^\d.]/g,'')) || 0;
  }
  for (const key of ['wild_observations', 'total_observations']) {
    const val = a?.distribution?.[key];
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && /^\d/.test(val)) return Number(val.replace(/[^\d.]/g,'')) || 0;
  }
  return Infinity;
}
function normalizeBadgeBiome(value) {
  const s = String(value || '').trim().toLowerCase();
  if (!s) return '';
  if (/urb|citt|giardin|parch|edificat|agricol|coltiv|rural/.test(s)) return 'Ambienti umani';
  if (/barrier|corall|reef/.test(s)) return 'Barriere coralline';
  if (/mangrov/.test(s)) return 'Mangrovie';
  if (/cost|litor|spiagg|dun|estuar|intertid|subtid|fondal|roccios|sabbios|lagun/.test(s)) return 'Coste e fondali';
  if (/pelagic|pelag|oceano|ocean|mare aperto|alto mare/.test(s)) return 'Oceano aperto';
  if (/acqua dolce|fium|ruscell|lago|stagno|palud|umid|canal|torrente|ripar/.test(s)) return 'Acque interne e zone umide';
  if (/tropical|pluvial|rainforest/.test(s)) return 'Foreste tropicali';
  if (/boreal|taiga/.test(s)) return 'Foreste boreali';
  if (/temperat|bosco|forest|foresta|macchia|margini forestali|woodland/.test(s)) return 'Foreste temperate';
  if (/savana|savanna/.test(s)) return 'Savane';
  if (/prater|stepp|grass|erboso|pascol/.test(s)) return 'Praterie e steppe';
  if (/desert|arid|duna|sabbia/.test(s)) return 'Deserti e ambienti aridi';
  if (/mont|alp|rocc|scogl|rupe|paret|altitud/.test(s)) return 'Montagne e ambienti rocciosi';
  if (/tundra|artic|antart|polar|ghiacc|neve|pack/.test(s)) return 'Tundra e ambienti polari';
  if (/grott|caver|sotterr/.test(s)) return 'Grotte e ambienti sotterranei';
  return s.split(/\s+/).slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
function getAnimalBiomes(a) {
  const raw = [a.biome, a.biomes, a.habitat, a.habitats, a.hab, a.ecosystem, a.ecosystems].filter(Boolean).join(',');
  return Array.from(new Set(raw.split(/[;,|]/).map(normalizeBadgeBiome).filter(Boolean)));
}
function getUsageStreak() {
  if (typeof window === 'undefined') return 1;
  const key = 'animaldex_usage_streak_v1';
  const today = new Date().toISOString().slice(0,10);
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) || '{}');
    if (saved.lastDate === today) return saved.streak || 1;
    const prevDate = saved.lastDate ? new Date(saved.lastDate) : null;
    const currDate = new Date(today);
    const diff = prevDate ? Math.round((currDate - prevDate) / 86400000) : null;
    const streak = diff === 1 ? (saved.streak || 1) + 1 : 1;
    window.localStorage.setItem(key, JSON.stringify({ lastDate: today, streak }));
    return streak;
  } catch {
    return 1;
  }
}
function getHomeCountry() {
  if (typeof window === 'undefined') return '';
  return String(window.ANIMALDEX_HOME_COUNTRY || window.localStorage.getItem('animaldex_home_country') || '').toUpperCase();
}
const AWARD_RULES = [
  {badgeId:'ONB-01-L1', macroId:'ONB', macro:'Onboarding', subId:'ONB-01', sub:'Primo Viaggio', level:1, name:'Primo Viaggio', goal:'1 nazione', metric:'onboarding_first_trip', threshold:1},
  {badgeId:'ARS-01-L1', macroId:'ARS', macro:'Arsenale', subId:'ARS-01', sub:'Lame Biologiche (Artigli)', level:1, name:'Incisore di Solchi', goal:'10 specie', metric:'bio_blades', threshold:10},
  {badgeId:'ARS-01-L2', macroId:'ARS', macro:'Arsenale', subId:'ARS-01', sub:'Lame Biologiche (Artigli)', level:2, name:'Curatore di Artigli', goal:'40 specie', metric:'bio_blades', threshold:40},
  {badgeId:'ARS-01-L3', macroId:'ARS', macro:'Arsenale', subId:'ARS-01', sub:'Lame Biologiche (Artigli)', level:3, name:'Maestro della Presa Mortale', goal:'90 specie', metric:'bio_blades', threshold:90},
  {badgeId:'ARS-02-L1', macroId:'ARS', macro:'Arsenale', subId:'ARS-02', sub:'Zanne e Perforatori', level:1, name:"Interprete delle Zanne", goal:'5 specie', metric:'tusks', threshold:5},
  {badgeId:'ARS-02-L2', macroId:'ARS', macro:'Arsenale', subId:'ARS-02', sub:'Zanne e Perforatori', level:2, name:'Archivista dei Perforatori', goal:'25 specie', metric:'tusks', threshold:25},
  {badgeId:'ARS-02-L3', macroId:'ARS', macro:'Arsenale', subId:'ARS-02', sub:'Zanne e Perforatori', level:3, name:'Araldo del Morso Primordiale', goal:'60 specie', metric:'tusks', threshold:60},
  {badgeId:'CON-01-L1', macroId:'CON', macro:'Conservazione', subId:'CON-01', sub:'Specie Critiche (CR)', level:1, name:'Sentinella del Rischio', goal:'1 specie', metric:'cr_count', threshold:1},
  {badgeId:'CON-01-L2', macroId:'CON', macro:'Conservazione', subId:'CON-01', sub:'Specie Critiche (CR)', level:2, name:'Cronista della Fragilità', goal:'5 specie', metric:'cr_count', threshold:5},
  {badgeId:'CON-01-L3', macroId:'CON', macro:'Conservazione', subId:'CON-01', sub:'Specie Critiche (CR)', level:3, name:'Ultimo Baluardo', goal:'15 specie', metric:'cr_count', threshold:15},
  {badgeId:'CON-02-L1', macroId:'CON', macro:'Conservazione', subId:'CON-02', sub:'Varietà Stati IUCN', level:1, name:'Cartografo del Rischio', goal:'3 stati', metric:'iucn_variety', threshold:3},
  {badgeId:'CON-02-L2', macroId:'CON', macro:'Conservazione', subId:'CON-02', sub:'Varietà Stati IUCN', level:2, name:'Atlante della Vulnerabilità', goal:'tutti i 6 stati', metric:'iucn_variety', threshold:6},
  {badgeId:'CON-02-L3', macroId:'CON', macro:'Conservazione', subId:'CON-02', sub:'Varietà Stati IUCN', level:3, name:'Sigillo della Lista Rossa', goal:'5 specie per stato', metric:'iucn_five_each', threshold:1},
  {badgeId:'ELI-01-L1', macroId:'ELI', macro:'Elite', subId:'ELI-01', sub:'Record Mondiali', level:1, name:'Rilevatore di Primati', goal:'5 record', metric:'record_count', threshold:5},
  {badgeId:'ELI-01-L2', macroId:'ELI', macro:'Elite', subId:'ELI-01', sub:'Record Mondiali', level:2, name:'Archivista dei Record', goal:'20 record', metric:'record_count', threshold:20},
  {badgeId:'ELI-01-L3', macroId:'ELI', macro:'Elite', subId:'ELI-01', sub:'Record Mondiali', level:3, name:'Cacciatore di Record', goal:'50 record', metric:'record_count', threshold:50},
  {badgeId:'ELI-02-L1', macroId:'ELI', macro:'Elite', subId:'ELI-02', sub:'Rarità Assoluta (Obs. 1-99)', level:1, name:"Cercatore dell'Improbabile", goal:'3 specie', metric:'obs_under_100', threshold:3},
  {badgeId:'ELI-02-L2', macroId:'ELI', macro:'Elite', subId:'ELI-02', sub:'Rarità Assoluta (Obs. 1-99)', level:2, name:'Archivista del Quasi Impossibile', goal:'10 specie', metric:'obs_under_100', threshold:10},
  {badgeId:'ELI-02-L3', macroId:'ELI', macro:'Elite', subId:'ELI-02', sub:'Rarità Assoluta (Obs. 1-99)', level:3, name:'Mito Vivente', goal:'25 specie', metric:'obs_under_100', threshold:25},
  {badgeId:'ENG-01-L1', macroId:'ENG', macro:'Engagement', subId:'ENG-01', sub:'Giorni consecutivi', level:1, name:'Sentinella della Costanza', goal:'3 giorni', metric:'usage_streak', threshold:3},
  {badgeId:'ENG-01-L2', macroId:'ENG', macro:'Engagement', subId:'ENG-01', sub:'Giorni consecutivi', level:2, name:'Custode del Ritmo', goal:'10 giorni', metric:'usage_streak', threshold:10},
  {badgeId:'ENG-01-L3', macroId:'ENG', macro:'Engagement', subId:'ENG-01', sub:'Giorni consecutivi', level:3, name:'Naturalista Perpetuo', goal:'30 giorni', metric:'usage_streak', threshold:30},
  {badgeId:'ENG-02-L1', macroId:'ENG', macro:'Engagement', subId:'ENG-02', sub:'Correzione dati AI', level:1, name:'Occhio Critico', goal:'5 correzioni', metric:'ai_corrections', threshold:5},
  {badgeId:'ENG-02-L2', macroId:'ENG', macro:'Engagement', subId:'ENG-02', sub:'Correzione dati AI', level:2, name:'Scriba della Verifica', goal:'20 correzioni', metric:'ai_corrections', threshold:20},
  {badgeId:'ENG-02-L3', macroId:'ENG', macro:'Engagement', subId:'ENG-02', sub:'Correzione dati AI', level:3, name:"Arbitro dell'Evidenza", goal:'100 correzioni', metric:'ai_corrections', threshold:100},
  {badgeId:'TRO-01-L1', macroId:'TRO', macro:'Gruppo Alimentare', subId:'TRO-01', sub:'Predatori Apex', level:1, name:'Avvistatore Alfa', goal:'5 specie', metric:'apex_count', threshold:5},
  {badgeId:'TRO-01-L2', macroId:'TRO', macro:'Gruppo Alimentare', subId:'TRO-01', sub:'Predatori Apex', level:2, name:'Curatore dei Predatori Apicali', goal:'25 specie', metric:'apex_count', threshold:25},
  {badgeId:'TRO-01-L3', macroId:'TRO', macro:'Gruppo Alimentare', subId:'TRO-01', sub:'Predatori Apex', level:3, name:'Sovrano della Catena', goal:'60 specie', metric:'apex_count', threshold:60},
  {badgeId:'TRO-02-L1', macroId:'TRO', macro:'Gruppo Alimentare', subId:'TRO-02', sub:'Produttori / Filtratori', level:1, name:'Rilevatore Trofico', goal:'3 specie', metric:'base_trophic_count', threshold:3},
  {badgeId:'TRO-02-L2', macroId:'TRO', macro:'Gruppo Alimentare', subId:'TRO-02', sub:'Produttori / Filtratori', level:2, name:'Atlante della Biomassa', goal:'10 specie', metric:'base_trophic_count', threshold:10},
  {badgeId:'TRO-02-L3', macroId:'TRO', macro:'Gruppo Alimentare', subId:'TRO-02', sub:'Produttori / Filtratori', level:3, name:'Custode delle Sorgenti', goal:'20 specie', metric:'base_trophic_count', threshold:20},
  {badgeId:'GEO-01-L1', macroId:'GEO', macro:'Geografia', subId:'GEO-01', sub:'Numero di Nazioni diverse', level:1, name:'Esploratore di Frontiere', goal:'3 nazioni', metric:'countries_count', threshold:3},
  {badgeId:'GEO-01-L2', macroId:'GEO', macro:'Geografia', subId:'GEO-01', sub:'Numero di Nazioni diverse', level:2, name:'Cartografo dei Continenti', goal:'10 nazioni', metric:'countries_count', threshold:10},
  {badgeId:'GEO-01-L3', macroId:'GEO', macro:'Geografia', subId:'GEO-01', sub:'Numero di Nazioni diverse', level:3, name:'Diplomatico della Biodiversità', goal:'30 nazioni', metric:'countries_count', threshold:30},
  {badgeId:'GEO-01-L4', macroId:'GEO', macro:'Geografia', subId:'GEO-01', sub:'Numero di Nazioni diverse', level:4, name:'Atlante Vivente', goal:'75 nazioni', metric:'countries_count', threshold:75},
  {badgeId:'GEO-02-L1', macroId:'GEO', macro:'Geografia', subId:'GEO-02', sub:'Biodiversità Nazione', level:1, name:'Rilevatore del Territorio', goal:'5%', metric:'home_country_biodiversity', threshold:5},
  {badgeId:'GEO-02-L2', macroId:'GEO', macro:'Geografia', subId:'GEO-02', sub:'Biodiversità Nazione', level:2, name:'Atlante del Patrimonio Locale', goal:'20%', metric:'home_country_biodiversity', threshold:20},
  {badgeId:'GEO-02-L3', macroId:'GEO', macro:'Geografia', subId:'GEO-02', sub:'Biodiversità Nazione', level:3, name:'Sigillo del Patrimonio Vivente', goal:'50%', metric:'home_country_biodiversity', threshold:50},
  {badgeId:'GEO-03-L1', macroId:'GEO', macro:'Geografia', subId:'GEO-03', sub:'Diversità Biomi', level:1, name:'Esploratore dei Biomi', goal:'5 biomi', metric:'biomes_count', threshold:5},
  {badgeId:'GEO-03-L2', macroId:'GEO', macro:'Geografia', subId:'GEO-03', sub:'Diversità Biomi', level:2, name:'Ecologo di Frontiera', goal:'15 biomi', metric:'biomes_count', threshold:15},
  {badgeId:'GEO-03-L3', macroId:'GEO', macro:'Geografia', subId:'GEO-03', sub:'Diversità Biomi', level:3, name:'Signore degli Ecosistemi', goal:'30 biomi', metric:'biomes_count', threshold:30},
  {badgeId:'GEO-03-L4', macroId:'GEO', macro:'Geografia', subId:'GEO-03', sub:'Diversità Biomi', level:4, name:'Custode della Biosfera', goal:'50 biomi', metric:'biomes_count', threshold:50},
  {badgeId:'MAS-01-L1', macroId:'MAS', macro:'Massa', subId:'MAS-01', sub:'Peso Massimo (Gigantismo)', level:1, name:'Araldo dei Colossi', goal:'25 t', metric:'total_mass_tons', threshold:25},
  {badgeId:'MAS-01-L2', macroId:'MAS', macro:'Massa', subId:'MAS-01', sub:'Peso Massimo (Gigantismo)', level:2, name:'Censore di Giganti', goal:'150 t', metric:'total_mass_tons', threshold:150},
  {badgeId:'MAS-01-L3', macroId:'MAS', macro:'Massa', subId:'MAS-01', sub:'Peso Massimo (Gigantismo)', level:3, name:'Collezionista di Titani', goal:'400 t', metric:'total_mass_tons', threshold:400},
  {badgeId:'MAS-02-L1', macroId:'MAS', macro:'Massa', subId:'MAS-02', sub:'Massa Minima', level:1, name:'Rilevatore del Minuscolo', goal:'25 specie', metric:'tiny_species_count', threshold:25},
  {badgeId:'MAS-02-L2', macroId:'MAS', macro:'Massa', subId:'MAS-02', sub:'Massa Minima', level:2, name:'Decifratore delle Microforme', goal:'100 specie', metric:'tiny_species_count', threshold:100},
  {badgeId:'MAS-02-L3', macroId:'MAS', macro:'Massa', subId:'MAS-02', sub:'Massa Minima', level:3, name:"Maestro dell'Infinitesimo", goal:'200 specie', metric:'tiny_species_count', threshold:200},
  {badgeId:'MAS-02-L4', macroId:'MAS', macro:'Massa', subId:'MAS-02', sub:'Massa Minima', level:4, name:'Custode delle Microtaglie', goal:'250 specie', metric:'tiny_species_count', threshold:250},
  {badgeId:'MOR-01-L1', macroId:'MOR', macro:'Morfologia', subId:'MOR-01', sub:'Estremi (Giganti / Nani)', level:1, name:"Misuratore d'Estremi", goal:'5 specie', metric:'extremes_count', threshold:5},
  {badgeId:'MOR-01-L2', macroId:'MOR', macro:'Morfologia', subId:'MOR-01', sub:'Estremi (Giganti / Nani)', level:2, name:'Cartografo delle Taglie', goal:'20 specie', metric:'extremes_count', threshold:20},
  {badgeId:'MOR-01-L3', macroId:'MOR', macro:'Morfologia', subId:'MOR-01', sub:'Estremi (Giganti / Nani)', level:3, name:'Sovrano delle Proporzioni', goal:'50 specie', metric:'extremes_count', threshold:50},
  {badgeId:'STA-01-L1', macroId:'STA', macro:'Status User', subId:'STA-01', sub:'Foto caricate', level:1, name:'Cronista Visivo', goal:'10 foto', metric:'captured_count', threshold:10},
  {badgeId:'STA-01-L2', macroId:'STA', macro:'Status User', subId:'STA-01', sub:'Foto caricate', level:2, name:'Fotografo Naturalista', goal:'50 foto', metric:'captured_count', threshold:50},
  {badgeId:'STA-01-L3', macroId:'STA', macro:'Status User', subId:'STA-01', sub:'Foto caricate', level:3, name:'Iconografo del Selvatico', goal:'200 foto', metric:'captured_count', threshold:200},
  {badgeId:'STA-01-L4', macroId:'STA', macro:'Status User', subId:'STA-01', sub:'Foto caricate', level:4, name:'Archivio Totale', goal:'500 foto', metric:'captured_count', threshold:500},
  {badgeId:'STA-02-L1', macroId:'STA', macro:'Status User', subId:'STA-02', sub:'Avvistati (non foto)', level:1, name:'Scout Silenzioso', goal:'10 avvistamenti', metric:'sighting_only_count', threshold:10},
  {badgeId:'STA-02-L2', macroId:'STA', macro:'Status User', subId:'STA-02', sub:'Avvistati (non foto)', level:2, name:'Ombra del Territorio', goal:'50 avvistamenti', metric:'sighting_only_count', threshold:50},
  {badgeId:'STA-02-L3', macroId:'STA', macro:'Status User', subId:'STA-02', sub:'Avvistati (non foto)', level:3, name:'Fantasma dei Boschi', goal:'150 avvistamenti', metric:'sighting_only_count', threshold:150},
  {badgeId:'STA-02-L4', macroId:'STA', macro:'Status User', subId:'STA-02', sub:'Avvistati (non foto)', level:4, name:'Osservatore Leggendario', goal:'300 avvistamenti', metric:'sighting_only_count', threshold:300},
  {badgeId:'TAX-01-L1', macroId:'TAX', macro:'Tassonomia', subId:'TAX-01', sub:'Specie per Famiglia', level:1, name:'Araldista di Stirpe', goal:'5 specie', metric:'max_family_count', threshold:5},
  {badgeId:'TAX-01-L2', macroId:'TAX', macro:'Tassonomia', subId:'TAX-01', sub:'Specie per Famiglia', level:2, name:'Genealogista di Famiglia', goal:'15 specie', metric:'max_family_count', threshold:15},
  {badgeId:'TAX-01-L3', macroId:'TAX', macro:'Tassonomia', subId:'TAX-01', sub:'Specie per Famiglia', level:3, name:'Monografo di Famiglia', goal:'30 specie', metric:'max_family_count', threshold:30},
  {badgeId:'TAX-02-L1', macroId:'TAX', macro:'Tassonomia', subId:'TAX-02', sub:'Specie stesso Ordine', level:1, name:"Decifratore d'Ordine", goal:'10 specie', metric:'max_order_count', threshold:10},
  {badgeId:'TAX-02-L2', macroId:'TAX', macro:'Tassonomia', subId:'TAX-02', sub:'Specie stesso Ordine', level:2, name:'Curatore del Clade', goal:'40 specie', metric:'max_order_count', threshold:40},
  {badgeId:'TAX-02-L3', macroId:'TAX', macro:'Tassonomia', subId:'TAX-02', sub:'Specie stesso Ordine', level:3, name:'Architetto Filogenetico', goal:'80 specie', metric:'max_order_count', threshold:80},
  {badgeId:'TAX-03-L1', macroId:'TAX', macro:'Tassonomia', subId:'TAX-03', sub:'Numero Generi diversi', level:1, name:'Censitore di Generi', goal:'50 generi', metric:'genera_count', threshold:50},
  {badgeId:'TAX-03-L2', macroId:'TAX', macro:'Tassonomia', subId:'TAX-03', sub:'Numero Generi diversi', level:2, name:'Cartografo dei Generi', goal:'200 generi', metric:'genera_count', threshold:200},
  {badgeId:'TAX-03-L3', macroId:'TAX', macro:'Tassonomia', subId:'TAX-03', sub:'Numero Generi diversi', level:3, name:'Maestro della Sistematica', goal:'500 generi', metric:'genera_count', threshold:500},
  {badgeId:'TAX-03-L4', macroId:'TAX', macro:'Tassonomia', subId:'TAX-03', sub:'Numero Generi diversi', level:4, name:'Enciclopedia dei Generi', goal:'800 generi', metric:'genera_count', threshold:800},
];
const AWARD_MACROS = Array.from(new Set(AWARD_RULES.map(r => r.macro)));
function buildAwardImagePath(badgeId) {
  return `/awards/${String(badgeId || '').toLowerCase()}.png`;
}
function computeAwardMetrics(statusMap = {}, visitedCountries = null) {
  const visitedCountrySet = new Set(visitedCountries || getVisitedCountries());
  const animalsWithStatus = ANIMALS.map(a => ({ ...a, _status: normalizeAnimalStatus(statusMap[a.id] ?? a.status) }));
  const recorded = animalsWithStatus.filter(a => ['avvistato','catturato'].includes(a._status));
  const captured = recorded.filter(a => a._status === 'catturato');
  const sightOnly = recorded.filter(a => a._status === 'avvistato');
  const consCounts = recorded.reduce((acc, a) => { acc[a.cons] = (acc[a.cons] || 0) + 1; return acc; }, {});
  const familyCounts = recorded.reduce((acc, a) => { if (a.fam) acc[a.fam] = (acc[a.fam] || 0) + 1; return acc; }, {});
  const orderCounts = recorded.reduce((acc, a) => { if (a.ord) acc[a.ord] = (acc[a.ord] || 0) + 1; return acc; }, {});
  const countries = new Set(recorded.flatMap(a => a.distribution?.countries_present || []));
  const biomes = new Set(recorded.flatMap(a => getAnimalBiomes(a)));
  const recordedByHome = getHomeCountry();
  const homeCountryPool = recordedByHome ? ANIMALS.filter(a => (a.distribution?.countries_present || []).includes(recordedByHome)) : [];
  const homeCountrySeen = recordedByHome ? recorded.filter(a => (a.distribution?.countries_present || []).includes(recordedByHome)) : [];
  const homeCountryBiodiversity = recordedByHome && homeCountryPool.length ? Math.round((homeCountrySeen.length / homeCountryPool.length) * 100) : 0;
  const iucnSet = new Set(recorded.map(a => a.cons).filter(Boolean));
  const targetSix = ['LC','NT','VU','EN','CR','DD'];
  const allBiomesCount = new Set(ANIMALS.flatMap(a => getAnimalBiomes(a))).size;
  const metrics = {
    bio_blades: recorded.filter(a => (a.categories || []).includes('OFF_BIO_BLADES')).length,
    tusks: recorded.filter(a => (a.categories || []).includes('OFF_TUSKS_PIERCERS')).length,
    cr_count: consCounts.CR || 0,
    iucn_variety: iucnSet.size,
    iucn_five_each: targetSix.every(code => (consCounts[code] || 0) >= 5) ? 1 : 0,
    record_count: recorded.filter(a => (a.categories || []).includes('PHYS_RECORD_BREAKERS') || (a.categories || []).includes('ELITE_WORLD_RECORD') || !!a.world_record).length,
    obs_under_100: recorded.filter(a => getObservationCount(a) > 0 && getObservationCount(a) < 100).length,
    usage_streak: getUsageStreak(),
    ai_corrections: Number((typeof window !== 'undefined' && (window.ANIMALDEX_AI_CORRECTIONS || window.localStorage.getItem('animaldex_ai_corrections'))) || 0),
    apex_count: recorded.filter(a => String(a.trophic) === '4').length,
    base_trophic_count: recorded.filter(a => String(a.trophic) === '1' || String(a.trophic) === 'F').length,
    onboarding_first_trip: visitedCountrySet.size > 0 ? 1 : 0,
    countries_count: visitedCountrySet.size,
    home_country_biodiversity: homeCountryBiodiversity,
    biomes_count: biomes.size,
    all_biomes: allBiomesCount > 0 && biomes.size >= allBiomesCount ? 1 : 0,
    total_mass_tons: recorded.reduce((sum, a) => sum + extractAverageWeightKg(a.wt), 0) / 1000,
    tiny_species_count: recorded.filter(a => extractAverageWeightKg(a.wt) > 0 && extractAverageWeightKg(a.wt) <= 0.1).length,
    extremes_count: recorded.filter(a => (a.categories || []).some(cat => ['EVO_INSULAR_DWARFISM','EVO_INSULAR_GIGANTISM','PHYS_RECORD_BREAKERS'].includes(cat))).length,
    captured_count: captured.length,
    sighting_only_count: sightOnly.length,
    max_family_count: Math.max(0, ...Object.values(familyCounts)),
    max_order_count: Math.max(0, ...Object.values(orderCounts)),
    genera_count: new Set(recorded.map(a => a.gen).filter(Boolean)).size,
  };
  return metrics;
}
function computeUnlockedAwards(statusMap = {}, visitedCountries = null) {
  const metrics = computeAwardMetrics(statusMap, visitedCountries);
  return AWARD_RULES.filter(rule => Number(metrics[rule.metric] || 0) >= Number(rule.threshold || 0))
    .map(rule => ({ ...rule, image: buildAwardImagePath(rule.badgeId), currentValue: metrics[rule.metric] || 0 }));
}
function getAwardUnlockSet() {
  if (typeof window === 'undefined') return new Set();
  try { return new Set(JSON.parse(window.localStorage.getItem('animaldex_awards_unlocked') || '[]').map(normalizeBadgeId)); } catch { return new Set(); }
}
function persistAwardUnlocks(ids = []) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem('animaldex_awards_unlocked', JSON.stringify(Array.from(new Set((ids || []).map(normalizeBadgeId).filter(Boolean))))); } catch {}
}

// ── Rarity class helper ───────────────────────────────────────────────
function rarityClass(rarity) {
  return 'rarity-' + (rarity || 'Comune').toLowerCase().replace(' ', '-');
}
function rarityDotClass(rarity) {
  return 'rarity-dot-' + (rarity || 'Comune').toLowerCase().replace(' ', '-');
}
function rarityMetalClass(rarity) {
  return 'rarity-metal-' + (rarity || 'Comune').toLowerCase().replace(' ', '-');
}

function RarityBadge({ rarity='Comune', compact=false, small=false, full=false, onClick, suffix='', style={} }) {
  const r = RARITY[rarity] ? rarity : 'Comune';
  const cfg = {
    Comune: { material:'rame', bg:'linear-gradient(135deg,rgba(168,92,54,.30),rgba(78,35,20,.54))', border:'rgba(208,137,92,.58)', glow:'0 0 0 rgba(0,0,0,0)', text:'#F2C09D' },
    'Non comune': { material:'argento', bg:'linear-gradient(135deg,rgba(180,190,202,.24),rgba(62,72,84,.54))', border:'rgba(210,220,232,.60)', glow:'0 0 10px rgba(190,210,232,.08)', text:'#E7EEF5' },
    Raro: { material:'oro', bg:'linear-gradient(135deg,rgba(240,196,73,.28),rgba(113,78,8,.58))', border:'rgba(246,210,92,.72)', glow:'0 0 15px rgba(240,196,73,.14)', text:'#FFE08A' },
    Leggendario: { material:'cristallo', bg:'linear-gradient(135deg,rgba(143,52,245,.28),rgba(34,12,70,.60))', border:'rgba(190,118,255,.78)', glow:'0 0 18px rgba(143,52,245,.20)', text:'#F0D9FF' },
  }[r];
  const h = full ? 42 : small ? 36 : compact ? 28 : 38;
  const label = compact ? (suffix || r) : `${r}${suffix}`;
  return (
    <div className="rarity-badge" onClick={onClick} title={`${r} · rarità ${cfg.material}`} style={{
      height:h,
      minWidth: compact ? 0 : small ? 118 : 132,
      maxWidth:'100%',
      display:'inline-flex',
      alignItems:'center',
      justifyContent:'center',
      borderRadius:14,
      padding:`0 ${full ? 16 : 12}px`,
      position:'relative',
      cursor:onClick?'pointer':'default',
      background:cfg.bg,
      border:`1.2px solid ${cfg.border}`,
      boxShadow:`inset 0 1px 0 rgba(255,255,255,.18), inset 0 -8px 18px rgba(0,0,0,.22), ${cfg.glow}`,
      overflow:'hidden',
      boxSizing:'border-box',
      ...style,
    }}>
      {r === 'Non comune' && <span aria-hidden className="rarity-silver-sheen" style={{ position:'absolute', inset:'-8% -38%', width:'46%', background:'linear-gradient(115deg, transparent 8%, rgba(255,255,255,.20) 44%, rgba(255,255,255,.06) 56%, transparent 78%)', opacity:.48, mixBlendMode:'screen', pointerEvents:'none' }} />}
      {r === 'Raro' && <span aria-hidden className="rarity-rare-gems" style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 18% 28%, rgba(255,255,255,.95) 0 1.4px, transparent 2.3px), radial-gradient(circle at 78% 24%, rgba(255,255,255,.82) 0 1.2px, transparent 2.2px), radial-gradient(circle at 68% 72%, rgba(255,244,164,.86) 0 1.3px, transparent 2.4px), radial-gradient(circle at 34% 74%, rgba(255,255,255,.70) 0 1px, transparent 2px)', pointerEvents:'none', mixBlendMode:'screen' }} />}
      {r === 'Leggendario' && <span aria-hidden className="rarity-legendary-water" style={{ position:'absolute', inset:'-28% -42%', background:'radial-gradient(ellipse at 22% 38%, rgba(118,220,255,.26), transparent 34%), radial-gradient(ellipse at 74% 64%, rgba(255,255,255,.18), transparent 32%), linear-gradient(100deg, transparent 0%, rgba(87,214,255,.16) 24%, transparent 46%, rgba(255,255,255,.14) 64%, transparent 100%)', backgroundSize:'180% 180%, 160% 160%, 240% 100%', filter:'blur(.45px)', mixBlendMode:'screen', pointerEvents:'none' }} />}
      <span style={{ position:'relative', zIndex:2, color:cfg.text, fontSize:full?13.5:small?11.5:12.5, fontWeight:1000, letterSpacing:.2, textShadow:'0 1px 4px rgba(0,0,0,.50)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</span>
    </div>
  );
}

// ── Build taxonomy tree ───────────────────────────────────────────────
function buildTree(animals) {
  const LEVELS = ['kin','phy','cls','ord','fam','gen'];
  const LABELS = { kin:'Regno', phy:'Phylum', cls:'Classe', ord:'Ordine', fam:'Famiglia', gen:'Genere' };
  function insert(node, animal, depth) {
    if (depth >= LEVELS.length) return;
    const key = animal[LEVELS[depth]];
    if (!node[key]) node[key] = { _label: LABELS[LEVELS[depth]], _key: LEVELS[depth], _children: {}, _count: 0 };
    node[key]._count++;
    insert(node[key]._children, animal, depth + 1);
  }
  const root = {};
  for (const a of animals) insert(root, a, 0);
  return root;
}

// ── Weight gauge with segmented category scale ────────────────────────
const WEIGHT_CATS = [
  { id:'piuma', label:'Pesi piuma', range:[0.001,5], color:'#5BB8F5' },
  { id:'medio', label:'Pesi medi', range:[5,100], color:'#F0C84E' },
  { id:'massimo', label:'Pesi massimi', range:[100,2300], color:'#F55454' },
];

function getWeightAvgKg(wt_str) {
  if (!wt_str) return 0;
  const s = String(wt_str).toLowerCase();
  const mult = s.includes(' kg') ? 1 : s.includes(' g') ? 0.001 : 1;
  const nums = s.match(/[\d.]+/g);
  if (!nums) return 0;
  return ((parseFloat(nums[0]) + parseFloat(nums[nums.length-1])) / 2) * mult;
}

function getWeightCat(wt_str) {
  const avg = getWeightAvgKg(wt_str);
  if (avg < 5) return WEIGHT_CATS[0];
  if (avg < 100) return WEIGHT_CATS[1];
  return WEIGHT_CATS[2];
}

function getGaugeAngle(wt_str) {
  const avg = Math.max(0.001, getWeightAvgKg(wt_str));
  const ranges = [
    { min:0.001, max:5, start:-82, end:-30 },
    { min:5, max:100, start:-26, end:26 },
    { min:100, max:2300, start:30, end:82 },
  ];
  const idx = avg < 5 ? 0 : avg < 100 ? 1 : 2;
  const seg = ranges[idx];
  const ratio = Math.max(0, Math.min(1, (Math.log10(avg) - Math.log10(seg.min)) / Math.max(0.0001, (Math.log10(seg.max) - Math.log10(seg.min)))));
  return seg.start + (seg.end - seg.start) * ratio;
}

function GaugeSVG({ wt_str, large=false }) {
  const cat = getWeightCat(wt_str);
  const angle = getGaugeAngle(wt_str);
  const col = cat.color;
  const cx = 60, cy = 56;

  function polarToXY(deg, radius) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(startDeg, endDeg, r1, r2) {
    const s1 = polarToXY(startDeg, r1), e1 = polarToXY(endDeg, r1);
    const s2 = polarToXY(startDeg, r2), e2 = polarToXY(endDeg, r2);
    const large = (endDeg - startDeg) > 180 ? 1 : 0;
    return `M${s1.x},${s1.y} A${r1},${r1},0,${large},1,${e1.x},${e1.y} L${e2.x},${e2.y} A${r2},${r2},0,${large},0,${s2.x},${s2.y} Z`;
  }

  const segDefs = [
    { start:-82, end:-30, color:WEIGHT_CATS[0].color },
    { start:-26, end:26, color:WEIGHT_CATS[1].color },
    { start:30, end:82, color:WEIGHT_CATS[2].color },
  ];
  const catIdx = WEIGHT_CATS.indexOf(cat);
  let arcs = '';
  for (let i = 0; i < segDefs.length; i++) {
    const seg = segDefs[i];
    arcs += `<path d="${arcPath(seg.start, seg.end, 42, 52)}" fill="${i === catIdx ? seg.color : 'rgba(255,255,255,.16)'}"/>`;
  }

  const needleRad = (angle - 90) * Math.PI / 180;
  const nx = cx + 36 * Math.cos(needleRad);
  const ny = cy + 36 * Math.sin(needleRad);
  const n1 = polarToXY(angle - 4, 8);
  const n2 = polarToXY(angle + 4, 8);

  return (
    <svg viewBox="0 0 120 82" width="100%" height={large ? 185 : 52} xmlns="http://www.w3.org/2000/svg">
      <g dangerouslySetInnerHTML={{ __html: arcs }} />
      <polygon points={`${n1.x},${n1.y} ${nx},${ny} ${n2.x},${n2.y}`} fill={col} />
      <circle cx={cx} cy={cy} r="4.6" fill={col} />
      <circle cx={cx} cy={cy} r="2.1" fill="#111113" />
    </svg>
  );
}


function parseAnimalLengthCm(lengthValue) {
  const raw = String(lengthValue || '').toLowerCase().replace(',', '.');
  const nums = (raw.match(/\d+(?:\.\d+)?/g) || []).map(Number).filter(n => Number.isFinite(n));
  if (!nums.length) return 0;
  const max = Math.max(...nums);
  if (/\bmm\b|millimet/.test(raw)) return max / 10;
  if (/\bcm\b|centimet/.test(raw)) return max;
  if (/\bm\b|metri|metro/.test(raw) && !/\bcm\b/.test(raw) && !/\bmm\b/.test(raw)) return max * 100;
  return max;
}
function getLengthReference(lengthCm) {
  if (lengthCm > 50) return { type:'corpo', label:'Corpo umano 175 cm', cm:175, src:'/dimensioni/corpo.png' };
  if (lengthCm >= 20) return { type:'busto', label:'Busto umano 50 cm', cm:50, src:'/dimensioni/busto.png' };
  return { type:'mano', label:'Mano 20 cm', cm:20, src:'/dimensioni/mano.png' };
}
// ── Human/reference silhouettes and trophic pyramid ───────────────────
function HumanSilhouette({ h = 78 }) {
  const w = Math.max(18, Math.round(h * 0.28));
  return (
    <svg viewBox="0 0 46 170" width={w} height={h} xmlns="http://www.w3.org/2000/svg" style={{ display:'block', overflow:'visible' }}>
      <circle cx="23" cy="13" r="12" fill="rgba(255,255,255,.94)"/>
      <path d="M16 29h14c4 0 7 3 7 7v45c0 4-3 7-7 7H16c-4 0-7-3-7-7V36c0-4 3-7 7-7Z" fill="rgba(255,255,255,.94)"/>
      <path d="M9 39c-5 11-7 25-7 42 0 4 3 7 7 7s7-3 7-7c0-15 2-27 6-35Z" fill="rgba(255,255,255,.94)"/>
      <path d="M37 39c5 11 7 25 7 42 0 4-3 7-7 7s-7-3-7-7c0-15-2-27-6-35Z" fill="rgba(255,255,255,.94)"/>
      <path d="M15 87h12l-2 69c0 5-4 8-8 8s-8-3-8-8Z" fill="rgba(255,255,255,.94)"/>
      <path d="M31 87H19l2 69c0 5 4 8 8 8s8-3 8-8Z" fill="rgba(255,255,255,.94)"/>
    </svg>
  );
}
function BustSilhouette({ h = 72 }) {
  const w = Math.max(34, Math.round(h * 0.72));
  return (
    <svg viewBox="0 0 72 80" width={w} height={h} xmlns="http://www.w3.org/2000/svg" style={{ display:'block', overflow:'visible' }}>
      <circle cx="36" cy="16" r="13" fill="rgba(255,255,255,.94)"/>
      <path d="M14 76c2-19 13-29 22-29s20 10 22 29Z" fill="rgba(255,255,255,.94)"/>
      <rect x="24" y="31" width="24" height="22" rx="8" fill="rgba(255,255,255,.94)"/>
    </svg>
  );
}
function EarSilhouette({ h = 72 }) {
  const w = Math.max(28, Math.round(h * 0.52));
  return (
    <svg viewBox="0 0 46 76" width={w} height={h} xmlns="http://www.w3.org/2000/svg" style={{ display:'block', overflow:'visible' }}>
      <path d="M28 5c9 0 15 8 15 19 0 8-4 13-7 18-4 5-6 10-6 17 0 7-6 12-13 12S5 64 5 55c0-10 6-15 11-20 5-5 7-9 7-16 0-7 2-14 5-14Z" fill="rgba(255,255,255,.94)"/>
      <path d="M25 21c5 0 9 4 9 9 0 4-2 7-4 10-3 3-5 6-5 11" fill="none" stroke="#111113" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}
function ScaleComparison({ animal, full=false }) {
  const lengthCm = parseAnimalLengthCm(animal?.ln);
  const ref = getLengthReference(lengthCm);
  const maxPx = full ? 178 : 62;
  const minPx = full ? 20 : 8;
  const maxCm = Math.max(ref.cm, lengthCm || 0.1);
  const pxPerCm = maxPx / maxCm;
  const referencePx = Math.max(full ? 40 : 28, Math.round(ref.cm * pxPerCm));
  const animalPx = Math.max(minPx, Math.round((lengthCm || ref.cm * .25) * pxPerCm));
  const animalIsMystery = isMysteryStatus(animal?.status);
  const animalSrc = animalIsMystery ? MYSTERY_PLACEHOLDER : (animal?.image_url || MYSTERY_PLACEHOLDER);
  const stageHeight = full ? 196 : 68;
  const floorY = full ? 178 : 62;
  const refSlotW = full ? 170 : 66;
  const animalSlotW = full ? 190 : 72;
  const refNudge = full ? 18 : 10;
  const animalNudge = full ? -8 : -4;
  return (
	    <div style={{ width:'100%', minHeight:full?252:72, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
	      <div style={{ width:'100%', height:stageHeight, position:'relative', display:'grid', gridTemplateColumns:`${refSlotW}px ${animalSlotW}px`, justifyContent:'center', alignItems:'end', columnGap:full?20:6, padding:full?'18px 10px 8px':'2px 0 0', boxSizing:'border-box' }}>
	        <div style={{ height:'100%', width:refSlotW, display:'flex', justifyContent:'flex-end', alignItems:'flex-end', transform:`translateX(${refNudge}px)`, paddingBottom:Math.max(0, stageHeight - floorY), boxSizing:'border-box' }}>
	          <img src={ref.src} alt={ref.label} style={{ maxHeight:referencePx, maxWidth:full?144:58, width:'auto', height:'auto', objectFit:'contain', objectPosition:'center bottom', display:'block', opacity:.96 }} />
	        </div>
	        <div style={{ height:'100%', width:animalSlotW, display:'flex', justifyContent:'flex-start', alignItems:'flex-end', transform:`translateX(${animalNudge}px)`, paddingBottom:Math.max(0, stageHeight - floorY), boxSizing:'border-box' }}>
	          <img src={animalSrc} alt="" style={{ maxWidth:animalPx, maxHeight:animalPx, width:'auto', height:'auto', objectFit:'contain', objectPosition:'center bottom', display:'block', filter:animalIsMystery?'none':'brightness(0) invert(1)', imageRendering:'-webkit-optimize-contrast', opacity:animalIsMystery ? .78 : 1 }} />
	        </div>
      </div>
    </div>
  );
}
function TrophicPyramid({ trophic, compact = false, showLabels = false, large=false }) {
  const activeKey = getPyramidKey(trophic);
  const widths = compact ? [20, 32, 46, 60, 74] : large ? [90, 134, 180, 228, 272] : [42, 62, 86, 108, 128];
  const rowH = compact ? 9 : large ? 34 : 18;
  const barH = compact ? 6 : large ? 24 : 12;
  const vbW = compact ? 78 : large ? 286 : 132;
  const svgW = compact ? 72 : large ? 286 : 130;
  const svgH = compact ? 50 : large ? 220 : 96;
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: showLabels ? 16 : 0 }}>
      <svg viewBox={`0 0 ${vbW} ${rowH*5}`} width={svgW} height={svgH} xmlns="http://www.w3.org/2000/svg" style={{ overflow:'visible' }}>
        {PYRAMID_LEVELS.map((lv, i) => {
          const isActive = lv.key === activeKey;
          const x = (vbW - widths[i]) / 2;
          return <rect key={lv.key} x={x} y={i*rowH} width={widths[i]} height={barH} rx="2.5" fill={isActive ? lv.c : 'rgba(255,255,255,.16)'} opacity={isActive ? 1 : .82} />;
        })}
      </svg>
      {showLabels && <div style={{ display:'grid', gap:6, textAlign:'left' }}>{PYRAMID_LEVELS.map(lv => <div key={lv.key} style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,.78)', fontSize:12, fontWeight:750 }}><span style={{ width:18, height:8, borderRadius:5, background:lv.c, flexShrink:0 }} />{lv.label}</div>)}</div>}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────
function StatRow({ label, base, scale, color, unit }) {
  const statKey = Object.keys(STAT_MAXES).find(k => STATS_DEF.some(s => s.k === k && s.l === label));
  const maxValue = statKey ? STAT_MAXES[statKey] : 100;
  const realValue = Math.round(base * scale);
  const barWidth = Math.min(100, Math.round((realValue / maxValue) * 100));
  return (
    <div style={{ minHeight:40, borderRadius:13, background:'rgba(255,255,255,.055)', border:'1px solid rgba(255,255,255,.065)', padding:'8px 11px', boxSizing:'border-box', display:'grid', gridTemplateColumns:'92px 1fr 66px', alignItems:'center', gap:9 }}>
      <span style={{ color:'rgba(255,255,255,.80)', fontSize:12, fontWeight:950, lineHeight:1.05 }}>{label}</span>
      <div style={{ height:9, background:'rgba(0,0,0,.48)', borderRadius:999, overflow:'hidden', boxShadow:'inset 0 1px 3px rgba(255,255,255,.04)' }}>
        <div style={{ height:'100%', width:`${barWidth}%`, background:`linear-gradient(90deg, ${color}A8, ${color})`, borderRadius:999, transition:'width .65s cubic-bezier(.4,0,.2,1)', boxShadow:`0 0 16px ${color}55` }} />
      </div>
      <span style={{ color:'white', fontSize:12.5, fontWeight:950, textAlign:'right', lineHeight:1.05 }}>{realValue} {unit}</span>
    </div>
  );
}

function useAutoUnflip(flipped, setFlipped, delay = 5000) {
  useEffect(() => {
    if (!flipped) return undefined;
    const t = setTimeout(() => setFlipped(false), delay);
    return () => clearTimeout(t);
  }, [flipped, setFlipped, delay]);
}

function getCountryRegionGroup(code) {
  const c = String(code || '').toUpperCase();
  const groups = {
    northAmerica:['US','CA','MX','GL','BM','PM'],
    centralAmerica:['BZ','GT','HN','SV','NI','CR','PA','CU','JM','HT','DO','PR','VI','VG','AI','AG','BL','MF','SX','KN','LC','VC','DM','GP','MQ','MS','GD','BB','TT','TC','AW','CW','BQ','BS','KY'],
    southAmerica:['CO','VE','EC','PE','BO','BR','GF','GY','SR','AR','CL','UY','PY','FK'],
    europe:['IS','NO','SE','FI','DK','FO','AX','IE','GB','GG','IM','JE','FR','BE','NL','LU','DE','CH','AT','LI','MC','AD','PL','CZ','SK','HU','RO','BG','MD','UA','BY','LT','LV','EE','ES','PT','IT','MT','SM','VA','GI','GR','CY','AL','HR','BA','ME','SI','MK','RS','XK'],
    africa:['MA','DZ','TN','LY','EG','EH','MR','ML','NE','TD','SD','SN','GM','GW','GN','SL','LR','CI','GH','TG','BJ','BF','NG','CV','CM','CF','GQ','GA','CG','CD','ST','STP','AO','ET','ER','DJ','SO','KE','TZ','UG','RW','BI','SS','ZA','NA','BW','ZW','ZM','MW','MZ','SZ','LS','MG','MU','RE','YT','KM','SC','IO','SH'],
    asia:['RU','KZ','MN','TR','GE','AM','AZ','IR','IL','PS','JO','LB','SY','IQ','SA','YE','OM','AE','QA','BH','KW','UZ','TM','TJ','KG','AF','PK','IN','BD','LK','NP','BT','MV','CN','HK','MO','TW','KR','KP','JP','MM','TH','LA','KH','VN','MY','SG','ID','BN','TL','PH'],
    oceania:['AU','NF','CX','CC','NZ','PG','SB','VU','NC','FJ','FM','GU','KI','MH','MP','NR','PW','UM','AS','CK','NU','PF','PN','TK','TO','TV','WF','WS'],
    antarctic:['AQ','BV','GS','HM','TF']
  };
  for (const [group, codes] of Object.entries(groups)) if (codes.includes(c)) return { group, index: codes.indexOf(c), total: codes.length };
  return { group:'other', index:(c.charCodeAt(0)||0)+(c.charCodeAt(1)||0), total:16 };
}

const COUNTRY_LONLAT = {
  // Europe
  IS:[-19,65], NO:[10,62], SE:[15,62], FI:[26,64], DK:[10,56], FO:[-7,62], AX:[20,60], IE:[-8,53], GB:[-2,54], GG:[-2.6,49.5], IM:[-4.5,54.2], JE:[-2.1,49.2], FR:[2,46], BE:[4.5,50.5], NL:[5.3,52.2], LU:[6.1,49.8], DE:[10,51], CH:[8.2,46.8], AT:[14,47.5], LI:[9.5,47.1], MC:[7.4,43.7], AD:[1.6,42.5], PL:[19,52], CZ:[15.5,49.8], SK:[19.5,48.7], HU:[19,47.2], RO:[25,45.8], BG:[25.5,42.8], MD:[28.5,47.2], UA:[31,49], BY:[28,53], LT:[24,55.2], LV:[25,57], EE:[25.5,58.7], ES:[-3.7,40.4], PT:[-8,39.5], IT:[12.5,42.8], MT:[14.4,35.9], SM:[12.5,43.9], VA:[12.45,41.9], GI:[-5.35,36.1], GR:[22,39], CY:[33,35], AL:[20,41], HR:[16,45], BA:[18,44], ME:[19.3,42.7], SI:[14.8,46.1], MK:[21.7,41.6], RS:[20.8,44],
  // Americas
  CA:[-105,57], US:[-98,39], MX:[-102,23], GL:[-42,72], BM:[-64.8,32.3], PM:[-56.3,46.8], BZ:[-88.7,17.2], GT:[-90.2,15.7], HN:[-86.2,14.8], SV:[-88.9,13.8], NI:[-85,13], CR:[-84,9.9], PA:[-80,8.5], CU:[-79.5,21.7], JM:[-77.3,18.1], HT:[-72.3,19], DO:[-70.2,19], PR:[-66.5,18.2], VI:[-64.8,18.1], VG:[-64.6,18.4], AI:[-63.1,18.2], AG:[-61.8,17.1], BL:[-62.8,17.9], MF:[-63.1,18.1], SX:[-63.05,18.04], KN:[-62.7,17.3], LC:[-60.98,13.9], VC:[-61.2,13.2], DM:[-61.35,15.4], GP:[-61.55,16.2], MQ:[-61,14.6], MS:[-62.2,16.7], GD:[-61.7,12.1], BB:[-59.5,13.2], TT:[-61.2,10.6], TC:[-71.8,21.7], AW:[-69.97,12.5], CW:[-69,12.2], BQ:[-68.3,12.2], BS:[-76,24.5], KY:[-80.5,19.4], CO:[-74,4.6], VE:[-66,7], EC:[-78.2,-1.5], PE:[-75,-9], BO:[-64.7,-16.3], BR:[-52,-10], GF:[-53.1,4], GY:[-58.9,5], SR:[-56,4], AR:[-64,-34], CL:[-71,-30], UY:[-56,-32.7], PY:[-58,-23.4], FK:[-59,-51.7],
  // Africa
  MA:[-6,32], DZ:[2,28], TN:[9,34], LY:[17,27], EG:[30,27], EH:[-13,24], MR:[-10,20], ML:[-4,17], NE:[8,17], TD:[18,15], SD:[30,15], SN:[-14,14.5], GM:[-15.3,13.4], GW:[-15,12], GN:[-10.9,10.4], SL:[-11.8,8.5], LR:[-9.4,6.5], CI:[-5.5,7.5], GH:[-1.2,7.9], TG:[1.1,8.6], BJ:[2.3,9.3], BF:[-1.7,12.2], NG:[8,9], CV:[-23.6,15.1], CM:[12,5.7], CF:[20.5,6.6], GQ:[10.3,1.6], GA:[11.6,-0.6], CG:[15.2,-1], CD:[23.7,-2.9], ST:[6.7,0.2], AO:[17.9,-12.3], ET:[40,9], ER:[39,15], DJ:[42.6,11.8], SO:[45.3,5.2], KE:[37.8,0.5], TZ:[35,-6], UG:[32.3,1.3], RW:[29.9,-1.9], BI:[29.9,-3.4], SS:[31.6,7.8], ZA:[24,-29], NA:[17,-22], BW:[24,-22], ZW:[29,-19], ZM:[27.8,-13.1], MW:[34,-13.3], MZ:[35.5,-18.5], SZ:[31.5,-26.5], LS:[28.2,-29.6], MG:[47,-19],
  // Asia
  RU:[90,60], KZ:[67,48], MN:[103,46], TR:[35,39], GE:[43.5,42], AM:[45,40], AZ:[47.5,40.3], IR:[53,32], IL:[35,31.5], PS:[35.2,31.9], JO:[36,31], LB:[35.9,33.9], SY:[38,35], IQ:[44,33], SA:[45,24], YE:[48,15.5], OM:[57,21], AE:[54,24], QA:[51.2,25.3], BH:[50.5,26], KW:[47.5,29.3], UZ:[64,41], TM:[59,39], TJ:[71,38.5], KG:[74.6,41.5], AF:[66,34], PK:[69,30], IN:[78,22], BD:[90.3,23.7], LK:[80.7,7.7], NP:[84,28.2], BT:[90.4,27.5], MV:[73.2,3.2], CN:[104,35], HK:[114.1,22.3], MO:[113.6,22.2], TW:[121,23.7], KR:[127.8,36], KP:[127,40], JP:[138,37], MM:[96,21], TH:[101,15], LA:[103.8,18], KH:[104.9,12.7], VN:[106,16], MY:[102,4], SG:[103.8,1.35], ID:[118,-2], BN:[114.7,4.5], TL:[125.7,-8.8], PH:[122,12],
  // Oceania / Antarctica / islands
  AU:[134,-25], NF:[167.9,-29], CX:[105.7,-10.5], CC:[96.9,-12.1], NZ:[172,-41], PG:[145,-6], SB:[160,-9], VU:[167,-16], NC:[165.5,-21.3], FJ:[178,-17.8], FM:[158,6.9], GU:[144.8,13.5], KI:[-157,1.9], MH:[171,7], MP:[145.7,15.2], NR:[166.9,-0.5], PW:[134.6,7.5], UM:[-162,6], AS:[-170.7,-14.3], CK:[-159.8,-21.2], NU:[-169.9,-19.1], PF:[-149,-17.7], PN:[-128.3,-24.4], TK:[-172,-9], TO:[-175.2,-21.2], TV:[179,-8], WF:[-176.2,-13.8], WS:[-172,-13.8], MU:[57.6,-20.2], RE:[55.5,-21.1], YT:[45.2,-12.8], KM:[43.3,-11.9], SC:[55.4,-4.6], IO:[72.4,-7.3], SJ:[20,78], AQ:[20,-82], BV:[3.4,-54.4], GS:[-36,-54.3], HM:[73.5,-53.1], TF:[69.3,-49.3], SH:[-5.7,-15.9]
};

function countryMapPoint(code) {
  const c = String(code || '').toUpperCase();
  const lonlat = COUNTRY_LONLAT[c];
  if (lonlat) {
    const [x,y] = projectLonLat(lonlat[0], lonlat[1]);
    return { x:x/10, y:y/5, lon:lonlat[0], lat:lonlat[1], px:x, py:y };
  }
  const { group, index, total } = getCountryRegionGroup(c);
  const t = total > 1 ? index / (total - 1) : 0;
  const wobble = ((String(c).charCodeAt(0) || 65) % 7 - 3) * .8;
  const lerp = (a,b,v)=>a+(b-a)*v;
  const ranges = {
    northAmerica:[20,28,24,48],
    centralAmerica:[26,42,48,62],
    southAmerica:[33,43,58,83],
    europe:[44,57,26,43],
    africa:[46,60,47,78],
    asia:[59,80,24,58],
    oceania:[73,90,65,84],
    antarctic:[45,62,88,94],
    other:[50,56,48,58],
  };
  const [x1,x2,y1,y2] = ranges[group] || ranges.other;
  const x = lerp(x1,x2,t) + wobble;
  const y = lerp(y1,y2, (t*1.37)%1);
  return { x, y, px:x*10, py:y*5 };
}

function pointsToViewBox(points = [], padRatio=.22) {
  const valid = points.filter(p => Number.isFinite(p?.px) && Number.isFinite(p?.py));
  if (!valid.length) return '0 0 1000 500';
  const b = valid.reduce((acc,p)=>({
    minX:Math.min(acc.minX,p.px), minY:Math.min(acc.minY,p.py),
    maxX:Math.max(acc.maxX,p.px), maxY:Math.max(acc.maxY,p.py),
  }), {minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity});
  return boundsToViewBox(b, padRatio);
}

function clampWholeWords(text, maxChars = 31) {
  const clean = String(text || '').trim().replace(/\s+/g,' ');
  if (clean.length <= maxChars) return clean;
  const words = clean.split(' ');
  let out = '';
  for (const word of words) {
    const next = out ? `${out} ${word}` : word;
    if (next.length > maxChars) break;
    out = next;
  }
  return out || clean.slice(0, maxChars).replace(/\s+\S*$/,'');
}


function useAppViewportHeight() {
  const [h, setH] = useState('100dvh');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const apply = () => {
      const vv = window.visualViewport;
      const next = Math.max(320, Math.round(vv?.height || window.innerHeight || document.documentElement.clientHeight || 800));
      const px = `${next}px`;
      document.documentElement.style.setProperty('--animaldex-app-height', px);
      document.body.style.minHeight = px;
      setH(px);
    };
    apply();
    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', apply);
    window.visualViewport?.addEventListener('resize', apply);
    window.visualViewport?.addEventListener('scroll', apply);
    return () => {
      window.removeEventListener('resize', apply);
      window.removeEventListener('orientationchange', apply);
      window.visualViewport?.removeEventListener('resize', apply);
      window.visualViewport?.removeEventListener('scroll', apply);
    };
  }, []);
  return h;
}

function useInteractiveMapControls(minZoom=1, maxZoom=4.5, initialZoom=1, options={}) {
  const [zoom, setZoomState] = useState(initialZoom);
  const [pan, setPanState] = useState({x:0,y:0});
  const ref = useRef({ dragging:false, lastX:0, lastY:0, pinch:false, startDist:0, startZoom:1 });
  const allowPanAtMin = !!options.allowPanAtMin;
  const panLimitX = Number(options.panLimitX || 190);
  const panLimitY = Number(options.panLimitY || 120);
  const clampZoom = (z) => Math.max(minZoom, Math.min(maxZoom, Number(z) || initialZoom));
  const clampPan = (nextPan, z = zoom) => {
    if (!allowPanAtMin && z <= minZoom + 0.01) return { x:0, y:0 };
    const travel = allowPanAtMin ? Math.max(.65, z - minZoom + .65) : Math.max(0, z - minZoom);
    const maxX = panLimitX * travel;
    const maxY = panLimitY * travel;
    return {
      x: Math.max(-maxX, Math.min(maxX, nextPan.x || 0)),
      y: Math.max(-maxY, Math.min(maxY, nextPan.y || 0)),
    };
  };
  const setZoom = (updater) => {
    setZoomState(prev => {
      const next = clampZoom(typeof updater === 'function' ? updater(prev) : updater);
      if (next <= minZoom + 0.01) setPanState({ x:0, y:0 });
      else setPanState(p => clampPan(p, next));
      return next;
    });
  };
  const setPan = (updater) => {
    setPanState(prev => clampPan(typeof updater === 'function' ? updater(prev) : updater, zoom));
  };
  const reset = () => { setZoomState(initialZoom); setPanState({x:0,y:0}); };
  const dist = (touches) => {
    if (!touches || touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  };
  const handlers = {
	    onWheel:(e)=> {
	      e.preventDefault?.();
	      const delta = e.deltaY > 0 ? -0.12 : 0.12;
	      setZoom(z => z + delta);
    },
    onPointerDown:(e)=> {
      if (e.pointerType === 'touch' || (!allowPanAtMin && zoom <= minZoom + 0.01)) return;
      ref.current.dragging = true;
      ref.current.lastX = e.clientX; ref.current.lastY = e.clientY;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    onPointerMove:(e)=> {
      if (!ref.current.dragging || (!allowPanAtMin && zoom <= minZoom + 0.01)) return;
      const dx = e.clientX - ref.current.lastX;
      const dy = e.clientY - ref.current.lastY;
      ref.current.lastX = e.clientX; ref.current.lastY = e.clientY;
      setPan(p => ({ x:p.x+dx, y:p.y+dy }));
    },
    onPointerUp:(e)=> {
      ref.current.dragging = false;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    },
    onPointerCancel:()=> { ref.current.dragging = false; },
    onTouchStart:(e)=> {
      if (e.touches?.length === 2) {
        e.preventDefault?.();
        ref.current.pinch = true;
        ref.current.startDist = dist(e.touches);
        ref.current.startZoom = zoom;
      } else if (e.touches?.length === 1 && (allowPanAtMin || zoom > minZoom + 0.01)) {
        ref.current.dragging = true;
        ref.current.lastX = e.touches[0].clientX;
        ref.current.lastY = e.touches[0].clientY;
      }
    },
    onTouchMove:(e)=> {
      if (e.touches?.length === 2 && ref.current.pinch) {
        e.preventDefault?.();
        const d = dist(e.touches);
        if (ref.current.startDist > 0) setZoom(ref.current.startZoom * (d/ref.current.startDist));
      } else if (e.touches?.length === 1 && ref.current.dragging && (allowPanAtMin || zoom > minZoom + 0.01)) {
        e.preventDefault?.();
        const dx = e.touches[0].clientX - ref.current.lastX;
        const dy = e.touches[0].clientY - ref.current.lastY;
        ref.current.lastX = e.touches[0].clientX;
        ref.current.lastY = e.touches[0].clientY;
        setPan(p => ({ x:p.x+dx, y:p.y+dy }));
      }
    },
    onTouchEnd:()=> { ref.current.dragging=false; ref.current.pinch=false; }
  };
  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  return { zoom, pan, reset, handlers, transform, setZoom, setPan };
}


function countryPseudoPolygon(code, radiusLon=3.2, radiusLat=2.0) {
  const p = countryMapPoint(code);
  if (!Number.isFinite(p?.lon) || !Number.isFinite(p?.lat)) return null;
  const pts = [];
  const latScale = Math.max(.5, Math.cos((Math.PI/180) * p.lat));
  const rLon = radiusLon / latScale;
  for (let i=0;i<18;i++) {
    const a = (Math.PI*2*i)/18;
    pts.push([p.lon + Math.cos(a)*rLon, p.lat + Math.sin(a)*radiusLat]);
  }
  pts.push(pts[0]);
  return { type:'Polygon', coordinates:[pts] };
}

function CountryPresenceMap({ countryCodes = [], selectedCountry, onSelectCountry, accent='#A84637', height=230, title='Mappa paesi', pointMode=false, fullscreen=false, onCloseFullscreen }) {
  const { data:countryData, error:countryError } = useCountryGeoJson();
  const { data:bioregionData } = useBioregionGeoJson();
  const codes = Array.from(new Set((countryCodes || []).map(c=>String(c).toUpperCase()).filter(Boolean))).slice(0,220);
  const selected = selectedCountry || null;
  const [hoverCountry, setHoverCountry] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapControls = useInteractiveMapControls(1, fullscreen ? 8 : 4.5, 1, { allowPanAtMin:fullscreen, panLimitX:fullscreen ? 420 : 190, panLimitY:fullscreen ? 260 : 120 });
  const points = codes.map(code => ({ code, ...countryMapPoint(code) }));
  const activeCodeSet = new Set(codes);
  const countryFeatures = countryData?.features || [];
  const activeCountryFeatures = countryFeatures.filter(f => activeCodeSet.has(getCountryFeatureIso2(f)));
  const fallbackFeatures = bioregionData?.features || [];
  const featureIso2 = (feature) => {
    const p = feature?.properties || {};
    const raw = Array.isArray(p.countries_iso2_list) ? p.countries_iso2_list.join(';') : (p.countries_iso2 || p.countries_iso2_list || '');
    return String(raw).split(/[;,\s]+/).map(v => v.trim().toUpperCase()).filter(Boolean);
  };
  const pseudoCountryFeatures = codes.map(code => ({ type:'Feature', properties:{ iso2:code, name:getCountryDisplayName(code) }, geometry:countryPseudoPolygon(code) })).filter(f => !!f.geometry);
  const fallbackActive = pseudoCountryFeatures.length ? pseudoCountryFeatures : fallbackFeatures.filter(f => (f.properties || {}).domain !== 'marine' && featureIso2(f).some(code => activeCodeSet.has(code)));
  const activeCountryLabel = hoverCountry || selected;
  const hasCountries = !!countryData && !countryError;
  const baseCountryFeatures = hasCountries ? countryFeatures : (pseudoCountryFeatures.length ? pseudoCountryFeatures : fallbackFeatures.filter(f => (f.properties || {}).domain !== 'marine'));
  const activeBounds = mergeProjectedBounds(
    (activeCountryFeatures.length ? activeCountryFeatures : fallbackActive)
      .map(f => geometryProjectedBounds(f.geometry))
  ) || pointProjectedBounds(points, pointMode ? 42 : 26, pointMode ? 32 : 22);
  const viewBox = boundsToViewBox(activeBounds, codes.length > 8 ? .12 : .22);
  const openFullscreen = () => { if (!fullscreen) setIsFullscreen(true); };

  const mapLibreFeatures = baseCountryFeatures.map(f => {
    const iso = hasCountries ? getCountryFeatureIso2(f) : (getCountryFeatureIso2(f) || featureIso2(f).find(code => activeCodeSet.has(code)) || '');
    return cloneFeatureWithProps(f, { iso2:iso });
  });
  const mapLibreActiveIds = pointMode ? [] : codes;
  const mapLibreBounds = mergeLngLatBounds(
    (activeCountryFeatures.length ? activeCountryFeatures : fallbackActive).map(f => geometryLngLatBounds(f.geometry))
  ) || pointLngLatBounds(points, pointMode ? 5 : 3, pointMode ? 4 : 2.5);

  if (countryData || bioregionData) {
    const map = (
      <MapLibreGeoJsonMap
        data={featureCollection(mapLibreFeatures)}
        activeFeatureIds={mapLibreActiveIds}
        selectedId={selected}
        getFeatureId={getCountryFeatureIso2}
        onFeatureClick={(id)=>id && onSelectCountry?.(String(id).toUpperCase())}
        points={pointMode ? points : []}
        pointMode={pointMode}
        height={fullscreen ? undefined : height}
        fullscreen={fullscreen}
        onCloseFullscreen={onCloseFullscreen}
        title={title}
        label={activeCountryLabel ? `${getFlagEmoji(activeCountryLabel)} ${getCountryDisplayName(activeCountryLabel)}` : ''}
        accent={accent}
        fitBounds={mapLibreBounds}
        onOpenFullscreen={openFullscreen}
      />
    );
    return (
      <>
        {map}
        {isFullscreen && (
          <div onClick={()=>setIsFullscreen(false)} style={{ position:'fixed', inset:0, zIndex:380, background:'rgba(0,0,0,.94)', padding:'calc(env(safe-area-inset-top, 0px) + 10px) 10px calc(env(safe-area-inset-bottom, 0px) + 10px)', boxSizing:'border-box' }}>
            <div onClick={e=>e.stopPropagation()} style={{ width:'100%', height:'100%', borderRadius:18, overflow:'hidden', background:'#07131F', border:'1px solid rgba(255,255,255,.10)' }}>
              <CountryPresenceMap countryCodes={countryCodes} selectedCountry={selectedCountry} onSelectCountry={onSelectCountry} accent={accent} title={title} pointMode={pointMode} fullscreen onCloseFullscreen={()=>setIsFullscreen(false)} />
            </div>
          </div>
        )}
      </>
    );
  }

  const countryMark = (p) => {
    const active = p.code === selected || p.code === hoverCountry;
    return (
      <g key={p.code} onClick={(e)=>{e.stopPropagation(); onSelectCountry?.(p.code);}} onMouseEnter={()=>setHoverCountry(p.code)} onMouseLeave={()=>setHoverCountry(null)} style={{ cursor:'pointer' }}>
        <circle cx={p.px} cy={p.py} r={active ? 13 : 8.5} fill={active ? '#72D6FF' : 'rgba(114,205,255,.20)'} stroke="#72D6FF" strokeWidth={active ? 3.2 : 2.2} opacity=".98" />
        <circle cx={p.px} cy={p.py} r={active ? 22 : 15} fill="none" stroke="#72D6FF" strokeWidth={active ? 3 : 2} opacity={active ? .34 : .22} />
      </g>
    );
  };

  return (
    <>
    <div
      {...mapControls.handlers}
      onClick={openFullscreen}
	      style={{ position:'relative', width:'100%', height:fullscreen?'100%':undefined, aspectRatio:fullscreen?undefined:'2 / 1', minHeight:fullscreen?undefined:Math.min(230, Number(height) || 230), borderRadius:fullscreen?0:16, overflow:'hidden', background:'radial-gradient(circle at 50% 46%, #153245 0%, #0A1722 62%, #05090D 100%)', border:fullscreen?'none':'1px solid rgba(255,255,255,.08)', boxShadow:'inset 0 0 46px rgba(0,0,0,.48)', touchAction:fullscreen || mapControls.zoom > 1.01 ? 'none' : 'pan-y', cursor:fullscreen?'grab':'zoom-in' }}
    >
      <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
        <defs>
          <filter id="countrySatNoiseV41">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="17" result="n"/>
            <feColorMatrix in="n" type="saturate" values="0"/>
            <feComponentTransfer><feFuncA type="table" tableValues="0 0.13"/></feComponentTransfer>
          </filter>
          <radialGradient id="countryOceanV41" cx="50%" cy="45%" r="72%"><stop offset="0%" stopColor="#0E3444"/><stop offset="62%" stopColor="#061722"/><stop offset="100%" stopColor="#02070B"/></radialGradient>
        </defs>
        <rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#countryOceanV41)" />
        <rect x="-2000" y="-2000" width="5000" height="5000" filter="url(#countrySatNoiseV41)" opacity=".62" />
        <g style={{ transform:mapControls.transform, transformOrigin:'50% 50%' }}>
          <g opacity=".86">
            {baseCountryFeatures.map((f,idx) => {
              const iso = hasCountries ? getCountryFeatureIso2(f) : (getCountryFeatureIso2(f) || featureIso2(f).join('-'));
              const d = geometryToSvgPath(f.geometry, 150);
              if (!d) return null;
              return <path key={`base-country:${iso || idx}`} d={d} fill="rgba(85,53,43,.42)" stroke="rgba(100,190,235,.24)" strokeWidth=".38" opacity=".78" />;
            })}
          </g>
          {!pointMode && (
            <g>
              {(activeCountryFeatures.length ? activeCountryFeatures : fallbackActive).map((f,idx) => {
                const iso = hasCountries ? getCountryFeatureIso2(f) : (getCountryFeatureIso2(f) || featureIso2(f).find(code => activeCodeSet.has(code)) || '');
                const active = iso && (iso === selected || iso === hoverCountry);
                const d = geometryToSvgPath(f.geometry, active ? 360 : 240);
                if (!d) return null;
                return <path key={`active-country:${iso || idx}`} d={d} onClick={(e)=>{ e.stopPropagation(); if (iso) onSelectCountry?.(iso); }} onMouseEnter={()=>iso && setHoverCountry(iso)} onMouseLeave={()=>setHoverCountry(null)} style={{ cursor:'pointer' }} fill={active ? `${accent}DD` : `${accent}99`} stroke={active ? '#FFD9C5' : 'rgba(255,255,255,.18)'} strokeWidth={active ? 1.35 : .7} opacity={active ? .98 : .78} />;
              })}
            </g>
          )}
          {pointMode && <g>{points.map(countryMark)}</g>}
        </g>
      </svg>

      <div style={{ position:'absolute', left:12, top:10, color:'rgba(255,255,255,.90)', fontSize:12, fontWeight:950, pointerEvents:'none', textShadow:'0 2px 10px rgba(0,0,0,.65)' }}>{title}</div>
      <div style={{ position:'absolute', right:10, top:10, display:'flex', gap:6 }}>
        <button data-sound="map" onClick={(e)=>{e.stopPropagation(); mapControls.reset();}} aria-label="Ricentra mappa" style={{ width:34, height:34, borderRadius:12, border:'1px solid rgba(255,255,255,.13)', background:'rgba(0,0,0,.45)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16, fontWeight:900, lineHeight:1, padding:0 }}>⌖</button>
        {fullscreen && <button data-sound="back" onClick={(e)=>{e.stopPropagation(); onCloseFullscreen?.();}} aria-label="Chiudi mappa" style={{ width:34, height:34, borderRadius:12, border:'1px solid rgba(255,255,255,.13)', background:'rgba(0,0,0,.45)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:18, fontWeight:900, lineHeight:1, padding:0 }}>×</button>}
      </div>

      {activeCountryLabel && (
        <div style={{ position:'absolute', right:10, bottom:10, maxWidth:'76%', background:'rgba(0,0,0,.58)', border:'1px solid rgba(255,255,255,.10)', borderRadius:14, padding:'8px 10px', color:'white', fontSize:11, fontWeight:900, backdropFilter:'blur(6px)', pointerEvents:'none' }}>
          {getFlagEmoji(activeCountryLabel)} {getCountryDisplayName(activeCountryLabel)}
        </div>
      )}
    </div>
    {isFullscreen && (
      <div onClick={()=>setIsFullscreen(false)} style={{ position:'fixed', inset:0, zIndex:380, background:'rgba(0,0,0,.94)', padding:'calc(env(safe-area-inset-top, 0px) + 10px) 10px calc(env(safe-area-inset-bottom, 0px) + 10px)', boxSizing:'border-box' }}>
        <div onClick={e=>e.stopPropagation()} style={{ width:'100%', height:'100%', borderRadius:18, overflow:'hidden', background:'#07131F', border:'1px solid rgba(255,255,255,.10)' }}>
          <CountryPresenceMap countryCodes={countryCodes} selectedCountry={selectedCountry} onSelectCountry={onSelectCountry} accent={accent} title={title} pointMode={pointMode} fullscreen onCloseFullscreen={()=>setIsFullscreen(false)} />
        </div>
      </div>
    )}
    </>
  );
}

function useAnimaldexSound(enabled = true) {
  const ctxRef = useRef(null);
  const lastRef = useRef(0);

  const play = (type='tap') => {
    if (!enabled || typeof window === 'undefined') return;
    const nowTs = Date.now();
    if (nowTs - lastRef.current < 90) return;
    lastRef.current = nowTs;

    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = ctxRef.current || new AC({ latencyHint:'interactive' });
      ctxRef.current = ctx;

      const synth = () => {
        const now = ctx.currentTime + 0.004;
        const master = ctx.createGain();
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-24, now);
        comp.knee.setValueAtTime(16, now);
        comp.ratio.setValueAtTime(3, now);
        comp.attack.setValueAtTime(0.004, now);
        comp.release.setValueAtTime(0.16, now);

        const level = type==='reward' ? 0.18 : type==='capture' ? 0.16 : type==='compare' ? 0.14 : type==='map' ? 0.115 : type==='back' ? 0.09 : type==='filter' ? 0.085 : 0.075;
        master.gain.setValueAtTime(0.0001, now);
        master.gain.exponentialRampToValueAtTime(level, now + 0.012);
        master.gain.exponentialRampToValueAtTime(0.0001, now + (type==='reward' ? 0.56 : type==='capture' ? 0.38 : type==='map' ? 0.26 : 0.16));
        master.connect(comp); comp.connect(ctx.destination);

        const tone = (freq, start, dur, wave='sine', gain=1, pan=0) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
          osc.type = wave;
          osc.frequency.setValueAtTime(freq, now + start);
          g.gain.setValueAtTime(0.0001, now + start);
          g.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.7 * gain), now + start + 0.010);
          g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
          osc.connect(g);
          if (p) { p.pan.setValueAtTime(pan, now + start); g.connect(p); p.connect(master); }
          else g.connect(master);
          osc.start(now + start); osc.stop(now + start + dur + .025);
        };
        const clickDust = (start=.0, dur=.035, gain=.018) => {
          const len = Math.floor(ctx.sampleRate * dur);
          const buf = ctx.createBuffer(1, len, ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i=0;i<len;i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/len, 2);
          const src = ctx.createBufferSource();
          const hp = ctx.createBiquadFilter();
          const g = ctx.createGain();
          hp.type='highpass'; hp.frequency.setValueAtTime(2200, now+start);
          g.gain.setValueAtTime(gain, now+start);
          g.gain.exponentialRampToValueAtTime(0.0001, now+start+dur);
          src.buffer=buf; src.connect(hp); hp.connect(g); g.connect(master);
          src.start(now+start); src.stop(now+start+dur+.02);
        };

        if (type === 'capture') {
          clickDust(0,.055,.026); tone(196,0,.10,'triangle',.50,-.1); tone(392,.055,.13,'sine',.36,.12); tone(784,.12,.16,'sine',.18,0);
        } else if (type === 'map') {
          clickDust(0,.04,.018); tone(146.8,0,.09,'triangle',.44,-.1); tone(293.7,.052,.12,'triangle',.24,.1);
        } else if (type === 'reward') {
          clickDust(0,.08,.022); [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,i*.055,.16,'sine',.25,(i-1.5)*.07));
        } else if (type === 'compare') {
          clickDust(0,.045,.018); tone(220,0,.10,'triangle',.28,-.10); tone(440,.045,.13,'sine',.22,.08); tone(660,.105,.12,'sine',.12,0);
        } else if (type === 'back') {
          tone(240,0,.07,'triangle',.34,.08); tone(170,.04,.09,'triangle',.18,-.08);
        } else if (type === 'filter') {
          tone(520,0,.045,'sine',.22,-.06); tone(680,.034,.055,'sine',.13,.08); clickDust(0,.03,.012);
        } else {
          tone(620,0,.046,'sine',.20,-.04); tone(930,.032,.055,'sine',.10,.05);
        }
      };

      if (ctx.state === 'suspended') ctx.resume?.().then(synth).catch(synth);
      else synth();
    } catch {}
  };

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    const handler = (e) => {
      const el = e.target?.closest?.('button,[data-sound],.interactive-hint,.rarity-badge,input,select');
      if (!el) return;
      const text = String(el.textContent || el.getAttribute?.('aria-label') || '').toLowerCase();
      const sound = el.getAttribute?.('data-sound')
        || (text.includes('cattur') || text.includes('fotograf') ? 'capture'
        : text.includes('map') || text.includes('mappa') || text.includes('ricentra') ? 'map'
        : text.includes('compar') || text.includes('vs') ? 'compare'
        : text.includes('badge') || text.includes('award') || text.includes('reward') ? 'reward'
        : text.includes('filtr') || text.includes('ordina') || text.includes('cerca') ? 'filter'
        : text.includes('indietro') || text.includes('‹') || text.includes('×') || text.includes('chiudi') ? 'back'
        : 'tap');
      play(sound);
    };
    document.addEventListener('pointerdown', handler, { passive:true });
    return () => document.removeEventListener('pointerdown', handler);
  }, [enabled]);

  return play;
}

function TrophicTile({ level }) {
  const t = TROPHIC[level] || TROPHIC[3];
  return (
    <div style={{ background:'rgba(0,0,0,.38)', borderRadius:12, padding:'10px 8px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, marginBottom:2 }}>
        {[4,3,2,1].map(l => {
          const isActive = level===l||(level==='F'&&l===2)||(level==='D'&&l===1);
          const w=[40,52,64,76][4-l];
          return <div key={l} style={{ height:5, width:w, borderRadius:2, background:isActive?t.c:'rgba(255,255,255,.1)' }} />;
        })}
      </div>
      <span style={{ color:t.c, fontSize:10, fontWeight:700, letterSpacing:.3 }}>{t.label}</span>
    </div>
  );
}

function DistMap({ hab, accentColor, countriesPresent, bioregionIds=[], animal }) {
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const countryCodes = Array.from(new Set((countriesPresent || []).map(code => String(code).toUpperCase()).filter(Boolean)));
  const isEndemic = countryCodes.length === 1 || !!animal?.categories?.includes?.('EVO_ENDEMIC_SPECIES') || !!animal?.raw?.endemic;
  const hasCountries = countryCodes.length > 0;
  const activeCountry = selectedCountry || countryCodes[0] || null;
  return (
    <div style={{ borderRadius:12, overflow:'hidden', background:'#07131F' }}>
      {hasCountries ? (
        <SpeciesRangeMap
          animal={animal}
          accentColor={accentColor}
          fallbackCountryMap={<CountryPresenceMap countryCodes={countryCodes} selectedCountry={activeCountry} onSelectCountry={setSelectedCountry} accent={accentColor} height={280} title="Mappa paesi di presenza" pointMode={animal?.cls === 'Aves'} />}
        />
      ) : (
        <div style={{ padding:12, borderBottom:'1px solid rgba(255,255,255,.1)' }}>
          <div style={{ color:'rgba(255,255,255,.5)', fontSize:11, fontWeight:700, marginBottom:8, letterSpacing:.3 }}>DISTRIBUZIONE</div>
          <span style={{ color:'rgba(255,255,255,.3)', fontSize:11 }}>Nessun paese di presenza disponibile</span>
        </div>
      )}
      <div style={{ padding:12, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color:'rgba(255,255,255,.5)', fontSize:11, fontWeight:700, marginBottom:8, letterSpacing:.3 }}>
            PAESI DI PRESENZA
          </div>
          <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, WebkitOverflowScrolling:'touch', scrollbarWidth:'none' }}>
            {hasCountries && countryCodes.map(code => (
              <button key={code} onClick={()=>setSelectedCountry(code)} style={{ whiteSpace:'nowrap', background:code===activeCountry?'rgba(36,74,112,.95)':'rgba(36,74,112,.52)', border:'1px solid rgba(91,184,245,.22)', color:'#DCEEFF', fontSize:10.5, fontWeight:850, padding:'7px 10px', borderRadius:10, letterSpacing:.1, flexShrink:0, cursor:'pointer', fontFamily:'inherit' }}>
                {getFlagEmoji(code)} {getCountryDisplayName(code)} {isEndemic && countryCodes.length===1 ? <strong style={{ color:'#90D84A', marginLeft:4 }}>· Endemico</strong> : null}
              </button>
            ))}
            {!hasCountries && hab && hab.slice(0,6).map(h=>{
              const capitalizedH = String(h).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              return <span key={h} style={{ whiteSpace:'nowrap', background:'rgba(255,255,255,.15)', color:'white', fontSize:10.5, fontWeight:700, padding:'7px 10px', borderRadius:8, letterSpacing:.1, flexShrink:0 }}>{capitalizedH}</span>;
            })}
          </div>
        </div>
        <button onClick={()=>setShowLimitsModal(true)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.6)', fontSize:16, cursor:'pointer', padding:0, width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>ℹ️</button>
      </div>
      {showLimitsModal && (
        <div style={{ position:'fixed', inset:0, background:'#000000', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:16 }}>
          <div style={{ background:'#0A0A0C', borderRadius:16, padding:24, maxWidth:400, width:'100%', border:'2px solid rgba(91,184,245,.3)', boxShadow:'0 20px 80px rgba(0,0,0,.95)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <h3 style={{ margin:0, color:'#9DD3FF', fontSize:18, fontWeight:800 }}>Paesi di presenza</h3>
              <button onClick={()=>setShowLimitsModal(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.6)', fontSize:20, cursor:'pointer', padding:0, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
            <div style={{ background:'#050505', padding:16, borderRadius:12, border:'1px solid rgba(91,184,245,.15)' }}>
              <p style={{ margin:'0 0 12px', color:'#9DD3FF', fontWeight:700, fontSize:13 }}>La scheda animale evidenzia solo le nazioni in cui la specie è indicata come presente.</p>
              <p style={{ margin:'0', padding:'12px 14px', background:'#000000', borderLeft:'4px solid #5BB8F5', color:'#FFFFFF', fontSize:12, borderRadius:6, lineHeight:1.6 }}>Per reami, regioni ed ecoregioni usa la sezione Territori.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, accentColor, onClick }) {
  const normalized = normalizeAnimalStatus(status);
  const base = getStatusMeta(normalized);
  const cfg = normalized === 'avvistato'
    ? { ...base, c: accentColor, border:`1.5px solid ${accentColor}`, dot: accentColor }
    : normalized === 'catturato'
    ? { ...base, bg: accentColor, c:'#fff', dot:'#fff' }
    : base;
  return (
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px 12px', borderRadius:12, background:cfg.bg, color:cfg.c, fontSize:12, fontWeight:800, border:cfg.border||'none', cursor:onClick?'pointer':'default', textTransform:'uppercase', letterSpacing:0.5, width:'100%', boxSizing:'border-box', maxWidth:'100%' }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background:cfg.dot || cfg.c, display:'inline-block', boxShadow:normalized==='catturato'?'0 0 8px rgba(255,255,255,.55)':'none' }} />
      {cfg.label}
    </div>
  );
}


const RARITY_GLOW = {
  'Comune':     'rgba(245,222,179,.45)',
  'Non comune': 'rgba(232,232,232,.35)',
  'Raro':       'rgba(255,229,102,.6)',
  'Leggendario':'rgba(234,200,255,.7)',
};

function flattenSearchText(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(flattenSearchText).join(' ');
  if (typeof value === 'object') return Object.values(value).map(flattenSearchText).join(' ');
  return String(value);
}

function getAnimalSearchText(a) {
  const categoryText = (a.categories || []).map(id => `${id} ${CATEGORY_META[id]?.label || ''}`).join(' ');
  return [
    a.com, a.sci,
    a.habitat, a.habitats, a.hab,
    a.biome, a.biomes, a.ecosystem, a.ecosystems,
    categoryText,
    a.rarity, a.cons,
  ].map(flattenSearchText).join(' ').toLowerCase();
}


function getClassGlowColor(cls) {
  if (cls === 'Reptilia') return '#C8FF8C';
  if (cls === 'Insecta') return '#FFD890';
  return (CLS[cls] || CLS.Mammalia).accent;
}
function rarityBorderColor(rarity) {
  const r = String(rarity || 'Comune').toLowerCase();
  if (r === 'comune') return '#9D6845';
  if (r === 'non comune') return '#A1A8B2';
  if (r === 'raro') return '#F0C449';
  if (r === 'leggendario') return '#8F34F5';
  return '#9D6845';
}

function AnimalImg({ a, size=102, fontSize=52, overrideStatus, gridMode=false }) {
  const c = CLS[a.cls] || CLS.Mammalia;
  const [imgErr, setImgErr] = useState(false);
  const [mysteryErr, setMysteryErr] = useState(false);
  const baseStatus = normalizeAnimalStatus(a.status);
  const status = baseStatus === 'misterioso' ? 'misterioso' : normalizeAnimalStatus(overrideStatus !== undefined ? overrideStatus : a.status);
  const mystery = isMysteryStatus(status);

  if (mystery) {
    return (
      <div style={{ width:'100%', height:size, position:'relative', overflow:'hidden', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {!mysteryErr ? (
          <img src={MYSTERY_PLACEHOLDER} alt="misterioso" onError={()=>setMysteryErr(true)}
            style={{ width:'100%', height:'100%', objectFit:'contain', opacity:0.68, transform:`scale(${gridMode ? GRID_MYSTERY_SCALE : 1.15})`, filter:'none' }} />
        ) : (
          <div style={{ width:54, height:54, borderRadius:'50%', background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.14)', color:'rgba(255,255,255,.34)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, fontWeight:900 }}>?</div>
        )}
      </div>
    );
  }

  const localImageUrl = a.image_url || (LOCAL_ANIMALS.find(x => Number(x.id) === Number(a.id) || x.sci === a.sci)?.image_url || '');
  if (localImageUrl && !imgErr) {
    const pad = gridMode ? 0 : Math.round(size * 0.12);
    const imgScale = gridMode ? GRID_IMAGE_SCALE : 1.2;
    const imageBg = 'transparent';
    return (
      <div style={{ width:'100%', height:size, background:imageBg, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', padding:pad, boxSizing:'border-box' }}>
        <img src={localImageUrl} alt={a.sci} onError={()=>setImgErr(true)}
          style={{ width:'100%', height:'100%', objectFit:'contain',
            transform: `scale(${imgScale})`,
            filter:'none',
            WebkitFilter:'none' }} />
      </div>
    );
  }

  return (
    <div style={{ width:'100%', height:size, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize }}>{c.icon}</div>
  );
}




function AnimalCard({ a, onClick, tutorialHighlight=false, tutorialDim=false }) {
  const status = normalizeAnimalStatus(a.status);
  const mystery = isMysteryStatus(status);
  const imageVisible = !mystery;
  // Ricercato, Avvistato e Catturato condividono la resa grafica completa in griglia.
  const found = imageVisible;
  const classMeta = CLS[a.cls] || CLS.Mammalia;
  const isNarrow = typeof window !== 'undefined' && window.innerWidth <= 390;
  const cardH = isNarrow ? 124 : 134;
  const labelH = isNarrow ? 36 : 38;
  const imageH = imageVisible ? cardH : cardH - labelH + 8;
  const photographed = status === 'catturato' || !!a.photo_url || !!a.userAnimal?.photo_url || !!a.userAnimal?.photo_path;
  const displayName = clampWholeWords(a.com, isNarrow ? 25 : 31);
  const rarityColor = rarityBorderColor(a.rarity);
  return (
    <div
      data-tour={tutorialHighlight ? 'grid-first-animal' : undefined}
      onClick={()=>onClick(a)}
      style={{
        height:cardH,
        borderRadius:18,
        overflow:'hidden',
        cursor:'pointer',
        position:'relative',
        userSelect:'none',
        transition:'transform .1s ease, box-shadow .3s ease, opacity .2s ease',
        boxShadow:tutorialHighlight ? '0 0 0 3px #90D84A, 0 0 24px rgba(144,216,74,.34)' : `0 10px 24px rgba(0,0,0,.22), 0 0 0 1px ${hexToRgba(rarityColor,.10)}`,
        outline:tutorialHighlight ? '1px solid rgba(255,255,255,.55)' : 'none',
        zIndex:tutorialHighlight ? 180 : 1,
        opacity:tutorialDim ? .38 : 1,
        background: imageVisible
          ? 'linear-gradient(180deg, #191B20 0%, #14161A 58%, #0F1013 100%)'
          : 'linear-gradient(180deg, rgba(255,255,255,.035), rgba(0,0,0,.30)), #14161A',
        border:`1.5px solid ${rarityColor}B8`
      }}
      onMouseDown={e=>e.currentTarget.style.transform='scale(0.94)'}
      onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
    >
      {imageVisible ? (
        <AnimalImg a={a} size={cardH} fontSize={52} gridMode={true} />
      ) : (
        <div style={{ position:'absolute', left:0, right:0, top:0, height:imageH, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
          <AnimalImg a={a} size={imageH} fontSize={52} gridMode={true} />
        </div>
      )}
      {photographed ? <div style={{ position:'absolute', top:7, left:7, zIndex:3, width:24, height:24, borderRadius:9, background:'rgba(0,0,0,.58)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, backdropFilter:'blur(4px)', boxShadow:'0 2px 10px rgba(0,0,0,.28)' }}>📷</div> : <div style={{ position:'absolute', top:8, left:8, zIndex:3, color:'rgba(245,241,234,.38)', fontSize:8.5, fontWeight:800, letterSpacing:.2 }}>#{String(a.no || a.id || '').padStart(3,'0')}</div>}
      <div
        style={{
          position:'absolute',
          left:0,
          right:0,
          bottom:0,
          minHeight:labelH,
          padding:'7px 7px 7px',
          boxSizing:'border-box',
          background: found
            ? 'linear-gradient(180deg, transparent 0%, rgba(10,12,16,.58) 30%, rgba(10,12,16,.94) 100%)'
            : 'linear-gradient(180deg, transparent 0%, rgba(35,37,42,.68) 34%, rgba(18,20,24,.94) 100%)',
          color:mystery ? 'rgba(245,241,234,.74)' : 'rgba(245,241,234,.92)',
          fontSize:isNarrow ? 9.5 : 10.3,
          fontWeight:700,
          textAlign:'center',
          lineHeight:'12.8px',
          textShadow: found ? '0 1px 1px rgba(0,0,0,.38)' : 'none',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          overflow:'hidden',
        }}
      ><span style={{
          display:'-webkit-box',
          WebkitLineClamp:2,
          WebkitBoxOrient:'vertical',
          overflow:'hidden',
          textOverflow:'clip',
          wordBreak:'normal',
          overflowWrap:'normal',
          textWrap:'balance',
          width:'100%'
        }}>{displayName}</span></div>
    </div>
  );
}


function Sheet({ title, onClose, children, tall }) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:60, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={onClose} style={{ flex:1, background:'rgba(0,0,0,.72)' }}/>
      <div style={{ background:'#2A2A2C', borderRadius:'20px 20px 0 0', display:'flex', flexDirection:'column', maxHeight: tall?'92%':'76%', overflow:'hidden' }}>
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 0', flexShrink:0 }}>
          <div style={{ width:40, height:4, borderRadius:2, background:'#555' }}/>
        </div>
        <p style={{ margin:'10px 0 14px', color:'white', fontSize:17, fontWeight:800, textAlign:'center', flexShrink:0 }}>{title}</p>
        <div style={{ flex:1, overflowY:'auto', minHeight:0 }}>{children}</div>
      </div>
    </div>
  );
}


function prettyFilterLabel(value, title='') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (title === 'Geografia' && /^[A-Z]{2}$/.test(raw)) return getCountryDisplayName(raw);
  if (/^[A-Z]{2}$/.test(raw)) return getCountryDisplayName(raw);
  let cleaned = raw
    .replace(/^T[_-]/i, '')
    .replace(/^BIO[_-]/i, '')
    .replace(/^GAME[_-]/i, '')
    .replace(/^HAB[_-]/i, '')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
  return cleaned || raw;
}

function MultiSheet({ title, options, selected, onApply, onClose, withSearch }) {
  const [local, setLocal] = useState(new Set(selected));
  const [search, setSearch] = useState('');
  const toggle = v => setLocal(s => { const n=new Set(s); n.has(v)?n.delete(v):n.add(v); return n; });
  const allKeys = options.map(o=>o.value);
  const filteredOptions = search.trim() ? options.filter(opt => prettyFilterLabel(opt.label || opt.value, title).toLowerCase().includes(search.toLowerCase())) : options;
  return (
    <Sheet title={title} onClose={onClose}>
      {withSearch && (
        <div style={{ padding:'0 14px 12px', flexShrink:0 }}>
          <input type="text" placeholder={title==='Geografia'?'Cerca nazione o regione...':'Cerca...'} value={search} onChange={e => setSearch(e.target.value)} style={{ width:'100%', height:38, borderRadius:10, background:'#2A2A2C', color:'white', border:'1px solid rgba(255,255,255,.2)', padding:'0 12px', fontSize:14, outline:'none' }} />
        </div>
      )}
      <div style={{ display:'flex', gap:8, padding:'0 14px 12px', flexShrink:0 }}>
        <button onClick={()=>setLocal(new Set(allKeys))} style={{ flex:1, height:34, borderRadius:10, background:'#3A3A3C', color:'rgba(255,255,255,.7)', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>Seleziona tutto</button>
        <button onClick={()=>setLocal(new Set())} style={{ flex:1, height:34, borderRadius:10, background:'#3A3A3C', color:'rgba(255,255,255,.7)', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>Cancella</button>
      </div>
      <div style={{ padding:'0 14px 80px' }}>
        {filteredOptions.length > 0 ? filteredOptions.map(opt => {
          const on = local.has(opt.value);
          const isIsoCountryOption = /^[A-Z]{2}$/.test(String(opt.value || ''));
          const flag = title === 'Geografia' && isIsoCountryOption ? getFlagEmoji(opt.value) : '';
          const isRarity = ['Comune','Non comune','Raro','Leggendario'].includes(opt.value);
          if (isRarity) {
            return (
              <div key={opt.value} onClick={()=>toggle(opt.value)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'8px 6px 8px 18px', marginBottom:8, borderRadius:14, background:on?'rgba(255,255,255,.08)':'rgba(0,0,0,.12)', border:`1.5px solid ${on?'rgba(255,255,255,.28)':'transparent'}`, cursor:'pointer' }}>
                <RarityBadge rarity={opt.value} small style={{ flex:1, minWidth:0 }} />
                <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${on?'rgba(255,255,255,0.65)':'rgba(255,255,255,.25)'}`, background:on?'rgba(255,255,255,0.25)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {on&&<span style={{ fontSize:13, fontWeight:900, lineHeight:1 }}>✓</span>}
                </div>
              </div>
            );
          }
          return (
            <div
              key={opt.value}
              onClick={()=>toggle(opt.value)}
              style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'13px 14px', marginBottom:6, borderRadius:12,
                background: opt.bg||'#333',
                border:`1.5px solid ${on ? (opt.c||'#666') : 'transparent'}`,
                cursor:'pointer'
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
                {flag && <span style={{ fontSize:16 }}>{flag}</span>}
                <span style={{ fontSize:14, fontWeight:700 }}>{title === 'Geografia' && isIsoCountryOption ? getCountryDisplayName(opt.value) : prettyFilterLabel(opt.label || opt.value, title)}</span>
              </div>
              <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${on?(opt.c||'#666'):'rgba(255,255,255,.25)'}`, background:on?(opt.c||'#666'):'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {on&&<span style={{ fontSize:13, fontWeight:900, lineHeight:1 }}>✓</span>}
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign:'center', padding:'20px', color:'rgba(255,255,255,.4)', fontSize:13 }}>Nessuna nazione trovata</div>
        )}
      </div>
      <div style={{ position:'sticky', bottom:0, background:'#2A2A2C', padding:'10px 14px 24px', display:'flex', gap:8, flexShrink:0 }}>
        <button onClick={onClose} style={{ flex:1, height:44, borderRadius:12, background:'#3A3A3C', color:'rgba(255,255,255,.6)', fontSize:14, fontWeight:700, border:'none', cursor:'pointer' }}>Annulla</button>
        <button onClick={()=>{onApply([...local]);onClose();}} style={{ flex:2, height:44, borderRadius:12, background:'#E8C040', color:'#1A1000', fontSize:14, fontWeight:800, border:'none', cursor:'pointer' }}>Applica</button>
      </div>
    </Sheet>
  );
}


function SortSheet({ title, options, selected, onApply, onClose }) {
  const [local, setLocal] = useState(selected || 'no');
  return (
    <Sheet title={title} onClose={onClose}>
      <div style={{ padding:'0 14px 86px' }}>
        {options.map(opt => {
          const on = local === opt.value;
          return (
            <button key={opt.value} onClick={()=>setLocal(opt.value)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px', marginBottom:8, borderRadius:14, border:`1.5px solid ${on ? (opt.c||'#fff') : 'transparent'}`, background:opt.bg||'#333', color:'white', cursor:'pointer', fontFamily:'inherit' }}>
              <span style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, fontWeight:800 }}><span style={{ color:opt.c||'#fff' }}>↕</span>{opt.label}</span>
              <span style={{ width:22, height:22, borderRadius:6, border:`2px solid ${on?(opt.c||'#fff'):'rgba(255,255,255,.25)'}`, background:on?(opt.c||'#fff'):'transparent', color:'#111', fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center' }}>{on?'✓':''}</span>
            </button>
          );
        })}
      </div>
      <div style={{ position:'sticky', bottom:0, background:'#2A2A2C', padding:'10px 14px 24px', display:'flex', gap:8, flexShrink:0 }}>
        <button onClick={onClose} style={{ flex:1, height:44, borderRadius:12, background:'#3A3A3C', color:'rgba(255,255,255,.6)', fontSize:14, fontWeight:700, border:'none', cursor:'pointer' }}>Annulla</button>
        <button onClick={()=>{onApply(local);onClose();}} style={{ flex:2, height:44, borderRadius:12, background:'#E8C040', color:'#1A1000', fontSize:14, fontWeight:800, border:'none', cursor:'pointer' }}>Applica</button>
      </div>
    </Sheet>
  );
}

const TAX_LEVEL_LABELS = { kin:'Regno', phy:'Phylum', cls:'Classe', ord:'Ordine', fam:'Famiglia', gen:'Genere' };

function TaxSheet({ onApply, onClose, current }) {
  const tree = useMemo(()=>buildTree(ANIMALS),[]);
  const [path, setPath] = useState([]);
  const [selected, setSelected] = useState(current);
  const currentNode = path.length===0 ? tree : path[path.length-1].node._children;
  const entries = Object.entries(currentNode).sort((a,b)=>b[1]._count-a[1]._count);
  const breadcrumb = ['Tutti', ...path.map(p=>p.name)];
  const goTo = (name, node) => setPath(prev=>[...prev, { name, node }]);
  const goBack = (idx) => setPath(prev=>prev.slice(0,idx));
  const selectThis = (name, node) => { const key = node._key; setSelected({ key, value: name, label: `${TAX_LEVEL_LABELS[key]}: ${name}` }); };
  return (
    <Sheet title="Albero Tassonomico" onClose={onClose} tall>
      <div style={{ display:'flex', flexWrap:'wrap', gap:4, padding:'0 14px 10px', alignItems:'center', flexShrink:0 }}>
        {breadcrumb.map((b,i)=>(
          <span key={i} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span onClick={()=>goBack(i)} style={{ color: i===breadcrumb.length-1?'white':'#E8C040', fontSize:12, fontWeight:700, cursor: i<breadcrumb.length-1?'pointer':'default', padding:'3px 8px', borderRadius:8, background: i===breadcrumb.length-1?'rgba(255,255,255,.1)':'transparent' }}>{b}</span>
            {i<breadcrumb.length-1&&<span style={{ color:'rgba(255,255,255,.25)', fontSize:11 }}>›</span>}
          </span>
        ))}
      </div>
      {selected && (
        <div style={{ margin:'0 14px 10px', padding:'10px 14px', borderRadius:10, background:'rgba(232,192,64,.15)', border:'1px solid rgba(232,192,64,.4)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color:'#E8C040', fontSize:13, fontWeight:700 }}>{selected.label}</span>
          <span onClick={()=>setSelected(null)} style={{ color:'rgba(255,255,255,.4)', fontSize:18, cursor:'pointer', padding:'0 4px' }}>×</span>
        </div>
      )}
      <div style={{ padding:'0 14px 90px' }}>
        {entries.map(([name, node])=>{
          const isSel = selected?.value===name && selected?.key===node._key;
          return (
            <div key={name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <div onClick={()=>selectThis(name,node)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:12, background:isSel?'rgba(232,192,64,.2)':'#222224', border:`1.5px solid ${isSel?'#E8C040':'transparent'}`, cursor:'pointer' }}>
                <div>
                  <div style={{ color:isSel?'#E8C040':'white', fontSize:14, fontWeight:700 }}>{name}</div>
                  <div style={{ color:'rgba(255,255,255,.4)', fontSize:11, marginTop:2 }}>{node._label} · {node._count} specie</div>
                </div>
                {isSel&&<span style={{ color:'#E8C040', fontSize:16 }}>✓</span>}
              </div>
              {Object.keys(node._children).length>0 && (
                <div onClick={()=>goTo(name,node)} style={{ width:40, height:40, borderRadius:10, background:'#333', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                  <span style={{ color:'rgba(255,255,255,.5)', fontSize:16 }}>›</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position:'sticky', bottom:0, background:'#2A2A2C', padding:'10px 14px 28px', display:'flex', gap:8 }}>
        <button onClick={onClose} style={{ flex:1, height:44, borderRadius:12, background:'#3A3A3C', color:'rgba(255,255,255,.6)', fontSize:14, fontWeight:700, border:'none', cursor:'pointer' }}>Annulla</button>
        <button onClick={()=>{onApply(selected);onClose();}} style={{ flex:2, height:44, borderRadius:12, background:'#E8C040', color:'#1A1000', fontSize:14, fontWeight:800, border:'none', cursor:'pointer' }}>Applica filtro</button>
      </div>
    </Sheet>
  );
}

function ClassSheet({ sel, onSel, onClose }) {
  return (
    <Sheet title="Seleziona la Classe" onClose={onClose}>
      <div style={{ padding:'0 14px 40px' }}>
        <button onClick={()=>onSel(null)} style={{ width:'100%', marginBottom:10, padding:'12px 0', borderRadius:12, background:sel===null?'#5A5A5C':'#3A3A3C', color:'white', fontSize:14, fontWeight:700, border:sel===null?'2px solid white':'2px solid transparent', cursor:'pointer' }}>Qualsiasi</button>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {Object.entries(CLS).map(([k,v])=>(
            <button key={k} onClick={()=>onSel(k)} style={{ padding:'10px 4px', borderRadius:12, background:sel===k?v.mid:'#222224', color:sel===k?v.accent:'rgba(255,255,255,.6)', fontSize:11, fontWeight:700, border:sel===k?`2px solid ${v.accent}`:'2px solid #333', cursor:'pointer', lineHeight:1.4 }}>
              <div style={{ fontSize:22, marginBottom:3 }}>{v.icon}</div>{v.label}
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}

// ── Rarity Legend helper ──────────────────────────────────────────────
function RarityLegendRows() {
  return (
    <>
      {[
        {k:'Comune',     desc:'Specie comune e facile da avvistare'},
        {k:'Non comune', desc:'Specie poco frequente'},
        {k:'Raro',       desc:'Specie molto rara, difficile da trovare'},
        {k:'Leggendario',desc:'Specie estremamente rara e leggendaria'},
      ].map(({k,desc})=>(
        <div key={k} style={{ display:'flex', gap:12, alignItems:'center' }}>
          <RarityBadge rarity={k} small style={{ width:132, flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <div style={{ color:'rgba(255,255,255,.75)', fontSize:11, marginTop:2 }}>{desc}</div>
          </div>
        </div>
      ))}
    </>
  );
}

function StatusLegendRows() {
  return (
    <>
      {ANIMAL_STATUS_ORDER.map(k=>{
        const so = ANIMAL_STATUS[k];
        return (
          <div key={k} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
            <div style={{ background:so.bg, color:so.c, border:so.border, padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:800, whiteSpace:'nowrap', flexShrink:0, textTransform:'uppercase' }}>{so.label}</div>
            <div style={{ flex:1 }}><div style={{ color:'rgba(255,255,255,.75)', fontSize:11, marginTop:2 }}>{so.desc}</div></div>
          </div>
        );
      })}
    </>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────

function Grid({ onSelect, statusMap = {}, visitedCountries = [], onHome, preset, onBackToOrigin, tutorialActive=false, tutorialStep=null, tutorialAnimalId=null, onTutorialAnimalSelect, onOpenRegions, theme='dark' }) {
  const [search, setSearch]   = useState('');
  const [clsF, setClsF]       = useState(null);
  const [sheet, setSheet]     = useState(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showInfoModalGrid, setShowInfoModalGrid] = useState(false);
  const [fRarity, setFRarity]     = useState([]);
  const [fCons,   setFCons]       = useState([]);
  const [fStatus, setFStatus]     = useState(['ricercato']);
  const [fTrophic,setFTrophic]    = useState([]);
  const [fGeography, setFGeography] = useState([]);
  const [fCategory, setFCategory] = useState([]);
  const [fConfidence, setFConfidence] = useState([]);
  const [fMapProfile, setFMapProfile] = useState([]);
  const [fBioRegion, setFBioRegion] = useState([]);
  const [fGameRegion, setFGameRegion] = useState([]);
  const [fHabitat, setFHabitat] = useState([]);
  const [sortBy, setSortBy] = useState('no');
  const [fTax,    setFTax]        = useState(null);
  const TAX_KEY_MAP = { kin:'kin', phy:'phy', cls:'cls', ord:'ord', fam:'fam', gen:'gen' };
  const isNarrow = typeof window !== 'undefined' && window.innerWidth <= 390;
  const isLightTheme = theme === 'light';

  useEffect(() => {
    if (!preset?.id) return;
    setSearch(preset.search || '');
    setClsF(preset.type === 'class' ? preset.cls : null);
    setFRarity(preset.rarity || []);
    setFCons(preset.cons || []);
    setFStatus(preset.type === 'status' ? (preset.statuses || ['ricercato']) : (preset.statuses || ['ricercato']));
    setFTrophic(preset.trophic || []);
    setFGeography(preset.type === 'region' ? [preset.regionValue] : (preset.geography || []));
    setFCategory(preset.categories || []);
    setFConfidence(preset.confidence || []);
    setFMapProfile(preset.map_profile || []);
    setFBioRegion(preset.bio_regions || []);
    setFGameRegion(preset.game_regions || []);
    setFHabitat(preset.habitats || []);
    setFTax(preset.tax || null);
    setSortBy(preset.sortBy || 'no');
  }, [preset?.id]);

  const hasExplicitPreset = !!preset?.id;
  const list = ANIMALS
    .map(a => ({ ...a, status: getResolvedAnimalStatus(a, statusMap, visitedCountries) }))
    .filter(a => {
      const q = search.toLowerCase().trim();
      const status = normalizeAnimalStatus(a.status);
      const wantsMystery = fStatus.includes('misterioso');
      if (!hasExplicitPreset && !wantsMystery && !['ricercato','avvistato','catturato'].includes(status)) return false;
      if (q && !getAnimalSearchText(a).includes(q)) return false;
      if (clsF && a.cls !== clsF) return false;
      if (fRarity.length   && !fRarity.includes(a.rarity)) return false;
      if (fCons.length     && !fCons.includes(a.cons)) return false;
      if (fStatus.length   && !fStatus.includes(status)) return false;
      if (fTrophic.length  && !fTrophic.includes(String(a.trophic))) return false;
      if (fGeography.length && !matchGeographySelection(a, fGeography)) return false;
      if (fCategory.length && !(a.categories || []).some(cat => fCategory.includes(cat))) return false;
      if (fConfidence.length && !fConfidence.includes(a.confidence || a.geo?.confidence)) return false;
      if (fMapProfile.length && !fMapProfile.includes(a.map_profile || a.geo?.map_profile)) return false;
      if (fBioRegion.length && !toArraySafe(a.bio_regions || a.geo?.bio_regions).some(v => fBioRegion.includes(v))) return false;
      if (fGameRegion.length && !toArraySafe(a.game_regions || a.geo?.game_regions).some(v => fGameRegion.includes(v))) return false;
      if (fHabitat.length && !toArraySafe(a.habitats || a.habitat || a.geo?.habitats).some(v => fHabitat.includes(v))) return false;
      if (fTax && a[TAX_KEY_MAP[fTax.key]] !== fTax.value) return false;
      if (typeof preset?.customFilter === 'function' && !preset.customFilter(a)) return false;
      return true;
    })
    .sort((a,b) => {
      if (typeof preset?.customSort === 'function') return preset.customSort(a, b);
      const noA = Number(a.no || a.id || 0), noB = Number(b.no || b.id || 0);
      if (sortBy === 'name_asc') return String(a.com).localeCompare(String(b.com), 'it');
      if (sortBy === 'name_desc') return String(b.com).localeCompare(String(a.com), 'it');
      if (sortBy === 'rarity') return (RARITY[b.rarity]?.s || 0) - (RARITY[a.rarity]?.s || 0) || noA - noB;
      if (sortBy === 'status') return ANIMAL_STATUS_ORDER.indexOf(a.status) - ANIMAL_STATUS_ORDER.indexOf(b.status) || noA - noB;
      if (sortBy === 'class') return String(a.cls).localeCompare(String(b.cls), 'it') || noA - noB;
      return noA - noB;
    });

  const anyExtra = fRarity.length||fCons.length||fStatus.length||fTrophic.length||fGeography.length||fCategory.length||fConfidence.length||fMapProfile.length||fBioRegion.length||fGameRegion.length||fHabitat.length||fTax||sortBy!=='no';
  const handleCardClick = (animal) => {
    if (tutorialActive && tutorialAnimalId && animal.id !== tutorialAnimalId) return;
    onSelect?.(animal);
    if (tutorialActive && animal.id === tutorialAnimalId) onTutorialAnimalSelect?.(animal);
  };
  const rarityOpts = Object.entries(RARITY).map(([k,v])=>({ value:k, label:k, c:v.c, bg:v.bg }));
  const consOpts   = Object.entries(CONS).map(([k,v])=>({ value:k, label:`${k} · ${v.full}`, c:v.c, bg:v.bg }));
  const statusOpts = ANIMAL_STATUS_ORDER.map(k => ({ value:k, label:ANIMAL_STATUS[k].label, c:ANIMAL_STATUS[k].c, bg:ANIMAL_STATUS[k].bg }));
  const trophicOpts = Object.entries(TROPHIC).map(([k,v])=>({ value:String(k), label:v.label, c:v.c, bg:v.bg }));
  const geographyOpts = [...GEO_FILTER_OPTIONS, ...getAllScratchCountries().map(code=>({ value:code, label:getCountryDisplayName(code), c:'#20B2AA', bg:'rgba(32,178,170,.15)' }))];
  const categoryOpts = Object.entries(CATEGORY_META).map(([id,meta])=>({ value:id, label:meta.label, c:meta.color, bg:`${meta.color}22` }));
  const uniqueOpt = (values, color='#7AC7FF') => Array.from(new Set(values.flatMap(v => toArraySafe(v)).filter(Boolean))).sort().map(v=>({ value:v, label:prettyFilterLabel(v), c:color, bg:`${color}22` }));
  const confidenceOpts = ['high','medium','low'].map(v=>({ value:v, label:`confidence ${v}`, c:v==='high'?'#90D84A':v==='medium'?'#F0C449':'#F06060', bg:'rgba(255,255,255,.10)' }));
  const mapProfileOpts = uniqueOpt(ANIMALS.map(a=>a.map_profile || a.geo?.map_profile), '#5BBEF8');
  const bioRegionOpts = uniqueOpt(ANIMALS.map(a=>a.bio_regions || a.geo?.bio_regions), '#6CE5C7');
  const gameRegionOpts = uniqueOpt(ANIMALS.map(a=>a.game_regions || a.geo?.game_regions), '#B860F8');
  const habitatOpts = uniqueOpt(ANIMALS.map(a=>a.habitats || a.habitat || a.geo?.habitats), '#F0A840');
  const sortOpts = [
    { value:'no', label:'Numero ID', c:'#90D84A', bg:'rgba(144,216,74,.16)' },
    { value:'name_asc', label:'Nome A → Z', c:'#5BBEF8', bg:'rgba(91,190,248,.16)' },
    { value:'name_desc', label:'Nome Z → A', c:'#5BBEF8', bg:'rgba(91,190,248,.16)' },
    { value:'rarity', label:'Rarità più alta', c:'#F0C449', bg:'rgba(240,196,73,.16)' },
    { value:'status', label:'Status', c:'#FFFFFF', bg:'rgba(255,255,255,.12)' },
    { value:'class', label:'Classe', c:'#90D84A', bg:'rgba(144,216,74,.16)' },
  ];
  const buttonSize = isNarrow ? 40 : 46;

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:isLightTheme?LIGHT_APP_BG:'radial-gradient(circle at 50% -12%, rgba(240,168,64,.20), transparent 32%), radial-gradient(circle at 12% 44%, rgba(184,77,58,.12), transparent 36%), linear-gradient(180deg,#15110E,#101216 42%,#0B0D10)', position:'relative', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:isNarrow?'6px 10px 6px':'8px 12px 8px', borderBottom:isLightTheme?'1px solid rgba(0,0,0,.14)':'1px solid #2A2A2C', background:isLightTheme?LIGHT_APP_BG:'transparent', flexShrink:0 }}>
        {onBackToOrigin ? (
          <button onClick={onBackToOrigin} aria-label="Torna alla scheda" style={{ width:buttonSize, height:buttonSize, borderRadius:10, background:'transparent', border:'none', color:isLightTheme?'#171717':'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 5L8 12l7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        ) : (
          <button onClick={onHome} aria-label="Home" style={{ width:buttonSize, height:buttonSize, borderRadius:10, background:'transparent', border:'none', color:isLightTheme?'#171717':'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 10.5L12 3.25l8.5 7.25" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 9.75V20h11V9.75" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.5 20v-6h5v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
        <span style={{ color:isLightTheme?'#171717':'white', fontSize:isNarrow?17:18, fontWeight:900, flex:1, textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{preset?.title || 'Animaldex'}</span>
        <button onClick={()=>setShowInfoModalGrid(!showInfoModalGrid)} style={{ background:'none', border:'none', color:isLightTheme?'rgba(0,0,0,.68)':'rgba(255,255,255,.8)', fontSize:22, cursor:'pointer', padding:0, width:buttonSize, height:buttonSize, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:10, flexShrink:0 }}>ⓘ</button>
      </div>

      {/* Filtri applicati nascosti: l'area libera viene usata dai filtri rapidi. */}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, padding:isNarrow?'10px 10px 8px':'12px 12px 10px', flexShrink:0 }}>
        {[
          ['misterioso','Misteriosi'],
          ['ricercato','Ricercati'],
          ['avvistato','Avvistati'],
          ['catturato','Catturati']
        ].map(([key,label]) => {
          const active = fStatus.length === 1 && fStatus.includes(key) && !fRarity.length;
          const tutorialStatusHighlight = tutorialStep === 'grid-status';
          const activeColor = key === 'ricercato' ? DEX.status.ricercato : key === 'avvistato' ? DEX.status.avvistato : key === 'catturato' ? DEX.status.catturato : (isLightTheme ? '#8F8F8F' : 'rgba(255,255,255,.28)');
          const inactiveColor = isLightTheme ? 'rgba(0,0,0,.50)' : 'rgba(245,241,234,.88)';
          const activeText = isLightTheme ? '#171717' : '#F5F1EA';
          return <button key={key} onClick={()=>{ setFRarity([]); setFStatus([key]); }} style={{ minWidth:0, height:isNarrow?50:54, padding:'0 8px', borderRadius:16, border:`1px solid ${tutorialStatusHighlight ? '#F0A840' : (active ? activeColor : (isLightTheme?'rgba(0,0,0,.14)':'rgba(255,255,255,.10)'))}`, background:active?`linear-gradient(180deg, ${hexToRgba(activeColor, key==='misterioso' ? .16 : .20)}, ${isLightTheme?'rgba(255,255,255,.92)':'rgba(255,255,255,.035)'})`:(isLightTheme?LIGHT_APP_BG:'rgba(255,255,255,.055)'), color:active ? activeText : inactiveColor, boxShadow:tutorialStatusHighlight ? '0 0 0 3px rgba(240,168,64,.28), 0 0 24px rgba(240,168,64,.28)' : (active ? `0 10px 22px ${hexToRgba(activeColor, .12)}` : (isLightTheme?'0 6px 16px rgba(0,0,0,.05)':'none')), fontSize:isNarrow?11.5:12.5, fontWeight:950, fontFamily:'inherit' }}>{label}</button>
        })}
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:isNarrow?'10px 10px 0':'12px 12px 0' }}>
        {list.length===0 ? (() => {
          const statusOnly = new Set(fStatus);
          const isMysteryTab = statusOnly.size === 1 && statusOnly.has('misterioso');
          const isSeenTab = statusOnly.size === 1 && statusOnly.has('avvistato');
          const isCapturedTab = statusOnly.size === 1 && statusOnly.has('catturato');
          const title = isMysteryTab ? 'Nessun animale misterioso' : isSeenTab ? 'Nessun animale avvistato' : isCapturedTab ? 'Nessun animale catturato' : 'Nessun animale ricercato';
          const body = isMysteryTab
            ? 'Qui compaiono solo gli animali ancora bloccati e non rivelati.'
            : isSeenTab
              ? 'Qui compaiono gli animali che hai dichiarato come visti dal vivo.'
              : isCapturedTab
                ? 'Qui compaiono solo gli animali fotografati e registrati nel tuo Animaldex.'
                : 'Aggiungi un paese visitato per vedere i primi animali ricercati.';
          return <div style={{ color:isLightTheme?'rgba(0,0,0,.58)':'rgba(255,255,255,.56)', textAlign:'center', padding:34, fontSize:14 }}><div style={{ fontWeight:950, color:isLightTheme?'#171717':'white', marginBottom:8 }}>{title}</div><div>{body}</div>{!isSeenTab && !isCapturedTab && !isMysteryTab && <button onClick={()=>onOpenRegions?.()} style={{ marginTop:16, height:44, padding:'0 16px', borderRadius:14, border:'none', background:'linear-gradient(180deg,rgba(184,77,58,.96),rgba(142,58,46,.98))', color:'white', fontWeight:950 }}>Aggiungi paese</button>}</div>;
        })() : <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:isNarrow?8:10 }}>{list.map(a=><AnimalCard key={a.id} a={a} onClick={handleCardClick} tutorialHighlight={tutorialActive && a.id === tutorialAnimalId} tutorialDim={tutorialActive && tutorialAnimalId && a.id !== tutorialAnimalId}/>)}</div>}
        <div style={{ height:6 }}/>
      </div>

      <div style={{ background:'#A84637', borderTop:'1px solid #7A3228', padding:isNarrow?'6px 10px 6px':'7px 12px 6px', flexShrink:0, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
          <button data-tour="grid-search" onClick={()=>setShowSearchBar(!showSearchBar)} aria-label="Cerca" style={{ width:buttonSize, height:buttonSize, borderRadius:14, background:'rgba(0,0,0,.10)', border:'1px solid rgba(255,255,255,.08)', color:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:tutorialStep==='grid-tools'?'0 0 0 3px rgba(240,168,64,.30), 0 0 24px rgba(240,168,64,.28)':'none' }}>
            <svg width="21" height="21" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.7" fill="none"/><path d="M13 13L18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
          </button>
          <div style={{ flex:1, textAlign:'center', color:'rgba(255,255,255,.72)', fontSize:11, fontWeight:800, letterSpacing:'.1px' }}>{`${list.length} ${(fStatus[0] && ANIMAL_STATUS[fStatus[0]]?.label.toLowerCase()) || 'ricercati'}`}</div>
          <div style={{ display:'flex', alignItems:'center', gap:isNarrow?8:10, flexShrink:0 }}>
            <button onClick={()=>{setSheet('sort');setShowMenu(false);}} aria-label="Ordina" style={{ width:buttonSize, height:buttonSize, borderRadius:14, background:'rgba(0,0,0,.10)', border:'1px solid rgba(255,255,255,.08)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white', flexShrink:0, boxShadow:tutorialStep==='grid-tools'?'0 0 0 3px rgba(240,168,64,.30), 0 0 24px rgba(240,168,64,.28)':'none' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5v14M8 19l-3-3M8 19l3-3M16 19V5M16 5l-3 3M16 5l3 3" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button data-tour="grid-filters" onClick={()=>setShowMenu(v=>!v)} aria-label="Filtra" style={{ width:buttonSize, height:buttonSize, borderRadius:14, background:'rgba(0,0,0,.10)', border:'1px solid rgba(255,255,255,.08)', color:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:tutorialStep==='grid-tools'?'0 0 0 3px rgba(240,168,64,.30), 0 0 24px rgba(240,168,64,.28)':'none' }}>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M7 12h13M10 17h10" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      </div>

      {showMenu && (
        <div style={{ position:'absolute', top:isNarrow?94:100, right:12, width:280, background:'#252527', border:'1px solid #333', borderRadius:14, boxShadow:'0 12px 32px rgba(0,0,0,.5)', zIndex:40, overflow:'hidden' }}>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {[
              { label:'Tassonomia', icon:'⌬', onClick:()=>{setSheet('tax');setShowMenu(false);}, active:!!fTax, color:'#E8C040' },
              { label:'Rarità', icon:'★', onClick:()=>{setSheet('rarity');setShowMenu(false);}, active:fRarity.length>0, color:'#C9A961' },
              { label:'Conservazione', icon:'🛡', onClick:()=>{setSheet('cons');setShowMenu(false);}, active:fCons.length>0, color:'#DC143C' },
              { label:'Gerarchia', icon:'⛓', onClick:()=>{setSheet('trophic');setShowMenu(false);}, active:fTrophic.length>0, color:'#F5A828' },
              { label:'Status', icon:'📷', onClick:()=>{setSheet('status');setShowMenu(false);}, active:fStatus.length>0, color:'#00BFFF' },
              { label:'Categorie', icon:'◉', onClick:()=>{setSheet('category');setShowMenu(false);}, active:fCategory.length>0, color:'#B860F8' },
              { label:'Geografia', icon:'🌍', onClick:()=>{setSheet('geography');setShowMenu(false);}, active:fGeography.length>0, color:'#20B2AA' },
            ].map((item,i)=>(
              <button key={i} onClick={item.onClick} style={{ width:'100%', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,.05)', background:'transparent', border:'none', display:'flex', alignItems:'center', gap:12, cursor:'pointer', color:item.active?item.color:'white', fontWeight:item.active?700:600 }}>
                <span style={{ fontSize:18 }}>{item.icon}</span>
                <span style={{ fontSize:14 }}>{item.label}</span>
                {item.active && <span style={{ marginLeft:'auto', color:item.color, fontSize:12 }}>✓</span>}
              </button>
            ))}
            <button onClick={()=>{setSearch('');setClsF(null);setFRarity([]);setFCons([]);setFStatus(['ricercato']);setFTrophic([]);setFGeography([]);setFCategory([]);setFConfidence([]);setFMapProfile([]);setFBioRegion([]);setFGameRegion([]);setFHabitat([]);setFTax(null);setSortBy('no');setShowMenu(false);}} style={{ width:'100%', padding:'14px 16px', background:'rgba(255,0,0,.1)', border:'none', color:'#FF6B6B', cursor:'pointer', fontWeight:700, fontSize:14 }}>Resetta filtri</button>
          </div>
        </div>
      )}

      {showSearchBar && (
        <div style={{ position:'absolute', top:isNarrow?52:58, left:12, right:12, background:'#252527', borderRadius:12, border:'1px solid #333', padding:10, zIndex:50, display:'flex', gap:8, boxShadow:'0 8px 24px rgba(0,0,0,.4)' }}>
          <button onClick={()=>{setSearch('');setShowSearchBar(false);}} style={{ width:40, height:40, borderRadius:8, background:'#3A3A3C', border:'none', color:'rgba(255,255,255,.6)', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>×</button>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca nome, scientifico, habitat o categoria..." style={{ flex:1, height:40, borderRadius:8, background:'#333', border:'1px solid #444', color:'white', fontSize:14, padding:'0 12px', outline:'none', fontFamily:'inherit' }} autoFocus/>
        </div>
      )}

      {showInfoModalGrid && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
          <div style={{ background:'#1A1A1C', borderRadius:20, padding:28, maxHeight:'90vh', overflowY:'auto', maxWidth:520, width:'100%', border:'2px solid #A84637' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}><h2 style={{ margin:0, color:'#A84637', fontSize:22, fontWeight:900 }}>📚 Legenda Completa</h2><button onClick={()=>setShowInfoModalGrid(false)} style={{ background:'none', border:'none', color:'#A84637', fontSize:24, cursor:'pointer', padding:0 }}>×</button></div>
            <div style={{ marginBottom:24 }}><h3 style={{ margin:'0 0 12px', color:'#A84637', fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>🛡 Stato Conservazione (IUCN)</h3><div style={{ display:'flex', flexDirection:'column', gap:8 }}>{[{k:'LC',full:'Least Concern',desc:'Specie non in pericolo'},{k:'NT',full:'Near Threatened',desc:'Prossima a essere minacciata'},{k:'VU',full:'Vulnerable',desc:'A rischio di estinzione'},{k:'EN',full:'Endangered',desc:'Fortemente minacciata'},{k:'CR',full:'Critically Endangered',desc:'Gravissimamente minacciata'},{k:'EW',full:'Extinct in the Wild',desc:'Estinta in natura'},{k:'EX',full:'Extinct',desc:'Completamente estinta'},{k:'DD',full:'Data Deficient',desc:'Dati insufficienti'}].map(({k,full,desc})=>{const co=CONS[k]||CONS.DD;return <div key={k} style={{display:'flex',gap:10,alignItems:'flex-start'}}><div style={{background:co.bg,color:co.c,padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>{k}</div><div style={{flex:1}}><div style={{color:'white',fontSize:12,fontWeight:700}}>{full}</div><div style={{color:'rgba(255,255,255,.55)',fontSize:11,marginTop:2}}>{desc}</div></div></div>;})}</div></div>
            <div style={{ marginBottom:24 }}><h3 style={{ margin:'0 0 12px', color:'#A84637', fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>★ Rarità Animale</h3><div style={{ display:'flex', flexDirection:'column', gap:8 }}><RarityLegendRows /></div></div>
            <div style={{ marginBottom:24 }}><h3 style={{ margin:'0 0 12px', color:'#A84637', fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>📷 Status Animale</h3><div style={{ display:'flex', flexDirection:'column', gap:8 }}><StatusLegendRows /></div></div>
          </div>
        </div>
      )}

      {sheet==='rarity'  && <MultiSheet title="Rarità" options={rarityOpts} selected={fRarity} onApply={setFRarity} onClose={()=>setSheet(null)}/>}
      {sheet==='cons'    && <MultiSheet title="Stato di Conservazione" options={consOpts} selected={fCons} onApply={setFCons} onClose={()=>setSheet(null)}/>}
      {sheet==='status'  && <MultiSheet title="Status Animale" options={statusOpts} selected={fStatus} onApply={setFStatus} onClose={()=>setSheet(null)}/>}
      {sheet==='trophic' && <MultiSheet title="Catena Alimentare" options={trophicOpts} selected={fTrophic} onApply={setFTrophic} onClose={()=>setSheet(null)}/>}
      {sheet==='geography' && <MultiSheet title="Geografia" options={geographyOpts} selected={fGeography} onApply={setFGeography} onClose={()=>setSheet(null)} withSearch/>}
      {sheet==='category' && <MultiSheet title="Categorie" options={categoryOpts} selected={fCategory} onApply={setFCategory} onClose={()=>setSheet(null)} withSearch/>}
      {sheet==='sort' && <SortSheet title="Ordina" options={sortOpts} selected={sortBy} onApply={setSortBy} onClose={()=>setSheet(null)}/>}
      {sheet==='tax' && <TaxSheet current={fTax} onApply={v=>{setFTax(v);}} onClose={()=>setSheet(null)}/>}
    </div>
  );
}



function getImageSrcCandidates(src) {
  const raw = String(src || '').trim();
  if (!raw) return [];
  const out = [];
  const add = (v) => { if (v && !out.includes(v)) out.push(v); };
  add(raw);
  try {
    const file = raw.split('?')[0].split('#')[0].split('/').pop();
    if (file && !/^https?:\/\//i.test(raw)) {
      add(`/${raw.replace(/^\/+/, '')}`);
      add(`/animals/${file}`);
      add(`/animal-images/${file}`);
      add(`/images/${file}`);
      add(`/img/${file}`);
      add(`/assets/${file}`);
    }
  } catch {}
  return out;
}

// ── Image Lightbox ────────────────────────────────────────────────────
function ImageLightbox({ src, alt, accentColor, bgColor, originRect, onClose, animal }) {
  const [visible, setVisible] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [lastTap, setLastTap] = useState(0);
  const candidates = getImageSrcCandidates(src);
  const [srcIdx, setSrcIdx] = useState(0);
  const currentSrc = candidates[srcIdx] || src;
  const [hardFail, setHardFail] = useState(false);
  const pinchRef = useRef({ active:false, startDist:0, startZoom:1 });

  useEffect(() => { requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }, []);
  const handleClose = () => { setVisible(false); setTimeout(onClose, 350); };

  const vw = typeof window !== 'undefined' ? window.innerWidth : 390;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  const startLeft   = originRect ? originRect.left : vw * 0.1;
  const startTop    = originRect ? originRect.top  : vh * 0.1;
  const startW      = originRect ? originRect.width  : vw * 0.4;
  const startH      = originRect ? originRect.height : vh * 0.3;

  const distance = (touches) => {
    if (!touches || touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches?.length === 2) {
      e.preventDefault();
      pinchRef.current = { active:true, startDist:distance(e.touches), startZoom:zoom };
    }
  };
  const handleTouchMove = (e) => {
    if (pinchRef.current.active && e.touches?.length === 2) {
      e.preventDefault();
      const d = distance(e.touches);
      if (pinchRef.current.startDist > 0) {
        const next = Math.max(1, Math.min(4, pinchRef.current.startZoom * (d / pinchRef.current.startDist)));
        setZoom(next);
      }
    }
  };
  const handleTouchEnd = () => {
    pinchRef.current.active = false;
  };
  const handleDoubleTap = (e) => {
    const now = Date.now();
    if (now - lastTap < 280) {
      e.preventDefault?.();
      setZoom(z => z > 1 ? 1 : 2.25);
    }
    setLastTap(now);
  };

  const neutralZoomBg = 'radial-gradient(circle at 50% 44%, rgba(255,255,255,.055), rgba(18,18,20,.98) 58%, #08080A 100%)';
  const boxStyle = visible ? {
    position:'fixed', left:0, top:0, width:'100vw', height:'var(--animaldex-app-height, 100dvh)',
    background: neutralZoomBg,
    transition:'all .38s cubic-bezier(.4,0,.2,1)',
    display:'flex', alignItems:'center', justifyContent:'center',
    zIndex:300, cursor:'default', overflow:'hidden',
    touchAction:'none',
  } : {
    position:'fixed',
    left: startLeft, top: startTop,
    width: startW, height: startH,
    borderRadius: 16,
    background: neutralZoomBg,
    transition:'all .38s cubic-bezier(.4,0,.2,1)',
    display:'flex', alignItems:'center', justifyContent:'center',
    zIndex:300, cursor:'default', overflow:'hidden',
    touchAction:'none',
  };

  return (
    <>
      <div onClick={handleClose} style={{
        position:'fixed', inset:0, zIndex:299,
        background: visible ? 'rgba(0,0,0,.7)' : 'rgba(0,0,0,0)',
        transition:'background .35s ease',
      }}/>
      <div
        onClick={e=>e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={boxStyle}
      >
        {!hardFail ? (
          <img
            src={currentSrc}
            alt={alt}
            onError={() => {
              if (srcIdx < candidates.length - 1) setSrcIdx(i => i + 1);
              else setHardFail(true);
            }}
            onClick={e=>e.stopPropagation()}
            onTouchEnd={handleDoubleTap}
            draggable={false}
            style={{
              maxWidth:'88%', maxHeight:'88%',
              objectFit:'contain',
              opacity: visible ? 1 : 0,
              transition:'opacity .25s ease .1s, transform .12s ease-out',
              transform:`scale(${zoom})`,
              transformOrigin:'center center',
              filter: `drop-shadow(0 0 40px ${accentColor}99)`,
              cursor:'default',
              userSelect:'none',
              WebkitUserSelect:'none',
              touchAction:'none',
            }}
          />
        ) : (
          <div onClick={e=>e.stopPropagation()} onTouchEnd={handleDoubleTap} style={{
            width:'88vw', maxWidth:520, height:'70vh', maxHeight:520,
            display:'flex', alignItems:'center', justifyContent:'center',
            opacity: visible ? 1 : 0,
            transition:'opacity .25s ease .1s, transform .12s ease-out',
            transform:`scale(${zoom})`,
            filter:`drop-shadow(0 0 40px ${accentColor}99)`,
          }}>
            {animal ? <AnimalImg a={animal} size={Math.min(520, Math.round((typeof window !== 'undefined' ? window.innerWidth : 390) * .88))} fontSize={120} overrideStatus={animal.status || 'ricercato'} /> : <div style={{ color:'white', fontWeight:900 }}>{alt}</div>}
          </div>
        )}
        <button onClick={handleClose} style={{
          position:'absolute', top:16, right:16,
          background:'rgba(0,0,0,.25)', border:'none',
          color:'white', fontSize:20, width:40, height:40,
          borderRadius:'50%', cursor:'pointer', display:'flex',
          alignItems:'center', justifyContent:'center',
          opacity: visible ? 1 : 0, transition:'opacity .3s ease .15s',
          zIndex:2,
        }}>×</button>
        {zoom > 1 && (
          <button onClick={()=>setZoom(1)} style={{
            position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%)',
            height:38, padding:'0 14px', borderRadius:999, border:'none',
            background:'rgba(0,0,0,.32)', color:'white', fontSize:12, fontWeight:900,
            cursor:'pointer', zIndex:2,
          }}>Reset zoom</button>
        )}
      </div>
    </>
  );
}

// ── Detail ────────────────────────────────────────────────────────────
const TAB_ORDER = ['abilita','statistiche','tassonomia'];

function PhotoRecognitionModal({ animal, animals = [], user, onClose, onConfirm }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState([]);
  const [gps, setGps] = useState(null);
  const expectedHabitats = getAnimalHabitatIds(animal || {});
  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setGps({ lat:pos.coords.latitude, lng:pos.coords.longitude, accuracy:pos.coords.accuracy }),
      () => setGps(null),
      { enableHighAccuracy:true, timeout:6500, maximumAge:60000 }
    );
  }, []);
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const runIdentification = async () => {
    if (!file) { setError('Scatta o carica prima una foto.'); return; }
    setLoading(true); setError(''); setMatches([]);
    let publicUrl = '';
    try {
      if (user?.id && supabase?.storage) {
        const cleanName = String(file.name || 'photo.jpg').replace(/[^a-z0-9._-]/gi,'_');
        const path = `${user.id}/${animal?.id || 'unknown'}/${Date.now()}-${cleanName}`;
        const { error:uploadError } = await supabase.storage.from('animal-photos').upload(path, file, { upsert:false, contentType:file.type || 'image/jpeg' });
        if (!uploadError) {
          const { data } = supabase.storage.from('animal-photos').getPublicUrl(path);
          publicUrl = data?.publicUrl || '';
        }
      }
      const payload = {
        image_url: publicUrl,
        expected_animal_id: animal?.id,
        expected_sci: animal?.sci,
        gps,
        expected_habitat_ids: expectedHabitats,
        candidates: (animals || []).slice(0,1200).map(a => ({ id:a.id, sci:a.sci, com:a.com, com_en:a.com_en, cls:a.cls, countries:a?.distribution?.countries_present || a?.geo?.iso?.primary || [], habitat_ids:getAnimalHabitatIds(a) }))
      };
      let aiMatches = [];
      try {
        const { data, error:fnError } = await supabase.functions.invoke('identify-animal', { body:payload });
        if (!fnError && data?.matches?.length) aiMatches = data.matches;
      } catch (fnErr) {
        console.warn('[Animaldex] identify-animal non disponibile:', fnErr);
      }
      if (!aiMatches.length) {
        // Fallback sicuro: non riconosce davvero l'immagine, propone conferma manuale con controlli habitat/GPS.
        const expected = animal ? [{ animal_id:animal.id, confidence:0.72, basis:'fallback/manual-confirmation', geo_match:!!gps, habitat_match:expectedHabitats.length>0 }] : [];
        const sameHabitat = expectedHabitats.length ? (animals || []).filter(a => a.id !== animal?.id && getAnimalHabitatIds(a).some(id => expectedHabitats.includes(id))).slice(0,2).map((a,i)=>({ animal_id:a.id, confidence:0.52 - i*.05, basis:'habitat-similar', geo_match:false, habitat_match:true })) : [];
        aiMatches = [...expected, ...sameHabitat];
      }
      const hydrated = aiMatches.map(m => {
        const a = (animals || []).find(x => Number(x.id) === Number(m.animal_id || m.id)) || (Number(m.animal_id || m.id) === Number(animal?.id) ? animal : null);
        return a ? { ...m, animal:a } : null;
      }).filter(Boolean).slice(0,3);
      setMatches(hydrated);
    } catch (err) {
      console.warn('[Animaldex] photo recognition:', err);
      setError(err?.message || 'Riconoscimento non riuscito.');
    } finally {
      setLoading(false);
    }
  };
  const confirmMatch = (match) => {
    if (!match?.animal) return;
    onConfirm?.(match.animal, { confidence:match.confidence, gps, file, image_url:preview });
  };
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:260, background:'rgba(0,0,0,.82)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:460, maxHeight:'92%', overflowY:'auto', borderRadius:28, background:'linear-gradient(180deg,#222226,#111113)', border:'1px solid rgba(255,255,255,.10)', boxShadow:'0 30px 80px rgba(0,0,0,.65)', padding:18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div><div style={{ color:'#C85D44', fontSize:11, fontWeight:1000, letterSpacing:.8, textTransform:'uppercase' }}>Cattura Dex</div><div style={{ color:'white', fontSize:22, fontWeight:1000 }}>Registra nel Dex</div></div>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:12, border:'none', background:'rgba(255,255,255,.08)', color:'white', fontSize:20 }}>×</button>
        </div>
        <label style={{ display:'block', border:'1px dashed rgba(255,255,255,.22)', borderRadius:20, padding:14, background:'rgba(255,255,255,.04)', cursor:'pointer', textAlign:'center' }}>
          {preview ? <img src={preview} alt="foto" style={{ width:'100%', maxHeight:260, objectFit:'contain', borderRadius:16 }} /> : <div style={{ minHeight:150, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.62)', fontWeight:900 }}>📷 Scatta o carica una foto</div>}
          <input type="file" accept="image/*" capture="environment" onChange={e=>setFile(e.target.files?.[0] || null)} style={{ display:'none' }} />
        </label>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:8, marginTop:12, width:'100%', maxWidth:'100%', boxSizing:'border-box' }}>
          <div style={{ borderRadius:14, background:'rgba(255,255,255,.055)', padding:12 }}><div style={{ color:'white', fontSize:12, fontWeight:900 }}>GPS</div><div style={{ color:gps?'#90D84A':'#F0B24E', fontSize:11, marginTop:4 }}>{gps ? `agganciato ±${Math.round(gps.accuracy || 0)}m` : 'in attesa / non disponibile'}</div></div>
          <div style={{ borderRadius:14, background:'rgba(255,255,255,.055)', padding:12 }}><div style={{ color:'white', fontSize:12, fontWeight:900 }}>Habitat</div><div style={{ color:expectedHabitats.length?'#90D84A':'#F0B24E', fontSize:11, marginTop:4 }}>{expectedHabitats.length ? `${expectedHabitats.length} habitat attesi` : 'non mappato'}</div></div>
        </div>
        {error && <div style={{ marginTop:12, borderRadius:14, background:'rgba(168,70,55,.18)', border:'1px solid rgba(168,70,55,.45)', color:'#FFC8BE', padding:12, fontSize:12, fontWeight:800 }}>{error}</div>}
        <button disabled={loading || !file} onClick={()=>animal ? onConfirm?.(animal,{ gps, file, image_url:preview, confidence:1 }) : runIdentification()} style={{ marginTop:14, width:'100%', height:50, borderRadius:16, border:'none', background:(loading || !file)?'#444':'linear-gradient(135deg,#A84637,#C45A3E)', color:'white', fontWeight:1000, fontSize:14 }}>{loading ? 'Registrazione…' : 'Conferma cattura nel Dex'}</button>
        {!!matches.length && <div style={{ marginTop:16 }}>
          <div style={{ color:'rgba(255,255,255,.62)', fontSize:12, fontWeight:900, marginBottom:8 }}>Risultati verificati</div>
          {matches.map(m => <button key={m.animal.id} onClick={()=>confirmMatch(m)} style={{ width:'100%', minHeight:62, borderRadius:16, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.055)', color:'white', display:'flex', alignItems:'center', gap:12, padding:10, marginBottom:8, cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}>
            <AnimalImg a={m.animal} size={44} fontSize={22} overrideStatus="catturato" />
            <div style={{ flex:1, minWidth:0 }}><div style={{ fontWeight:1000, fontSize:13 }}>{m.animal.com}</div><div style={{ color:'rgba(255,255,255,.52)', fontSize:11 }}>{Math.round((m.confidence || 0) * 100)}% · GPS {m.geo_match?'ok':'manuale'} · habitat {m.habitat_match?'ok':'da verificare'}</div></div>
            <div style={{ color:'#90D84A', fontWeight:1000, fontSize:12 }}>Conferma</div>
          </button>)}
        </div>}
        <div style={{ color:'rgba(255,255,255,.42)', fontSize:10.5, lineHeight:1.4, marginTop:12 }}>“Catturato” significa registrato nel tuo Animaldex. Nessun animale viene catturato fisicamente.</div>
      </div>
    </div>
  );
}


function FullscreenMetricModal({ open, title, subtitle='', onClose, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:340, background:'rgba(0,0,0,.90)', display:'flex', alignItems:'center', justifyContent:'center', padding:18 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:520, borderRadius:28, background:'linear-gradient(180deg,#16181C,#0F1012)', border:'1px solid rgba(255,255,255,.10)', boxShadow:'0 30px 80px rgba(0,0,0,.58)', padding:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, marginBottom:14 }}>
          <div>
            <div style={{ color:'#F0A840', fontSize:11, fontWeight:1000, letterSpacing:.7, textTransform:'uppercase' }}>Approfondimento</div>
            <div style={{ color:'white', fontSize:24, fontWeight:1000 }}>{title}</div>
            {subtitle ? <div style={{ color:'rgba(255,255,255,.58)', fontSize:12, marginTop:5, lineHeight:1.45 }}>{subtitle}</div> : null}
          </div>
          <button onClick={onClose} style={{ width:38, height:38, borderRadius:12, border:'none', background:'rgba(255,255,255,.08)', color:'white', fontSize:22, cursor:'pointer' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Detail({ a, onBack, onStatusChange, onJumpToClass, onOpenComparator, onOpenLifeWeb, onOpenPhoto, visitedCountries = [], tutorialStep=null, onTutorialAbilityClick, onTutorialMetricClick, onTutorialStatusClick, theme='dark' }) {
  const [statMode,setStatMode]=useState('statistiche');
  const [slideDir,setSlideDir]=useState(1);
  const [localStatus,setLocalStatus]=useState(normalizeAnimalStatus(a.status));
  const [showStatusMenu,setShowStatusMenu]=useState(false);
  const [showInfoModal,setShowInfoModal]=useState(false);
  const [showLightbox,setShowLightbox]=useState(false);
  const [lightboxRect,setLightboxRect]=useState(null);
  const [metricModal,setMetricModal]=useState(null);
  const [pullProgress,setPullProgress]=useState(0);
  const scrollRef = useRef(null);
  const imgRef = useRef(null);
  const touchStartY = useRef(0);
  const c=CLS[a.cls]||CLS.Mammalia;
  const isLightTheme = theme === 'light';
  const detailText = isLightTheme ? '#171717' : 'white';
  const detailMuted = isLightTheme ? 'rgba(0,0,0,.62)' : 'rgba(255,255,255,.62)';
  const detailPanel = isLightTheme ? 'rgba(255,255,255,.74)' : 'rgba(0,0,0,.35)';
  const detailPanelBorder = isLightTheme ? '1px solid rgba(0,0,0,.08)' : 'none';
  const co=CONS[a.cons]||CONS.DD;
  const found = isRevealedStatus(localStatus);
  const canViewImage = !isMysteryStatus(localStatus) && !!a.image_url;

  const handleTab = (m) => {
    if (m===statMode) return;
    setSlideDir(TAB_ORDER.indexOf(m) > TAB_ORDER.indexOf(statMode) ? 1 : -1);
    setStatMode(m);
  };

  const openLightbox = (rect) => {
    if (!canViewImage) return;
    setLightboxRect(rect || (imgRef.current ? imgRef.current.getBoundingClientRect() : null));
    setShowLightbox(true);
    setPullProgress(0);
  };

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchMove  = (e) => {
    if (!scrollRef.current || scrollRef.current.scrollTop > 2) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && canViewImage) {
      const progress = Math.min(1, delta / 120);
      setPullProgress(progress);
      if (delta > 110) openLightbox();
    }
  };
  const handleTouchEnd = () => { if (!showLightbox) setPullProgress(0); };
  
  useEffect(() => {
    if (tutorialStep === 'detail-overview' || tutorialStep === 'detail-metrics' || tutorialStep === 'detail-status') setStatMode('statistiche');
    if (tutorialStep === 'detail-abilities') setStatMode('abilita');
  }, [tutorialStep]);

  const scale = 1;
  const longName = String(a.com || '').length > 24;
  const statusActions = getStatusActions(localStatus);
  const visitedMatches = countCountryMatches(a, new Set((visitedCountries || []).map(c => String(c).toUpperCase())));
  const lengthCm = parseAnimalLengthCm(a.ln);
  const activePyramidLevel = getPyramidLevel(a.trophic);
  const handleStatusAction = (action) => {
    if (action === 'mark-seen') {
      setLocalStatus('avvistato');
      onStatusChange?.(a.id, 'avvistato');
      track('animal_marked_seen', { animal_id:a.id, animal_name:a.com, source:'detail' });
      if (tutorialStep === 'detail-status') onTutorialStatusClick?.();
    }
    if (action === 'capture') onOpenPhoto?.(a);
  };
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:isLightTheme ? LIGHT_APP_BG : 'linear-gradient(180deg,#101216 0%,#17191D 44%,#1A1A1C 100%)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px 11px', flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:c.accent, fontSize:15, fontWeight:700, cursor:'pointer', padding:0 }}>‹ Animaldex</button>
        <span aria-hidden style={{ flex:1 }} />
        <button onClick={()=>setShowInfoModal(!showInfoModal)} style={{ background:'none', border:'none', color:isLightTheme?'rgba(0,0,0,.62)':'rgba(255,255,255,.8)', fontSize:20, cursor:'pointer', padding:'4px 8px', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8 }}>ⓘ</button>
      </div>
      <div ref={scrollRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        style={{ flex:1, overflowY:'auto', padding:'0 14px 48px' }}>
        
<div style={{ display:'flex', flexWrap:'wrap', gap:3, alignItems:'center', marginBottom:14 }}>
  {[a.kin,a.phy,a.cls,a.ord,a.fam].map((p,i,arr)=>(
    <span key={i} style={{ display:'flex', alignItems:'center', gap:3 }}>
      {i===2 ? (
        <button onClick={()=>onJumpToClass?.(a.cls, a)} style={{ color:c.accent, fontSize:11, fontWeight:700, background:'transparent', border:'none', padding:0, cursor:'pointer', textDecoration:'underline' }}>{p}</button>
      ) : (
        <span style={{ color:'rgba(255,255,255,.32)', fontSize:11, fontWeight:400, fontStyle:'italic' }}>{p}</span>
      )}
      {i<arr.length-1&&<span style={{ color:'rgba(255,255,255,.18)', fontSize:11 }}>›</span>}
    </span>
  ))}
</div>

        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16, padding:'0 4px' }}>
          <div ref={imgRef}
            onClick={()=>openLightbox(imgRef.current?.getBoundingClientRect())}
            style={{
              width:'100%',
              height: Math.round(268 + pullProgress * 70),
              borderRadius:18,
              overflow:'hidden',
              background:'#202228',
              cursor: canViewImage ? 'zoom-in' : 'default',
              boxShadow:'inset 0 0 0 1px rgba(255,255,255,.06)',
              transition: pullProgress===0 ? 'height .25s ease, border-radius .25s ease' : 'none',
            }}>
            <AnimalImg a={a} size={Math.round(268 + pullProgress * 70)} fontSize={88} overrideStatus={localStatus} />
          </div>
        </div>
        <div style={{ textAlign:'center', marginBottom:14 }}>
          <h1 style={{ margin:0, color:detailText, fontSize:longName?22:26, fontWeight:900, letterSpacing:longName?-.6:-.3, lineHeight:1.06, transform:longName?'scaleX(.8)':'none', transformOrigin:'center', maxWidth:'124%', marginLeft:longName?'-12%':0, marginRight:longName?'-12%':0 }}>{a.com}</h1>
          <p style={{ margin:'4px 0 0', color:c.accent, fontSize:15, fontStyle:'italic', fontWeight:400 }}>{a.sci}</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:8, marginBottom:14, padding:'0 4px' }}>
          <div data-tour="animal-rarity" style={{ width:'100%', boxShadow:tutorialStep==='detail-overview'?'0 0 0 3px rgba(240,168,64,.30), 0 0 24px rgba(240,168,64,.28)':'none', borderRadius:14 }}><RarityBadge rarity={a.rarity || 'Comune'} full style={{ width:'100%', fontSize:13.5 }} /></div>
          <div data-tour="animal-conservation" style={{ background:co.bg, borderRadius:12, padding:'9px 12px', color:co.c, fontSize:12, fontWeight:700, textAlign:'center', boxShadow:tutorialStep==='detail-overview'?'0 0 0 3px rgba(240,168,64,.30), 0 0 24px rgba(240,168,64,.28)':'none' }}>{co.lbl} · {co.full}</div>
          <div data-tour="animal-status" style={{ width:'100%', borderRadius:14, boxShadow:tutorialStep==='detail-overview'?'0 0 0 3px rgba(240,168,64,.30), 0 0 24px rgba(240,168,64,.28)':'none' }}><StatusBadge status={localStatus} accentColor={c.accent}/></div>
          {statusActions.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:`repeat(${statusActions.length},1fr)`, gap:7 }}>
              {statusActions.map(act => <button key={act.action} onClick={()=>handleStatusAction(act.action)} style={{ height:38, borderRadius:12, border:'1px solid rgba(255,255,255,.10)', background:act.action==='capture'?'linear-gradient(135deg,#A84637,#C45A3E)':'rgba(255,255,255,.08)', color:'white', fontSize:11.5, fontWeight:950, fontFamily:'inherit', cursor:'pointer', boxShadow:tutorialStep==='detail-status' && act.action==='mark-seen' ? '0 0 0 3px rgba(240,168,64,.32), 0 0 26px rgba(240,168,64,.34)' : 'none' }}>{act.label}</button>)}
            </div>
          )}
        </div>
        <div style={{ background:detailPanel, border:detailPanelBorder, borderRadius:14, padding:14, marginBottom:10, boxShadow:tutorialStep==='detail-overview'?'0 0 0 3px rgba(240,168,64,.22), 0 0 24px rgba(240,168,64,.18)':'none' }}>
          <p style={{ margin:0, color:isLightTheme?'rgba(0,0,0,.74)':'rgba(255,255,255,.82)', fontSize:13, lineHeight:1.7 }}>{a.desc}</p>
        </div>
        <div style={{ color:isLightTheme?'rgba(0,0,0,.54)':'rgba(255,255,255,.56)', fontSize:10.5, lineHeight:1.45, margin:'0 4px 16px' }}>
          {visitedMatches ? `Presente in ${visitedMatches} dei tuoi paesi · ` : ''}{(a.rarity || 'Comune')}, {a.rarity === 'Comune' ? 'facile da catturare' : a.rarity === 'Leggendario' ? 'molto raro' : 'da documentare'} · “Catturato” significa registrato nel tuo Animaldex, non cattura fisica.
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:18 }}>
          <button onClick={()=>{setMetricModal('peso'); if(tutorialStep==='detail-metrics') { setTimeout(()=>setMetricModal(null), 520); onTutorialMetricClick?.(); }}} style={{ height:112, minHeight:112, width:'100%', minWidth:0, background:'#111113', borderRadius:12, padding:'8px 8px 10px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', gap:3, border:'1px solid rgba(255,255,255,.06)', fontFamily:'inherit', cursor:'pointer', boxSizing:'border-box', boxShadow:tutorialStep==='detail-metrics'?'0 0 0 3px rgba(240,168,64,.30), 0 0 24px rgba(240,168,64,.28)':'none' }}>
            <div style={{ width:'100%', maxWidth:'116px', transform:'translateY(8px)', marginBottom:2 }}><GaugeSVG wt_str={a.wt} /></div>
            <div style={{ fontSize:9.8, fontWeight:900, color:getWeightCat(a.wt).color, textAlign:'center', lineHeight:1.05, marginTop:0 }}>{getWeightCat(a.wt).label}</div>
            <div style={{ fontSize:11.5, fontWeight:900, color:'white', textAlign:'center', letterSpacing:'-.3px' }}>{a.wt}</div>
          </button>

          <button onClick={()=>{setMetricModal('dimensioni'); if(tutorialStep==='detail-metrics') { setTimeout(()=>setMetricModal(null), 520); onTutorialMetricClick?.(); }}} style={{ height:112, minHeight:112, width:'100%', minWidth:0, background:'#111113', borderRadius:12, padding:'6px 8px 10px', display:'flex', flexDirection:'column', alignItems:'stretch', justifyContent:'space-between', border:'1px solid rgba(255,255,255,.06)', fontFamily:'inherit', cursor:'pointer', boxSizing:'border-box', boxShadow:tutorialStep==='detail-metrics'?'0 0 0 3px rgba(240,168,64,.30), 0 0 24px rgba(240,168,64,.28)':'none' }}>
            <ScaleComparison animal={a} />
            <div style={{ fontSize:11.5, fontWeight:900, color:'white', textAlign:'center', letterSpacing:'-.3px', marginTop:2 }}>{a.ln}</div>
          </button>

          <button onClick={()=>{setMetricModal('trofico'); if(tutorialStep==='detail-metrics') { setTimeout(()=>setMetricModal(null), 520); onTutorialMetricClick?.(); }}} style={{ height:112, minHeight:112, width:'100%', minWidth:0, background:'#111113', borderRadius:12, padding:'6px 6px 10px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between', gap:2, border:'1px solid rgba(255,255,255,.06)', fontFamily:'inherit', cursor:'pointer', boxSizing:'border-box', boxShadow:tutorialStep==='detail-metrics'?'0 0 0 3px rgba(240,168,64,.30), 0 0 24px rgba(240,168,64,.28)':'none' }}>
            <div style={{ transform:'translateY(10px)', marginTop:6 }}><TrophicPyramid trophic={a.trophic} compact /></div>
            <div style={{ fontSize:10.5, fontWeight:900, color:'white', textAlign:'center', letterSpacing:'-.2px', lineHeight:1.15 }}>{activePyramidLevel.label}</div>
          </button>
        </div>
        {/* 3 pannelli: Abilità | Statistiche | Tassonomia */}
        <div style={{ marginBottom:20 }}>
          {/* Tab bar */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', marginBottom:0, background:'rgba(0,0,0,.38)', borderRadius:'12px 12px 0 0', padding:4, gap:4 }}>
            {['abilita','statistiche','tassonomia'].map(m=>(
              <button key={m} onClick={()=>handleTab(m)} style={{ padding:'8px 0', borderRadius:8, background:statMode===m?c.mid:'transparent', color:statMode===m?'white':'rgba(255,255,255,.38)', fontSize:11, fontWeight:700, border:'none', cursor:'pointer', textTransform:'capitalize' }}>
                {m==='abilita'?'Abilità':m==='statistiche'?'Statistiche':'Tassonomia'}
              </button>
            ))}
          </div>

          {/* Fixed-height content — height sized to tassonomia (tallest tab) */}
          <div style={{ background:'rgba(0,0,0,.28)', borderRadius:'0 0 14px 14px', padding:'10px 10px', height:404, boxSizing:'border-box', overflow:'hidden', position:'relative' }}>
            <div key={statMode} className={slideDir>0?'tab-from-right':'tab-from-left'} style={{ height:'100%' }}>

              {/* Abilità */}
              {statMode==='abilita'&&(
                <div
                  onTouchStart={e=>e.stopPropagation()}
                  onTouchMove={e=>e.stopPropagation()}
                  data-tour="animal-abilities" style={{ height:'100%', overflowY:'auto', WebkitOverflowScrolling:'touch', overscrollBehavior:'contain', touchAction:'pan-y', paddingRight:2 }}
                >
                  {a.categories?.length>0?(
                    <div style={{ display:'flex', flexDirection:'column', gap:8, paddingBottom:10 }}>
                      {a.categories.map(cat=>(
                        <DetailAbilityCard key={cat} cat={cat} animal={a} accentColor={c.accent} tutorialActive={tutorialStep==='detail-abilities'} onTutorialClick={onTutorialAbilityClick} />
                      ))}
                    </div>
                  ):(
                    <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:20, textAlign:'center' }}>
                      <p style={{ color:'rgba(255,255,255,.5)', fontSize:13, margin:0 }}>Nessuna abilità speciale registrata</p>
                    </div>
                  )}
                </div>
              )}

              {/* Statistiche */}
              {statMode==='statistiche'&&(
                isRevealedStatus(localStatus) ? (
                  <div data-tour="animal-stats" style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:'12px', height:'100%', boxSizing:'border-box', display:'flex', flexDirection:'column', gap:7, justifyContent:'space-between' }}>
                    <StatRow label='Velocità' base={a.stats?.velocita ?? 0} scale={scale} color={c.accent} unit='km/h'/>
                    <StatRow label='Morso' base={a.stats?.morso ?? 0} scale={scale} color={c.accent} unit='PSI'/>
                    {a.lifespan != null && (
                      <div style={{ minHeight:40, borderRadius:13, background:'rgba(255,255,255,.055)', border:'1px solid rgba(255,255,255,.065)', padding:'8px 11px', boxSizing:'border-box', display:'grid', gridTemplateColumns:'92px 1fr 66px', alignItems:'center', gap:9 }}>
                        <span style={{ color:'rgba(255,255,255,.78)', fontSize:12.5, fontWeight:900, lineHeight:1.1 }}>Vita</span>
                        <div style={{ flex:1, height:9, background:'rgba(0,0,0,.4)', borderRadius:4, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${Math.min(100, Math.round((a.lifespan / 200) * 100))}%`, background:c.accent, borderRadius:4, transition:'width .65s cubic-bezier(.4,0,.2,1)' }} />
                        </div>
                        <span style={{ color:'white', fontSize:12.5, fontWeight:900, textAlign:'right' }}>{a.lifespan} anni</span>
                      </div>
                    )}
                    <StatRow label='Forza' base={a.stats?.forza ?? 0} scale={scale} color={c.accent} unit='%'/>
                    <StatRow label='Resistenza' base={a.stats?.resistenza ?? 0} scale={scale} color={c.accent} unit='%'/>
                    <StatRow label='Intelligenza' base={a.stats?.intelligenza ?? 0} scale={scale} color={c.accent} unit='%'/>
                    <StatRow label='Agilità' base={a.stats?.agilita ?? 0} scale={scale} color={c.accent} unit='%'/>
                  </div>
                ) : (
                  <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:20, textAlign:'center' }}>
                    <p style={{ color:'rgba(255,255,255,.6)', fontSize:13, margin:0 }}>🔒 Sblocca passando ad Avvistato o Catturato</p>
                  </div>
                )
              )}

              {/* Tassonomia */}
              {statMode==='tassonomia'&&(
                <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:'4px 16px 16px', height:'100%', boxSizing:'border-box', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                  {[['Regno',a.kin],['Phylum',a.phy],['Classe',a.cls],['Ordine',a.ord],['Famiglia',a.fam],['Genere',a.gen],['Specie',a.sci]].map(([l,v])=>(
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                      <span style={{ color:'rgba(255,255,255,.35)', fontSize:12 }}>{l}</span>
                      <span style={{ color:l==='Specie'||l==='Genere'?c.accent:'white', fontSize:12, fontWeight:600, fontStyle:l==='Specie'||l==='Genere'?'italic':undefined }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
        {a.bio && (
          <>
            <p style={{ color:'white', fontSize:16, fontWeight:800, margin:'0 0 10px', paddingLeft:4 }}>Biologia</p>
            <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:14, marginBottom:20 }}><p style={{ margin:0, color:'rgba(255,255,255,.82)', fontSize:13, lineHeight:1.7 }}>{a.bio}</p></div>
          </>
        )}
        <p style={{ color:'white', fontSize:16, fontWeight:800, margin:'0 0 10px', paddingLeft:4 }}>Etimologia</p>
        <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:14, marginBottom:20 }}><p style={{ margin:0, color:'rgba(255,255,255,.82)', fontSize:13, lineHeight:1.7 }}>{a.ety}</p></div>
        <p data-distribution-anchor style={{ color:'white', fontSize:16, fontWeight:800, margin:'0 0 10px', paddingLeft:4 }}>Distribuzione</p>
        <DistMap hab={a.hab} accentColor={c.accent} countriesPresent={a.distribution?.countries_present} animal={a}/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, margin:'18px 0 8px' }}><button data-sound="compare" onClick={()=>onOpenComparator?.(a)} style={{ minHeight:50, border:'1px solid rgba(255,255,255,.10)', borderRadius:16, background:'rgba(255,255,255,.07)', color:'white', fontSize:11.5, fontWeight:950, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>Confronta</button><button data-sound="map" onClick={()=>onOpenLifeWeb?.(a)} style={{ minHeight:50, border:'1px solid rgba(255,255,255,.10)', borderRadius:16, background:'rgba(255,255,255,.07)', color:'white', fontSize:11.5, fontWeight:950, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>LifeWeb</button><button data-sound="map" onClick={()=>document.querySelector('[data-distribution-anchor]')?.scrollIntoView({behavior:'smooth', block:'start'})} style={{ minHeight:50, border:'1px solid rgba(255,255,255,.10)', borderRadius:16, background:'rgba(255,255,255,.07)', color:'white', fontSize:11.5, fontWeight:950, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>Distribuzione</button></div>
      </div>

      {/* Info Modal */}
      <FullscreenMetricModal open={metricModal==='peso'} title="Peso" subtitle="Il tachimetro divide il peso in tre fasce: pesi piuma, pesi medi e pesi massimi. La lancetta si muove solo dentro la fascia corretta: a sinistra per i valori più leggeri della categoria, a destra per i più pesanti." onClose={()=>setMetricModal(null)}>
        <div style={{ background:'rgba(255,255,255,.04)', borderRadius:20, padding:'26px 18px 18px', textAlign:'center' }}>
	          <div style={{ maxWidth:500, margin:'10px auto -22px', transform:'translateY(18px)' }}><GaugeSVG wt_str={a.wt} large /></div>
	          <div style={{ color:getWeightCat(a.wt).color, fontWeight:1000, marginTop:-10, marginBottom:10 }}>{getWeightCat(a.wt).label}</div>
          <div style={{ color:'white', fontSize:30, fontWeight:1000, marginTop:6 }}>{a.wt}</div>
        </div>
      </FullscreenMetricModal>
      <FullscreenMetricModal open={metricModal==='dimensioni'} title="Dimensioni" subtitle="Il confronto usa sempre la stessa scala tra anteprima e zoom. Le misure in metri vengono convertite in centimetri, così animali grandi come bovini o cervi non risultano artificialmente minuscoli." onClose={()=>setMetricModal(null)}>
        <div style={{ background:'rgba(255,255,255,.04)', borderRadius:20, padding:18, textAlign:'center' }}>
          <ScaleComparison animal={a} full />
        </div>
        <div style={{ color:'white', textAlign:'center', fontSize:28, fontWeight:1000, marginTop:12 }}>{a.ln}</div>
      </FullscreenMetricModal>
      <FullscreenMetricModal open={metricModal==='trofico'} title="Piramide alimentare" subtitle="La piramide mostra sempre tutti i gradini della rete trofica. Il gradino colorato indica il ruolo dell’animale." onClose={()=>setMetricModal(null)}>
        <div style={{ background:'rgba(255,255,255,.04)', borderRadius:20, padding:18, textAlign:'center' }}>
          <div style={{ transform:'translateY(8px)' }}><TrophicPyramid trophic={a.trophic} showLabels large /></div>
          <div style={{ color:'white', fontSize:24, fontWeight:1000, marginTop:10 }}>{activePyramidLevel.label}</div>
          <div style={{ display:'grid', gap:8, marginTop:16, textAlign:'left' }}>{PYRAMID_LEVELS.map(lv=><div key={lv.key} style={{ display:'grid', gridTemplateColumns:'22px 150px 1fr', alignItems:'center', gap:10, color:'rgba(255,255,255,.78)', fontSize:12 }}><div style={{ width:18, height:8, borderRadius:4, background:lv.c }} /><strong style={{ color:'white' }}>{lv.label}</strong><span>{lv.desc}</span></div>)}</div>
        </div>
      </FullscreenMetricModal>
      {showInfoModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
          <div style={{ background:c.detailBg, borderRadius:20, padding:28, maxHeight:'90vh', overflowY:'auto', maxWidth:520, width:'100%', border:`2px solid ${c.accent}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ margin:0, color:c.accent, fontSize:22, fontWeight:900 }}>📚 Legenda Completa</h2>
              <button onClick={()=>setShowInfoModal(false)} style={{ background:'none', border:'none', color:c.accent, fontSize:24, cursor:'pointer', padding:0 }}>×</button>
            </div>
            <div style={{ marginBottom:24 }}>
              <h3 style={{ margin:'0 0 12px', color:c.accent, fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>🛡 Stato Conservazione (IUCN)</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[{k:'LC',full:'Least Concern',desc:'Specie non in pericolo'},{k:'NT',full:'Near Threatened',desc:'Prossima a essere minacciata'},{k:'VU',full:'Vulnerable',desc:'A rischio di estinzione'},{k:'EN',full:'Endangered',desc:'Fortemente minacciata'},{k:'CR',full:'Critically Endangered',desc:'Gravissimamente minacciata'},{k:'EW',full:'Extinct in the Wild',desc:'Estinta in natura'},{k:'EX',full:'Extinct',desc:'Completamente estinta'},{k:'DD',full:'Data Deficient',desc:'Dati insufficienti'}].map(({k,full,desc})=>{const co2=CONS[k]||CONS.DD;return <div key={k} style={{display:'flex',gap:10,alignItems:'flex-start'}}><div style={{background:co2.bg,color:co2.c,padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>{k}</div><div style={{flex:1}}><div style={{color:'white',fontSize:12,fontWeight:700}}>{full}</div><div style={{color:'rgba(255,255,255,.55)',fontSize:11,marginTop:2}}>{desc}</div></div></div>;})}
              </div>
            </div>
            <div style={{ marginBottom:24 }}>
              <h3 style={{ margin:'0 0 12px', color:c.accent, fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>★ Rarità Animale</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}><RarityLegendRows /></div>
            </div>
            <div style={{ marginBottom:24 }}>
              <h3 style={{ margin:'0 0 12px', color:c.accent, fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>📷 Status Animale</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <StatusLegendRows />
              </div>
            </div>
            <div>
              <h3 style={{ margin:'0 0 12px', color:c.accent, fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>⛓ Gerarchia Alimentare</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[{k:'D',l:'Decomponente',desc:'Detritofago'},{k:'F',l:'Filtratore',desc:'Filtra particelle dall\'acqua'},{k:1,l:'Produttore',desc:'Organismi autotrofi'},{k:2,l:'Erbivoro',desc:'Si nutre di piante'},{k:4,l:'Predatore Apice',desc:'Vertice della catena'},{k:3,l:'Predatore',desc:'Carnivoro medio'}].map(({k,l,desc})=>{const tr=TROPHIC[k]||TROPHIC[1];return <div key={k} style={{display:'flex',gap:10,alignItems:'flex-start'}}><div style={{background:tr.bg,color:tr.c,padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>{l}</div><div style={{flex:1}}><div style={{color:'rgba(255,255,255,.75)',fontSize:11,marginTop:2}}>{desc}</div></div></div>;})}
              </div>
            </div>
            <div style={{ marginTop:24 }}>
              <h3 style={{ margin:'0 0 12px', color:c.accent, fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:.5 }}>⚖️ Tachimetro Peso</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[{label:'Piuma',range:'< 1 kg',color:'#5BB8F5',desc:'Animali leggerissimi, spesso volatili o insetti'},{label:'Medio',range:'1 kg – 200 kg',color:'#F5A623',desc:'La maggior parte dei mammiferi e rettili medi'},{label:'Massimo',range:'> 200 kg',color:'#E74C3C',desc:'Grandi predatori, elefanti, cetacei e megafauna'}].map(({label,range,color,desc})=>(
                  <div key={label} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                    <div style={{background:color+'22',color,padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>{label}</div>
                    <div style={{flex:1}}>
                      <div style={{color:'white',fontSize:12,fontWeight:700}}>{range}</div>
                      <div style={{color:'rgba(255,255,255,.55)',fontSize:11,marginTop:2}}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {showLightbox && <ImageLightbox src={a.image_url} alt={a.com} accentColor={c.accent} bgColor={c.img} originRect={lightboxRect} animal={{...a,status:localStatus}} onClose={()=>{setShowLightbox(false);setPullProgress(0);}}/>}
    </div>
  );
}



// ── Main Menu & Extra Pages ──────────────────────────────────────────

function PageHeader({ title, onBack, right, theme }) {
  const inferredTheme = theme || (typeof window !== 'undefined' ? window.localStorage?.getItem(ANIMALDEX_THEME_KEY) : 'dark');
  const isLightTheme = inferredTheme === 'light';
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderBottom:isLightTheme?'1px solid rgba(0,0,0,.14)':'1px solid #2A2A2C', flexShrink:0, background:isLightTheme?LIGHT_HEADER_BG:'#1C1C1E' }}>
      <button onClick={onBack} aria-label="Indietro" style={{ width:46, height:46, borderRadius:10, background:'transparent', border:'none', color:isLightTheme?'#171717':'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5L8 12l7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <div style={{ color:isLightTheme?'#171717':'white', fontSize:20, fontWeight:900, letterSpacing:'-.2px', flex:1, textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{title}</div>
      <div style={{ width:46, height:46, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{right}</div>
    </div>
  );
}


function getAwardDescription(rule) {
  if (!rule) return '';
  const target = Number(rule.threshold || rule.target || 0);
  const goal = String(rule.goal || '').replace(/\.$/, '');
  const sub = String(rule.sub || '').replace(/\.$/, '');
  return `Come si ottiene: raggiungi ${target} in ${sub}. Obiettivo: ${goal}.`;
}

function getAbilityDescription(id, meta = {}) {
  const custom = {
    OFF_PERFECT_STRIKE:'Precisione offensiva estrema: colpi rapidi, mirati o quasi inevitabili.',
    OFF_VENOM_TOXINS:'Veleni, tossine e secrezioni capaci di difendere o neutralizzare una preda.',
    OFF_BIO_BLADES:'Artigli, lame naturali e strutture taglienti usate per presa o attacco.',
    OFF_TUSKS_PIERCERS:'Zanne, canini, rostri o perforatori naturali usati per colpire o scavare.',
    DEF_ACTIVE_CAMOUFLAGE:'Capacità di confondersi con l’ambiente o cambiare aspetto per sopravvivere.',
    DEF_SHELL_ARMOR:'Corazze, gusci o placche che proteggono il corpo.',
    DEF_SPURS_SPINES:'Spine, speroni o strutture difensive appuntite.',
    DEF_TOUGH_SKIN:'Pelle resistente, spessa o coriacea contro urti e predatori.',
    SENS_EXTREME_SENSORY:'Sensi molto sviluppati per caccia, orientamento o comunicazione.',
    SENS_NOCTURNAL_SPECIALISTS:'Adattamenti alla vita notturna o in condizioni di poca luce.',
    COG_HIGH_INTELLIGENCE:'Comportamenti complessi, apprendimento rapido o uso avanzato dell’ambiente.',
    COG_NETWORK_MINDS:'Cooperazione, colonie, sciami o intelligenza distribuita.',
    PHYS_EXTREME_SPEED:'Scatti, volo o nuoto a velocità superiori alla media.',
    PHYS_FEATHERWEIGHTS:'Specie molto leggere o dal corpo estremamente ridotto.',
    PHYS_HEAVYWEIGHTS:'Specie grandi, massicce o dalla forza fisica notevole.',
    PHYS_RECORD_BREAKERS:'Specie note per record biologici o prestazioni fuori scala.',
    BEH_LONG_MIGRATION:'Spostamenti stagionali o viaggi su grandi distanze.',
    BEH_PAIR_BONDING:'Legami di coppia stabili o strategie riproduttive collaborative.',
    BEH_PARENTAL_CARE:'Cure parentali sviluppate e protezione attiva della prole.',
    SURV_EXTREME_RESILIENCE:'Resistenza a condizioni ambientali difficili o estreme.',
    ECO_ENGINEERS:'Specie che modificano habitat e influenzano interi ecosistemi.',
    ECO_GLOBAL_DISPERSERS:'Specie capaci di diffondersi su vaste aree geografiche.',
    ECO_INVISIBLE_HOSTS:'Organismi piccoli o nascosti, spesso legati ad altri esseri viventi.',
    EVO_DOMESTICATION:'Specie domesticate o profondamente legate alla storia umana.',
    EVO_ENDEMIC_SPECIES:'Specie legate a un’area geografica limitata.',
    EVO_EXTREME_DIMORPHISM:'Differenze marcate tra maschi e femmine.',
    EVO_INSULAR_DWARFISM:'Adattamenti insulari che portano a taglie ridotte.',
    EVO_INSULAR_GIGANTISM:'Adattamenti insulari che portano a taglie aumentate.',
    EVO_LIVING_FOSSILS:'Linee evolutive antiche con tratti rimasti quasi invariati.',
    LIFESPAN_LONGEVITY:'Specie longeve o con cicli vitali particolarmente lunghi.',
    HAB_DEEP_ABYSS:'Adattamenti ad abissi, profondità marine o ambienti estremi.'
  };
  if (custom[id]) return custom[id];
  if (id.startsWith('OFF_')) return 'Abilità offensiva utile per caccia, difesa attiva o competizione.';
  if (id.startsWith('DEF_')) return 'Abilità difensiva che aumenta protezione, sopravvivenza o mimetismo.';
  if (id.startsWith('SENS_')) return 'Specializzazione sensoriale per percepire meglio l’ambiente.';
  if (id.startsWith('COG_')) return 'Comportamento complesso legato a intelligenza, memoria o cooperazione.';
  if (id.startsWith('PHYS_')) return 'Tratto fisico notevole per massa, velocità, forza o prestazione.';
  if (id.startsWith('BEH_')) return 'Comportamento caratteristico nella vita sociale o riproduttiva.';
  if (id.startsWith('ECO_')) return 'Ruolo ecologico importante nella rete degli ecosistemi.';
  if (id.startsWith('EVO_')) return 'Tratto evolutivo distintivo o adattamento specializzato.';
  return `Categoria naturale: ${meta.label || 'abilità'} osservabile in più specie.`;
}

function countAnimalsForGeoValue(value) {
  return ANIMALS.filter(a => matchGeographySelection(a, [value])).length;
}


function DetailAbilityCard({ cat, animal, accentColor, tutorialActive=false, onTutorialClick }) {
  const [flipped, setFlipped] = useState(false);
  useAutoUnflip(flipped, setFlipped, 5000);
  const meta = CATEGORY_META?.[cat] || { label:cat, icon:'🔹', color:accentColor };
  const curiosity = animal.cat_curiosities?.[cat] || getAbilityDescription(cat, meta);
  const badgeUrl = `/badges/${cat.toLowerCase()}.png`;
  return (
    <div
      className="interactive-hint"
      onClick={()=>{setFlipped(v=>!v); if(tutorialActive) onTutorialClick?.();}}
      style={{
        minHeight:104,
        borderRadius:14,
        background:'rgba(0,0,0,.35)',
        overflow:'hidden',
        cursor:'pointer',
        perspective:900,
        border:`1px solid ${tutorialActive ? '#A84637' : (meta.color || accentColor)}${tutorialActive ? 'cc' : '22'}`,
        boxShadow:tutorialActive?'0 0 0 3px rgba(168,70,55,.32), 0 0 28px rgba(168,70,55,.34)':'none'
      }}
    >
      <div style={{ position:'relative', minHeight:104, transformStyle:'preserve-3d', transition:'transform .36s cubic-bezier(.2,.8,.2,1)', transform:flipped?'rotateX(180deg)':'rotateX(0deg)' }}>
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', padding:'12px 14px', display:'flex', alignItems:'center', gap:14, boxSizing:'border-box' }}>
          <img src={badgeUrl} alt={meta.label} onError={e=>{e.currentTarget.style.display='none'; const n=e.currentTarget.nextSibling; if(n) n.style.display='inline-flex';}} style={{ width:66, height:66, objectFit:'contain', flexShrink:0, filter:`drop-shadow(0 0 14px ${(meta.color || accentColor)}44)` }} />
          <span style={{ display:'none', width:66, height:66, alignItems:'center', justifyContent:'center', fontSize:36, flexShrink:0 }}>{meta.icon}</span>
          <div style={{ color:'white', fontSize:15, fontWeight:900, lineHeight:1.2 }}>{meta.label}</div>
        </div>
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateX(180deg)', padding:'12px 36px 12px 14px', boxSizing:'border-box', display:'flex', alignItems:'center', background:'linear-gradient(135deg,rgba(0,0,0,.50),rgba(255,255,255,.04))' }}>
          <button data-sound="back" onClick={e=>{e.stopPropagation();setFlipped(false);}} aria-label="Gira card" style={{ position:'absolute', top:8, right:8, width:26, height:26, borderRadius:9, border:'1px solid rgba(255,255,255,.10)', background:'rgba(0,0,0,.32)', color:'white', fontSize:13, fontWeight:900, cursor:'pointer', zIndex:3, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1, padding:0 }}>↺</button>
          <div style={{ color:'rgba(255,255,255,.80)', fontSize:10.4, lineHeight:1.18, fontWeight:720, textAlign:'left', maxHeight:80, overflowY:'auto', paddingRight:2 }}>{curiosity}</div>
        </div>
      </div>
    </div>
  );
}

function RegionArt({ src, fallbackColors = ['#2B5D58','#4F8B78','#203A3B'], grayscale=false, height=128 }) {
  const sources = Array.isArray(src) ? src.filter(Boolean) : (src ? [src] : []);
  const [idx, setIdx] = useState(0);
  useEffect(()=>{ setIdx(0); }, [JSON.stringify(sources)]);
  const current = sources[idx];
  if (current) {
    return <img src={current} alt="" onError={()=>setIdx(i=>i+1)} style={{ width:'100%', height, objectFit:'cover', filter:grayscale?'grayscale(1) saturate(.1)':'none', display:'block' }} />;
  }
  return <div style={{ width:'100%', height, background:`linear-gradient(125deg, ${fallbackColors[0]}, ${fallbackColors[1]} 55%, ${fallbackColors[2]})`, filter:grayscale?'grayscale(1)':'none' }} />;
}


let COUNTRY_GEOJSON_CACHE = null;
let COUNTRY_GEOJSON_PROMISE = null;
const COUNTRY_GEOJSON_URLS = ['/geo/countries.geojson','/countries.geojson','/geo/countries-lowres.geojson','/countries-lowres.geojson'];
function useCountryGeoJson() {
  const [data, setData] = useState(COUNTRY_GEOJSON_CACHE);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    if (COUNTRY_GEOJSON_CACHE) { setData(COUNTRY_GEOJSON_CACHE); return; }
    if (!COUNTRY_GEOJSON_PROMISE) {
      COUNTRY_GEOJSON_PROMISE = (async () => {
        let lastErr;
        for (const url of COUNTRY_GEOJSON_URLS) {
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            COUNTRY_GEOJSON_CACHE = json;
            return json;
          } catch (err) { lastErr = err; }
        }
        throw lastErr;
      })();
    }
    COUNTRY_GEOJSON_PROMISE.then(json => { if (alive) setData(json); }).catch(err => { console.warn('[Animaldex] country geojson:', err); if (alive) setError(true); });
    return () => { alive = false; };
  }, []);
  return { data, error };
}
function getCountryFeatureIso2(feature) {
  const p = feature?.properties || {};
  return String(p.iso2 || p.ISO_A2 || p.iso_a2 || p.ADM0_A3 || '').toUpperCase();
}
function getCountryFeatureName(feature) {
  const p = feature?.properties || {};
  return p.name || p.NAME || p.name_en || p.sovereignt || '';
}

let BIOREGION_GEOJSON_CACHE = null;
let BIOREGION_GEOJSON_PROMISE = null;
const BIOREGION_GEOJSON_URLS = ['/geo/bioregions-v4-terrestrial-marine-kepler.geojson','/geo/bioregions-v4-terrestrial-marine-kepler.geojson.geojson','/geo/bioregions-v4-terrestrial-marine-kepler_paesi_med-atlantic-split.geojson','/bioregions-v4-terrestrial-marine-kepler.geojson','/bioregions-v4-terrestrial-marine-kepler.geojson.geojson','/bioregions-v4-terrestrial-marine-kepler_paesi_med-atlantic-split.geojson'];
function useBioregionGeoJson() {
  const [data, setData] = useState(BIOREGION_GEOJSON_CACHE);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    if (BIOREGION_GEOJSON_CACHE) { setData(BIOREGION_GEOJSON_CACHE); return; }
    if (!BIOREGION_GEOJSON_PROMISE) {
      BIOREGION_GEOJSON_PROMISE = (async () => {
        let lastErr;
        for (const url of BIOREGION_GEOJSON_URLS) {
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            BIOREGION_GEOJSON_CACHE = json;
            return json;
          } catch (err) { lastErr = err; }
        }
        throw lastErr;
      })();
    }
    BIOREGION_GEOJSON_PROMISE.then(json => { if (alive) setData(json); }).catch(err => { console.warn('[Animaldex] bioregion geojson:', err); if (alive) setError(true); });
    return () => { alive = false; };
  }, []);
  return { data, error };
}
function getFeatureBioregionId(feature) {
  const p = feature?.properties || {};
  return p.bioregion_id || p.unit_id || p.id || p.ID;
}
function projectLonLat(lon, lat) {
  const x = ((Number(lon) + 180) / 360) * 1000;
  const y = ((90 - Number(lat)) / 180) * 500;
  return [Number.isFinite(x) ? x : 0, Number.isFinite(y) ? y : 0];
}
function ringToSvgPath(ring = [], maxPoints = 120) {
  if (!ring.length) return '';
  const step = Math.max(1, Math.ceil(ring.length / maxPoints));
  const pts = ring.filter((_,i)=>i % step === 0 || i === ring.length - 1).map(([lon,lat]) => projectLonLat(lon,lat));
  if (!pts.length) return '';
  return `M${pts.map(([x,y])=>`${x.toFixed(1)},${y.toFixed(1)}`).join('L')}Z`;
}
function geometryToSvgPath(geometry, maxPoints = 120) {
  if (!geometry) return '';
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
  return polys.map(poly => (poly || []).map(ring => ringToSvgPath(ring, maxPoints)).join('')).join('');
}
function geometryProjectedBounds(geometry) {
  if (!geometry) return null;
  const coords = geometry.type === 'Polygon' ? geometry.coordinates : geometry.type === 'MultiPolygon' ? geometry.coordinates.flat(1) : [];
  let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
  const visitRing = (ring) => {
    (ring || []).forEach(([lon,lat]) => {
      const [x,y] = projectLonLat(lon,lat);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      minX = Math.min(minX,x); maxX = Math.max(maxX,x);
      minY = Math.min(minY,y); maxY = Math.max(maxY,y);
    });
  };
  (coords || []).forEach(polyOrRing => {
    if (Array.isArray(polyOrRing?.[0]?.[0])) polyOrRing.forEach(visitRing);
    else visitRing(polyOrRing);
  });
  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}
function mergeProjectedBounds(bounds = []) {
  const valid = bounds.filter(Boolean);
  if (!valid.length) return null;
  return valid.reduce((acc,b)=>({
    minX:Math.min(acc.minX,b.minX), minY:Math.min(acc.minY,b.minY),
    maxX:Math.max(acc.maxX,b.maxX), maxY:Math.max(acc.maxY,b.maxY),
  }), { minX:Infinity, minY:Infinity, maxX:-Infinity, maxY:-Infinity });
}
function pointProjectedBounds(points = [], radiusX=34, radiusY=24) {
  const valid = points.filter(p => Number.isFinite(p?.lon) && Number.isFinite(p?.lat));
  if (!valid.length) return null;
  const projected = valid.map(p => {
    const [x,y] = projectLonLat(p.lon, p.lat);
    return { x, y };
  });
  return projected.reduce((acc,p)=>({
    minX:Math.min(acc.minX,p.x - radiusX), minY:Math.min(acc.minY,p.y - radiusY),
    maxX:Math.max(acc.maxX,p.x + radiusX), maxY:Math.max(acc.maxY,p.y + radiusY),
  }), { minX:Infinity, minY:Infinity, maxX:-Infinity, maxY:-Infinity });
}
const MAPLIBRE_VERSION = '5.7.1';
const MAPLIBRE_JS_URL = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js`;
const MAPLIBRE_CSS_URL = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`;
const GEBCO_WMS_TILE_URL = 'https://wms.gebco.net/mapserv?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=GEBCO_Latest_2&STYLES=&FORMAT=image/png&TRANSPARENT=false&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}';
const ANIMALDEX_PHYSICAL_GLOBE_STYLE = {
  version: 8,
  projection: { type:'globe' },
  sources: {
    gebcoPhysical: {
      type:'raster',
      tiles:[GEBCO_WMS_TILE_URL],
      tileSize:256,
      attribution:'GEBCO',
    },
  },
  layers: [
    { id:'animaldex-space', type:'background', paint:{ 'background-color':'#03070D' } },
    {
      id:'gebco-physical',
      type:'raster',
      source:'gebcoPhysical',
      paint:{
        'raster-opacity':1,
        'raster-saturation':0.1,
        'raster-contrast':0.04,
      },
    },
  ],
};
let MAPLIBRE_PROMISE = null;

function loadMapLibreRuntime() {
  if (typeof window === 'undefined') return Promise.reject(new Error('MapLibre richiede il browser'));
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  if (MAPLIBRE_PROMISE) return MAPLIBRE_PROMISE;
  MAPLIBRE_PROMISE = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${MAPLIBRE_CSS_URL}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = MAPLIBRE_CSS_URL;
      document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[src="${MAPLIBRE_JS_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.maplibregl));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = MAPLIBRE_JS_URL;
    script.async = true;
    script.onload = () => window.maplibregl ? resolve(window.maplibregl) : reject(new Error('MapLibre non disponibile'));
    script.onerror = () => reject(new Error('Caricamento MapLibre fallito'));
    document.head.appendChild(script);
  });
  return MAPLIBRE_PROMISE;
}

function geometryLngLatBounds(geometry) {
  if (!geometry) return null;
  let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
  const visit = (coord) => {
    const lon = Number(coord?.[0]);
    const lat = Number(coord?.[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return;
    minX = Math.min(minX, lon); maxX = Math.max(maxX, lon);
    minY = Math.min(minY, lat); maxY = Math.max(maxY, lat);
  };
  const walk = (coords) => {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === 'number') visit(coords);
    else coords.forEach(walk);
  };
  walk(geometry.coordinates);
  if (!Number.isFinite(minX)) return null;
  return [minX, minY, maxX, maxY];
}
function mergeLngLatBounds(bounds = []) {
  const valid = bounds.filter(Boolean);
  if (!valid.length) return null;
  return valid.reduce((acc,b)=>[
    Math.min(acc[0], b[0]), Math.min(acc[1], b[1]),
    Math.max(acc[2], b[2]), Math.max(acc[3], b[3])
  ], [Infinity, Infinity, -Infinity, -Infinity]);
}
function padLngLatBounds(bounds, padRatio=.12) {
  if (!bounds) return null;
  const [minX,minY,maxX,maxY] = bounds;
  const dx = Math.max(.4, maxX - minX);
  const dy = Math.max(.4, maxY - minY);
  return [
    Math.max(-179.5, minX - dx * padRatio),
    Math.max(-84, minY - dy * padRatio),
    Math.min(179.5, maxX + dx * padRatio),
    Math.min(84, maxY + dy * padRatio),
  ];
}
function pointLngLatBounds(points = [], radiusLon=4, radiusLat=3) {
  const valid = points.filter(p => Number.isFinite(p?.lon) && Number.isFinite(p?.lat));
  if (!valid.length) return null;
  return valid.reduce((acc,p)=>[
    Math.min(acc[0], p.lon - radiusLon), Math.min(acc[1], p.lat - radiusLat),
    Math.max(acc[2], p.lon + radiusLon), Math.max(acc[3], p.lat + radiusLat),
  ], [Infinity, Infinity, -Infinity, -Infinity]);
}
function featureCollection(features = []) {
  return { type:'FeatureCollection', features:features.filter(f => f?.geometry) };
}
function cloneFeatureWithProps(feature, extra = {}) {
  return { ...feature, properties:{ ...(feature?.properties || {}), ...extra } };
}
function boundsAreGlobalEnoughForSpin(bounds) {
  if (!bounds) return true;
  const [minLon, minLat, maxLon, maxLat] = bounds;
  return (maxLon - minLon) > 118 || (maxLat - minLat) > 56;
}
function MapLibreGeoJsonMap({
  data,
  activeFeatureIds = [],
  selectedId = null,
  getFeatureId = getFeatureBioregionId,
  onFeatureClick,
  points = [],
  pointMode = false,
  height = 230,
  fullscreen = false,
  onCloseFullscreen,
  title = '',
  label = '',
  accent = '#A84637',
  marine = false,
  onOpenFullscreen,
  fitBounds,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const loadedRef = useRef(false);
  const spinFrameRef = useRef(null);
  const userInteractionRef = useRef(0);
  const activeSet = useMemo(() => new Set((activeFeatureIds || []).map(String)), [JSON.stringify(activeFeatureIds || [])]);
  const mapData = useMemo(() => {
    const features = (data?.features || []).map(f => {
      const id = String(getFeatureId(f) || '');
      return cloneFeatureWithProps(f, { __animaldex_id:id, __animaldex_active:activeSet.has(id), __animaldex_selected:selectedId && String(selectedId) === id });
    });
    return featureCollection(features);
  }, [data, activeSet, selectedId, getFeatureId]);
  const markerData = useMemo(() => featureCollection(points.map(p => ({
    type:'Feature',
    properties:{ code:p.code, name:getCountryDisplayName(p.code), __animaldex_active:true, __animaldex_selected:p.code === selectedId },
    geometry:{ type:'Point', coordinates:[p.lon, p.lat] }
  })).filter(f => Number.isFinite(f.geometry.coordinates[0]) && Number.isFinite(f.geometry.coordinates[1]))), [points, selectedId]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let map;
    loadMapLibreRuntime().then((maplibregl) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      map = new maplibregl.Map({
        container: containerRef.current,
        style: ANIMALDEX_PHYSICAL_GLOBE_STYLE,
        center:[12, 18],
        zoom:1.1,
        minZoom:0.7,
        maxZoom:9,
        attributionControl:false,
        dragRotate:false,
        pitchWithRotate:false,
        touchPitch:false,
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass:false }), 'bottom-right');
      try { map.setProjection?.({ type:'globe' }); } catch (err) { console.warn('[Animaldex] Globe projection:', err); }
      map.on('load', () => {
        if (cancelled) return;
        loadedRef.current = true;
        map.addSource('animaldex-polygons', { type:'geojson', data:mapData });
        map.addSource('animaldex-points', { type:'geojson', data:markerData });
        map.addLayer({ id:'animaldex-base-fill', type:'fill', source:'animaldex-polygons', paint:{ 'fill-color': marine ? '#153C4D' : '#735343', 'fill-opacity': marine ? .18 : .24 } });
        map.addLayer({ id:'animaldex-base-line', type:'line', source:'animaldex-polygons', paint:{ 'line-color': marine ? 'rgba(120,210,245,.28)' : 'rgba(255,255,255,.16)', 'line-width':.75 } });
        map.addLayer({ id:'animaldex-active-fill', type:'fill', source:'animaldex-polygons', filter:['==', ['get','__animaldex_active'], true], paint:{ 'fill-color':accent, 'fill-opacity':['case', ['==', ['get','__animaldex_selected'], true], .78, .52] } });
        map.addLayer({ id:'animaldex-active-line', type:'line', source:'animaldex-polygons', filter:['==', ['get','__animaldex_active'], true], paint:{ 'line-color':'#FFE0D4', 'line-width':['interpolate', ['linear'], ['zoom'], 1, 1.5, 6, 4.5] } });
        map.addLayer({ id:'animaldex-point-halo', type:'circle', source:'animaldex-points', paint:{ 'circle-radius':['case', ['==', ['get','__animaldex_selected'], true], 18, 12], 'circle-color':'rgba(114,214,255,.20)', 'circle-stroke-color':'#72D6FF', 'circle-stroke-width':2 } });
        map.addLayer({ id:'animaldex-point-dot', type:'circle', source:'animaldex-points', paint:{ 'circle-radius':['case', ['==', ['get','__animaldex_selected'], true], 7, 5], 'circle-color':'#72D6FF', 'circle-stroke-color':'white', 'circle-stroke-width':1 } });
        map.on('click', 'animaldex-active-fill', (e) => {
          const f = e.features?.[0];
          if (f) onFeatureClick?.(f.properties?.__animaldex_id, f.properties);
        });
        map.on('click', 'animaldex-point-dot', (e) => {
          const f = e.features?.[0];
          if (f) onFeatureClick?.(f.properties?.code, f.properties);
        });
        ['animaldex-active-fill','animaldex-point-dot','animaldex-point-halo'].forEach(id => {
          map.on('mouseenter', id, () => { map.getCanvas().style.cursor = 'pointer'; });
          map.on('mouseleave', id, () => { map.getCanvas().style.cursor = ''; });
        });
        const markUserInteraction = () => { userInteractionRef.current = Date.now(); };
        const canvas = map.getCanvas();
        ['wheel','mousedown','touchstart','pointerdown'].forEach(eventName => canvas.addEventListener(eventName, markUserInteraction, { passive:true }));
        setReady(true);
      });
      map.on('error', (evt) => console.warn('[Animaldex] MapLibre:', evt?.error || evt));
    }).catch(err => {
      console.warn('[Animaldex] MapLibre runtime:', err);
      if (!cancelled) setError(err?.message || 'Mappa non disponibile');
    });
    return () => {
      cancelled = true;
      if (spinFrameRef.current) cancelAnimationFrame(spinFrameRef.current);
      spinFrameRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        loadedRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    map.getSource('animaldex-polygons')?.setData(mapData);
    map.getSource('animaldex-points')?.setData(markerData);
  }, [mapData, markerData]);

  const recenter = () => {
    const map = mapRef.current;
    if (!map) return;
    const target = padLngLatBounds(fitBounds, fullscreen ? .10 : .18) || [-170,-58,170,76];
    map.fitBounds([[target[0], target[1]], [target[2], target[3]]], { padding:fullscreen ? 58 : 26, duration:900, maxZoom:fullscreen ? 6.4 : 4.2 });
  };
  useEffect(() => {
    if (!ready) return;
    recenter();
  }, [ready, fitBounds, fullscreen]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    if (spinFrameRef.current) cancelAnimationFrame(spinFrameRef.current);
    const canSpin = boundsAreGlobalEnoughForSpin(fitBounds);
    let previous = performance.now();
    const spin = (now) => {
      const elapsed = Math.min(80, now - previous);
      previous = now;
      const quietFor = Date.now() - userInteractionRef.current;
      const isOverview = map.getZoom() < (fullscreen ? 2.35 : 1.95);
      if (canSpin && quietFor > 2800 && isOverview && !map.isMoving() && !map.isZooming() && !map.isRotating()) {
        const center = map.getCenter();
        map.setCenter([center.lng + elapsed * 0.00115, center.lat]);
      }
      spinFrameRef.current = requestAnimationFrame(spin);
    };
    spinFrameRef.current = requestAnimationFrame(spin);
    return () => {
      if (spinFrameRef.current) cancelAnimationFrame(spinFrameRef.current);
      spinFrameRef.current = null;
    };
  }, [ready, fitBounds, fullscreen]);

  return (
    <div onClick={() => !fullscreen && onOpenFullscreen?.()} style={{ position:'relative', width:'100%', height:fullscreen?'100%':height, minHeight:fullscreen?undefined:Math.min(Number(height) || 230, 230), borderRadius:fullscreen?0:16, overflow:'hidden', background:'#03070D', border:fullscreen?'none':'1px solid rgba(255,255,255,.09)', cursor:fullscreen?'grab':'zoom-in', boxShadow:fullscreen?'none':'inset 0 0 48px rgba(0,0,0,.48)' }}>
      <div ref={containerRef} style={{ position:'absolute', inset:0 }} />
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', boxShadow:'inset 0 0 34px rgba(0,0,0,.55), inset 0 0 86px rgba(0,0,0,.36)' }} />
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', mixBlendMode:'screen', opacity:marine ? .18 : .12, background:'radial-gradient(ellipse at 34% 28%, rgba(255,255,255,.22), transparent 26%), radial-gradient(ellipse at 72% 68%, rgba(54,132,178,.18), transparent 38%)' }} />
      {!ready && !error && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.58)', fontSize:11, fontWeight:900, background:'linear-gradient(135deg,rgba(14,32,42,.94),rgba(5,8,12,.94))' }}>Caricamento mappa interattiva...</div>}
      {error && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.68)', fontSize:11, fontWeight:900, textAlign:'center', padding:18, background:'linear-gradient(135deg,#151515,#07131F)' }}>{error}</div>}
      {title && <div style={{ position:'absolute', left:12, top:10, color:'white', fontSize:12, fontWeight:1000, textShadow:'0 2px 10px rgba(0,0,0,.85)', pointerEvents:'none' }}>{title}</div>}
      <div style={{ position:'absolute', right:10, top:10, display:'flex', gap:6 }}>
        <button data-sound="map" onClick={(e)=>{e.stopPropagation();recenter();}} aria-label="Ricentra mappa" style={{ width:36, height:36, borderRadius:12, border:'1px solid rgba(255,255,255,.14)', background:'rgba(0,0,0,.54)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16, fontWeight:900, lineHeight:1, padding:0 }}>⌖</button>
        {fullscreen && <button data-sound="back" onClick={(e)=>{e.stopPropagation(); onCloseFullscreen?.();}} aria-label="Chiudi mappa" style={{ width:36, height:36, borderRadius:12, border:'1px solid rgba(255,255,255,.14)', background:'rgba(0,0,0,.54)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:18, fontWeight:900, lineHeight:1, padding:0 }}>×</button>}
      </div>
      {label && <div style={{ position:'absolute', left:10, right:10, bottom:10, background:'rgba(0,0,0,.58)', border:'1px solid rgba(255,255,255,.10)', borderRadius:14, padding:'8px 10px', color:'white', fontSize:11, fontWeight:900, backdropFilter:'blur(6px)', pointerEvents:'none' }}>{label}</div>}
      <div className="gebco-map-label">GEBCO physical globe</div>
    </div>
  );
}
let SPECIES_RANGE_INDEX_CACHE = null;
let SPECIES_RANGE_INDEX_PROMISE = null;
const SPECIES_RANGE_INDEX_URL = '/data/species-ranges/index.json';
function scientificRangeKey(value) {
  return String(value || '').trim().toLowerCase();
}
async function fetchJsonMaybeGzip(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const encoding = String(res.headers.get('content-encoding') || '').toLowerCase();
  const type = String(res.headers.get('content-type') || '').toLowerCase();
  if (encoding.includes('gzip') || type.includes('json')) return res.json();
  const buffer = await res.arrayBuffer();
  if (typeof DecompressionStream !== 'undefined') {
    const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).json();
  }
  const text = new TextDecoder().decode(buffer);
  return JSON.parse(text);
}
function useSpeciesRange(animal) {
  const sci = scientificRangeKey(animal?.sci || animal?.scientific_name);
  const [state, setState] = useState({ meta:null, data:null, loading:false, error:null });
  useEffect(() => {
    let alive = true;
    if (!sci) { setState({ meta:null, data:null, loading:false, error:null }); return; }
    setState(prev => ({ ...prev, loading:true, error:null }));
    if (!SPECIES_RANGE_INDEX_PROMISE) {
      SPECIES_RANGE_INDEX_PROMISE = fetch(SPECIES_RANGE_INDEX_URL)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(json => {
          SPECIES_RANGE_INDEX_CACHE = json;
          return json;
        });
    }
    SPECIES_RANGE_INDEX_PROMISE
      .then(index => {
        const meta = index?.[sci] || null;
        if (!meta) return { meta:null, data:null };
        return fetchJsonMaybeGzip(meta.url).then(data => ({ meta, data }));
      })
      .then(next => { if (alive) setState({ ...next, loading:false, error:null }); })
      .catch(err => { console.warn('[Animaldex] range specie:', err); if (alive) setState({ meta:null, data:null, loading:false, error:err }); });
    return () => { alive = false; };
  }, [sci]);
  return state;
}
function SpeciesRangeMap({ animal, fallbackCountryMap, accentColor }) {
  const { meta, data, loading } = useSpeciesRange(animal);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const features = data?.features || [];
  const rangeData = useMemo(() => featureCollection(features.map((f, idx) => cloneFeatureWithProps(f, { __range_id:`range-${idx}` }))), [data]);
  const activeIds = useMemo(() => features.map((_, idx) => `range-${idx}`), [features.length]);
  const bounds = meta?.bbox || mergeLngLatBounds(features.map(f => geometryLngLatBounds(f.geometry)));
  if (!data || !features.length) {
    return fallbackCountryMap || (
      <div style={{ height:280, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.52)', fontSize:11, fontWeight:900 }}>
        {loading ? 'Caricamento distribuzione...' : 'Distribuzione non disponibile'}
      </div>
    );
  }
  return (
    <>
      <MapLibreGeoJsonMap
        data={rangeData}
        activeFeatureIds={activeIds}
        getFeatureId={(f)=>f?.properties?.__range_id}
        height={280}
        title="Distribuzione specie"
        label={`${meta.sci_name || animal?.sci || 'Specie'} · ${meta.n_features || features.length} aree`}
        accent={accentColor}
        marine={!!meta.marine}
        fitBounds={bounds}
        onOpenFullscreen={()=>setIsFullscreen(true)}
      />
      {isFullscreen && (
        <div onClick={()=>setIsFullscreen(false)} style={{ position:'fixed', inset:0, zIndex:380, background:'rgba(0,0,0,.94)', padding:'calc(env(safe-area-inset-top, 0px) + 10px) 10px calc(env(safe-area-inset-bottom, 0px) + 10px)', boxSizing:'border-box' }}>
          <div onClick={e=>e.stopPropagation()} style={{ width:'100%', height:'100%', borderRadius:18, overflow:'hidden', background:'#07131F', border:'1px solid rgba(255,255,255,.10)' }}>
            <MapLibreGeoJsonMap
              data={rangeData}
              activeFeatureIds={activeIds}
              getFeatureId={(f)=>f?.properties?.__range_id}
              fullscreen
              onCloseFullscreen={()=>setIsFullscreen(false)}
              title="Distribuzione specie"
              label={`${meta.sci_name || animal?.sci || 'Specie'} · ${meta.n_features || features.length} aree`}
              accent={accentColor}
              marine={!!meta.marine}
              fitBounds={bounds}
            />
          </div>
        </div>
      )}
    </>
  );
}
function boundsToViewBox(b, padRatio=.34) {
  if (!b) return '0 0 1000 500';
  let w = Math.max(95, b.maxX - b.minX);
  let h = Math.max(70, b.maxY - b.minY);
  const pad = Math.max(w,h) * padRatio;
  let x = Math.max(0, b.minX - pad);
  let y = Math.max(0, b.minY - pad);
  w = Math.min(1000 - x, w + pad * 2);
  h = Math.min(500 - y, h + pad * 2);
  if (w < 180) { const d=(180-w)/2; x=Math.max(0,x-d); w=Math.min(1000-x,180); }
  if (h < 120) { const d=(120-h)/2; y=Math.max(0,y-d); h=Math.min(500-y,120); }
  return `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
}

function BioregionVectorMap({ highlightIds = [], highlightIsoCodes = [], selectedId=null, onSelect, clickable=false, height=180, accent='#A84637', marine=false, showLabels=false, fullBleed=false, fullscreen=false, onCloseFullscreen }) {
  const { data, error } = useBioregionGeoJson();
  const highlightSet = new Set((highlightIds || []).map(String));
  const isoHighlightSet = new Set((highlightIsoCodes || []).map(code => String(code).toUpperCase()).filter(Boolean));
  const features = data?.features || [];
  const [hoverId, setHoverId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapControls = useInteractiveMapControls(1, fullscreen ? 8 : 4.5, 1, { allowPanAtMin:fullscreen, panLimitX:fullscreen ? 420 : 190, panLimitY:fullscreen ? 260 : 120 });
  const relevant = features.filter(f => {
    const p = f.properties || {};
    if (marine) return p.domain === 'marine';
    return p.domain !== 'marine';
  });
  const featureIso2 = (feature) => String(feature?.properties?.countries_iso2 || '')
    .split(/[;,\s]+/)
    .map(v => v.trim().toUpperCase())
    .filter(Boolean);
  const isActiveFeature = (f) => {
    const id = String(getFeatureBioregionId(f) || '');
    const isoActive = isoHighlightSet.size > 0 && featureIso2(f).some(code => isoHighlightSet.has(code));
    return highlightSet.has(id) || isoActive;
  };
  const activeFeatures = relevant.filter(isActiveFeature);
  const viewBox = boundsToViewBox(mergeProjectedBounds(activeFeatures.map(f => geometryProjectedBounds(f.geometry))), activeFeatures.length > 2 ? .08 : .14);
  const openFullscreen = () => { if (!fullscreen) setIsFullscreen(true); };

  if (!data && !error) {
    return <div style={{ height, borderRadius:fullBleed?0:16, background:'linear-gradient(135deg,#1B1513,#2B1713)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.50)', fontSize:11, fontWeight:800 }}>Caricamento mappa vettoriale…</div>;
  }
  if (error) {
    return <div style={{ height, borderRadius:fullBleed?0:16, background:'linear-gradient(135deg,#1B1513,#2B1713)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.55)', fontSize:11, fontWeight:800, textAlign:'center', padding:18 }}>Mappa vettoriale non trovata. Verifica public/geo/bioregions-v4-terrestrial-marine-kepler.geojson.</div>;
  }
  const activeIds = activeFeatures.map(f => String(getFeatureBioregionId(f) || '')).filter(Boolean);
  const mapLibreBounds = mergeLngLatBounds(activeFeatures.map(f => geometryLngLatBounds(f.geometry)));
  const mapLibreLabel = showLabels && (hoverId || selectedId)
    ? (BIOREGION_V4_BY_ID[hoverId || selectedId]?.label || hoverId || selectedId)
    : '';
  if (data) {
    return (
      <>
        <MapLibreGeoJsonMap
          data={featureCollection(relevant)}
          activeFeatureIds={activeIds}
          selectedId={selectedId}
          getFeatureId={getFeatureBioregionId}
          onFeatureClick={(id, props)=>clickable && onSelect?.(id, props)}
          height={fullscreen ? undefined : height}
          fullscreen={fullscreen}
          onCloseFullscreen={onCloseFullscreen}
          title={marine ? 'Dominio marino' : ''}
          label={mapLibreLabel}
          accent={accent}
          marine={marine}
          fitBounds={mapLibreBounds}
          onOpenFullscreen={openFullscreen}
        />
        {isFullscreen && (
          <div onClick={()=>setIsFullscreen(false)} style={{ position:'fixed', inset:0, zIndex:380, background:'rgba(0,0,0,.94)', padding:'calc(env(safe-area-inset-top, 0px) + 10px) 10px calc(env(safe-area-inset-bottom, 0px) + 10px)', boxSizing:'border-box' }}>
            <div onClick={e=>e.stopPropagation()} style={{ width:'100%', height:'100%', borderRadius:18, overflow:'hidden', background:marine?'#061923':'#130C0A', border:'1px solid rgba(255,255,255,.10)' }}>
              <BioregionVectorMap highlightIds={highlightIds} highlightIsoCodes={highlightIsoCodes} selectedId={selectedId} onSelect={onSelect} clickable={clickable} accent={accent} marine={marine} showLabels={showLabels} fullBleed fullscreen onCloseFullscreen={()=>setIsFullscreen(false)} />
            </div>
          </div>
        )}
      </>
    );
  }
  const seabedBackground = "radial-gradient(ellipse at 44% 40%, rgba(72,157,187,.42) 0 9%, transparent 24%), radial-gradient(ellipse at 62% 64%, rgba(18,76,118,.54) 0 16%, transparent 38%), linear-gradient(135deg, rgba(98,177,188,.22) 0 10%, transparent 10% 21%, rgba(31,95,132,.24) 21% 28%, transparent 28% 45%, rgba(8,45,81,.34) 45% 54%, transparent 54%), url('/mappaGEBCO.png'), url('/mappaGEBCO.jpg'), url('/geo/mappaGEBCO.png'), url('/geo/mappaGEBCO.jpg'), radial-gradient(circle at 50% 45%,#1D607E,#08283A 55%,#02070B)";
  return (
    <>
    <div
      {...mapControls.handlers}
      onClick={openFullscreen}
	      style={{ position:'relative', height:fullscreen?'100%':height, borderRadius:fullscreen||fullBleed?0:16, overflow:'hidden', background: marine ? seabedBackground : 'radial-gradient(circle at 50% 45%,#2A1C18,#130C0A 58%,#050303)', backgroundSize: marine ? 'cover, cover, cover, cover, cover, cover, cover, cover' : undefined, backgroundPosition: marine ? 'center' : undefined, border:(fullscreen||fullBleed)?'none':'1px solid rgba(255,255,255,.10)', boxShadow:'inset 0 0 44px rgba(0,0,0,.55)', touchAction:fullscreen || mapControls.zoom > 1.01 ? 'none' : 'pan-y', cursor:fullscreen?'grab':'zoom-in' }}
    >
      <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
        <defs>
          <filter id="bioSatNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="11" result="n"/>
            <feColorMatrix in="n" type="saturate" values="0"/>
            <feComponentTransfer><feFuncA type="table" tableValues="0 0.14"/></feComponentTransfer>
          </filter>
          <radialGradient id="bioOcean" cx="50%" cy="45%" r="75%"><stop offset="0%" stopColor="#102630"/><stop offset="62%" stopColor="#0B0A09"/><stop offset="100%" stopColor="#030202"/></radialGradient>
        </defs>
        <g style={{ transform:mapControls.transform, transformOrigin:'50% 50%' }}>
        <rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#bioOcean)" opacity={marine ? .18 : 1} />
        <rect x="-2000" y="-2000" width="5000" height="5000" filter="url(#bioSatNoise)" opacity={marine ? .32 : .6} />
        <g opacity=".22">
          <path d="M0 110 C160 60 250 130 390 92 S660 62 1000 132" fill="none" stroke="#C87555" strokeWidth="1.2" />
          <path d="M0 375 C150 325 320 404 498 350 S760 330 1000 400" fill="none" stroke="#C87555" strokeWidth="1.2" />
        </g>
        <g>
          {relevant.map(f => {
            const id = String(getFeatureBioregionId(f) || '');
            const active = isActiveFeature(f);
            const selected = selectedId === id || hoverId === id;
            const d = geometryToSvgPath(f.geometry, active ? 260 : 100);
            if (!d) return null;
            return <path key={id} d={d} onClick={clickable ? ()=>onSelect?.(id, f.properties) : undefined} onMouseEnter={()=>setHoverId(id)} onMouseLeave={()=>setHoverId(null)} style={{ cursor:clickable?'pointer':'default' }} fill={active ? accent : (marine ? 'rgba(64,90,100,.42)' : 'rgba(82,58,45,.48)')} stroke={active ? '#FFD0B7' : 'rgba(110,210,245,.18)'} strokeWidth={active ? 1.55 : 0.42} opacity={active ? 0.95 : selected ? .66 : .50} />;
          })}
        </g>
        </g>
      </svg>
      {marine && <div className="gebco-map-label">fondali GEBCO</div>}
      <button data-sound="map" onClick={(e)=>{e.stopPropagation(); mapControls.reset();}} aria-label="Ricentra mappa" style={{ position:'absolute', right:10, top:10, width:34, height:34, borderRadius:12, border:'1px solid rgba(255,255,255,.13)', background:'rgba(0,0,0,.45)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16, fontWeight:900, lineHeight:1, padding:0 }}>⌖</button>
      {fullscreen && <button data-sound="back" onClick={(e)=>{e.stopPropagation(); onCloseFullscreen?.();}} aria-label="Chiudi mappa" style={{ position:'absolute', right:50, top:10, width:34, height:34, borderRadius:12, border:'1px solid rgba(255,255,255,.13)', background:'rgba(0,0,0,.45)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:18, fontWeight:900, lineHeight:1, padding:0 }}>×</button>}
      {showLabels && (hoverId || selectedId) && <div style={{ position:'absolute', left:10, bottom:10, right:10, padding:'8px 10px', borderRadius:12, background:'rgba(0,0,0,.58)', color:'white', fontSize:11, fontWeight:900 }}>{BIOREGION_V4_BY_ID[hoverId || selectedId]?.label || hoverId || selectedId}</div>}
    </div>
    {isFullscreen && (
      <div onClick={()=>setIsFullscreen(false)} style={{ position:'fixed', inset:0, zIndex:380, background:'rgba(0,0,0,.94)', padding:'calc(env(safe-area-inset-top, 0px) + 10px) 10px calc(env(safe-area-inset-bottom, 0px) + 10px)', boxSizing:'border-box' }}>
        <div onClick={e=>e.stopPropagation()} style={{ width:'100%', height:'100%', borderRadius:18, overflow:'hidden', background:marine?'#061923':'#130C0A', border:'1px solid rgba(255,255,255,.10)' }}>
          <BioregionVectorMap highlightIds={highlightIds} highlightIsoCodes={highlightIsoCodes} selectedId={selectedId} onSelect={onSelect} clickable={clickable} accent={accent} marine={marine} showLabels={showLabels} fullBleed fullscreen onCloseFullscreen={()=>setIsFullscreen(false)} />
        </div>
      </div>
    )}
    </>
  );
}
function TerritoryCard({ item, title, subtitle, image, icon='🌍', accent='#90D84A', fallbackColors, locked=false, onUnlock, onOpen, openLabel='Apri', secondaryOpenLabel='', onSecondaryOpen, mapIds=[], mapDisabled=false }) {
  const [flipped, setFlipped] = useState(false);
  const isMarine = item?.realmType === 'marine' || item?.kind === 'marine';
  const ids = mapIds?.length ? mapIds : (item?.bioregionIds || (item?.bioregionId ? [item.bioregionId] : []));
  const coverSources = getRegionCoverSources(item, image || item?.image);
  const handleOpen = () => {
    if (locked) return;
    onOpen?.();
  };
  return (
    <div style={{ marginBottom:14, borderRadius:22, width:'100%', maxWidth:'100%', overflow:'hidden', height:flipped?356:204, perspective:900, cursor:locked?'default':'pointer', transition:'height .28s ease' }}>
      <div style={{ position:'relative', height:'100%', transition:'transform .35s ease', transformStyle:'preserve-3d', transform:flipped?'rotateY(180deg)':'rotateY(0deg)' }}>
        <div onClick={handleOpen} style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', borderRadius:22, overflow:'hidden', background:'#1A1A1C', border:'1px solid rgba(255,255,255,.08)' }}>
          <RegionArt src={coverSources} grayscale={locked} fallbackColors={fallbackColors || (isMarine ? ['#0B314A','#116B89','#051B2A'] : ['#30494D','#53706D','#1C2B2E'])} height={204} />
          <div style={{
            position:'absolute',
            left:0,
            right:0,
            bottom:0,
            minHeight:96,
            padding:'40px 16px 14px',
            boxSizing:'border-box',
            display:'flex',
            alignItems:'flex-end',
            gap:12,
            background:'linear-gradient(180deg, rgba(38,38,40,0) 0%, rgba(38,38,40,.26) 28%, rgba(38,38,40,.70) 62%, rgba(38,38,40,.98) 100%)'
          }}>
            <div style={{ flex:1, minWidth:0, textShadow:'0 2px 10px rgba(0,0,0,.72)' }}>
              <div style={{ color:'white', fontSize:18, fontWeight:1000, lineHeight:1.1 }}>{title || item?.label}</div>
              {subtitle && <div style={{ color:'rgba(255,255,255,.62)', fontSize:11.5, marginTop:4, lineHeight:1.25 }}>{subtitle}</div>}
            </div>
            {locked
              ? <button data-sound="map" onClick={e=>{e.stopPropagation();onUnlock?.();}} style={{ height:36, padding:'0 11px', borderRadius:12, border:'none', background:accent, color:'#071017', fontWeight:950, cursor:'pointer', flexShrink:0 }}>Sblocca</button>
              : (!mapDisabled && <button data-sound="map" onClick={e=>{e.stopPropagation();setFlipped(true);}} style={{ height:36, padding:'0 13px', borderRadius:12, border:'none', background:'#244A70', color:'white', fontWeight:950, cursor:'pointer', flexShrink:0 }}>Map</button>)}
          </div>
        </div>
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateY(180deg)', borderRadius:22, overflow:'hidden', background:'#101114', border:`1px solid ${accent}55`, padding:0, boxSizing:'border-box', boxShadow:'0 18px 60px rgba(0,0,0,.46)' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, padding:'12px 14px 10px', background:'linear-gradient(180deg, rgba(50,56,66,.98) 0%, rgba(30,34,42,.88) 44%, rgba(22,24,30,.50) 76%, rgba(16,17,20,0) 100%)', backdropFilter:'blur(8px)' }}>
            <div style={{ minWidth:0 }}>
              <div style={{ color:'white', fontSize:15, fontWeight:1000, lineHeight:1.08 }}>{title || item?.label}</div>
              {subtitle && <div style={{ color:'rgba(255,255,255,.56)', fontSize:10.5, lineHeight:1.28, marginTop:4 }}>{subtitle}</div>}
            </div>
            <button data-sound="back" onClick={e=>{e.stopPropagation();setFlipped(false);}} aria-label="Gira card" style={{ width:30, height:30, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.06)', color:'white', fontSize:15, fontWeight:900, cursor:'pointer', flexShrink:0, lineHeight:1, padding:0 }}>↺</button>
          </div>
          <div style={{ padding:'0 0 0', marginTop:-6 }}>
            <BioregionVectorMap highlightIds={ids} marine={isMarine} accent={'#A84637'} height={236} fullBleed />
          </div>
          <div style={{ display:'flex', gap:8, padding:'8px 12px 12px', background:'rgba(16,17,20,.98)', boxSizing:'border-box' }}>
            <button data-sound="back" onClick={e=>{e.stopPropagation();setFlipped(false);}} style={{ flex:1, height:34, borderRadius:12, border:'1px solid rgba(255,255,255,.10)', background:'linear-gradient(180deg,rgba(255,255,255,.060),rgba(255,255,255,.030))', color:'white', fontWeight:900 }}>Indietro</button>
            <button data-sound="tap" onClick={e=>{e.stopPropagation();setFlipped(false);onOpen?.();}} style={{ flex:1, height:34, borderRadius:12, border:'none', background:'#244A70', color:'white', fontWeight:950 }}>{openLabel}</button>
            {secondaryOpenLabel && <button data-sound="tap" onClick={e=>{e.stopPropagation();setFlipped(false);onSecondaryOpen?.();}} style={{ flex:1, height:34, borderRadius:12, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.06)', color:'white', fontWeight:950 }}>{secondaryOpenLabel}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AwardToast({ award, onOpen, onDismiss }) {
  const [imgErr, setImgErr] = useState(false);
  const touchStartY = useRef(null);
  const handleTouchStart = (e) => { touchStartY.current = e.touches?.[0]?.clientY ?? null; };
  const handleTouchEnd = (e) => {
    if (touchStartY.current == null) return;
    const endY = e.changedTouches?.[0]?.clientY ?? touchStartY.current;
    if (touchStartY.current - endY > 42) onDismiss?.();
    touchStartY.current = null;
  };
  return (
    <div style={{ position:'absolute', top:18, left:12, right:12, zIndex:200, display:'flex', justifyContent:'center', pointerEvents:'auto' }}>
      <div
        className="award-toast-sparkles"
        onClick={()=>onOpen?.(award)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ position:'relative', width:'100%', maxWidth:360, background:'rgba(18,18,22,.96)', border:'1px solid rgba(255,255,255,.12)', borderRadius:22, padding:'14px 16px', boxShadow:'0 16px 40px rgba(0,0,0,.38)', display:'flex', alignItems:'center', gap:14, cursor:'pointer', userSelect:'none' }}
      >
        <div style={{ width:64, height:64, borderRadius:16, background:'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
          {!imgErr ? <img src={award.image} alt={award.name} onError={()=>setImgErr(true)} style={{ width:56, height:56, objectFit:'contain' }} /> : <span style={{ fontSize:34 }}>🏅</span>}
        </div>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ color:'#F0C449', fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:.7 }}>Nuovo award ottenuto</div>
          <div style={{ color:'white', fontSize:16, fontWeight:900, lineHeight:1.2, marginTop:3 }}>{award.name}</div>
          <div style={{ color:'rgba(255,255,255,.55)', fontSize:11, marginTop:4 }}>{award.macro} · {award.goal}</div>
          <div style={{ color:'rgba(255,255,255,.35)', fontSize:10, marginTop:3 }}>Tocca per aprire · swipe su per chiudere</div>
        </div>
      </div>
    </div>
  );
}



function OperationalTutorialOverlay({ step, animal, onNext, onPrev, onFinish, onSkip }) {
  if (!step) return null;
  const OCHRE = '#A84637';
  const sequence = ['home','grid-status','grid-tools','grid-open','detail-overview','detail-metrics','detail-abilities','detail-status','home-finish'];
  const index = Math.max(0, sequence.indexOf(step));
  const pct = Math.round(((index + 1) / sequence.length) * 100);

  const copyMap = {
    home: {
      title:'La tua base',
      kicker:'Home',
      body:'La Home raccoglie il tuo livello, la missione consigliata, le scorciatoie rapide e l’accesso alle sezioni. Per iniziare davvero si entra nella griglia: è il catalogo operativo di Apex.',
      hint:'Tocca “Animaldex” nella navigazione evidenziata.',
      action:null,
    },
    'grid-status': {
      title:'I quattro stati',
      kicker:'Grid',
      body:'Misterioso significa che l’identità non è ancora rivelata. Ricercato indica una specie disponibile nel tuo percorso, ma non ancora vista. Avvistato è una specie che dichiari di aver visto dal vivo. Catturato è una specie confermata nel Dex, idealmente con foto.',
      hint:'Guarda i quattro filtri in alto: sono il modo più rapido per leggere il tuo progresso.',
      action:'Avanti',
    },
    'grid-tools': {
      title:'Cercare e filtrare',
      kicker:'Grid',
      body:'La griglia non è solo una lista. Puoi cercare per nome, aprire i filtri, ordinare, isolare una classe, una geografia, uno stato di conservazione o una famiglia di abilità. Quando il catalogo cresce, questi strumenti diventano la tua bussola.',
      hint:'I comandi evidenziati sono ricerca, ordinamento e filtri.',
      action:'Avanti',
    },
    'grid-open': {
      title:'Apri una scheda',
      kicker:'Grid',
      body:`Useremo ${animal?.com || 'il piccione'} come specie guida. Aprire una card è il gesto base: da lì trovi descrizione, biologia, statistiche, abilità, tassonomia e distribuzione.`,
      hint:'Tocca la card evidenziata.',
      action:null,
    },
    'detail-overview': {
      title:'Leggere un animale',
      kicker:'Scheda',
      body:'In alto trovi nome comune e nome scientifico. Subito sotto ci sono rarità, conservazione e status. La descrizione racconta come riconoscerlo; Biologia approfondisce comportamento, adattamenti e vita quotidiana.',
      hint:'Scorri la scheda: ogni blocco racconta un pezzo diverso della specie.',
      action:'Avanti',
    },
    'detail-metrics': {
      title:'Peso, dimensioni e ruolo',
      kicker:'Scheda',
      body:'Le tre card statistiche sono interattive. Peso apre il tachimetro, Dimensioni mostra il confronto di scala, la piramide spiega il ruolo alimentare nella rete trofica.',
      hint:'Tocca una delle tre card evidenziate per aprire lo zoom.',
      action:null,
    },
    'detail-abilities': {
      title:'Abilità e curiosità',
      kicker:'Scheda',
      body:'Le abilità sono il lato divulgativo di Apex: adattamenti, comportamenti e capacità fuori scala. Per esempio, i piccioni sanno distinguere immagini e pattern complessi, e in alcuni studi hanno imparato a separare stili pittorici come Picasso e Monet. Tocca una card abilità per girarla e leggere la curiosità.',
      hint:'Tocca una card abilità evidenziata.',
      action:null,
    },
    'detail-status': {
      title:'Avvistare e catturare',
      kicker:'Scheda',
      body:'Qui Apex inizia a diventare tuo. Una specie Ricercata è nel mirino; quando la incontri davvero passa ad Avvistata e il tuo percorso si aggiorna. Con una foto o una conferma completa diventa Catturata nel Dex. Ogni passo muove progressi, badge e profilo.',
      hint:'Tocca il tasto “Ho avvistato” evidenziato sulla scheda.',
      action:null,
    },
    'home-finish': {
      title:'Ora puoi esplorare',
      kicker:'Home',
      body:'Hai visto il percorso principale: Home, Grid e scheda animale. Le altre sezioni avranno una guida breve quando le aprirai per la prima volta, così impari nel momento giusto senza sovraccaricare l’inizio.',
      hint:'Fine del percorso principale.',
      action:'Chiudi',
    },
  };

  const copy = copyMap[step];
  if (!copy) return null;
  const noPrimary = ['home','grid-open','detail-metrics','detail-abilities','detail-status'].includes(step);
  const primary = step === 'home-finish' ? onFinish : onNext;
  const panelPosition = step === 'grid-tools'
    ? { top:'calc(env(safe-area-inset-top, 0px) + 14px)' }
    : { bottom:'calc(env(safe-area-inset-bottom, 0px) + 18px)' };

  return (
    <div style={{ position:'absolute', inset:0, zIndex:260, pointerEvents:'none' }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 50% 28%, rgba(168,70,55,.08), rgba(0,0,0,.58) 42%, rgba(0,0,0,.72))', pointerEvents:'none' }} />
      <div style={{ position:'absolute', left:12, right:12, ...panelPosition, pointerEvents:'auto', maxHeight:'calc(var(--animaldex-app-height, 100dvh) - 42px)', overflowY:'auto', WebkitOverflowScrolling:'touch' }}>
        <div style={{ background:'linear-gradient(180deg,rgba(28,28,31,.98),rgba(12,12,14,.99))', border:`1px solid ${OCHRE}88`, borderRadius:28, padding:16, boxShadow:`0 24px 80px rgba(0,0,0,.62), 0 0 34px ${OCHRE}28`, overflow:'visible' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:52, height:52, borderRadius:20, background:`linear-gradient(135deg,${OCHRE},#6F2D24)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:1000, boxShadow:`0 0 28px ${OCHRE}55`, flexShrink:0 }}>A</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:OCHRE, fontSize:11, fontWeight:1000, textTransform:'uppercase', letterSpacing:.9 }}>{copy.kicker}</div>
              <div style={{ color:'white', fontSize:20, fontWeight:1000, letterSpacing:'-.4px', lineHeight:1.08, marginTop:3 }}>{copy.title}</div>
            </div>
            <div style={{ width:48, height:48, borderRadius:18, background:'rgba(255,255,255,.055)', border:'1px solid rgba(255,255,255,.08)', color:'rgba(255,255,255,.72)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:14, fontWeight:1000 }}>{index+1}</span>
              <span style={{ fontSize:9, fontWeight:900, color:'rgba(255,255,255,.38)' }}>/{sequence.length}</span>
            </div>
          </div>

          <div style={{ height:7, borderRadius:999, background:'rgba(255,255,255,.08)', overflow:'hidden', margin:'14px 0 12px' }}>
            <div style={{ width:`${pct}%`, height:'100%', borderRadius:999, background:`linear-gradient(90deg,${OCHRE},#F0A840)`, transition:'width .25s ease' }} />
          </div>

          <div style={{ color:'rgba(255,255,255,.76)', fontSize:13, lineHeight:1.55 }}>{copy.body}</div>

          {copy.hint && (
            <div style={{ marginTop:12, borderRadius:16, background:'rgba(240,168,64,.10)', border:'1px solid rgba(240,168,64,.24)', padding:'10px 11px', color:'#F0CFA5', fontSize:11.5, lineHeight:1.38, fontWeight:850 }}>
              {copy.hint}
            </div>
          )}

          <div style={{ display:'flex', gap:9, marginTop:14 }}>
            <button onClick={onSkip} style={{ height:44, padding:'0 12px', borderRadius:15, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.04)', color:'rgba(255,255,255,.62)', fontWeight:950, cursor:'pointer', fontFamily:'inherit' }}>Salta</button>
            {index > 0 && <button onClick={onPrev} style={{ height:44, padding:'0 12px', borderRadius:15, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.055)', color:'rgba(255,255,255,.82)', fontWeight:950, cursor:'pointer', fontFamily:'inherit' }}>Indietro</button>}
            {!noPrimary && <button onClick={primary} style={{ flex:1, height:44, borderRadius:15, border:'none', background:`linear-gradient(135deg,${OCHRE},#C45D3F)`, color:'white', fontWeight:1000, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 12px 32px ${OCHRE}40` }}>{copy.action}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionIntroModal({ section, onClose }) {
  if (!section) return null;
  const OCHRE = '#A84637';
  const copy = {
    regions:{ title:'Geografia', kicker:'Mini guida', body:'Apex organizza il mondo a livelli: Domini, cioè Terrestre e Marino; Continenti, come America o Eurasia; Regioni, grandi aree biogeografiche; Territori, cioè le nostre ecoregioni giocabili. I paesi servono come ingresso rapido, ma i Territori sono il livello più preciso: quando apri Alaska, Mediterraneo o Foreste boreali stai entrando in una unità ecologica con animali collegati a quell’ID bioregionale.' },
    badges:{ title:'Badge', kicker:'Mini guida', body:'Qui si colleziona sul serio. I badge sono divisi per categorie: Arsenale, Elite, Trofico, Geografia, Massa, Morfologia, Status, Tassonomia, Engagement e Onboarding. Ogni linea sale di livello: Bronzo principiante, Argento intermedio, Oro esperto e Viola leggenda. Tocca una card: dentro trovi obiettivo, progresso e quanto ti manca al prossimo colpo grosso.', action:'Scelgo un badge' },
    abilities:{ title:'Abilità', kicker:'Mini guida', body:'Le abilità sono i superpoteri biologici di Apex: veleno, mimetismo, intelligenza, velocità, migrazioni, corazze, record, vita estrema. Sono raggruppate per famiglia e ogni card mostra quanti animali la possiedono. Tocca un’abilità per aprire il dettaglio, poi puoi saltare alla griglia già filtrata con tutte le specie collegate.', action:'Scelgo un’abilità' },
    compare:{ title:'Comparatore', kicker:'Mini guida', body:'Il comparatore mette due animali fianco a fianco per confrontare dimensioni, peso, statistiche e ruolo ecologico. Usalo quando vuoi capire le differenze in modo immediato.' },
    profile:{ title:'Profilo', kicker:'Mini guida', body:'Il profilo riassume progressi, animali ricercati, avvistati e catturati, badge ottenuti e dati del tuo percorso. È la memoria personale del tuo Apex.' },
    friends:{ title:'Amici', kicker:'Mini guida', body:'Qui Animaldex diventa una spedizione condivisa: cerca altri giocatori solo per username, manda richieste, guarda i progressi degli amici e reagisci alle catture rare o leggendarie con messaggi preset. Niente chat e niente testo libero: più gioco, più privacy, meno rumore.' },
    gallery:{ title:'Galleria', kicker:'Mini guida', body:'La galleria raccoglie le immagini e le catture collegate al tuo percorso. È pensata come archivio visivo delle specie che hai documentato.' },
    lifeweb:{ title:'LifeWeb', kicker:'Mini guida', body:'LifeWeb mostra relazioni alimentari e ruoli ecologici. È una lettura della rete, non solo della singola specie: predatori, prede, risorse e connessioni.' },
    quickSeen:{ title:'Avvistamento rapido', kicker:'Mini guida', body:'È il modo più veloce per aggiornare l’Animaldex con gli animali che hai già avvistato. Apex ti propone specie ad alta probabilità in base alle nazioni visitate e alla facilità di incontro: tu rispondi al volo, il Dex si aggiorna e i progressi iniziano a correre.' },
  }[section];
  if (!copy) return null;
  return (
    <div style={{ position:'absolute', inset:0, zIndex:270, background:'rgba(0,0,0,.64)', display:'flex', alignItems:'flex-end', justifyContent:'center', padding:14 }}>
      <div style={{ width:'100%', maxWidth:440, borderRadius:26, background:'linear-gradient(180deg,rgba(30,30,34,.98),rgba(12,12,14,.99))', border:`1px solid ${OCHRE}88`, boxShadow:'0 24px 80px rgba(0,0,0,.55)', padding:18 }}>
        <div style={{ color:OCHRE, fontSize:11, fontWeight:1000, letterSpacing:.9, textTransform:'uppercase' }}>{copy.kicker}</div>
        <div style={{ color:'white', fontSize:23, fontWeight:1000, marginTop:5 }}>{copy.title}</div>
        <div style={{ color:'rgba(255,255,255,.72)', fontSize:13, lineHeight:1.55, marginTop:9 }}>{copy.body}</div>
        <button onClick={onClose} style={{ width:'100%', height:48, borderRadius:16, border:'none', background:`linear-gradient(135deg,${OCHRE},#C45D3F)`, color:'white', fontWeight:1000, marginTop:16 }}>{copy.action || 'Ho capito'}</button>
      </div>
    </div>
  );
}


function OnboardingFlow({ user, animals = [], initialNickname='', onComplete, onFinish }) {
  const OCHRE = '#A84637';
  const [step,setStep]=useState('intro');
  const [nickname,setNickname]=useState(initialNickname || String(user?.email || 'utente').split('@')[0] || 'Esploratore');
  const [countrySearch,setCountrySearch]=useState('');
  const [selectedCountries,setSelectedCountries]=useState([]);
  const [selectedTripTags,setSelectedTripTags]=useState(['nature']);
  const [gender,setGender]=useState('');
  const [nationality,setNationality]=useState('');
  const [phone,setPhone]=useState('');
  const [dateOfBirth,setDateOfBirth]=useState('');
  const [residenceCountry,setResidenceCountry]=useState('');
  const [objectives,setObjectives]=useState([]);
  const [objectiveOther,setObjectiveOther]=useState('');
  const [isCollector,setIsCollector]=useState('');
  const [annualAbroadVacations,setAnnualAbroadVacations]=useState('');
  const [consents,setConsents]=useState({ terms:false, analytics:false, marketing:false, personalization:false, newsletter:false });
  const [cardIndex,setCardIndex]=useState(0);
  const [seenAnimals,setSeenAnimals]=useState([]);
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState('');

  const steps = ['intro','identity','birth','location','goals','travel','countries','radar','review','sync','wow'];
  const stepIndex = Math.max(0, steps.indexOf(step));
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);
  const allCountries = useMemo(() => normalizeIsoList(getAllScratchCountries()), []);
  const filteredCountries = allCountries.filter(code => !countrySearch.trim() || getCountryDisplayName(code).toLowerCase().includes(countrySearch.toLowerCase()) || code.toLowerCase().includes(countrySearch.toLowerCase()));
  const animalCount = animals?.length || LOCAL_ANIMALS.length;
  const classCount = new Set((animals?.length ? animals : LOCAL_ANIMALS).map(a => a.cls).filter(Boolean)).size;
  const countryCount = allCountries.length;

  const radarAnimals = useMemo(() => {
    if (!selectedCountries.length) return [];
    const normalizedAnimals = animals.map(a => ({ ...(LOCAL_ANIMALS.find(x => Number(x.id) === Number(a.id)) || {}), ...a })).filter(a => a.image_url);
    const byCountry = selectedCountries.map(code => normalizedAnimals
      .filter(a => getAnimalCountryCodes(a).includes(String(code).toUpperCase()))
      .sort((a,b) => (RARITY[a.rarity]?.s || 1) - (RARITY[b.rarity]?.s || 1) || (b.obs_count || b.observations || 0) - (a.obs_count || a.observations || 0))
    );
    const picked = [];
    const seen = new Set();
    for (let round = 0; picked.length < 14 && round < 80; round++) {
      for (const list of byCountry) {
        const next = list.find(a => !seen.has(Number(a.id)));
        if (next) {
          seen.add(Number(next.id));
          picked.push(next);
          if (picked.length >= 14) break;
        }
      }
      if (byCountry.every(list => list.every(a => seen.has(Number(a.id))))) break;
    }
    if (picked.length < 14) {
      const selectedSet = new Set(selectedCountries.map(c => String(c).toUpperCase()));
      normalizedAnimals
        .filter(a => getAnimalCountryCodes(a).some(code => selectedSet.has(code)))
        .forEach(a => { if (picked.length < 14 && !seen.has(Number(a.id))) { seen.add(Number(a.id)); picked.push(a); } });
    }
    return picked.slice(0, 14);
  }, [animals, selectedCountries]);

  const currentAnimal = radarAnimals[cardIndex] || null;
  const predictedUnlocks = useMemo(() => {
    if (!selectedCountries.length) return 0;
    const set = new Set(selectedCountries);
    return animals.filter(a => {
      const iso = a.distribution?.countries_present || a.geo?.iso || a.iso || [];
      return iso.some(code => set.has(code));
    }).length;
  }, [animals, selectedCountries]);

  const toggleCountry = (code) => setSelectedCountries(prev => normalizeIsoList(prev.includes(code) ? prev.filter(x=>x!==code) : [...prev, code]));
  const toggleTripTag = (tag) => setSelectedTripTags(prev => prev.includes(tag) ? prev.filter(x=>x!==tag) : [...prev, tag]);

  const markRadar = (seen) => {
    if (seen && currentAnimal) setSeenAnimals(prev => Array.from(new Set([...prev, currentAnimal.id])));
    setCardIndex(i => i + 1);
  };
  const goBack = () => {
    if (step === 'intro' || step === 'sync') return;
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  };

  const runSync = async () => {
    setLoading(true);
    setError('');
    setStep('sync');
    const payload = { nickname, countries:normalizeIsoList(selectedCountries), seenAnimalIds:Array.from(new Set(seenAnimals)), tripTags:selectedTripTags, demographics:{
      gender,
      nationality,
      phone,
      date_of_birth:dateOfBirth,
      residence_country:residenceCountry,
      onboarding_objectives:objectives,
      onboarding_objective_other:objectiveOther,
      is_collector:isCollector === 'yes' ? true : isCollector === 'no' ? false : null,
      annual_abroad_vacations:annualAbroadVacations,
      pokemon_affinity:'',
      consent_terms_privacy:consents.terms,
      consent_analytics:consents.analytics,
      consent_marketing:consents.marketing,
      consent_personalization:consents.personalization,
      consent_newsletter:consents.newsletter,
    } };
    try {
      const timeoutResult = {
        ok:true,
        timed_out:true,
        unlocked_count:Math.max(predictedUnlocks, selectedCountries.length),
        seen_count:seenAnimals.length,
        badge_ids:['ONB-01-L1'],
      };
      const data = await Promise.race([
        Promise.resolve(onComplete?.(payload)),
        new Promise(resolve => setTimeout(() => resolve(timeoutResult), 16000))
      ]);
      setResult(data || timeoutResult);
      setStep('wow');
    } catch (err) {
      console.warn('[Animaldex] Onboarding sync failed:', err);
      setError(err?.message || 'Sincronizzazione non completata. Puoi riprovare o continuare: Apex tenterà di salvare in background.');
      setResult({ ok:false, unlocked_count:Math.max(predictedUnlocks, selectedCountries.length), seen_count:seenAnimals.length, badge_ids:['ONB-01-L1'] });
      setStep('review');
    } finally {
      setLoading(false);
    }
  };

  const panel = { margin:16, borderRadius:30, background:'linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.035))', border:'1px solid rgba(255,255,255,.10)', padding:18, boxShadow:'0 28px 80px rgba(0,0,0,.46)', overflowY:'auto', WebkitOverflowScrolling:'touch' };
  const primaryButton = { width:'100%', minHeight:50, borderRadius:18, border:'none', background:`linear-gradient(135deg,${OCHRE},#C45D3F)`, color:'white', fontWeight:1000, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 14px 34px ${OCHRE}38` };
  const disabledButton = { ...primaryButton, background:'#3A3A3C', color:'rgba(255,255,255,.42)', boxShadow:'none', cursor:'default' };
  const Pill = ({ children, active=false, onClick }) => <button onClick={onClick} style={{ borderRadius:999, border:`1px solid ${active?OCHRE:'rgba(255,255,255,.10)'}`, background:active?`rgba(168,70,55,.22)`:'rgba(255,255,255,.055)', color:active?'#FFD4C8':'rgba(255,255,255,.74)', padding:'8px 11px', fontSize:11.5, fontWeight:900, cursor:'pointer', fontFamily:'inherit' }}>{children}</button>;
  const ObjectivePill = ({ value, label }) => <Pill active={objectives.includes(value)} onClick={()=>setObjectives(prev => prev.includes(value) ? prev.filter(x=>x!==value) : [...prev, value])}>{label}</Pill>;
  const ConsentRow = ({ keyName, label, required=false }) => <button type="button" onClick={()=>setConsents(prev => ({ ...prev, [keyName]:!prev[keyName] }))} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, background:'rgba(255,255,255,.045)', padding:'10px 12px', color:'white', fontFamily:'inherit', textAlign:'left' }}>
    <span style={{ width:22, height:22, borderRadius:8, background:consents[keyName]?OCHRE:'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:1000 }}>{consents[keyName]?'✓':''}</span>
    <span style={{ flex:1, fontSize:12, color:'rgba(255,255,255,.72)', lineHeight:1.35 }}>{label} {required && <b style={{ color:'#FFD4C8' }}>*</b>}</span>
  </button>;

  return (
    <div style={{ height:'100%', background:`radial-gradient(circle at 50% 0%, ${OCHRE}2A, transparent 36%), linear-gradient(180deg,#111113,#050506)`, color:'white', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'20px 18px 8px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          {step !== 'intro' && step !== 'sync' && <button onClick={goBack} aria-label="Indietro" style={{ width:38, height:38, borderRadius:14, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.055)', color:'white', fontSize:22, fontWeight:1000, cursor:'pointer', flexShrink:0 }}>‹</button>}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:OCHRE, fontSize:11, fontWeight:1000, letterSpacing:.9, textTransform:'uppercase' }}>Apex setup</div>
            <div style={{ color:'white', fontSize:28, fontWeight:1000, letterSpacing:'-.8px', marginTop:3 }}>
              {step==='intro'?'Benvenuto in Apex':step==='identity'?'Come ti chiami':step==='birth'?'Profilo base':step==='location'?'Da dove parti':step==='goals'?'Cosa vuoi fare':step==='travel'?'Stile di esplorazione':step==='countries'?'Paesi visitati':step==='radar'?'Primi avvistamenti':step==='review'?'Riepilogo':step==='sync'?'Sincronizzazione':'Apex è pronto'}
            </div>
          </div>
          <div style={{ width:54, height:54, borderRadius:20, background:`linear-gradient(135deg,${OCHRE},#6F2D24)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:`0 0 32px ${OCHRE}44` }}>A</div>
        </div>
        <div style={{ height:8, background:'rgba(255,255,255,.08)', borderRadius:999, overflow:'hidden', marginTop:14 }}>
          <div style={{ width:`${progress}%`, height:'100%', background:`linear-gradient(90deg,${OCHRE},#F0A840)`, borderRadius:999, transition:'width .28s ease' }} />
        </div>
      </div>

      {step==='intro' && (
        <div style={{ ...panel, flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div style={{ color:OCHRE, fontSize:12, fontWeight:1000, textTransform:'uppercase', letterSpacing:.9 }}>Atlante vivo della fauna</div>
            <div style={{ color:'white', fontSize:27, fontWeight:1000, letterSpacing:'-.7px', lineHeight:1.06, marginTop:8 }}>Apex ti aiuta a scoprire, riconoscere e collezionare gli animali del mondo.</div>
            <p style={{ color:'rgba(255,255,255,.68)', fontSize:13.5, lineHeight:1.6 }}>L'app combina catalogo, geografia, rarità, stato di conservazione, abilità biologiche e progressi personali. In pochi passaggi prepariamo il tuo profilo e ti spieghiamo le parole chiave che incontrerai.</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:14 }}>
              {[
                [`${animalCount}`,'Animali','specie catalogate, divise per classe e dati ecologici'],
                [`${classCount}`,'Classi','mammiferi, uccelli, rettili, pesci, insetti e altri gruppi'],
                [`${countryCount}`,'Paesi','geografia usata per esplorare fauna e regioni'],
                ['Badge','Progressi','riconoscimenti per viaggi, catture, rarità e abilità'],
              ].map(([ic,t,d])=>(
                <div key={t} style={{ borderRadius:20, background:'rgba(255,255,255,.055)', border:'1px solid rgba(255,255,255,.08)', padding:12 }}>
                  <div style={{ color:'#FFD4C8', fontSize:20, fontWeight:1000 }}>{ic}</div><div style={{ fontWeight:1000, fontSize:13, marginTop:5 }}>{t}</div><div style={{ color:'rgba(255,255,255,.50)', fontSize:10.5, lineHeight:1.3, marginTop:3 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={()=>setStep('identity')} style={primaryButton}>Inizia</button>
        </div>
      )}

      {step==='identity' && (
        <div style={{ ...panel, flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
          <p style={{ color:'rgba(255,255,255,.66)', fontSize:13.5, lineHeight:1.6, marginTop:0 }}>Scegli il nome che Apex userà nel profilo, nelle schermate di progresso e nei riconoscimenti.</p>
          <div style={{ borderRadius:16, background:'rgba(255,255,255,.045)', border:'1px solid rgba(255,255,255,.08)', padding:12, marginBottom:12 }}>
            <div style={{ color:'rgba(255,255,255,.46)', fontSize:10.5, fontWeight:900, textTransform:'uppercase' }}>Account</div>
            <div style={{ color:'white', fontSize:13, fontWeight:900, marginTop:4 }}>{user?.email || 'Email non disponibile'}</div>
            <div style={{ color:'rgba(255,255,255,.50)', fontSize:11, marginTop:3 }}>Provider: {user?.app_metadata?.provider || user?.identities?.[0]?.provider || 'email'}</div>
          </div>
          <label style={{ color:'rgba(255,255,255,.58)', fontSize:12, fontWeight:900 }}>Nickname</label>
          <input value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="Es. Andrea" style={{ width:'100%', height:54, borderRadius:18, background:'#202024', border:`1px solid ${OCHRE}55`, color:'white', padding:'0 15px', fontSize:15, boxSizing:'border-box', outline:'none', fontFamily:'inherit', marginTop:8 }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:10, marginTop:16 }}><button onClick={goBack} style={{ minHeight:50, borderRadius:18, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.055)', color:'white', fontWeight:950, padding:'0 14px' }}>Indietro</button><button disabled={!nickname.trim()} onClick={()=>setStep('birth')} style={nickname.trim() ? primaryButton : disabledButton}>Continua</button></div>
        </div>
      )}

      {step==='birth' && (
        <div style={{ ...panel, flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <p style={{ color:'rgba(255,255,255,.66)', fontSize:13.5, lineHeight:1.6, marginTop:0 }}>Questi dati servono a leggere meglio il pubblico di Apex e, più avanti, a calibrare contenuti e missioni. Puoi lasciare vuoti i campi non essenziali.</p>
            <label style={{ color:'rgba(255,255,255,.58)', fontSize:12, fontWeight:900 }}>Data di nascita</label>
            <input type="date" value={dateOfBirth} onChange={e=>setDateOfBirth(e.target.value)} aria-label="Data di nascita" style={{ width:'100%', height:56, borderRadius:18, background:'#202024', border:'1px solid rgba(255,255,255,.14)', color:'white', padding:'0 14px', fontSize:16, boxSizing:'border-box', fontFamily:'inherit', marginTop:8, colorScheme:'dark' }} />
            <div style={{ color:'rgba(255,255,255,.42)', fontSize:11.5, lineHeight:1.4, marginTop:8 }}>Apri il calendario oppure digita la data nel formato del tuo dispositivo.</div>
            <label style={{ display:'block', color:'rgba(255,255,255,.58)', fontSize:12, fontWeight:900, marginTop:18 }}>Genere</label>
            <select value={gender} onChange={e=>setGender(e.target.value)} style={{ width:'100%', height:54, borderRadius:18, background:'#202024', border:'1px solid rgba(255,255,255,.14)', color:'white', padding:'0 14px', fontSize:15, boxSizing:'border-box', fontFamily:'inherit', marginTop:8 }}>
              <option value="">Seleziona, oppure salta</option><option>Donna</option><option>Uomo</option><option>Non binario</option><option>Preferisco non dirlo</option>
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:10, marginTop:16 }}><button onClick={goBack} style={{ minHeight:50, borderRadius:18, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.055)', color:'white', fontWeight:950, padding:'0 14px' }}>Indietro</button><button onClick={()=>setStep('location')} style={primaryButton}>Continua</button></div>
        </div>
      )}

      {step==='location' && (
        <div style={{ ...panel, flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <p style={{ color:'rgba(255,255,255,.66)', fontSize:13.5, lineHeight:1.6, marginTop:0 }}>La residenza e la nazionalità aiutano Apex a capire il punto di partenza del tuo atlante personale.</p>
            <label style={{ color:'rgba(255,255,255,.58)', fontSize:12, fontWeight:900 }}>Paese di residenza</label>
            <select value={residenceCountry} onChange={e=>setResidenceCountry(e.target.value)} style={{ width:'100%', height:54, borderRadius:18, background:'#202024', border:'1px solid rgba(255,255,255,.14)', color:'white', padding:'0 14px', fontSize:15, boxSizing:'border-box', fontFamily:'inherit', marginTop:8 }}>
              <option value="">Seleziona paese</option>
              {allCountries.map(code => <option key={code} value={code}>{getCountryDisplayName(code)}</option>)}
            </select>
            <label style={{ display:'block', color:'rgba(255,255,255,.58)', fontSize:12, fontWeight:900, marginTop:18 }}>Nazionalità</label>
            <select value={nationality} onChange={e=>setNationality(e.target.value)} style={{ width:'100%', height:54, borderRadius:18, background:'#202024', border:'1px solid rgba(255,255,255,.14)', color:'white', padding:'0 14px', fontSize:15, boxSizing:'border-box', fontFamily:'inherit', marginTop:8 }}>
              <option value="">Seleziona nazionalità</option>
              {allCountries.map(code => <option key={code} value={code}>{getCountryDisplayName(code)}</option>)}
            </select>
            <label style={{ display:'block', color:'rgba(255,255,255,.58)', fontSize:12, fontWeight:900, marginTop:18 }}>Telefono</label>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Facoltativo" style={{ width:'100%', height:52, borderRadius:18, background:'#202024', border:'1px solid rgba(255,255,255,.14)', color:'white', padding:'0 14px', fontSize:15, boxSizing:'border-box', outline:'none', fontFamily:'inherit', marginTop:8 }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:10, marginTop:16 }}><button onClick={goBack} style={{ minHeight:50, borderRadius:18, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.055)', color:'white', fontWeight:950, padding:'0 14px' }}>Indietro</button><button onClick={()=>setStep('goals')} style={primaryButton}>Continua</button></div>
        </div>
      )}

      {step==='goals' && (
        <div style={{ ...panel, flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <p style={{ color:'rgba(255,255,255,.66)', fontSize:13.5, lineHeight:1.6, marginTop:0 }}>Cosa vuoi ottenere da Apex? Puoi scegliere più opzioni.</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              <ObjectivePill value="collection" label="Collezionare specie" /><ObjectivePill value="travel" label="Preparare viaggi" /><ObjectivePill value="photo_ai" label="Riconoscere da foto" /><ObjectivePill value="education" label="Imparare biologia" /><ObjectivePill value="badges" label="Completare badge" /><ObjectivePill value="other" label="Altro" />
            </div>
            {objectives.includes('other') && <input value={objectiveOther} onChange={e=>setObjectiveOther(e.target.value)} placeholder="Scrivi il tuo obiettivo" style={{ width:'100%', height:48, borderRadius:16, background:'#202024', border:'1px solid rgba(255,255,255,.12)', color:'white', padding:'0 13px', fontSize:13, boxSizing:'border-box', outline:'none', fontFamily:'inherit', marginTop:12 }} />}
            <div style={{ marginTop:18, borderRadius:18, background:'rgba(168,70,55,.12)', border:'1px solid rgba(168,70,55,.24)', padding:13, color:'rgba(255,255,255,.72)', fontSize:12.5, lineHeight:1.45 }}>I badge si ottengono completando azioni misurabili: visitare paesi, avvistare o catturare animali, scoprire predatori apex, raccogliere specie rare, esplorare classi tassonomiche e abilità biologiche.</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:10, marginTop:16 }}><button onClick={goBack} style={{ minHeight:50, borderRadius:18, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.055)', color:'white', fontWeight:950, padding:'0 14px' }}>Indietro</button><button onClick={()=>setStep('travel')} style={primaryButton}>Continua</button></div>
        </div>
      )}

      {step==='travel' && (
        <div style={{ ...panel, flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <p style={{ color:'rgba(255,255,255,.66)', fontSize:13.5, lineHeight:1.6, marginTop:0 }}>Queste preferenze aiutano a capire che tipo di esplorazione ti interessa.</p>
            <label style={{ color:'rgba(255,255,255,.58)', fontSize:12, fontWeight:900 }}>Ti consideri collezionista?</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:8 }}>
              {[['yes','Sì'],['no','No']].map(([value,label]) => <button key={value} onClick={()=>setIsCollector(value)} style={{ minHeight:48, borderRadius:16, border:`1px solid ${isCollector===value?OCHRE:'rgba(255,255,255,.10)'}`, background:isCollector===value?'rgba(168,70,55,.22)':'rgba(255,255,255,.045)', color:'white', fontWeight:1000 }}>{label}</button>)}
            </div>
            <label style={{ display:'block', color:'rgba(255,255,255,.58)', fontSize:12, fontWeight:900, marginTop:18 }}>Viaggi all'estero in un anno</label>
            <select value={annualAbroadVacations} onChange={e=>setAnnualAbroadVacations(e.target.value)} style={{ width:'100%', height:52, borderRadius:16, background:'#202024', border:'1px solid rgba(255,255,255,.12)', color:'white', padding:'0 12px', fontSize:14, marginTop:8 }}><option value="">Seleziona frequenza</option><option value="0">Nessuno</option><option value="1">1</option><option value="2-4">2-4</option><option value="5-10">5-10</option><option value="10+">10+</option></select>
            <div style={{ color:'rgba(255,255,255,.55)', fontSize:11, fontWeight:900, margin:'18px 0 8px', textTransform:'uppercase' }}>Consensi</div>
            <div style={{ display:'grid', gap:7 }}>
              <ConsentRow keyName="terms" label="Accetto termini, privacy e trattamento dati necessario al funzionamento di Apex" required />
              <ConsentRow keyName="analytics" label="Analytics per migliorare prodotto e stabilità" />
              <ConsentRow keyName="marketing" label="Comunicazioni commerciali e offerte future" />
              <ConsentRow keyName="personalization" label="Personalizzazione di missioni, contenuti e suggerimenti" />
              <ConsentRow keyName="newsletter" label="Newsletter e aggiornamenti Apex" />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:10, marginTop:16 }}><button onClick={goBack} style={{ minHeight:50, borderRadius:18, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.055)', color:'white', fontWeight:950, padding:'0 14px' }}>Indietro</button><button disabled={!consents.terms} onClick={()=>setStep('countries')} style={consents.terms ? primaryButton : disabledButton}>Continua</button></div>
        </div>
      )}

      {step==='countries' && (
        <div style={{ ...panel, flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
          <p style={{ color:'rgba(255,255,255,.66)', fontSize:13.5, lineHeight:1.55, marginTop:0 }}>Seleziona i paesi in cui sei stato. Apex li userà per proporre animali compatibili con i tuoi viaggi.</p>
          <input value={countrySearch} onChange={e=>setCountrySearch(e.target.value)} placeholder="Cerca nazione o ISO..." style={{ width:'100%', height:44, borderRadius:16, background:'#202024', border:'1px solid rgba(255,255,255,.12)', color:'white', padding:'0 13px', fontSize:14, boxSizing:'border-box', outline:'none', marginBottom:10, fontFamily:'inherit' }} />
          <div style={{ flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, paddingRight:2 }}>
            {filteredCountries.map(code => {
              const active = selectedCountries.includes(code);
              return (
                <button key={code} onClick={()=>toggleCountry(code)} style={{ minHeight:48, borderRadius:17, border:`1px solid ${active?OCHRE:'rgba(255,255,255,.08)'}`, background:active?`rgba(168,70,55,.22)`:'rgba(255,255,255,.045)', color:'white', display:'flex', alignItems:'center', gap:8, padding:'8px 10px', cursor:'pointer', textAlign:'left', fontFamily:'inherit' }}>
                  <span style={{ fontSize:21 }}>{getFlagEmoji(code)}</span>
                  <span style={{ flex:1, fontSize:11.5, fontWeight:900, lineHeight:1.15 }}>{getCountryDisplayName(code)}</span>
                  <span style={{ color:active?'#FFD4C8':'rgba(255,255,255,.22)', fontWeight:1000 }}>{active?'✓':'+'}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:8, marginTop:12, width:'100%', maxWidth:'100%', boxSizing:'border-box' }}>
            <div style={{ borderRadius:18, background:'rgba(255,255,255,.055)', padding:12 }}><div style={{ color:OCHRE, fontWeight:1000, fontSize:18 }}>{selectedCountries.length}</div><div style={{ color:'rgba(255,255,255,.55)', fontSize:11 }}>nazioni</div></div>
            <div style={{ borderRadius:18, background:'rgba(255,255,255,.055)', padding:12 }}><div style={{ color:OCHRE, fontWeight:1000, fontSize:18 }}>{predictedUnlocks}</div><div style={{ color:'rgba(255,255,255,.55)', fontSize:11 }}>animali potenziali</div></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:8, marginTop:12 }}><button onClick={goBack} style={{ minHeight:50, borderRadius:18, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.055)', color:'white', fontWeight:950, padding:'0 14px' }}>Indietro</button><button disabled={!selectedCountries.length} onClick={()=>{ setCardIndex(0); setStep('radar'); }} style={selectedCountries.length?primaryButton:disabledButton}>Mostra specie possibili</button></div>
        </div>
      )}

      {step==='radar' && (
        <div style={{ ...panel, flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <p style={{ color:'rgba(255,255,255,.66)', fontSize:13.5, lineHeight:1.45, margin:0 }}>Se riconosci una specie che hai già visto dal vivo, segnala l'avvistamento. Potrai modificarlo più avanti.</p>
            <span style={{ color:OCHRE, fontWeight:1000, fontSize:12 }}>{Math.min(cardIndex+1, Math.max(1, radarAnimals.length))}/{Math.max(1, radarAnimals.length)}</span>
          </div>
          {!currentAnimal ? (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
              <div>
                <div style={{ fontSize:46 }}>✅</div>
                <div style={{ color:'white', fontWeight:1000, fontSize:18, marginTop:8 }}>Radar completato</div>
                <div style={{ color:'rgba(255,255,255,.55)', fontSize:12, marginTop:5 }}>{seenAnimals.length} specie segnate come avvistate.</div>
              </div>
            </div>
          ) : (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:'86%', maxWidth:292, borderRadius:28, background:'#202024', overflow:'hidden', boxShadow:'0 28px 70px rgba(0,0,0,.48)', border:`1px solid ${OCHRE}44` }}>
                <AnimalImg a={{...currentAnimal, status:'catturato'}} size={230} fontSize={82} overrideStatus="catturato" />
                <div style={{ padding:15, textAlign:'center' }}>
                  <div style={{ color:'white', fontSize:19, fontWeight:1000, lineHeight:1.12 }}>{currentAnimal.com}</div>
                  <div style={{ color:'rgba(255,255,255,.45)', fontSize:12, marginTop:5, fontStyle:'italic' }}>{currentAnimal.sci}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:12, marginTop:18, width:'100%' }}>
                <button onClick={()=>markRadar(false)} style={{ flex:1, height:50, borderRadius:17, border:'1px solid rgba(255,255,255,.12)', background:'#2A2A2C', color:'rgba(255,255,255,.72)', fontWeight:1000, cursor:'pointer', fontFamily:'inherit' }}>Mai visto</button>
                <button onClick={()=>markRadar(true)} style={{ flex:1, height:50, borderRadius:17, border:'none', background:`linear-gradient(135deg,${OCHRE},#C45D3F)`, color:'white', fontWeight:1000, cursor:'pointer', fontFamily:'inherit' }}>Già visto</button>
              </div>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:10, marginTop:14 }}><button onClick={goBack} style={{ minHeight:50, borderRadius:18, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.055)', color:'white', fontWeight:950, padding:'0 14px' }}>Indietro</button><button onClick={()=>setStep('review')} style={primaryButton}>Vai al riepilogo</button></div>
        </div>
      )}

      {step==='review' && (
        <div style={{ ...panel, flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div style={{ color:'white', fontSize:21, fontWeight:1000, lineHeight:1.12 }}>Pacchetto iniziale pronto</div>
            <p style={{ color:'rgba(255,255,255,.66)', fontSize:13.5, lineHeight:1.6 }}>Ora salviamo profilo, paesi visitati, primi avvistamenti e badge iniziale. Da qui in poi potrai esplorare liberamente griglia, geografia, badge, profilo e riconoscimento foto.</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:8, marginTop:12, width:'100%', maxWidth:'100%', boxSizing:'border-box' }}>
              {[
                ['🗺️', selectedCountries.length, 'nazioni visitate'],
                ['🔭', predictedUnlocks, 'ricercati potenziali'],
                ['👁️', seenAnimals.length, 'avvistati radar'],
                ['🏅', 1, 'badge iniziale'],
              ].map(([ic,n,l])=>(
                <div key={l} style={{ borderRadius:22, background:'rgba(255,255,255,.055)', border:'1px solid rgba(255,255,255,.08)', padding:13 }}>
                  <div style={{ fontSize:24 }}>{ic}</div><div style={{ color:OCHRE, fontSize:24, fontWeight:1000, marginTop:4 }}>{n}</div><div style={{ color:'rgba(255,255,255,.55)', fontSize:11, lineHeight:1.2 }}>{l}</div>
                </div>
              ))}
            </div>
            {error && <div style={{ marginTop:12, borderRadius:16, background:'rgba(255,70,70,.12)', border:'1px solid rgba(255,70,70,.22)', color:'#FF9A9A', padding:12, fontSize:12, lineHeight:1.45 }}>{error}</div>}
          </div>
            <div style={{ display:'grid', gap:9 }}>
            <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:10 }}><button onClick={goBack} disabled={loading} style={{ minHeight:50, borderRadius:18, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.055)', color:'white', fontWeight:950, padding:'0 14px', opacity:loading ? .45 : 1 }}>Indietro</button><button onClick={runSync} disabled={loading || !selectedCountries.length} style={selectedCountries.length && !loading ? primaryButton : disabledButton}>{loading?'Sincronizzazione...':'Salva e continua'}</button></div>
            {error && <button onClick={()=>{ setError(''); onFinish?.({ skipReload:true }); }} style={{ minHeight:46, borderRadius:16, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.06)', color:'white', fontWeight:950, cursor:'pointer', fontFamily:'inherit' }}>Continua comunque</button>}
          </div>
        </div>
      )}

      {step==='sync' && (
        <div style={{ ...panel, flex:1, display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
          <div>
            <div style={{ width:98, height:98, borderRadius:'50%', margin:'0 auto 18px', background:`conic-gradient(from 90deg,${OCHRE},#F0A840,#8f34f5,${OCHRE})`, boxShadow:`0 0 46px ${OCHRE}50`, animation:'interactiveWiggle .7s ease-in-out infinite' }} />
            <div style={{ color:'white', fontSize:19, fontWeight:1000 }}>Prepariamo il tuo atlante</div>
            <div style={{ color:'rgba(255,255,255,.55)', fontSize:12.5, marginTop:8, lineHeight:1.45 }}>Salvataggio di profilo, paesi visitati, primi avvistamenti e badge iniziale.</div>
          </div>
        </div>
      )}

      {step==='wow' && (
        <div style={{ ...panel, flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', textAlign:'center' }}>
          <div>
            <div style={{ fontSize:64, marginBottom:12 }}>🏅</div>
            <div style={{ color:'#F0C449', fontSize:13, fontWeight:1000, textTransform:'uppercase', letterSpacing:.8 }}>Primo viaggio registrato</div>
            <div style={{ color:'white', fontSize:42, fontWeight:1000, marginTop:8 }}>{result?.unlocked_count ?? predictedUnlocks}</div>
            <div style={{ color:'rgba(255,255,255,.64)', fontSize:13, marginTop:4 }}>animali collegati ai tuoi paesi visitati</div>
            <div style={{ color:'rgba(255,255,255,.58)', fontSize:12, lineHeight:1.45, marginTop:12 }}>Nella griglia trovi gli animali. In geografia esplori paesi e subregioni. Nei badge vedi gli obiettivi. Nel profilo segui progressi, catture e riconoscimenti.</div>
            {result?.timed_out && <div style={{ color:'#FFD4C8', fontSize:11.5, marginTop:12, lineHeight:1.4 }}>La rete è lenta: Apex entra subito, la sincronizzazione continua in background.</div>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginTop:20 }}>
              <div style={{ borderRadius:20, background:'rgba(168,70,55,.14)', padding:12 }}><div style={{ fontSize:25 }}>🔭</div><div style={{ fontWeight:1000, fontSize:12, marginTop:5 }}>Ricercato: da trovare</div></div>
              <div style={{ borderRadius:20, background:'rgba(168,70,55,.14)', padding:12 }}><div style={{ fontSize:25 }}>👁️</div><div style={{ fontWeight:1000, fontSize:12, marginTop:5 }}>Avvistato: visto dal vivo</div></div>
              <div style={{ borderRadius:20, background:'rgba(168,70,55,.14)', padding:12 }}><div style={{ fontSize:25 }}>📸</div><div style={{ fontWeight:1000, fontSize:12, marginTop:5 }}>Catturato: confermato</div></div>
              <div style={{ borderRadius:20, background:'rgba(168,70,55,.14)', padding:12 }}><div style={{ fontSize:25 }}>🏅</div><div style={{ fontWeight:1000, fontSize:12, marginTop:5 }}>Badge: obiettivi completati</div></div>
            </div>
          </div>
          <button onClick={()=>onFinish?.()} style={primaryButton}>Entra in Apex</button>
        </div>
      )}
    </div>
  );
}

function AuthScreen({ onAuthReady }) {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [mode,setMode]=useState('login');
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState('');

  const loginWithGoogle = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      setMessage(err?.message || 'Errore login Google.');
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data, error } = mode === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMessage(mode === 'signup' ? 'Account creato. Controlla la mail se Supabase richiede conferma, poi fai login.' : 'Accesso effettuato.');
      onAuthReady?.();
    } catch (err) {
      setMessage(err?.message || 'Errore autenticazione.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div {...APP_FRAME_PROPS} style={{ height:'var(--animaldex-app-height, 100dvh)', maxWidth:480, margin:'0 auto', background:'#111113', color:'white', fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif", display:'flex', alignItems:'center', justifyContent:'center', padding:22, boxSizing:'border-box' }}>
      <form onSubmit={submit} style={{ width:'100%', background:'linear-gradient(180deg,#222226,#161618)', border:'1px solid rgba(255,255,255,.10)', borderRadius:28, padding:24, boxShadow:'0 28px 80px rgba(0,0,0,.45)' }}>
        <div style={{ color:'#90D84A', fontSize:13, fontWeight:900, textTransform:'uppercase', letterSpacing:.9 }}>Animaldex</div>
        <h1 style={{ margin:'8px 0 6px', fontSize:30, lineHeight:1.05 }}>Accedi</h1>
        <p style={{ margin:'0 0 18px', color:'rgba(255,255,255,.58)', fontSize:13, lineHeight:1.45 }}>Login richiesto per sincronizzare animali, destinazioni, status e badge con Supabase.</p>
        <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{ width:'100%', height:46, borderRadius:14, border:'1px solid rgba(255,255,255,.12)', background:'#2B2B30', color:'white', padding:'0 14px', fontSize:14, boxSizing:'border-box', marginBottom:10 }} />
        <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={{ width:'100%', height:46, borderRadius:14, border:'1px solid rgba(255,255,255,.12)', background:'#2B2B30', color:'white', padding:'0 14px', fontSize:14, boxSizing:'border-box', marginBottom:14 }} />
        <button disabled={loading} type="submit" style={{ width:'100%', height:48, borderRadius:15, border:'none', background:'#90D84A', color:'#101410', fontWeight:900, fontSize:15, cursor:loading?'default':'pointer', opacity:loading ? .7 : 1 }}>{loading ? 'Attendi...' : mode === 'signup' ? 'Crea account' : 'Login'}</button>
        <button disabled={loading} type="button" onClick={loginWithGoogle} style={{ width:'100%', height:46, marginTop:10, borderRadius:14, border:'1px solid rgba(255,255,255,.14)', background:'#FFFFFF', color:'#151515', fontWeight:900, fontSize:14, cursor:loading?'default':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          <span style={{ width:20, height:20, borderRadius:'50%', background:'linear-gradient(135deg,#4285F4 0 25%,#34A853 25% 50%,#FBBC05 50% 75%,#EA4335 75% 100%)', display:'inline-block' }} />
          Continua con Google
        </button>
        <button type="button" onClick={()=>setMode(mode==='signup'?'login':'signup')} style={{ width:'100%', height:42, marginTop:10, borderRadius:13, border:'1px solid rgba(255,255,255,.10)', background:'transparent', color:'rgba(255,255,255,.78)', fontWeight:800, cursor:'pointer' }}>{mode === 'signup' ? 'Ho già un account' : 'Crea nuovo account'}</button>
        {message && <div style={{ marginTop:14, color:message.toLowerCase().includes('erro')?'#FF7777':'#BFEFA4', fontSize:12, lineHeight:1.4 }}>{message}</div>}
      </form>
    </div>
  );
}

const TRIP_TAGS = ['city','nature','coast','diving','snorkeling','boat','desert','mountain'];

function MainMenu({ onOpen, onBack, onLogout, tutorialFocus=null, statusMap = {}, visitedCountries = [], earnedBadgeIds = [], userProfile, user, onOpenGridStatus, onOpenRegions, onQuickSeen, onOpenPhoto, onOpenBadge, theme='dark' }) {
  const progress = buildSimpleProgressState({ animals:ANIMALS, statusMap, visitedCountries, earnedBadgeIds });
  const [socialPreview, setSocialPreview] = useState(() => buildSocialFallback(user, userProfile, progress));
  useEffect(() => {
    let alive = true;
    if (!user?.id) return;
    fetchSocialSnapshot(user.id, userProfile, progress).then(next => {
      if (alive) setSocialPreview(next);
    }).catch(() => {});
    return () => { alive = false; };
  }, [user?.id, userProfile?.user_id, progress.seenCount, progress.capturedCount, earnedBadgeIds?.length]);
  const isLightTheme = theme === 'light';
  const pageText = isLightTheme ? '#171717' : 'white';
  const mutedText = isLightTheme ? 'rgba(0,0,0,.58)' : 'rgba(255,255,255,.62)';
  const lightPanel = isLightTheme ? '#F6F4EF' : 'rgba(255,255,255,.055)';
  const lightPanelBorder = isLightTheme ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.08)';
  const displayName = userProfile?.nickname || userProfile?.username || user?.email?.split('@')[0] || 'Esploratore';
  const nextLevelXP = xpForLevel(progress.level + 1);
  const currLevelXP = xpForLevel(progress.level);
  const xpPct = Math.max(0, Math.min(100, ((progress.xp - currLevelXP) / Math.max(1, nextLevelXP - currLevelXP)) * 100));
  const animalsWithStatus = progress.animalsWithStatus;
  const seenNotCaptured = animalsWithStatus.filter(a => a.status === 'avvistato');
  const searchedAnimals = animalsWithStatus.filter(a => a.status === 'ricercato');
  let mission = {
    title:'Scopri una nuova regione',
    desc:'Esplora territori e habitat per trovare nuovi animali.',
    cta:'Apri regioni',
    action:onOpenRegions || (()=>onOpen('regions')),
  };
  if (!visitedCountries.length) mission = { title:'Inizia il tuo Animaldex', desc:'Aggiungi un paese visitato per vedere i primi animali ricercati.', cta:'Aggiungi paese', action:onOpenRegions || (()=>onOpen('regions')) };
  else if (searchedAnimals.length > 0) mission = { title:'Prossima missione', desc:`Hai ${searchedAnimals.length} animali ricercati nei tuoi paesi visitati.`, cta:'Visti rapidi', action:onQuickSeen };
  else if (seenNotCaptured.length > 0) mission = { title:'Completa il tuo Dex', desc:`Hai ${seenNotCaptured.length} animali avvistati non ancora catturati.`, cta:'Cattura ora', action:()=>onOpenGridStatus?.(['avvistato']) };
  const items = [
    { id:'grid', label:'Animaldex', icon:'🦁' },
    { id:'regions', label:'Regioni', icon:'🗺️' },
    { id:'friends', label:'Amici', icon:'🤝' },
    { id:'badges', label:'Badge', icon:'🏅' },
    { id:'compare', label:'Comparatore', icon:'⚔️' },
    { id:'abilities', label:'Abilità', icon:'✨' },
    { id:'profile', label:'Profilo', icon:'👤' },
    { id:'settings', label:'Impostazioni', icon:'⚙️' },
  ];
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:isLightTheme?LIGHT_APP_BG:'radial-gradient(circle at 50% -10%, rgba(184,77,58,.16), transparent 38%), linear-gradient(180deg,#101216,#0B0D10)', overflow:'hidden' }}>
      <PageHeader title="Mission Control" onBack={onBack} theme={theme} />
      <div style={{ flex:1, overflowY:'auto', padding:'16px 16px 30px' }}>
        <button onClick={()=>onOpen('profile')} style={{ width:'100%', borderRadius:26, padding:16, background:'linear-gradient(135deg,rgba(36,42,52,.96),rgba(17,19,23,.96)), radial-gradient(circle at top right, rgba(216,210,196,.10), transparent 40%)', border:'1px solid rgba(255,255,255,.12)', boxShadow:'inset 0 1px 0 rgba(255,255,255,.06), 0 18px 40px rgba(0,0,0,.24)', marginBottom:14, color:'white', fontFamily:'inherit', textAlign:'left', cursor:'pointer' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:54, height:54, borderRadius:18, background:'linear-gradient(135deg,rgba(216,210,196,.14),rgba(184,77,58,.16))', display:'flex', alignItems:'center', justifyContent:'center', color:'#D8D2C4', border:'1px solid rgba(255,255,255,.10)', fontSize:28 }}>🧭</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:'white', fontSize:18, fontWeight:1000, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{displayName}</div>
              <div style={{ color:'rgba(255,255,255,.56)', fontSize:11.5, marginTop:2 }}>Liv. {progress.level} · Esploratore urbano · {progress.xp} / {nextLevelXP} XP</div>
              <div style={{ height:8, borderRadius:999, background:'rgba(255,255,255,.08)', overflow:'hidden', marginTop:9 }}><div style={{ height:'100%', width:`${xpPct}%`, background:'linear-gradient(90deg,#D8D2C4,#C87955,#B84D3A)', boxShadow:'0 0 14px rgba(184,77,58,.22)', borderRadius:999 }} /></div>
            </div>
            <div style={{ color:'#F0A840', fontWeight:1000, fontSize:18 }}>🔥 3</div>
          </div>
        </button>

        <div style={{ borderRadius:26, padding:18, background:'linear-gradient(135deg, rgba(22,10,5,.22), rgba(8,8,10,.48) 58%, rgba(8,8,10,.70)), url("/regions/animals_general.png")', backgroundSize:'cover', backgroundPosition:'center', border:'1px solid rgba(245,241,234,.18)', boxShadow:'0 18px 44px rgba(0,0,0,.30)', marginBottom:14, overflow:'hidden' }}>
          <div style={{ color:'#F0A840', fontSize:11, fontWeight:1000, letterSpacing:.8, textTransform:'uppercase' }}>Missione principale</div>
          <div style={{ color:'white', fontSize:24, fontWeight:1000, marginTop:6 }}>{mission.title}</div>
          <div style={{ color:'rgba(255,255,255,.72)', fontSize:13, lineHeight:1.55, marginTop:8 }}>{mission.desc}</div>
          <button onClick={mission.action} style={{ marginTop:14, height:48, width:'100%', borderRadius:16, border:'none', background:'linear-gradient(135deg,#B84D3A,#D06A45)', color:'white', fontWeight:1000, fontSize:13.5 }}>{mission.cta}</button>
        </div>

        <button onClick={()=>onOpen('friends')} style={{ width:'100%', border:'1px solid rgba(240,168,64,.30)', borderRadius:26, background:'radial-gradient(circle at 92% 10%, rgba(240,168,64,.24), transparent 34%), linear-gradient(135deg,rgba(30,25,18,.96),rgba(15,18,16,.98))', color:'white', textAlign:'left', padding:16, fontFamily:'inherit', cursor:'pointer', boxShadow:'0 16px 38px rgba(0,0,0,.22)', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div>
              <div style={{ color:'#F0A840', fontSize:11, fontWeight:1000, letterSpacing:.8, textTransform:'uppercase' }}>Compagni</div>
              <div style={{ fontSize:22, fontWeight:1000, marginTop:4 }}>Amici Animaldex</div>
            </div>
            <div style={{ display:'flex', gap:7, flexShrink:0 }}>
              {!!socialPreview.unreadCount && <span style={{ minWidth:28, height:28, borderRadius:999, background:'#B84D3A', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:1000 }}>{socialPreview.unreadCount}</span>}
              <span style={{ minWidth:38, height:28, borderRadius:999, background:'rgba(255,255,255,.08)', color:'#FFD4A3', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:1000 }}>🤝 {socialPreview.friends?.length || 0}</span>
            </div>
          </div>
          <div style={{ color:'rgba(255,255,255,.66)', fontSize:12.5, lineHeight:1.45, marginTop:8 }}>Richieste, leaderboard amici e reazioni alle catture rare. Nessuna chat, solo segnali positivi e sicuri.</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginTop:12 }}>
            <div style={{ borderRadius:14, background:'rgba(255,255,255,.055)', padding:10 }}><div style={{ color:'#F0A840', fontSize:16, fontWeight:1000 }}>{socialPreview.requestsIn?.length || 0}</div><div style={{ color:'rgba(255,255,255,.50)', fontSize:10.5, fontWeight:850 }}>richieste</div></div>
            <div style={{ borderRadius:14, background:'rgba(255,255,255,.055)', padding:10 }}><div style={{ color:'#90D84A', fontSize:16, fontWeight:1000 }}>{socialPreview.leaderboard?.[0]?.isMe ? 'Tu' : `#${socialPreview.leaderboard?.find(r=>r.isMe)?.rank || 1}`}</div><div style={{ color:'rgba(255,255,255,.50)', fontSize:10.5, fontWeight:850 }}>classifica</div></div>
            <div style={{ borderRadius:14, background:'rgba(255,255,255,.055)', padding:10 }}><div style={{ color:'#B860F8', fontSize:16, fontWeight:1000 }}>{socialPreview.events?.length || 0}</div><div style={{ color:'rgba(255,255,255,.50)', fontSize:10.5, fontWeight:850 }}>eventi</div></div>
          </div>
        </button>

        <div style={{ marginBottom:14 }}>
          <button onClick={onOpenRegions || (()=>onOpen('regions'))} style={{ width:'100%', minHeight:132, border:`1px solid ${isLightTheme?'rgba(0,0,0,.10)':'rgba(108,229,199,.24)'}`, borderRadius:28, background:'linear-gradient(90deg, rgba(5,11,13,.72), rgba(5,11,13,.34) 58%, rgba(5,11,13,.16)), url("/regions/home_regioni.png")', backgroundSize:'cover', backgroundPosition:'center', color:'#F5F1EA', fontFamily:'inherit', textAlign:'left', padding:'18px 92px 18px 18px', cursor:'pointer', boxShadow:isLightTheme?'0 16px 34px rgba(0,0,0,.09)':'inset 0 1px 0 rgba(255,255,255,.06), 0 16px 34px rgba(0,0,0,.22)' }}>
            <div style={{ color:'#90D84A', fontSize:11, fontWeight:1000, letterSpacing:.8, textTransform:'uppercase' }}>Esplorazione</div>
            <div style={{ fontSize:28, fontWeight:1000, lineHeight:1.02, marginTop:6 }}>Territori</div>
            <div style={{ color:'rgba(245,241,234,.70)', fontSize:12.5, lineHeight:1.45, marginTop:7 }}>Domini, continenti, regioni e territori per scoprire animali dove il mondo cambia davvero.</div>
          </button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          <button onClick={()=>onOpen('grid')} style={{ minHeight:112, border:'1px solid rgba(184,77,58,.38)', borderRadius:22, background:'linear-gradient(135deg,#7A331F 0%,#B84D3A 48%,#F0A840 100%)', color:'white', textAlign:'left', padding:14, fontFamily:'inherit', cursor:'pointer', boxShadow:'0 14px 34px rgba(184,77,58,.20)' }}>
            <div style={{ color:'#FFE1BF', fontSize:10.5, fontWeight:1000, letterSpacing:.8, textTransform:'uppercase' }}>Animali</div>
            <div style={{ fontSize:20, fontWeight:1000, marginTop:6 }}>Grid</div>
            <div style={{ color:'rgba(255,255,255,.74)', fontSize:11.5, lineHeight:1.35, marginTop:5 }}>Catalogo, filtri e schede.</div>
          </button>
          <button onClick={()=>onOpen('friends')} style={{ minHeight:112, border:'1px solid rgba(240,168,64,.34)', borderRadius:22, background:'radial-gradient(circle at 92% 12%, rgba(240,168,64,.32), transparent 34%), linear-gradient(135deg,#1B1A18,#3B2415 72%)', color:'white', textAlign:'left', padding:14, fontFamily:'inherit', cursor:'pointer', boxShadow:'0 14px 34px rgba(0,0,0,.20)' }}>
            <div style={{ color:'#F0A840', fontSize:10.5, fontWeight:1000, letterSpacing:.8, textTransform:'uppercase' }}>Social</div>
            <div style={{ fontSize:20, fontWeight:1000, marginTop:6 }}>Amici</div>
            <div style={{ color:'rgba(255,255,255,.68)', fontSize:11.5, lineHeight:1.35, marginTop:5 }}>Richieste, reazioni e progressi.</div>
          </button>
        </div>

        <button onClick={()=>onOpenGridStatus?.(['ricercato','avvistato','catturato'])} style={{ width:'100%', border:'1px solid rgba(184,77,58,.44)', borderRadius:22, background:'radial-gradient(circle at 90% 0%, rgba(240,168,64,.18), transparent 30%), linear-gradient(135deg,rgba(92,37,30,.72),rgba(20,20,22,.96))', padding:16, textAlign:'left', marginBottom:14, fontFamily:'inherit', boxShadow:isLightTheme?'0 12px 30px rgba(0,0,0,.09)':'0 14px 34px rgba(0,0,0,.20)' }}>
          {(() => {
            const totalAnimals = Math.max(1, ANIMALS.length);
            const unlockedCount = progress.searchedCount + progress.seenCount + progress.capturedCount;
            const searchedPct = Math.max(0, Math.min(100, (unlockedCount / totalAnimals) * 100));
            const seenPct = Math.max(0, Math.min(100, (progress.seenCount / Math.max(1, unlockedCount)) * 100));
            const capturedPct = Math.max(0, Math.min(100, (progress.capturedCount / Math.max(1, unlockedCount)) * 100));
            const Row = ({ label, valueText, pct, color, hint }) => (
              <div style={{ marginTop:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'center' }}>
                  <div style={{ color:'white', fontSize:12.5, fontWeight:900 }}>{label}</div>
                  <div style={{ color:'rgba(255,255,255,.68)', fontSize:11.5, fontWeight:800 }}>{valueText}</div>
                </div>
                <div style={{ color:'rgba(255,255,255,.48)', fontSize:10.5, marginTop:2 }}>{hint}</div>
                <div style={{ height:8, borderRadius:999, background:'rgba(255,255,255,.10)', overflow:'hidden', marginTop:6 }}><div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:999 }} /></div>
              </div>
            );
            return <>
              <div style={{ color:'white', fontSize:18, fontWeight:1000 }}>Animaldex</div>
              <Row label="🔭 Ricercati" valueText={`${unlockedCount} / ${totalAnimals}`} pct={searchedPct} color="linear-gradient(90deg,#D8D2C4,#F5F1EA)" hint="Animali ricercati sul totale del Dex" />
              <Row label="Avvistati" valueText={`${progress.seenCount} / ${unlockedCount || 0}`} pct={seenPct} color="linear-gradient(90deg,#D49374,#C87955)" hint="Animali avvistati sui ricercati" />
              <Row label="Catturati" valueText={`${progress.capturedCount} / ${unlockedCount || 0}`} pct={capturedPct} color="linear-gradient(90deg,#D06A45,#B84D3A)" hint="Animali catturati sui ricercati" />
            </>;
          })()}
        </button>

        {!!progress.nearlyCompletedBadges.length && <div style={{ marginBottom:14 }}>
          <div style={{ color:isLightTheme?'rgba(0,0,0,.58)':'rgba(255,255,255,.60)', fontSize:11, fontWeight:1000, textTransform:'uppercase', margin:'0 0 8px 2px' }}>Badge quasi completati</div>
          <div style={{ display:'grid', gap:8 }}>
            {progress.nearlyCompletedBadges.map(rule => {
              const badgeColor = BADGE_LEVEL_COLORS[rule.level] || '#C0C0C0';
              const badgeBg = isLightTheme ? `linear-gradient(135deg, ${hexToRgba(badgeColor,.30)}, rgba(251,247,239,.96))` : `linear-gradient(135deg, ${hexToRgba(badgeColor,.20)}, rgba(18,18,20,.84))`;
              const badgeText = isLightTheme ? '#171717' : 'white';
              const badgeMuted = isLightTheme ? 'rgba(0,0,0,.62)' : 'rgba(255,255,255,.62)';
              return <button key={rule.badgeId} onClick={()=>onOpenBadge?.(rule.badgeId)} style={{ border:`1.8px solid ${badgeColor}`, borderRadius:16, background:badgeBg, boxShadow:isLightTheme?`0 10px 24px ${hexToRgba(badgeColor,.16)}, inset 0 1px 0 rgba(255,255,255,.68)`: `inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(0,0,0,.18)`, padding:12, textAlign:'left', color:badgeText, fontFamily:'inherit', cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:12, fontWeight:950, fontSize:12.5 }}><span>{rule.name}</span><span style={{ color:badgeColor }}>{rule.current} / {rule.target}</span></div>
                <div style={{ color:badgeMuted, fontSize:11, lineHeight:1.35, marginTop:5 }}>{rule.sub} · {rule.goal}</div>
                <div style={{ height:7, borderRadius:999, background:isLightTheme?'rgba(0,0,0,.10)':'rgba(255,255,255,.08)', overflow:'hidden', marginTop:8 }}><div style={{ width:`${Math.round(rule.progress*100)}%`, height:'100%', background:`linear-gradient(90deg, ${hexToRgba(badgeColor,.65)}, ${badgeColor})` }} /></div>
              </button>;
            })}
          </div>
        </div>}

        <div style={{ color:isLightTheme?'rgba(0,0,0,.58)':'rgba(255,255,255,.52)', fontSize:11, fontWeight:1000, textTransform:'uppercase', margin:'0 0 8px 2px' }}>Navigazione</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {items.map(item=>{
            const focused = tutorialFocus === item.id;
            return <button key={item.id} data-tour={`menu-${item.id}`} onClick={()=>{ if(tutorialFocus && !focused) return; onOpen(item.id); }} style={{ minHeight:78, border:`1px solid ${lightPanelBorder}`, borderRadius:18, background:lightPanel, color:pageText, cursor:'pointer', padding:13, display:'flex', alignItems:'center', gap:10, textAlign:'left', boxShadow:focused?'0 0 0 3px #90D84A, 0 0 34px rgba(144,216,74,.45)':'none', opacity:tutorialFocus && !focused ? .42 : 1 }}>
              <span style={{ width:38, height:38, borderRadius:14, background:isLightTheme?'rgba(0,0,0,.06)':'rgba(255,255,255,.10)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:21 }}>{item.icon}</span>
              <span style={{ fontSize:13, fontWeight:950 }}>{item.label}</span>
            </button>
          })}
        </div>
      </div>
      <button aria-label="Apri fotocamera" onClick={()=>onOpenPhoto?.()} style={{ position:'absolute', left:'50%', bottom:'calc(env(safe-area-inset-bottom, 0px) + 18px)', transform:'translateX(-50%)', width:76, height:76, borderRadius:'50%', border:'3px solid rgba(255,255,255,.92)', background:'linear-gradient(135deg,#A84637,#F0A840)', color:'white', boxShadow:'0 18px 42px rgba(0,0,0,.42), 0 0 0 7px rgba(168,70,55,.18)', fontSize:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:80 }}>📷</button>
    </div>
  );
}


function QuickSeenPage({ onBack, animals = ANIMALS, statusMap = {}, visitedCountries = [], onStatusChange, onSelect, theme='dark' }) {
  const isLightTheme = theme === 'light';
  const quickIntroColor = isLightTheme ? '#171717' : 'rgba(255,255,255,.62)';
  const quickPanelBg = 'linear-gradient(180deg,rgba(128,60,22,.98),rgba(80,32,12,.96))';
  const quickPanelBorder = '1px solid rgba(255,218,176,.22)';
  const quickNoticeBg = 'linear-gradient(135deg,rgba(128,60,22,.92),rgba(64,28,12,.96))';
  const quickNoticeBorder = '1px solid rgba(255,218,176,.18)';
  const [dailyIds, setDailyIds] = useState(getQuickSeenToday());
  const [busy, setBusy] = useState(false);
  const buildQueue = () => {
    const alreadyDone = new Set(getQuickSeenToday().map(String));
    return getQuickSeenCandidates(animals, statusMap, visitedCountries).filter(a => !alreadyDone.has(String(a.id)));
  };
  const [queue, setQueue] = useState(buildQueue);
  useEffect(() => {
    const alreadyDone = new Set(getQuickSeenToday().map(String));
    setQueue(prev => {
      const stillValid = (prev || []).filter(a => !alreadyDone.has(String(a.id)) && !isQuickSeenRejected(a.id) && normalizeAnimalStatus(statusMap[a.id] ?? a.status) === 'ricercato');
      const existing = new Set(stillValid.map(a => String(a.id)));
      const additions = getQuickSeenCandidates(animals, statusMap, visitedCountries).filter(a => !alreadyDone.has(String(a.id)) && !existing.has(String(a.id)));
      return [...stillValid, ...additions].slice(0, QUICK_SEEN_DAILY_LIMIT * 3);
    });
  }, [animals, statusMap, visitedCountries]);
  const doneToday = dailyIds.length;
  const current = queue[0] || null;
  const markDaily = (id) => {
    const next = Array.from(new Set([...dailyIds.map(String), String(id)]));
    setDailyIds(next);
    saveQuickSeenToday(next);
  };
  const advanceQueue = (id) => setQueue(prev => (prev || []).filter(a => String(a.id) !== String(id)).slice(0));
  const yes = async () => {
    if (!current || busy) return;
    const picked = current;
    setBusy(true);
    markDaily(picked.id);
    advanceQueue(picked.id);
    track('quick_seen_yes', { animal_id:picked.id, animal_name:picked.com });
    try {
      await onStatusChange?.(picked.id, 'avvistato');
    } finally {
      setBusy(false);
    }
  };
  const no = () => {
    if (!current || busy) return;
    const picked = current;
    setBusy(true);
    markDaily(picked.id);
    rejectQuickSeenForCooldown(picked.id);
    advanceQueue(picked.id);
    track('quick_seen_no', { animal_id:picked.id, animal_name:picked.com, cooldown_days:QUICK_SEEN_REJECT_COOLDOWN_DAYS });
    setBusy(false);
  };
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:isLightTheme?LIGHT_APP_BG:'#111113', overflow:'hidden' }}>
      <PageHeader title="Visti rapidi" onBack={onBack} theme={theme} />
      <div style={{ flex:1, overflowY:'auto', padding:18 }}>
        <div style={{ color:quickIntroColor, fontSize:13, lineHeight:1.55, marginBottom:14 }}>Il modo più veloce per aggiornare l’Animaldex: Apex propone animali ad alta probabilità in base alle nazioni visitate e alla facilità di avvistamento. {Math.min(doneToday, QUICK_SEEN_DAILY_LIMIT)} / {QUICK_SEEN_DAILY_LIMIT} oggi.</div>
        {!visitedCountries.length ? (
          <div style={{ borderRadius:22, background:quickNoticeBg, border:quickNoticeBorder, padding:20, color:'white', textAlign:'center', fontWeight:900 }}>Aggiungi un paese visitato per attivare Visti rapidi.</div>
        ) : doneToday >= QUICK_SEEN_DAILY_LIMIT ? (
          <div style={{ borderRadius:22, background:quickNoticeBg, border:quickNoticeBorder, padding:20, color:'white', textAlign:'center', fontWeight:900 }}>Limite giornaliero raggiunto. Torna domani.</div>
        ) : current ? (
          <div style={{ borderRadius:30, background:quickPanelBg, border:quickPanelBorder, padding:18, boxShadow:isLightTheme?'0 24px 60px rgba(0,0,0,.22)':'0 24px 70px rgba(0,0,0,.42)' }}>
            <div onClick={()=>onSelect?.(current)} style={{ height:260, borderRadius:24, background:'#202228', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', cursor:'pointer' }}>
              <AnimalImg a={{...current,status:'ricercato'}} size={260} fontSize={70} overrideStatus="ricercato" />
            </div>
            <div style={{ textAlign:'center', marginTop:16 }}>
              <div style={{ color:'white', fontSize:24, fontWeight:1000, lineHeight:1.05 }}>{current.com}</div>
              <div style={{ color:'rgba(255,255,255,.52)', fontSize:12, fontStyle:'italic', marginTop:4 }}>{current.sci}</div>
              <div style={{ color:'#F0A840', fontSize:11, fontWeight:900, marginTop:8 }}>{current.rarity || 'Comune'} · {getAnimalVisitedCountryMatches(current, visitedCountries).slice(0,4).map(getCountryDisplayName).join(', ') || 'Paesi visitati compatibili'}</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:18 }}>
              <button disabled={busy} onClick={no} style={{ height:56, borderRadius:18, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.06)', color:'white', fontSize:18, fontWeight:1000, opacity:busy ? .65 : 1 }}>✕ No</button>
              <button disabled={busy} onClick={yes} style={{ height:56, borderRadius:18, border:'none', background:'linear-gradient(135deg,#90D84A,#4E9E42)', color:'#071017', fontSize:18, fontWeight:1000, opacity:busy ? .65 : 1 }}>✓ Visto</button>
            </div>
          </div>
        ) : (
          <div style={{ borderRadius:22, background:quickNoticeBg, border:quickNoticeBorder, padding:20, color:'white', textAlign:'center', fontWeight:900 }}>Nessun altro ricercato disponibile oggi.</div>
        )}
      </div>
    </div>
  );
}

function FriendsPage({ onBack, user, userProfile, statusMap = {}, visitedCountries = [], earnedBadgeIds = [], theme='dark' }) {
  const isLightTheme = theme === 'light';
  const progress = buildSimpleProgressState({ animals:ANIMALS, statusMap, visitedCountries, earnedBadgeIds });
  const [snapshot, setSnapshot] = useState(() => buildSocialFallback(user, userProfile, progress));
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('feed');
  const [selectedFriend, setSelectedFriend] = useState(null);

  const load = async () => {
    setLoading(true);
    const next = await fetchSocialSnapshot(user?.id, userProfile, progress);
    setSnapshot(next);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user?.id, progress.seenCount, progress.capturedCount, earnedBadgeIds?.length]);
  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      const q = query.trim();
      if (q.length < 3) { setResults([]); return; }
      setSearching(true);
      try {
        const rows = await searchSocialProfiles(user?.id, q);
        if (alive) setResults(rows);
      } catch (err) {
        if (alive) {
          setMessage('Ricerca amici disponibile dopo lo script Supabase.');
          setResults([]);
        }
      } finally {
        if (alive) setSearching(false);
      }
    }, 260);
    return () => { alive = false; clearTimeout(t); };
  }, [query, user?.id]);

  const sendRequest = async (profile) => {
    setMessage('');
    try {
      await requestFriendship(user.id, profile.user_id);
      setMessage(`Richiesta inviata a ${profile.nickname}.`);
      setQuery('');
      setResults([]);
      load();
    } catch (err) {
      setMessage('Non riesco ancora a inviare: applica lo script Supabase amicizie.');
    }
  };
  const accept = async (row) => {
    await updateFriendshipStatus(row.id, 'accepted', user?.id).catch(()=>setMessage('Accettazione non riuscita: controlla Supabase.'));
    load();
  };
  const decline = async (row) => {
    await deleteFriendship(row.id).catch(()=>setMessage('Operazione non riuscita: controlla Supabase.'));
    load();
  };
  const react = async (event, reaction) => {
    setMessage('');
    await reactToSocialEvent(user?.id, event, reaction.key).then(() => {
      setMessage(`${reaction.emoji} Reazione inviata.`);
      load();
    }).catch(() => setMessage('Reazione non riuscita: controlla Supabase.'));
  };
  const removeFriend = async (friend) => {
    await deleteFriendship(friend.friendship_id).then(() => {
      setSelectedFriend(null);
      setMessage(`${friend.nickname} rimosso dagli amici.`);
      load();
    }).catch(() => setMessage('Rimozione non riuscita.'));
  };
  const blockFriend = async (friend) => {
    await blockSocialUser(user?.id, friend.user_id, friend.friendship_id).then(() => {
      setSelectedFriend(null);
      setMessage(`${friend.nickname} bloccato.`);
      load();
    }).catch(() => setMessage('Blocco non riuscito.'));
  };
  const reportFriend = async (friend, eventId = null) => {
    await reportSocialUser(user?.id, friend?.user_id, 'other', eventId).then(() => {
      setMessage('Segnalazione inviata. Grazie: la sicurezza prima di tutto.');
    }).catch(() => setMessage('Segnalazione non riuscita.'));
  };
  const markRead = async () => {
    await markSocialNotificationsRead(user?.id).catch(() => {});
    load();
  };
  const FriendAvatar = ({ p }) => (
    <div style={{ width:48, height:48, borderRadius:17, background:'linear-gradient(135deg,#7A331F,#F0A840)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:18, fontWeight:1000, flexShrink:0, overflow:'hidden' }}>
      {p?.avatar_url ? <img src={p.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : String(p?.nickname || p?.username || 'A').slice(0,1).toUpperCase()}
    </div>
  );
  const friendRows = snapshot.friends || [];
  const leaderboard = snapshot.leaderboard || [];
  const feed = snapshot.events || [];
  const panelBg = isLightTheme ? '#F6F4EF' : 'rgba(255,255,255,.055)';
  const panelBorder = isLightTheme ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.08)';
  const mainText = isLightTheme ? '#171717' : 'white';
  const subText = isLightTheme ? 'rgba(0,0,0,.58)' : 'rgba(255,255,255,.58)';
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:isLightTheme?LIGHT_APP_BG:'radial-gradient(circle at 50% -12%, rgba(240,168,64,.18), transparent 42%), linear-gradient(180deg,#111113,#08090B)', overflow:'hidden' }}>
      <PageHeader title="Amici" onBack={onBack} theme={theme} />
      <div style={{ flex:1, overflowY:'auto', padding:16, WebkitOverflowScrolling:'touch' }}>
        <div style={{ borderRadius:28, padding:18, background:'linear-gradient(135deg,rgba(122,51,31,.92),rgba(24,18,15,.96) 68%)', border:'1px solid rgba(240,168,64,.24)', color:'white', boxShadow:'0 18px 44px rgba(0,0,0,.28)', marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-start' }}>
            <div>
              <div style={{ color:'#FFD4A3', fontSize:11, fontWeight:1000, textTransform:'uppercase', letterSpacing:.8 }}>Compagni di esplorazione</div>
              <div style={{ fontSize:26, fontWeight:1000, marginTop:5 }}>Catture, badge e reazioni</div>
            </div>
            {!!snapshot.unreadCount && <button onClick={markRead} style={{ minWidth:36, height:36, borderRadius:14, border:'1px solid rgba(255,255,255,.18)', background:'#B84D3A', color:'white', fontWeight:1000 }}>{snapshot.unreadCount}</button>}
          </div>
          <div style={{ color:'rgba(255,255,255,.72)', fontSize:12.5, lineHeight:1.5, marginTop:8 }}>Aggiungi amici per username, confronta i progressi e reagisci alle catture rare. Niente chat, niente testo libero: solo segnali positivi e sicuri.</div>
          {!snapshot.socialReady && <div style={{ marginTop:10, color:'#FFE0B8', fontSize:11, fontWeight:850 }}>Applica lo script Supabase aggiornato per attivare dati social reali.</div>}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
          {[
            ['feed','Feed'],
            ['search','Cerca'],
            ['friends','Amici'],
            ['rank','Rank'],
          ].map(([id,label]) => <button key={id} onClick={()=>setTab(id)} style={{ height:42, borderRadius:14, border:`1px solid ${tab===id?'#F0A840':panelBorder}`, background:tab===id?'linear-gradient(135deg,#B84D3A,#F0A840)':panelBg, color:tab===id?'white':mainText, fontWeight:1000, fontSize:12, fontFamily:'inherit' }}>{label}</button>)}
        </div>

        {message && <div style={{ borderRadius:16, background:'rgba(240,168,64,.12)', border:'1px solid rgba(240,168,64,.22)', color:isLightTheme?'#6F321E':'#FFD4A3', fontSize:11.5, lineHeight:1.4, padding:11, marginBottom:14, fontWeight:850 }}>{message}</div>}

        {tab === 'search' && <div style={{ borderRadius:22, background:panelBg, border:`1px solid ${panelBorder}`, padding:14, marginBottom:14 }}>
          <div style={{ color:mainText, fontSize:16, fontWeight:1000 }}>Cerca per username</div>
          <div style={{ color:subText, fontSize:11.5, lineHeight:1.45, marginTop:4 }}>Scrivi almeno 3 caratteri. Non cerchiamo per email e mostriamo solo profili minimi finche non diventate amici.</div>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="es. lunawild" style={{ marginTop:10, width:'100%', height:46, borderRadius:15, background:isLightTheme?'rgba(0,0,0,.05)':'rgba(0,0,0,.28)', border:`1px solid ${panelBorder}`, color:mainText, padding:'0 13px', boxSizing:'border-box', fontSize:16, outline:'none' }} />
          {searching && <div style={{ color:subText, fontSize:12, marginTop:8 }}>Ricerca...</div>}
          {!!results.length && <div style={{ display:'grid', gap:8, marginTop:10 }}>
            {results.map(p => <button key={p.user_id} onClick={()=>sendRequest(p)} style={{ display:'flex', alignItems:'center', gap:10, minHeight:64, borderRadius:16, border:`1px solid ${panelBorder}`, background:isLightTheme?'rgba(255,255,255,.72)':'rgba(255,255,255,.055)', color:mainText, padding:10, textAlign:'left', fontFamily:'inherit' }}>
              <FriendAvatar p={p} />
              <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:14, fontWeight:1000 }}>{p.nickname}</div><div style={{ color:subText, fontSize:11 }}>@{p.username}</div></div>
              <span style={{ color:'#F0A840', fontSize:12, fontWeight:1000 }}>Aggiungi</span>
            </button>)}
          </div>}
          {!results.length && query.trim().length >= 3 && !searching && <div style={{ color:subText, textAlign:'center', padding:16, fontSize:12 }}>Nessun username trovato.</div>}
        </div>}

        {tab === 'feed' && <>
          {!!snapshot.requestsIn?.length && <div style={{ marginBottom:14 }}>
            <div style={{ color:subText, fontSize:11, fontWeight:1000, textTransform:'uppercase', margin:'0 0 8px 2px' }}>Richieste in arrivo</div>
            {snapshot.requestsIn.map(row => <div key={row.id} style={{ display:'flex', alignItems:'center', gap:10, borderRadius:18, background:panelBg, border:`1px solid ${panelBorder}`, padding:10, marginBottom:8 }}>
              <FriendAvatar p={row.profile} />
              <div style={{ flex:1, color:mainText, fontWeight:950 }}>{row.profile.nickname}</div>
              <button onClick={()=>decline(row)} style={{ width:38, height:38, borderRadius:13, border:`1px solid ${panelBorder}`, background:'rgba(255,255,255,.05)', color:mainText, fontWeight:1000 }}>×</button>
              <button onClick={()=>accept(row)} style={{ height:38, borderRadius:13, border:'none', background:'#F0A840', color:'#17100A', padding:'0 12px', fontWeight:1000 }}>Accetta</button>
            </div>)}
          </div>}
          <div style={{ color:subText, fontSize:11, fontWeight:1000, textTransform:'uppercase', margin:'0 0 8px 2px' }}>Catture e badge</div>
          <div style={{ display:'grid', gap:10 }}>
            {feed.map(event => {
              const copy = getSocialEventCopy(event);
              const mine = event.user_id === user?.id;
              return <div key={event.id} style={{ borderRadius:20, background:panelBg, border:`1px solid ${panelBorder}`, padding:13 }}>
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <FriendAvatar p={event.profile} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', gap:10 }}>
                      <div style={{ color:mainText, fontSize:14, fontWeight:1000 }}>{mine ? 'Tu' : event.profile?.nickname}</div>
                      <div style={{ color:copy.tone, fontSize:11, fontWeight:1000 }}>{copy.title}</div>
                    </div>
                    <div style={{ color:subText, fontSize:12, lineHeight:1.4, marginTop:3 }}>{copy.text}</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:10 }}>
                      {FRIEND_REACTIONS.map(reaction => {
                        const count = (event.reactions || []).filter(r => r.reaction_key === reaction.key).length;
                        const reacted = (event.reactions || []).some(r => r.reaction_key === reaction.key && r.user_id === user?.id);
                        return <button key={reaction.key} disabled={mine || reacted} onClick={()=>react(event, reaction)} title={reaction.label} style={{ height:34, minWidth:42, borderRadius:13, border:`1px solid ${reacted?'#F0A840':panelBorder}`, background:reacted?'rgba(240,168,64,.18)':'rgba(255,255,255,.055)', color:mainText, fontWeight:950, opacity:mine ? .55 : 1 }}>{reaction.emoji}{count ? ` ${count}` : ''}</button>;
                      })}
                    </div>
                  </div>
                  {!mine && <button onClick={()=>reportFriend(event.profile, event.id)} style={{ width:32, height:32, borderRadius:12, border:`1px solid ${panelBorder}`, background:'rgba(255,255,255,.04)', color:subText, fontWeight:1000 }}>!</button>}
                </div>
              </div>;
            })}
            {!feed.length && <div style={{ color:subText, fontSize:13, textAlign:'center', padding:22, borderRadius:20, background:panelBg, border:`1px solid ${panelBorder}` }}>Quando tu o un amico catturate animali rari o leggendari, compariranno qui.</div>}
          </div>
        </>}

        {tab === 'friends' && <div>
          <div style={{ color:subText, fontSize:11, fontWeight:1000, textTransform:'uppercase', margin:'0 0 8px 2px' }}>Amici</div>
          {loading ? <div style={{ color:subText, padding:18 }}>Carico amici...</div> : <div style={{ display:'grid', gap:9 }}>
            {friendRows.map(p => <button key={p.user_id} onClick={()=>setSelectedFriend(p)} style={{ display:'flex', alignItems:'center', gap:10, borderRadius:18, background:panelBg, border:`1px solid ${panelBorder}`, padding:11, textAlign:'left', fontFamily:'inherit' }}>
              <FriendAvatar p={p} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:mainText, fontSize:14, fontWeight:1000, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.nickname}</div>
                <div style={{ color:subText, fontSize:11, marginTop:3 }}>Liv. {p.level || 1} · {p.capturedCount || 0} catture · {p.badgeCount || 0} badge</div>
              </div>
              <div style={{ color:'#F0A840', fontSize:12, fontWeight:1000 }}>{p.completionPct || 0}%</div>
            </button>)}
            {!friendRows.length && <div style={{ color:subText, fontSize:13, textAlign:'center', padding:22 }}>Cerca un giocatore e manda la prima richiesta.</div>}
          </div>}
        </div>}

        {tab === 'rank' && <div>
          <div style={{ color:subText, fontSize:11, fontWeight:1000, textTransform:'uppercase', margin:'0 0 8px 2px' }}>Leaderboard amici</div>
          <div style={{ display:'grid', gap:9 }}>
            {leaderboard.map(row => <div key={row.user_id} style={{ display:'flex', alignItems:'center', gap:10, borderRadius:18, background:row.isMe?'linear-gradient(135deg,rgba(240,168,64,.18),rgba(255,255,255,.045))':panelBg, border:`1px solid ${row.isMe?'rgba(240,168,64,.28)':panelBorder}`, padding:11 }}>
              <div style={{ width:34, height:34, borderRadius:13, background:row.rank === 1 ? '#F0C449' : row.rank === 2 ? '#C0C0C0' : row.rank === 3 ? '#CD7F32' : 'rgba(255,255,255,.08)', color:row.rank <= 3 ? '#17100A' : mainText, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:1000 }}>{row.rank}</div>
              <FriendAvatar p={row} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:mainText, fontSize:14, fontWeight:1000 }}>{row.isMe ? 'Tu' : row.nickname}</div>
                <div style={{ color:subText, fontSize:11 }}>Liv. {row.level} · {row.capturedCount} catture · {row.badgeCount} badge</div>
              </div>
              <div style={{ color:'#90D84A', fontSize:12, fontWeight:1000 }}>{row.xp} XP</div>
            </div>)}
          </div>
        </div>}

        {!!snapshot.requestsOut?.length && tab === 'search' && <div style={{ marginTop:14 }}>
          <div style={{ color:subText, fontSize:11, fontWeight:1000, textTransform:'uppercase', margin:'0 0 8px 2px' }}>Richieste inviate</div>
          {snapshot.requestsOut.map(row => <div key={row.id} style={{ display:'flex', alignItems:'center', gap:10, borderRadius:18, background:panelBg, border:`1px solid ${panelBorder}`, padding:10, marginBottom:8 }}>
            <FriendAvatar p={row.profile} />
            <div style={{ flex:1, color:mainText, fontWeight:950 }}>{row.profile.nickname}</div>
            <button onClick={()=>decline(row)} style={{ height:36, borderRadius:13, border:`1px solid ${panelBorder}`, background:'rgba(255,255,255,.05)', color:mainText, padding:'0 10px', fontWeight:1000 }}>Annulla</button>
          </div>)}
        </div>}
      </div>
      {selectedFriend && <div onClick={()=>setSelectedFriend(null)} style={{ position:'absolute', inset:0, zIndex:260, background:'rgba(0,0,0,.66)', display:'flex', alignItems:'flex-end', padding:14 }}>
        <div onClick={e=>e.stopPropagation()} style={{ width:'100%', borderRadius:26, background:isLightTheme?'#FBF7EF':'#171719', border:`1px solid ${panelBorder}`, padding:18, boxShadow:'0 24px 80px rgba(0,0,0,.55)' }}>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <FriendAvatar p={selectedFriend} />
            <div style={{ flex:1 }}>
              <div style={{ color:mainText, fontSize:20, fontWeight:1000 }}>{selectedFriend.nickname}</div>
              <div style={{ color:subText, fontSize:12 }}>@{selectedFriend.username}</div>
            </div>
            <button onClick={()=>setSelectedFriend(null)} style={{ width:36, height:36, borderRadius:13, border:`1px solid ${panelBorder}`, background:'transparent', color:mainText, fontWeight:1000 }}>×</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:14 }}>
            {[['Liv.', selectedFriend.level], ['Visti', selectedFriend.seenCount], ['Catture', selectedFriend.capturedCount], ['Badge', selectedFriend.badgeCount]].map(([label,value]) => <div key={label} style={{ borderRadius:15, background:isLightTheme?'rgba(0,0,0,.045)':'rgba(255,255,255,.055)', padding:10, textAlign:'center' }}><div style={{ color:'#F0A840', fontSize:16, fontWeight:1000 }}>{value || 0}</div><div style={{ color:subText, fontSize:10.5, fontWeight:850 }}>{label}</div></div>)}
          </div>
          <div style={{ height:9, borderRadius:999, background:isLightTheme?'rgba(0,0,0,.08)':'rgba(255,255,255,.08)', overflow:'hidden', marginTop:14 }}><div style={{ width:`${selectedFriend.completionPct || 0}%`, height:'100%', background:'linear-gradient(90deg,#B84D3A,#F0A840)' }} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:14 }}>
            <button onClick={()=>removeFriend(selectedFriend)} style={{ height:44, borderRadius:15, border:`1px solid ${panelBorder}`, background:'rgba(255,255,255,.04)', color:mainText, fontWeight:950 }}>Rimuovi</button>
            <button onClick={()=>blockFriend(selectedFriend)} style={{ height:44, borderRadius:15, border:'1px solid rgba(255,59,48,.35)', background:'rgba(255,59,48,.10)', color:'#FF8A80', fontWeight:950 }}>Blocca</button>
            <button onClick={()=>reportFriend(selectedFriend)} style={{ height:44, borderRadius:15, border:`1px solid ${panelBorder}`, background:'rgba(240,168,64,.10)', color:'#F0A840', fontWeight:950 }}>Segnala</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

function ProfilePage({ onBack, statusMap = {}, visitedCountries = [], earnedBadgeIds = [], onOpenGridStatus, onOpenBadges, onOpenRegions, onOpenGallery, userProfile, user, onLogout, theme='dark' }) {
  const fileInputRef = useRef(null);
  const animalsWithStatus = ANIMALS.map(a => ({ ...a, status: getResolvedAnimalStatus(a, statusMap, visitedCountries) }));
  const seenCount = animalsWithStatus.filter(a => a.status === 'avvistato' || a.status === 'catturato').length;
  const capturedCount = animalsWithStatus.filter(a => a.status === 'catturato').length;
  const regionsCount = new Set(animalsWithStatus.filter(a => a.status === 'avvistato' || a.status === 'catturato').flatMap(a => a.distribution?.countries_present || [])).size;
  const badgeCount = new Set([...earnedBadgeIds, ...computeUnlockedAwards(statusMap, visitedCountries).map(a => a.badgeId)].map(normalizeBadgeId)).size;
  const displayName = userProfile?.nickname || userProfile?.username || user?.email?.split('@')[0] || 'Esploratore';
  const progress = buildSimpleProgressState({ animals:ANIMALS, statusMap, visitedCountries, earnedBadgeIds });
  const nextLevelXP = xpForLevel(progress.level + 1);
  const currLevelXP = xpForLevel(progress.level);
  const xpPct = Math.max(0, Math.min(100, ((progress.xp - currLevelXP) / Math.max(1, nextLevelXP - currLevelXP)) * 100));
  const residenceCountry = userProfile?.residence_country || userProfile?.country || visitedCountries?.[0] || null;
  const statCards = [
    { label:'Animali visti', value:seenCount, onClick:()=>onOpenGridStatus?.(['avvistato','catturato']), bg:'mission' },
    { label:'Catturati', value:capturedCount, onClick:onOpenGallery },
    { label:'Badge', value:badgeCount, onClick:onOpenBadges },
    { label:'Regioni', value:regionsCount, onClick:onOpenRegions, bg:'regions' },
  ];
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:theme==='light'?LIGHT_APP_BG:'#1C1C1E', overflow:'hidden' }}>
      <PageHeader title="Profilo" onBack={onBack} theme={theme} />
      <div style={{ flex:1, overflowY:'auto', padding:18 }}>
        <div style={{ background:'linear-gradient(135deg,#102B4D 0%,#1B567B 58%,#0B1D35 100%)', borderRadius:24, padding:24, textAlign:'center', marginBottom:16, boxShadow:'0 18px 42px rgba(0,0,0,.28)', border:'1px solid rgba(255,255,255,.08)' }}>
          <button onClick={()=>fileInputRef.current?.click()} aria-label="Cambia foto profilo" style={{ width:102, height:102, borderRadius:'50%', background:'rgba(135,198,255,.18)', border:'1px solid rgba(255,255,255,.12)', color:'#9DD3FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48, margin:'0 auto 14px', cursor:'pointer', boxShadow:'inset 0 0 22px rgba(255,255,255,.06)' }}>👤</button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={()=>{}} />
          <div style={{ color:'white', fontSize:26, fontWeight:900, letterSpacing:'-.4px' }}>{displayName}</div>
          <div style={{ color:'#B9D7EF', fontSize:13, marginTop:5, fontWeight:600 }}>{user?.email || 'Profilo Animaldex'}</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginTop:14, flexWrap:'wrap' }}>
            <span style={{ color:'#F5F1EA', fontSize:12, fontWeight:1000, background:'rgba(255,255,255,.10)', border:'1px solid rgba(255,255,255,.10)', borderRadius:999, padding:'7px 10px' }}>Liv. {progress.level}</span>
            <span style={{ color:'#F0A840', fontSize:12, fontWeight:1000, background:'rgba(240,168,64,.12)', border:'1px solid rgba(240,168,64,.20)', borderRadius:999, padding:'7px 10px' }}>🔥 3 slancio</span>
            <span style={{ color:'#B9D7EF', fontSize:12, fontWeight:1000, background:'rgba(91,190,248,.10)', border:'1px solid rgba(91,190,248,.18)', borderRadius:999, padding:'7px 10px' }}>{progress.xp} / {nextLevelXP} XP</span>
          </div>
          <div style={{ height:9, borderRadius:999, background:'rgba(255,255,255,.12)', overflow:'hidden', marginTop:13 }}><div style={{ height:'100%', width:`${xpPct}%`, background:'linear-gradient(90deg,#D8D2C4,#C87955,#B84D3A)', boxShadow:'0 0 14px rgba(184,77,58,.22)', borderRadius:999 }} /></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {statCards.map(card=>{
            const cardBg = card.bg === 'regions'
              ? 'linear-gradient(90deg, rgba(5,11,13,.72), rgba(5,11,13,.34) 58%, rgba(5,11,13,.16)), url("/regions/home_regioni.png")'
              : card.bg === 'mission'
                ? 'linear-gradient(135deg, rgba(6,7,9,.36), rgba(10,10,12,.78) 72%), url("/regions/animals_general.png")'
                : '#222222';
            return <button key={card.label} onClick={card.onClick} style={{ background:cardBg, backgroundSize:'cover', backgroundPosition:'center', border:'1px solid rgba(255,255,255,.10)', borderRadius:12, padding:16, minHeight:112, textAlign:'left', cursor:'pointer', display:'flex', flexDirection:'column', justifyContent:'space-between', fontFamily:'inherit', overflow:'hidden' }}><div style={{ color:'#90D84A', fontSize:28, fontWeight:900, lineHeight:1, textShadow:'0 2px 10px rgba(0,0,0,.35)' }}>{card.value}</div><div style={{ color:'white', fontSize:13, fontWeight:900, lineHeight:1.25, textShadow:'0 2px 10px rgba(0,0,0,.45)' }}>{card.label}</div></button>;
          })}
        </div>
        <div style={{ marginTop:16, background:'#222226', border:'1px solid rgba(255,255,255,.08)', borderRadius:18, padding:16 }}>
          <div style={{ color:'white', fontSize:18, fontWeight:900, marginBottom:12 }}>Account</div>
          {[
            ['Nome', displayName],
            ['Email', user?.email || '—'],
            ['Data di nascita', userProfile?.date_of_birth || 'Non impostata'],
            ['Genere', userProfile?.gender || 'Non impostato'],
            ['Nazionalità', userProfile?.nationality ? `${getFlagEmoji(userProfile.nationality)} ${getCountryDisplayName(userProfile.nationality)}` : 'Non impostata'],
            ['Telefono', userProfile?.phone || 'Non impostato'],
            ['Obiettivi', Array.isArray(userProfile?.onboarding_objectives) && userProfile.onboarding_objectives.length ? userProfile.onboarding_objectives.join(', ') : 'Non impostati'],
            ['Collezionista', userProfile?.is_collector === true ? 'Sì' : userProfile?.is_collector === false ? 'No' : 'Non impostato'],
	            ['Vacanze estero/anno', userProfile?.annual_abroad_vacations || 'Non impostato'],
	            ['Paese di residenza', residenceCountry ? `${getFlagEmoji(residenceCountry)} ${getCountryDisplayName(residenceCountry)}` : 'Non impostato'],
            ['Amici', 'In arrivo'],
          ].map(([label,value])=>(
            <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'11px 0', borderTop:'1px solid rgba(255,255,255,.06)' }}>
              <span style={{ color:'rgba(255,255,255,.50)', fontSize:12, fontWeight:800 }}>{label}</span>
              <span style={{ color:'white', fontSize:13, fontWeight:900, textAlign:'right', overflow:'hidden', textOverflow:'ellipsis' }}>{value}</span>
            </div>
          ))}
          <button data-sound="back" onClick={onLogout} style={{ marginTop:14, width:'100%', height:44, borderRadius:14, border:'none', background:'rgba(255,59,48,.16)', color:'#FF8A80', fontWeight:900, fontFamily:'inherit', cursor:'pointer' }}>Log out</button>
        </div>
      </div>
    </div>
  );
}



function AwardCard({ rule, unlocked, onOpen, tutorialHighlight=false }) {
  const img = buildAwardImagePath(rule.badgeId);
  const borderColor = BADGE_LEVEL_COLORS[Number(rule.level) || 1] || '#CD7F32';
  return (
    <button
      onClick={()=>onOpen?.(rule)}
      style={{
        border:`1.5px solid ${borderColor}`,
        borderRadius:18,
        padding:'12px 8px 10px',
        minHeight:158,
        background:unlocked ? 'linear-gradient(180deg,#464646,#272727)' : 'linear-gradient(180deg,#343436,#252527)',
        boxShadow:tutorialHighlight?`0 0 0 3px ${borderColor}, 0 0 34px ${borderColor}55`:`0 10px 26px rgba(0,0,0,.24)`,
        position:'relative',
        zIndex:tutorialHighlight?180:1,
        cursor:'pointer',
        fontFamily:'inherit',
        color:'white',
        overflow:'hidden',
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'space-between'
      }}
    >
      <img src={img} alt={rule.name} onError={e=>{e.currentTarget.style.display='none'; const n=e.currentTarget.nextSibling; if(n) n.style.display='flex';}} style={{ width:'92%', maxWidth:118, height:108, objectFit:'contain', filter:unlocked?'drop-shadow(0 6px 12px rgba(0,0,0,.36))':'grayscale(1) opacity(.7)' }} />
      <span style={{ display:'none', alignItems:'center', justifyContent:'center', flexDirection:'column', width:108, height:108, borderRadius:24, border:`1px dashed ${borderColor}88`, color:borderColor, fontSize:24, fontWeight:1000, lineHeight:1.05, textAlign:'center' }}><span>L{rule.level}</span><span style={{ marginTop:5, color:'rgba(255,255,255,.58)', fontSize:9, fontWeight:900 }}>{String(rule.badgeId || '').toLowerCase()}.png</span></span>
      <div style={{ color:unlocked?'#fff':'rgba(255,255,255,.62)', fontSize:12.5, fontWeight:900, lineHeight:1.13, textAlign:'center', minHeight:30, display:'flex', alignItems:'center' }}>{rule.name}</div>
    </button>
  );
}

function AwardModal({ rule, unlocked, currentValue, onClose, onPrev, onNext }) {
  if (!rule) return null;
  const img = buildAwardImagePath(rule.badgeId);
  const progress = Math.min(100, Math.round((Number(currentValue || 0) / Math.max(1, Number(rule.threshold || 1))) * 100));
  const borderColor = BADGE_LEVEL_COLORS[Number(rule.level) || 1] || '#CD7F32';
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:220, display:'flex', alignItems:'center', justifyContent:'center', padding:18 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:430, borderRadius:28, background:'linear-gradient(180deg,#2D2D31,#151517)', border:`1px solid ${borderColor}88`, boxShadow:'0 30px 80px rgba(0,0,0,.55)', padding:22, textAlign:'center', animation:'tabFromRight .18s ease-out', position:'relative' }}>
        <button onClick={onClose} aria-label="Chiudi" style={{ position:'absolute', top:14, right:14, width:42, height:42, borderRadius:14, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.09)', color:'white', fontSize:24, cursor:'pointer', zIndex:2, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>×</button>
        <button onClick={onPrev} aria-label="Badge precedente" style={{ position:'absolute', top:'50%', left:12, transform:'translateY(-50%)', width:42, height:42, borderRadius:14, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.09)', color:'white', fontSize:28, cursor:'pointer', zIndex:2, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>‹</button>
        <button onClick={onNext} aria-label="Badge successivo" style={{ position:'absolute', top:'50%', right:12, transform:'translateY(-50%)', width:42, height:42, borderRadius:14, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.09)', color:'white', fontSize:28, cursor:'pointer', zIndex:2, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>›</button>
        <div style={{ height:8 }} />
        <img src={img} alt={rule.name} onError={e=>{e.currentTarget.style.display='none'; const n=e.currentTarget.nextSibling; if(n) n.style.display='flex';}} style={{ width:266, height:266, maxWidth:'82vw', objectFit:'contain', filter:unlocked?'drop-shadow(0 12px 28px rgba(0,0,0,.45))':'grayscale(1) opacity(.78)', margin:'0 auto 8px', display:'block' }} />
        <span style={{ display:'none', alignItems:'center', justifyContent:'center', flexDirection:'column', width:266, height:266, maxWidth:'82vw', borderRadius:34, border:`1px dashed ${borderColor}88`, color:borderColor, fontSize:70, fontWeight:1000, margin:'0 auto 8px', lineHeight:1 }}><span>L{rule.level}</span><span style={{ marginTop:14, color:'rgba(255,255,255,.62)', fontSize:13, fontWeight:900 }}>{String(rule.badgeId || '').toLowerCase()}.png</span></span>
        <div style={{ color:'white', fontSize:24, fontWeight:900, lineHeight:1.1, marginTop:4 }}>{rule.name}</div>
        <div style={{ color:'rgba(255,255,255,.48)', fontSize:12, fontWeight:800, marginTop:6 }}>{rule.macro}</div>
        <div style={{ color:'rgba(255,255,255,.76)', fontSize:14, lineHeight:1.55, marginTop:18 }}>{getAwardDescription(rule)}</div>
        {!unlocked && (
          <div style={{ marginTop:18, background:'rgba(255,255,255,.07)', borderRadius:16, padding:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', color:'rgba(255,255,255,.68)', fontSize:12, fontWeight:800, marginBottom:8 }}>
              <span>Progresso</span><span>{Number(currentValue || 0)} / {rule.threshold}</span>
            </div>
            <div style={{ height:10, borderRadius:999, background:'rgba(0,0,0,.35)', overflow:'hidden' }}>
              <div style={{ width:`${progress}%`, height:'100%', borderRadius:999, background:borderColor }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BadgesPage({ onBack, statusMap = {}, visitedCountries = [], earnedBadgeIds = [], openBadgeId=null, onBadgeOpened, tutorialActive=false, onTutorialBadgeOpen, theme='dark' }) {
  const [macro, setMacro] = useState('Tutti');
  const [onlyUnlocked, setOnlyUnlocked] = useState(false);
  const [selectedAward, setSelectedAward] = useState(null);
  const metrics = computeAwardMetrics(statusMap, visitedCountries);
  const unlockedSet = new Set([...earnedBadgeIds, ...computeUnlockedAwards(statusMap, visitedCountries).map(a => a.badgeId)].map(normalizeBadgeId));
  const macros = ['Tutti', ...AWARD_MACROS];
  const awards = AWARD_RULES.filter(rule => (macro === 'Tutti' || rule.macro === macro) && (!onlyUnlocked || unlockedSet.has(normalizeBadgeId(rule.badgeId))));
  const orderedAwards = [...awards].sort((a,b)=> String(a.macro).localeCompare(String(b.macro)) || String(a.baseKey || a.badgeId).localeCompare(String(b.baseKey || b.badgeId)) || Number(a.level) - Number(b.level));
  const rows = [];
  for (let i = 0; i < orderedAwards.length; i += 3) rows.push(orderedAwards.slice(i, i + 3));
  useEffect(() => {
    if (!openBadgeId) return;
    const match = AWARD_RULES.find(rule => normalizeBadgeId(rule.badgeId) === normalizeBadgeId(openBadgeId));
    if (match) {
      setSelectedAward(match);
      setMacro('Tutti');
      onBadgeOpened?.();
    }
  }, [openBadgeId]);
  const selectedIndex = selectedAward ? orderedAwards.findIndex(rule => rule.badgeId === selectedAward.badgeId) : -1;
  const shiftSelected = (dir) => {
    if (!orderedAwards.length) return;
    const nextIndex = selectedIndex < 0 ? 0 : (selectedIndex + dir + orderedAwards.length) % orderedAwards.length;
    setSelectedAward(orderedAwards[nextIndex]);
  };
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:theme==='light'?LIGHT_APP_BG:'#2A2A2C', overflow:'hidden' }}>
      <PageHeader title="Badge" onBack={onBack} theme={theme} />
      <div style={{ padding:'12px 12px 8px', flexShrink:0 }}>
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:6 }}>
          {macros.map(c=><button key={c} onClick={()=>setMacro(c)} style={{ padding:'8px 14px', borderRadius:12, border:'none', background:macro===c?(theme==='light'?'#171717':'#777'):(theme==='light'?'#F3F1EC':'#3A3A3C'), color:macro===c?'white':(theme==='light'?'#171717':'white'), fontSize:13, fontWeight:800, whiteSpace:'nowrap', cursor:'pointer' }}>{c}</button>)}
        </div>
        <button onClick={()=>setOnlyUnlocked(v=>!v)} style={{ marginTop:8, width:'100%', height:40, borderRadius:12, background:onlyUnlocked?'rgba(144,216,74,.2)':(theme==='light'?'#F3F1EC':'#3A3A3C'), border:`1px solid ${theme==='light'?'rgba(0,0,0,.10)':'rgba(255,255,255,.08)'}`, color:onlyUnlocked?'#90D84A':(theme==='light'?'#171717':'white'), fontWeight:800, cursor:'pointer' }}>{onlyUnlocked ? 'Mostra tutti' : 'Solo ricercati'}</button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'10px 12px 28px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {rows.map((row, rowIdx)=><div key={rowIdx} style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>{row.map((rule,idx)=><AwardCard key={rule.badgeId} rule={rule} unlocked={unlockedSet.has(normalizeBadgeId(rule.badgeId))} tutorialHighlight={tutorialActive && rowIdx===0 && idx===0} onOpen={(r)=>{setSelectedAward(r); if(tutorialActive) onTutorialBadgeOpen?.(r);}} />)}{Array.from({ length: Math.max(0, 3 - row.length) }).map((_,i)=><div key={`empty-${i}`} />)}</div>)}
        </div>
      </div>
      {selectedAward && <AwardModal rule={selectedAward} unlocked={unlockedSet.has(normalizeBadgeId(selectedAward.badgeId))} currentValue={metrics[selectedAward.metric]} onClose={()=>setSelectedAward(null)} onPrev={()=>shiftSelected(-1)} onNext={()=>shiftSelected(1)} />}
    </div>
  );
}


function ScratchMap({ visitedCountries, selectedCountry, onSelectCountry }) {
  const visited = Array.from(new Set((visitedCountries || []).map(c=>String(c).toUpperCase()).filter(Boolean))).slice(0, 120);
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <div style={{ color:'white', fontSize:18, fontWeight:1000 }}>Paesi visitati</div>
        <div style={{ color:'#90D84A', fontSize:13, fontWeight:1000 }}>{visited.length}</div>
      </div>
      <CountryPresenceMap countryCodes={visited} selectedCountry={selectedCountry} onSelectCountry={onSelectCountry} accent="#90D84A" height={250} title="Paesi visitati" pointMode={false} />
      {visited.length === 0 && <div style={{ marginTop:8, color:'rgba(255,255,255,.45)', fontSize:12, textAlign:'center' }}>Aggiungi un paese visitato per evidenziarlo sulla mappa.</div>}
    </div>
  );
}

function VisitedCountryCard({ code, onOpenAnimals, onRemove }) {
  const [flipped, setFlipped] = useState(false);
  useAutoUnflip(flipped, setFlipped, 5000);
  const count = countAnimalsForGeoValue(code);
  return (
    <div className="interactive-hint" onClick={()=>setFlipped(v=>!v)} style={{ minHeight:72, borderRadius:14, background:'#1A1A1C', border:'1px solid rgba(255,255,255,.08)', overflow:'hidden', cursor:'pointer', perspective:700 }}>
      <div style={{ position:'relative', minHeight:72, transition:'transform .28s ease', transformStyle:'preserve-3d', transform:flipped?'rotateY(180deg)':'rotateY(0deg)' }}>
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', boxSizing:'border-box' }}>
          <span style={{ fontSize:24 }}>{getFlagEmoji(code)}</span>
          <span style={{ color:'white', fontSize:13, fontWeight:900, lineHeight:1.15, flex:1 }}>{getCountryDisplayName(code)}</span>
          <button onClick={e=>{e.stopPropagation();onRemove?.(code);}} style={{ width:28, height:28, borderRadius:8, border:'none', background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.6)', cursor:'pointer' }}>×</button>
        </div>
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateY(180deg)', padding:'10px 12px', boxSizing:'border-box', display:'flex', alignItems:'center', gap:10 }}>
          <button data-sound="back" onClick={e=>{e.stopPropagation();setFlipped(false);}} aria-label="Gira card" style={{ position:'absolute', top:6, right:6, width:24, height:24, borderRadius:8, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.06)', color:'white', fontSize:12, fontWeight:900, cursor:'pointer', zIndex:3 }}>↺</button>
          <div style={{ color:'#90D84A', fontSize:22, fontWeight:900, minWidth:34, textAlign:'center' }}>{count}</div>
          <div style={{ color:'rgba(255,255,255,.65)', fontSize:11, fontWeight:700, lineHeight:1.2, flex:1 }}>animali associati a questo paese</div>
          <button onClick={e=>{e.stopPropagation();onOpenAnimals?.(code);}} style={{ height:34, borderRadius:10, border:'none', background:'#244A70', color:'white', fontWeight:900, fontSize:11, padding:'0 10px', cursor:'pointer' }}>Vedi animali</button>
        </div>
      </div>
    </div>
  );
}


// ── LifeWeb / Food Web prototype ──────────────────────────────────────
const HABITAT_LABELS = {
  FOREST_TEMP:'Foresta temperata', FOREST_TROP:'Foresta tropicale', FOREST_BOREAL:'Foresta boreale', FOREST_MONTANE:'Foresta montana',
  GRASS_TEMP:'Prateria temperata', GRASS_TROP:'Savana / prateria tropicale', DES_HOT:'Deserto caldo', DES_COLD:'Deserto freddo',
  WET_WETLANDS:'Zone umide', WET_RIVER:'Fiumi', WET_LAKE:'Laghi', WET_POOL:'Pozze temporanee', MAR_SHORELINES:'Coste e litorali',
  MAR_CORAL:'Barriera corallina', MAR_PELAGIC:'Pelagico', MAR_BENTHIC:'Benthos marino', MAR_KELP:'Foreste di kelp', MAR_ESTUARY:'Estuari',
  ART_URBAN:'Urbano', ART_CANAL:'Canali e aree artificiali', CAVE:'Grotte', TUNDRA:'Tundra', SHRUB:'Arbusteti', MOUNTAIN:'Montagna'
};
const HABITAT_RESOURCE_MAP = {
  FOREST_TEMP:['leaves','fruit','seeds','insects','detritus'], FOREST_TROP:['fruit','leaves','nectar','insects','detritus'], FOREST_BOREAL:['seeds','leaves','insects','detritus'],
  GRASS_TEMP:['grass','seeds','insects','small_mammals'], GRASS_TROP:['grass','seeds','insects','carrion'], DES_HOT:['seeds','insects','detritus','carrion'], DES_COLD:['seeds','detritus','insects'],
  WET_WETLANDS:['algae','aquatic_plants','insects','larvae','small_fish'], WET_RIVER:['algae','insects','larvae','small_fish'], WET_LAKE:['algae','zooplankton','small_fish','larvae'],
  MAR_SHORELINES:['algae','detritus','crustaceans','small_fish'], MAR_CORAL:['algae','coral_polyps','plankton','small_fish'], MAR_PELAGIC:['phytoplankton','zooplankton','krill','small_fish'],
  MAR_BENTHIC:['detritus','algae','crustaceans'], MAR_KELP:['algae','small_fish','crustaceans'], MAR_ESTUARY:['detritus','algae','small_fish','crustaceans'],
  ART_URBAN:['seeds','fruit','insects','detritus'], TUNDRA:['grass','seeds','insects','carrion'], SHRUB:['leaves','fruit','seeds','insects'], MOUNTAIN:['grass','seeds','insects','small_mammals']
};
const RESOURCE_LABELS = {
  grass:'Erbe e graminacee',
  leaves:'Foglie e germogli',
  fruit:'Frutti',
  seeds:'Semi',
  nectar:'Nettare',
  algae:'Alghe',
  aquatic_plants:'Piante acquatiche',
  phytoplankton:'Fitoplancton',
  zooplankton:'Zooplancton',
  plankton:'Plancton',
  detritus:'Detrito organico',
  carrion:'Carogne',
  insects:'Insetti',
  larvae:'Larve',
  krill:'Krill',
  coral_polyps:'Polipi corallini',
  small_fish:'Piccoli pesci',
  small_mammals:'Piccoli mammiferi',
  crustaceans:'Crostacei'
};
function normalizeHabitatId(id) {
  const s = String(id || '').trim();
  if (!s) return '';
  const u = s.toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');
  if (/FOREST.*TEMP|TEMP.*FOREST|1_4/.test(u)) return 'FOREST_TEMP';
  if (/FOREST.*TROP|TROP.*FOREST|1_6/.test(u)) return 'FOREST_TROP';
  if (/BOREAL|TAIGA/.test(u)) return 'FOREST_BOREAL';
  if (/MONTANE|MOUNTAIN/.test(u)) return 'MOUNTAIN';
  if (/GRASS|PRAIRIE|SAVANNA|STEPPE/.test(u)) return /TROP|SAVANNA/.test(u) ? 'GRASS_TROP' : 'GRASS_TEMP';
  if (/DESERT|DES_|ARID/.test(u)) return /COLD/.test(u) ? 'DES_COLD' : 'DES_HOT';
  if (/WETLAND|SWAMP|MARSH/.test(u)) return 'WET_WETLANDS';
  if (/RIVER|STREAM/.test(u)) return 'WET_RIVER';
  if (/LAKE/.test(u)) return 'WET_LAKE';
  if (/CORAL|REEF/.test(u)) return 'MAR_CORAL';
  if (/PELAGIC|EPIPELAGIC|OCEANIC/.test(u)) return 'MAR_PELAGIC';
  if (/BENTHIC|SEAFLOOR/.test(u)) return 'MAR_BENTHIC';
  if (/KELP/.test(u)) return 'MAR_KELP';
  if (/ESTUAR/.test(u)) return 'MAR_ESTUARY';
  if (/SHORE|COAST|LITTORAL|BEACH|MARINE/.test(u)) return 'MAR_SHORELINES';
  if (/URBAN|ART|CANAL|GARDEN|CITY/.test(u)) return 'ART_URBAN';
  if (/TUNDRA/.test(u)) return 'TUNDRA';
  if (/SHRUB|SCRUB/.test(u)) return 'SHRUB';
  return u;
}
function getAnimalHabitatIds(a) {
  return Array.from(new Set(toArraySafe(
    a?.geo?.habitat_ids || a?.habitat_ids || a?.habitats || a?.geo?.habitats || a?.foodweb?.habitat_iucn_codes || []
  ).map(normalizeHabitatId).filter(Boolean)));
}
function habitatLabel(id) {
  const key = normalizeHabitatId(id);
  return HABITAT_LABELS[key] || String(id || 'Habitat').replace(/_/g,' ').toLowerCase().replace(/^\w/, c=>c.toUpperCase());
}
function inferDefaultHabitatsForTerritory(territory) {
  const label = `${territory?.label || ''} ${territory?.name_en || ''}`.toLowerCase();
  if (/coral|reef|pacific|atlantic|ocean|marine|sea|indo/.test(label)) return ['MAR_PELAGIC','MAR_SHORELINES','MAR_CORAL'];
  if (/desert|arid|sahara|arab|persian|messic/.test(label)) return ['DES_HOT','SHRUB'];
  if (/tundra|greenland|arctic|antart|boreal|siber|alaska|canadian/.test(label)) return ['TUNDRA','FOREST_BOREAL'];
  if (/savanna|grass|prairie|steppe|plain|praterie|grandi pianure/.test(label)) return ['GRASS_TEMP','GRASS_TROP'];
  if (/forest|foreste|amazon|congo|sundaland|indochina|tropical|madagascar/.test(label)) return ['FOREST_TROP','FOREST_TEMP'];
  if (/coast|costa|caraibi|isole|islands|oceania/.test(label)) return ['MAR_SHORELINES','FOREST_TROP'];
  return ['FOREST_TEMP','GRASS_TEMP','WET_WETLANDS'];
}
function animalMatchesHabitat(a, habitatId) {
  const h = normalizeHabitatId(habitatId);
  const ids = getAnimalHabitatIds(a);
  if (!h) return true;
  if (ids.includes(h)) return true;
  if (!ids.length) return false;
  const group = h.split('_')[0];
  return ids.some(id => id.startsWith(group + '_'));
}
function getHabitatsForTerritory(territory, animals = []) {
  const rows = new Map();
  const filterValue = territory?.filterValue || (territory?.id ? `ecoregion:${territory.id}` : '');
  const matching = animals.filter(a => !filterValue || matchGeographySelection(a, [filterValue]));
  matching.forEach(a => getAnimalHabitatIds(a).forEach(id => {
    const key = normalizeHabitatId(id);
    if (!rows.has(key)) rows.set(key, { id:key, label:habitatLabel(key), count:0, animals:[] });
    const row = rows.get(key); row.count += 1; row.animals.push(a);
  }));
  if (!rows.size) {
    inferDefaultHabitatsForTerritory(territory).forEach(id => rows.set(id, { id, label:habitatLabel(id), count:0, animals:[] }));
  }
  return Array.from(rows.values()).sort((a,b)=>b.count-a.count || a.label.localeCompare(b.label)).slice(0,10);
}
function trophicGroup(a) {
  const fw = a?.foodweb || {};
  const raw = String(fw.consumer_group || fw.feeding_mode || a?.diet || a?.trophic_group || '').toLowerCase();
  const tags = toArraySafe(fw.diet_tags || a?.diet_tags || []).join(' ').toLowerCase();
  const trophic = String(a?.trophic || '').toLowerCase();
  if (/producer|plant|algae/.test(raw)) return 'producer';
  if (/filter|plankton|suspension/.test(raw + tags) || trophic === 'f') return 'filter';
  if (/herb|grazer|nectar|frug|foliv|seed/.test(raw + tags) || trophic === '1') return 'herbivore';
  if (/omni/.test(raw + tags) || trophic === '2') return 'omnivore';
  if (/apex|top/.test(raw + tags) || trophic === '4') return 'apex';
  if (/carn|pred|pisc|insectiv/.test(raw + tags) || trophic === '3') return 'carnivore';
  if (['Insecta','Bivalvia','Gastropoda'].includes(a?.cls)) return 'herbivore';
  if (['Aves','Mammalia','Reptilia','Amphibia','Actinopterygii','Elasmobranchii','Cephalopoda'].includes(a?.cls)) return 'omnivore';
  return 'omnivore';
}
function nodeColorForGroup(group) {
  if (group === 'resource' || group === 'producer') return '#76D17B';
  if (group === 'herbivore' || group === 'filter') return '#74C7FF';
  if (group === 'omnivore') return '#F0B24E';
  if (group === 'carnivore' || group === 'apex') return '#FF7E8F';
  return '#B9B8C8';
}
function getAnimalPowerScore(a) {
  const mass = Math.log10(getAnimalMassG(a) + 10) * 12;
  const stats = a?.stats || {};
  const bite = Number(stats.morso || 0) / 3;
  const speed = Number(stats.velocita || 0) / 4;
  const strength = Number(stats.forza || 0) / 3;
  const cats = toArraySafe(a?.categories).join(' ');
  const traitBoost = (/VENOM|TOXIN|ARMOR|SPINES|POWER|BITE|CLAWS|APEX|AMBUSH|PACK/i.test(cats) ? 18 : 0) + (/SHELL|CAMOUFLAGE|FLIGHT/i.test(cats) ? 8 : 0);
  return Math.max(1, Math.round(mass + bite + speed + strength + traitBoost));
}
function animalPreyCategory(a) {
  if (['Insecta','Arachnida','Malacostraca','Chilopoda','Diplopoda'].includes(a?.cls)) return 'invertebrate';
  if (['Actinopterygii','Elasmobranchii'].includes(a?.cls)) return 'fish';
  if (['Aves'].includes(a?.cls)) return 'bird';
  if (['Mammalia'].includes(a?.cls)) return 'mammal';
  if (['Reptilia','Amphibia'].includes(a?.cls)) return 'herp';
  return 'animal';
}
function predatorCanEat(pred, prey) {
  if (!pred || !prey || pred.id === prey.id) return null;
  const group = trophicGroup(pred);
  if (!['omnivore','carnivore','apex'].includes(group)) return null;
  const predMass = getAnimalMassG(pred), preyMass = getAnimalMassG(prey);
  const predPower = getAnimalPowerScore(pred), preyPower = getAnimalPowerScore(prey);
  const predTags = toArraySafe(pred?.foodweb?.diet_tags || pred?.diet_tags || []).join(' ').toLowerCase();
  const preyCat = animalPreyCategory(prey);
  const preyCats = toArraySafe(prey?.categories).join(' ');
  if (/VENOM|TOXIN|POISON/i.test(preyCats) && predPower < preyPower * 1.35 && !/toxin|venom|specialist|resistant/.test(predTags)) return null;
  let dietOk = /animal|meat|vertebrate|prey|carn|fish|insect|mammal|bird|egg|crustacean|amphibian|reptile/.test(predTags);
  if (preyCat === 'fish' && /fish|pisc|aquatic|marine/.test(predTags)) dietOk = true;
  if (preyCat === 'invertebrate' && /insect|invertebrate|crustacean|arthropod/.test(predTags)) dietOk = true;
  if (!dietOk && group === 'omnivore' && preyMass > predMass * 0.08) return null;
  if (preyMass > predMass * (group === 'apex' ? 1.8 : .75) && predPower < preyPower * 1.15) return null;
  if (predPower < preyPower * .62 && preyMass > predMass * .25) return null;
  const confidence = predPower > preyPower * 1.35 ? 'likely' : predPower > preyPower ? 'possible' : 'rare';
  return { confidence, role: confidence === 'likely' ? 'core' : confidence === 'possible' ? 'secondary' : 'opportunistic', basis:['habitat condiviso','geografia condivisa','taglia/potenza compatibile'] };
}
function resourceFeedsAnimal(resourceId, animal) {
  const group = trophicGroup(animal);
  const tags = toArraySafe(animal?.foodweb?.diet_tags || animal?.diet_tags || []).join(' ').toLowerCase();
  if (resourceId === 'grass') return group === 'herbivore' || /grass|grazer|herb/.test(tags);
  if (resourceId === 'leaves') return group === 'herbivore' || /leaf|leaves|foliv/.test(tags);
  if (resourceId === 'fruit') return /fruit|frug|omni/.test(tags) || group === 'omnivore';
  if (resourceId === 'seeds') return /seed|grain|graniv|omni/.test(tags) || group === 'omnivore';
  if (resourceId === 'nectar') return /nectar|pollin/.test(tags);
  if (['algae','phytoplankton','zooplankton','plankton','krill'].includes(resourceId)) return group === 'filter' || /plankton|filter|krill|algae/.test(tags);
  if (['insects','larvae','crustaceans','small_fish','small_mammals'].includes(resourceId)) return /insect|larvae|crustacean|fish|mammal|animal|carn|omni/.test(tags) || ['omnivore','carnivore','apex'].includes(group);
  if (resourceId === 'carrion') return /carrion|scav/.test(tags) || group === 'omnivore';
  if (resourceId === 'detritus') return /detrit|deposit|benthic/.test(tags) || ['filter','herbivore'].includes(group);
  return false;
}
function getFoodWebCandidateAnimals(allAnimals, territory, habitat, limit=120, focusAnimal=null) {
  const filterValue = territory?.filterValue || (territory?.id ? `ecoregion:${territory.id}` : '');
  const exactBioregionId = habitat?.id === 'GENERAL' ? (habitat?.exactBioregionId || territory?.bioregionId || territory?.id) : null;
  const focus = focusAnimal ? (allAnimals || []).find(a => a.id === focusAnimal.id) || focusAnimal : null;
  let list = (allAnimals || []).filter(a => {
    const geoOk = exactBioregionId ? matchExactBioregion(a, exactBioregionId) : (!filterValue || matchGeographySelection(a, [filterValue]));
    const habitatOk = !habitat?.id || habitat.id === 'GENERAL' || animalMatchesHabitat(a, habitat?.id);
    return geoOk && habitatOk;
  });
  if (focus) {
    const focusHabitats = getAnimalHabitatIds(focus);
    const focusCountries = new Set(toArraySafe(focus?.distribution?.countries_present || focus?.geo?.iso?.primary || []));
    const contextual = (allAnimals || []).filter(a => {
      const sameHabitat = !focusHabitats.length || getAnimalHabitatIds(a).some(id => focusHabitats.includes(id));
      const sameCountry = !focusCountries.size || toArraySafe(a?.distribution?.countries_present || a?.geo?.iso?.primary || []).some(code => focusCountries.has(code));
      const geoOk = exactBioregionId ? matchExactBioregion(a, exactBioregionId) : (!filterValue || matchGeographySelection(a, [filterValue]));
      return (sameHabitat || sameCountry) && geoOk;
    });
    if (contextual.length) list = contextual;
  }
  if (list.length < 6 && habitat?.id && habitat.id !== 'GENERAL') list = (allAnimals || []).filter(a => animalMatchesHabitat(a, habitat?.id));
  list.sort((a,b)=>getAnimalPowerScore(b)-getAnimalPowerScore(a));
  if (focus && !list.some(a => a.id === focus.id)) list = [focus, ...list];
  return Array.from(new Map(list.map(a => [a.id, a])).values()).slice(0, limit);
}

function buildGeneralLifeWebHabitat(territory) {
  return { id:'GENERAL', label:territory?.label || 'LifeWeb', exactBioregionId:territory?.bioregionId || territory?.id || null, count:0, animals:[] };
}

function autoArrangeLifeWebNodes(nodes = [], focusAnimalId = null) {
  const order = ['apex','carnivore','omnivore','filter','herbivore','producer','resource'];
  const yByGroup = { apex:13, carnivore:29, omnivore:48, filter:66, herbivore:73, producer:84, resource:90 };
  const grouped = nodes.reduce((acc,node)=>{ (acc[node.group || 'omnivore'] ||= []).push(node); return acc; }, {});
  const maxCount = Math.max(1, ...Object.values(grouped).map(arr => arr.length));
  const canvasWidth = Math.max(100, 24 + maxCount * 13);
  const arranged = [];
  order.forEach(group => {
    const arr = [...(grouped[group] || [])].sort((a,b)=> (a.animalId === focusAnimalId ? -1 : b.animalId === focusAnimalId ? 1 : (b.power || 0) - (a.power || 0)));
    const count = arr.length;
    if (!count) return;
    const usable = canvasWidth - 18;
    const step = count === 1 ? 0 : usable / (count - 1);
    arr.forEach((node,idx) => {
      const baseX = count === 1 ? canvasWidth / 2 : 9 + idx * step;
      const wobble = (idx % 2 ? 2.6 : -2.6) * Math.min(1, count / 12);
      arranged.push({ ...node, x: node.animalId === focusAnimalId ? canvasWidth / 2 : Math.max(7, Math.min(canvasWidth - 7, baseX + wobble)), y:yByGroup[group] ?? 50, layoutWidth:canvasWidth });
    });
  });
  return arranged;
}

function buildLifeWebGraph(allAnimals, territory, habitat, focusAnimal=null, forcedAnimalIds=[]) {
  const animals = getFoodWebCandidateAnimals(allAnimals, territory, habitat, 36, focusAnimal);
  const extra = (allAnimals || []).filter(a => forcedAnimalIds.includes(a.id) && !animals.some(p => p.id === a.id));
  const pickedAnimals = [...animals, ...extra].slice(0, 36);
  const habitatResourceIds = (HABITAT_RESOURCE_MAP[normalizeHabitatId(habitat?.id)] || inferDefaultHabitatsForTerritory(territory).flatMap(h=>HABITAT_RESOURCE_MAP[h] || []) || ['grass','insects','detritus']).slice(0,8);
  const animalLikeResources = new Set(['crustaceans','small_fish','small_mammals']);
  const resourceIds = habitatResourceIds.filter(r => !animalLikeResources.has(r));
  const animalNodes = pickedAnimals.map(a => ({ id:`a:${a.id}`, animalId:a.id, type:'animal', label:a.com, sci:a.sci, group:trophicGroup(a), cls:a.cls, power:getAnimalPowerScore(a), image_url:isMysteryStatus(a.status)?'':a.image_url }));
  const resourceNodes = resourceIds.map((r)=>({ id:`res:${r}`, type:'resource', label:RESOURCE_LABELS[r] || r, group:'resource', power:0 }));
  const nodes = autoArrangeLifeWebNodes([...animalNodes, ...resourceNodes], focusAnimal?.id);
  const edgeMap = new Map();
  const addEdge = (edge) => { if (!edge?.id || edge.source === edge.target || edgeMap.has(edge.id)) return; edgeMap.set(edge.id, edge); };
  const byCls = (clsList=[]) => pickedAnimals.filter(a => clsList.includes(a.cls));
  const crustaceanPrey = pickedAnimals.filter(a => ['Malacostraca','Branchiopoda','Maxillopoda','Thecostraca'].includes(a.cls) || /crust/i.test(toArraySafe(a?.categories).join(' ')) || /crust/i.test(String(a?.com || '') + ' ' + String(a?.sci || '')));
  const fishPrey = byCls(['Actinopterygii','Elasmobranchii']).filter(a => getAnimalMassG(a) <= 20000 || getAnimalPowerScore(a) <= 110);
  const mammalPrey = byCls(['Mammalia']).filter(a => getAnimalMassG(a) <= 25000 || getAnimalPowerScore(a) <= 135);

  for (const a of pickedAnimals) {
    resourceIds.forEach(r => {
      if (resourceFeedsAnimal(r,a)) addEdge({ id:`res:${r}->a:${a.id}`, source:`res:${r}`, target:`a:${a.id}`, relation_type:'resource_use', confidence:'likely', role:'core', basis:['risorsa compatibile con habitat','diet_tags/consumer_group'] });
    });
  }

  const linkDietGroup = (pred, preyList, tagRegex, label) => {
    const tags = toArraySafe(pred?.foodweb?.diet_tags || pred?.diet_tags || []).join(' ').toLowerCase();
    const wants = tagRegex.test(tags) || habitatResourceIds.includes(label);
    if (!wants) return;
    preyList
      .filter(prey => prey.id !== pred.id && getAnimalPowerScore(pred) > getAnimalPowerScore(prey) * 1.08)
      .sort((a,b) => getAnimalPowerScore(a) - getAnimalPowerScore(b))
      .slice(0, 4)
      .forEach(prey => {
        const rel = predatorCanEat(pred, prey);
        if (rel) addEdge({ id:`a:${prey.id}->a:${pred.id}`, source:`a:${prey.id}`, target:`a:${pred.id}`, relation_type:'eats', confidence: rel.confidence === 'rare' ? 'possible' : rel.confidence, role: rel.role, basis:[...(rel.basis || []), `predazione reale su ${label}`] });
      });
  };

  for (const pred of pickedAnimals) {
    linkDietGroup(pred, crustaceanPrey, /crustacean|crab|shrimp|prawn|lobster/, 'crustaceans');
    linkDietGroup(pred, fishPrey, /fish|pisc|anchov|herring|small fish/, 'small_fish');
    linkDietGroup(pred, mammalPrey, /mammal|rodent|small mammal/, 'small_mammals');
  }

  for (const pred of pickedAnimals) for (const prey of pickedAnimals) {
    const rel = predatorCanEat(pred, prey);
    if (rel) addEdge({ id:`a:${prey.id}->a:${pred.id}`, source:`a:${prey.id}`, target:`a:${pred.id}`, relation_type:'eats', ...rel });
  }
  const edgeWeight = { likely:3, possible:2, rare:1 };
  const limitedEdges = Array.from(edgeMap.values()).sort((a,b)=>((edgeWeight[b.confidence] || 0) - (edgeWeight[a.confidence] || 0)) || (a.relation_type==='resource_use'?-1:1)).slice(0,220);
  return { nodes, edges:limitedEdges, animals:pickedAnimals, resources:resourceIds, focusAnimalId:focusAnimal?.id || null };
}

function LifeWebNodeAvatar({ node, color }) {
  const clipId = `lifeweb-clip-${String(node.id).replace(/[^a-z0-9_-]/gi,'')}`;
  const imgScale = node.animalId === node.focusAnimalId ? 16 : 13;
  if (node.type !== 'animal') {
    return <text y="1" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="2.6" fontWeight="900">✦</text>;
  }
  if (!node.image_url) {
    return <text y="1" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="2.4" fontWeight="900">●</text>;
  }
  return (
    <>
      <defs><clipPath id={clipId}><circle r={6.4} /></clipPath></defs>
      <circle r={6.4} fill={`${color}22`} />
      <image href={node.image_url} x={-imgScale/2} y={-imgScale/2} width={imgScale} height={imgScale} preserveAspectRatio="xMidYMid meet" clipPath={`url(#${clipId})`} style={{ filter:'saturate(1.1) contrast(1.05)' }} />
      <circle r={6.55} fill="none" stroke={`${color}88`} strokeWidth=".7" />
    </>
  );
}

function LifeWebMiniGrid({ animals = [], onOpenAnimal }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
      {animals.map(a => <AnimalCard key={a.id} a={a} onClick={onOpenAnimal} />)}
    </div>
  );
}

function LifeWebNodeModal({ node, graph, nodes, onClose, onOpenAnimal, onToggleRemove, removed }) {
  if (!node) return null;
  const nodeById = Object.fromEntries((nodes || []).map(n => [n.id, n]));
  const animalById = Object.fromEntries((graph.allAnimals || graph.animals || []).map(a => [a.id, a]));
  const incoming = (graph.edges || []).filter(e => e.target === node.id).map(e => nodeById[e.source]).filter(Boolean);
  const outgoing = (graph.edges || []).filter(e => e.source === node.id).map(e => nodeById[e.target]).filter(Boolean);
  const currentAnimal = node.type === 'animal' ? animalById[node.animalId] : null;
  const row = (label, arr, tone) => (
    <div style={{ marginTop:14 }}>
      <div style={{ color:tone, fontSize:12, fontWeight:1000, marginBottom:8 }}>{label}</div>
      <div style={{ display:'flex', gap:10, overflowX:'auto', WebkitOverflowScrolling:'touch', paddingBottom:4 }}>
        {arr.length ? arr.map(n => {
          const a = n.type === 'animal' ? animalById[n.animalId] : null;
          return <button key={n.id} onClick={()=>a && onOpenAnimal?.(a)} style={{ width:86, flex:'0 0 86px', minHeight:100, borderRadius:16, border:'1px solid rgba(255,255,255,.08)', background:'rgba(255,255,255,.055)', color:'white', padding:8, fontFamily:'inherit', cursor:a?'pointer':'default' }}>{a ? <AnimalImg a={a} size={56} fontSize={22} overrideStatus="catturato" /> : <div style={{ width:56, height:56, borderRadius:18, margin:'0 auto', background:'rgba(144,216,74,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>✦</div>}<div style={{ fontSize:10.5, fontWeight:900, lineHeight:1.1, marginTop:6 }}>{clampWholeWords(n.label, 22)}</div></button>;
        }) : <div style={{ color:'rgba(255,255,255,.42)', fontSize:12 }}>Nessun nodo diretto</div>}
      </div>
    </div>
  );
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.80)', zIndex:240, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:460, maxHeight:'92%', overflowY:'auto', borderRadius:28, background:'linear-gradient(180deg,#202126,#111216)', border:`1px solid ${nodeColorForGroup(node.group)}66`, boxShadow:'0 30px 80px rgba(0,0,0,.58)', padding:18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}><div style={{ color:'white', fontSize:22, fontWeight:1000 }}>{node.label}</div><button onClick={onClose} style={{ width:34, height:34, borderRadius:12, border:'none', background:'rgba(255,255,255,.08)', color:'white', fontSize:20 }}>×</button></div>
        <div style={{ display:'flex', gap:14, alignItems:'center' }}>
          <div style={{ width:104, height:104, borderRadius:34, background:`${nodeColorForGroup(node.group)}22`, border:`3px solid ${nodeColorForGroup(node.group)}`, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>{currentAnimal ? <AnimalImg a={currentAnimal} size={94} fontSize={32} overrideStatus="catturato" /> : <span style={{ fontSize:44, color:'white' }}>✦</span>}</div>
          <div style={{ flex:1, minWidth:0 }}><div style={{ color:nodeColorForGroup(node.group), fontSize:12, fontWeight:1000, textTransform:'uppercase' }}>{node.type==='resource'?'Risorsa':node.group}</div><div style={{ color:'rgba(255,255,255,.66)', fontSize:12, lineHeight:1.5, marginTop:6 }}>{node.type==='animal' ? `${node.cls || ''} · power ${node.power || 0}` : 'Nodo base che sostiene la rete.'}</div></div>
        </div>
        {row('Predatori / consumatori collegati', outgoing, '#FF7A88')}
        {row('Prede / risorse consumate', incoming, '#90D84A')}
        {currentAnimal && <button onClick={()=>onOpenAnimal?.(currentAnimal)} style={{ marginTop:16, width:'100%', height:44, borderRadius:14, border:'none', background:'#244A70', color:'white', fontWeight:1000 }}>Apri scheda animale</button>}
        <button onClick={()=>onToggleRemove?.(node.id)} style={{ marginTop:10, width:'100%', height:44, borderRadius:14, border:'none', background:removed?.has?.(node.id)?'#90D84A':'#A84637', color:'white', fontWeight:1000 }}>{removed?.has?.(node.id)?'Ripristina nodo':'Rimuovi dal web'}</button>
      </div>
    </div>
  );
}


function LifeWebGraph({ graph, onOpenAnimal, onGraphChange }) {
  const WIDTH = 1520;
  const HEIGHT = 1120;
  const WAIT_Y = HEIGHT - 88;
  const [nodes, setNodes] = useState([]);
  const nodesRef = useRef([]);
  const alphaRef = useRef(0.9);
  const rafRef = useRef(null);
  const dragRef = useRef(null);
  const [removed, setRemoved] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [availableAnimals, setAvailableAnimals] = useState([]);
  const [equilibrium, setEquilibrium] = useState(100);
  const mapControls = useInteractiveMapControls(0.72, 3.6, 0.82);

  const groupOrder = ['apex','carnivore','omnivore','filter','herbivore','producer','resource'];
  const baseY = { apex:78, carnivore:214, omnivore:370, filter:526, herbivore:622, producer:720, resource:815 };
  const boxFor = (n) => n.type === 'resource' ? { w:132, h:56 } : { w:104, h:124 };
  const initNodes = (sourceNodes = graph.nodes || []) => {
    const grouped = sourceNodes.reduce((acc,n)=>{ (acc[n.group || 'omnivore'] ||= []).push(n); return acc; }, {});
    const out = [];
    groupOrder.forEach((group) => {
      const arr = [...(grouped[group] || [])].sort((a,b)=> (a.animalId === graph.focusAnimalId ? -1 : b.animalId === graph.focusAnimalId ? 1 : (b.power || 0) - (a.power || 0)));
      const maxPerRow = group === 'resource' ? 8 : 9;
      const vGap = group === 'resource' ? 76 : 142;
      arr.forEach((n, idx) => {
        const row = Math.floor(idx / maxPerRow);
        const col = idx % maxPerRow;
        const rowCount = Math.min(maxPerRow, arr.length - row * maxPerRow);
        const box = boxFor(n);
        const spacing = group === 'resource' ? 168 : 154;
        const rowWidth = (rowCount - 1) * spacing;
        const x = WIDTH / 2 - rowWidth / 2 + col * spacing + (row % 2 ? 18 : -18);
        const y = (baseY[group] || 380) + row * vGap;
        out.push({ ...n, ...box, x, y, tx:x, ty:y, vx:0, vy:0, fx:null, fy:null });
      });
    });
    return out;
  };

  const restartSimulation = (hot=0.75) => {
    alphaRef.current = Math.max(alphaRef.current, hot);
    if (!rafRef.current) rafRef.current = requestAnimationFrame(stepSimulation);
  };

  const stepSimulation = () => {
    const arr = nodesRef.current;
    if (!arr.length) return;
    const map = Object.fromEntries(arr.map(n => [n.id, n]));
    const alpha = alphaRef.current;

    (graph.edges || []).forEach(edge => {
      const s = map[edge.source], t = map[edge.target];
      if (!s || !t || removed.has(s.id) || removed.has(t.id)) return;
      const dx = (t.x - s.x) || 0.01;
      const dy = (t.y - s.y) || 0.01;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const desired = edge.relation_type === 'resource_use' ? 210 : edge.confidence === 'likely' ? 268 : 300;
      const force = (dist - desired) * 0.0045 * alpha;
      const fx = dx / dist * force;
      const fy = dy / dist * force;
      if (s.fx == null) { s.vx += fx; s.vy += fy; }
      if (t.fx == null) { t.vx -= fx; t.vy -= fy; }
    });

    for (let iter=0; iter<6; iter++) {
      for (let i=0; i<arr.length; i++) {
        const a = arr[i];
        if (removed.has(a.id)) continue;
        for (let j=i+1; j<arr.length; j++) {
          const b = arr[j];
          if (removed.has(b.id)) continue;
          const dx = (b.x - a.x) || 0.01;
          const dy = (b.y - a.y) || 0.01;
          const overlapX = (a.w + b.w) / 2 + 34 - Math.abs(dx);
          const overlapY = (a.h + b.h) / 2 + 34 - Math.abs(dy);
          if (overlapX > 0 && overlapY > 0) {
            if (overlapX < overlapY) {
              const push = overlapX * 0.26 * (dx < 0 ? -1 : 1);
              if (a.fx == null) a.vx -= push;
              if (b.fx == null) b.vx += push;
            } else {
              const push = overlapY * 0.30 * (dy < 0 ? -1 : 1);
              if (a.fx == null) a.vy -= push;
              if (b.fx == null) b.vy += push;
            }
          }
        }
      }
    }

    arr.forEach((n) => {
      if (removed.has(n.id)) return;
      if (n.fx == null) {
        n.vx += (n.tx - n.x) * 0.010 * alpha;
        n.vy += (n.ty - n.y) * 0.012 * alpha;
      }
      const left = n.w/2 + 20, right = WIDTH - n.w/2 - 20, top = n.h/2 + 18, bottom = HEIGHT - 116 - n.h/2;
      if (n.x < left) n.vx += (left - n.x) * 0.08;
      if (n.x > right) n.vx -= (n.x - right) * 0.08;
      if (n.y < top) n.vy += (top - n.y) * 0.08;
      if (n.y > bottom) n.vy -= (n.y - bottom) * 0.08;
      if (n.fx != null) { n.x = n.fx; n.y = n.fy; n.vx = 0; n.vy = 0; }
      else { n.vx *= 0.66; n.vy *= 0.66; n.x += n.vx; n.y += n.vy; }
    });

    alphaRef.current = Math.max(0.016, alpha * 0.982);
    setNodes(arr.map(n => ({ ...n })));
    rafRef.current = requestAnimationFrame(stepSimulation);
  };

  useEffect(() => {
    const init = initNodes(graph.nodes || []);
    nodesRef.current = init;
    setNodes(init.map(n=>({ ...n })));
    setRemoved(new Set());
    setSelected(null);
    setAvailableAnimals((graph.allAnimals || []).filter(a => !(graph.animals || []).some(g => g.id === a.id)).slice(0, 160));
    mapControls.reset();
    restartSimulation(0.95);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; };
  }, [graph]);

  useEffect(() => {
    const hiddenIds = new Set([...removed].filter(id => id.startsWith('a:')).map(id => id.replace(/^a:/,'')));
    const totalAnimals = nodes.filter(n => n.type === 'animal').length || 1;
    const healthyAnimals = nodes.filter(n => n.type === 'animal' && !removed.has(n.id)).length;
    const impactedTargets = new Set((graph.edges || []).filter(e => removed.has(e.source)).map(e => e.target));
    const eq = Math.max(0, Math.round((healthyAnimals / totalAnimals) * 100 - impactedTargets.size * 2.5));
    setEquilibrium(Math.min(100, Math.max(0, eq)));
    onGraphChange?.({ removedIds:[...hiddenIds], visibleAnimalIds:nodes.filter(n => n.type === 'animal' && !removed.has(n.id)).map(n => n.animalId) });
  }, [removed, nodes.length, graph.edges]);

  const nodeById = Object.fromEntries((nodes || []).map(n => [n.id, n]));
  const waitingNodes = nodes.filter(n => removed.has(n.id) && n.type === 'animal');
  const stressSet = new Set((graph.edges || []).filter(e => removed.has(e.source) || removed.has(e.target)).flatMap(e => [e.source, e.target]));
  const svgPoint = (e) => {
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect?.() || e.currentTarget.getBoundingClientRect();
    return { x:Math.max(30, Math.min(WIDTH - 30, ((e.clientX - rect.left) / rect.width) * WIDTH)), y:Math.max(30, Math.min(HEIGHT - 30, ((e.clientY - rect.top) / rect.height) * HEIGHT)) };
  };
  const startDrag = (e,node) => {
    e.stopPropagation();
    const target = nodesRef.current.find(n => n.id === node.id);
    if (!target || removed.has(target.id)) return;
    dragRef.current = target.id;
    target.fx = target.x; target.fy = target.y;
    alphaRef.current = 0.65;
    restartSimulation(0.65);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const moveDrag = (e) => {
    if (!dragRef.current) return;
    const p = svgPoint(e);
    const target = nodesRef.current.find(n => n.id === dragRef.current);
    if (!target) return;
    target.fx = p.x; target.fy = p.y; target.x = p.x; target.y = p.y;
    setNodes(nodesRef.current.map(n => ({ ...n })));
  };
  const stopDrag = () => {
    if (!dragRef.current) return;
    const target = nodesRef.current.find(n => n.id === dragRef.current);
    if (target) {
      const droppedInWaitingZone = target.y > WAIT_Y && target.type === 'animal';
      target.fx = null; target.fy = null;
      if (droppedInWaitingZone) { setRemoved(prev => new Set([...prev, target.id])); setSelected(null); }
    }
    dragRef.current = null;
    restartSimulation(0.7);
  };
  const toggleRemoved = (id) => {
    setRemoved(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
    restartSimulation(0.75);
  };
  const addAnimal = (animal) => {
    if (!animal) return;
    const box = { w:104, h:124 };
    const node = { id:`a:${animal.id}`, animalId:animal.id, type:'animal', label:animal.com, sci:animal.sci, group:trophicGroup(animal), cls:animal.cls, power:getAnimalPowerScore(animal), image_url:isMysteryStatus(animal.status)?'':animal.image_url, ...box, x:WIDTH/2, y:HEIGHT/2, tx:WIDTH/2, ty:HEIGHT/2, vx:0, vy:0, fx:null, fy:null };
    if (nodesRef.current.some(n => n.id === node.id)) return;
    nodesRef.current = [...nodesRef.current, node];
    setNodes(nodesRef.current.map(n=>({ ...n })));
    setAvailableAnimals(prev => prev.filter(a => a.id !== animal.id));
    setPickerOpen(false);
    restartSimulation(0.95);
  };
  const splitLabelLines = (label, limit=13) => {
    const words = String(label || '').split(/\s+/).filter(Boolean);
    const lines = [''];
    for (const w of words) {
      const i = lines.length - 1;
      if ((lines[i] + ' ' + w).trim().length <= limit) lines[i] = (lines[i] + ' ' + w).trim();
      else if (lines.length < 2) lines.push(w);
      else break;
    }
    return lines.filter(Boolean).slice(0,2);
  };
  const imageHrefFor = (a) => isMysteryStatus(a?.status) ? MYSTERY_PLACEHOLDER : (getImageSrcCandidates(a?.image_url)[0] || a?.image_url || '');
  const renderNodeCard = (n) => {
    const color = nodeColorForGroup(n.group);
    const isAnimal = n.type === 'animal';
    const stressed = stressSet.has(n.id);
    const currentAnimal = isAnimal ? (graph.allAnimals || graph.animals || []).find(a => a.id === n.animalId) : null;
    const cls = isAnimal ? (CLS[n.cls] || CLS.Mammalia) : null;
    const lines = splitLabelLines(n.label, isAnimal ? 13 : 18);
    return (
      <g key={n.id} transform={`translate(${n.x - n.w/2},${n.y - n.h/2})`} onPointerDown={(e)=>startDrag(e,n)} onDoubleClick={(e)=>{e.stopPropagation();toggleRemoved(n.id);}} onClick={(e)=>{e.stopPropagation(); if(!dragRef.current) setSelected(n);}} style={{ cursor:'grab', animation:stressed?'ecosystemStress .75s ease-in-out infinite':'none', transformBox:'fill-box', transformOrigin:'center' }}>
        <rect x="0" y="0" width={n.w} height={n.h} rx={isAnimal?18:15} fill={isAnimal ? (cls?.img || '#24303A') : '#25321F'} stroke={color} strokeWidth="3" />
        <rect x="2" y="2" width={n.w-4} height={n.h-4} rx={isAnimal?16:13} fill={isAnimal ? 'rgba(0,0,0,.03)' : 'rgba(0,0,0,.10)'} stroke={`rgba(255,255,255,.10)`} strokeWidth="1" />
        {isAnimal ? (
          <>
            {currentAnimal && (currentAnimal.image_url || isMysteryStatus(currentAnimal.status)) ? <image href={imageHrefFor(currentAnimal)} x="10" y="8" width={n.w-20} height="76" preserveAspectRatio="xMidYMid meet" opacity=".96" /> : <text x={n.w/2} y="52" textAnchor="middle" fontSize="28" fill="white">•</text>}
            <rect x="0" y={n.h-42} width={n.w} height="42" rx="14" fill="rgba(0,0,0,.40)" />
            {lines.map((line,i)=><text key={i} x={n.w/2} y={n.h-25+i*12} textAnchor="middle" fontSize="10.5" fontWeight="900" fill="white">{line}</text>)}
          </>
        ) : (
          <>
            <text x={n.w/2} y={n.h/2-4} textAnchor="middle" fontSize="12" fontWeight="900" fill="white">{lines[0] || 'Risorsa'}</text>
            {lines[1] && <text x={n.w/2} y={n.h/2+11} textAnchor="middle" fontSize="12" fontWeight="900" fill="white">{lines[1]}</text>}
          </>
        )}
      </g>
    );
  };


  return (
    <div style={{ background:'#0E1116', border:'1px solid rgba(255,255,255,.08)', borderRadius:24, padding:12, boxShadow:'inset 0 0 44px rgba(0,0,0,.45)', overflow:'hidden' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto auto', gap:8, alignItems:'center', marginBottom:10 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ padding:'8px 12px', borderRadius:12, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', color:'white', fontSize:11.5, fontWeight:900 }}>Equilibrio <span style={{ color: equilibrium >= 70 ? '#90D84A' : equilibrium >= 40 ? '#F0B24E' : '#FF6B6B' }}>{equilibrium}%</span></div>
          <div style={{ padding:'8px 12px', borderRadius:12, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', color:'white', fontSize:11.5, fontWeight:900 }}>Animali <span style={{ color:'#74C7FF' }}>{nodes.filter(n=>n.type==='animal' && !removed.has(n.id)).length}</span></div>
        </div>
        <button data-sound="filter" onClick={()=>setPickerOpen(v=>!v)} style={{ height:38, borderRadius:13, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.06)', color:'white', fontWeight:900, padding:'0 10px', cursor:'pointer' }}>+ Aggiungi</button>
        <button data-sound="map" onClick={(e)=>{e.stopPropagation(); mapControls.setZoom(z=>Math.max(0.72,z-0.16));}} style={{ height:38, width:38, borderRadius:13, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.06)', color:'white', fontWeight:900, cursor:'pointer' }}>−</button>
        <button data-sound="map" onClick={(e)=>{e.stopPropagation(); mapControls.setZoom(z=>Math.min(3.8,z+0.16));}} style={{ height:38, width:38, borderRadius:13, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.06)', color:'white', fontWeight:900, cursor:'pointer' }}>+</button>
        <button data-sound="map" onClick={(e)=>{e.stopPropagation(); mapControls.reset(); restartSimulation(0.85);}} style={{ height:38, borderRadius:13, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.06)', color:'white', fontWeight:900, padding:'0 10px', cursor:'pointer' }}>⌖</button>
      </div>
      {pickerOpen && (
        <div style={{ marginBottom:10, maxHeight:148, overflowY:'auto', borderRadius:16, padding:10, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {availableAnimals.slice(0,50).map(a => <button key={a.id} onClick={()=>addAnimal(a)} style={{ minHeight:40, borderRadius:11, border:'1px solid rgba(255,255,255,.08)', background:'#15171B', color:'white', display:'flex', alignItems:'center', gap:8, padding:'0 10px', cursor:'pointer', fontFamily:'inherit' }}><span style={{ width:18, textAlign:'center' }}>+</span><span style={{ flex:1, textAlign:'left', fontSize:11.5, fontWeight:800, lineHeight:1.15 }}>{a.com}</span></button>)}
        </div>
      )}
	      <div {...mapControls.handlers} style={{ borderRadius:18, overflow:'hidden', touchAction:mapControls.zoom > 1.01 ? 'none' : 'pan-y' }}>
	        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag} style={{ width:'100%', height:620, display:'block', touchAction:mapControls.zoom > 1.01 ? 'none' : 'pan-y', background:'radial-gradient(circle at 50% 46%,rgba(168,70,55,.10),rgba(6,8,12,.96) 58%)', borderRadius:18 }}>
          <defs><marker id="lifeArrowV42" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="rgba(255,255,255,.55)" /></marker></defs>
          <g style={{ transform:mapControls.transform, transformOrigin:'50% 50%' }}>
            {(graph.edges || []).map(e=>{
              const s = nodeById[e.source], t = nodeById[e.target];
              if(!s||!t || removed.has(s.id) || removed.has(t.id)) return null;
              return <line key={e.id} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={e.confidence==='likely'?'rgba(255,255,255,.30)':'rgba(255,255,255,.16)'} strokeWidth={1.15} markerEnd="url(#lifeArrowV42)" opacity={.72} />;
            })}
            <rect x="20" y={WAIT_Y} width={WIDTH-40} height="60" rx="20" fill="rgba(168,70,55,.10)" stroke="rgba(168,70,55,.34)" strokeDasharray="8 8" />
            <text x={WIDTH/2} y={WAIT_Y+37} textAnchor="middle" fill="rgba(255,255,255,.42)" fontSize="15" fontWeight="900" pointerEvents="none">trascina qui per mettere in attesa</text>
            {nodes.map(n => removed.has(n.id) ? null : renderNodeCard(n))}
          </g>
        </svg>
      </div>
      {waitingNodes.length > 0 && (
        <div style={{ marginTop:10, borderRadius:18, background:'rgba(168,70,55,.08)', border:'1px solid rgba(168,70,55,.28)', padding:10 }}>
          <div style={{ color:'#E8A08E', fontSize:11, fontWeight:1000, textTransform:'uppercase', marginBottom:8 }}>Attesa · specie rimosse</div>
          <div style={{ display:'flex', gap:9, overflowX:'auto', WebkitOverflowScrolling:'touch', paddingBottom:3 }}>
            {waitingNodes.map(n => {
              const a = (graph.allAnimals || graph.animals || []).find(x => x.id === n.animalId);
              return <button key={n.id} onClick={()=>toggleRemoved(n.id)} style={{ flex:'0 0 82px', minHeight:92, borderRadius:15, border:'1px solid rgba(255,255,255,.08)', background:'rgba(255,255,255,.055)', color:'white', padding:7, fontFamily:'inherit', cursor:'pointer' }}>
                {a ? <AnimalImg a={{...a,status:'catturato'}} size={52} fontSize={20} overrideStatus="catturato" /> : <div style={{ width:52, height:52, borderRadius:16, margin:'0 auto', background:'rgba(255,255,255,.08)' }} />}
                <div style={{ fontSize:9.8, lineHeight:1.1, fontWeight:900, marginTop:5 }}>{clampWholeWords(n.label, 18)}</div>
              </button>;
            })}
          </div>
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'center', marginTop:10 }}>
        <div style={{ color:'rgba(255,255,255,.60)', fontSize:11, lineHeight:1.4 }}>Rete trofica con riquadri distanziati: se lo spazio visibile è stretto, usa pinch/zoom e trascinamento della mappa.</div>
        <button data-sound="filter" onClick={()=>{ const init = initNodes(graph.nodes || []); nodesRef.current = init; setNodes(init.map(n=>({ ...n }))); setRemoved(new Set()); setSelected(null); mapControls.reset(); restartSimulation(0.95); }} style={{ height:38, borderRadius:13, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.06)', color:'white', fontWeight:900, padding:'0 12px', cursor:'pointer' }}>Reset</button>
      </div>
      {selected && <LifeWebNodeModal node={selected} graph={graph} nodes={nodes} removed={removed} onClose={()=>setSelected(null)} onOpenAnimal={onOpenAnimal} onToggleRemove={toggleRemoved} />}
    </div>
  );
}

function getSubregionAnimals(animals = [], territory) {
  const bioregionId = territory?.bioregionId || territory?.id;
  if (!bioregionId) return [];
  return (animals || []).filter(a => matchExactBioregion(a, bioregionId));
}
function getSubregionApexPredators(animals = [], territory) {
  const zoneAnimals = getSubregionAnimals(animals, territory);
  const apex = zoneAnimals.filter(a => trophicGroup(a) === 'apex' || String(a.trophic) === '4');
  const predators = apex.length ? apex : zoneAnimals.filter(a => ['carnivore','apex'].includes(trophicGroup(a)) || String(a.trophic) === '3');
  return predators.sort(compareAnimalsRevealedFirst).slice(0,16);
}
function buildSubregionDescription(territory) {
  const label = territory?.label || 'Questa subregione';
  const en = territory?.name_en ? ` (${territory.name_en})` : '';
  const area = territory?.area_km2 ? `${Math.round(territory.area_km2).toLocaleString('it-IT')} km²` : 'un mosaico esteso';
  const source = String(territory?.source_ecoregions || '').split(';').map(s=>s.trim()).filter(Boolean);
  const examples = source.slice(0, 5).join(', ');
  const tail = examples ? ` Comprende ambienti come ${examples}, che rendono il confine ecologico più preciso dei soli codici paese.` : '';
  return `${label}${en} copre ${area} di paesaggi collegati da clima, vegetazione e storia geologica. La composizione del terreno alterna substrati minerali, suoli giovani o torbosi, zone drenate e aree più umide dove acqua, gelo, vento o stagionalità modellano la disponibilità di rifugi e prede. La fauna tende a concentrarsi lungo corridoi ecologici: coste, foreste, praterie, tundre, rilievi o bacini interni secondo la subregione. Per Animaldex questa pagina usa la subregione biogeografica come unità principale, così la lista animali resta più coerente della semplice presenza nazionale.${tail}`;
}
function RegionActionBox({ title, text, label, tone='#244A70', onClick, disabled=false }) {
  return (
    <button onClick={disabled ? undefined : onClick} style={{ minHeight:112, borderRadius:18, border:`1px solid ${disabled?'rgba(255,255,255,.08)':'rgba(255,255,255,.12)'}`, background:disabled?'rgba(255,255,255,.035)':`linear-gradient(135deg,${tone},rgba(255,255,255,.045))`, color:'white', textAlign:'left', padding:14, fontFamily:'inherit', cursor:disabled?'default':'pointer', opacity:disabled ? .85 : 1 }}>
      <div style={{ fontSize:17, fontWeight:1000 }}>{title}</div>
      <div style={{ color:'rgba(255,255,255,.62)', fontSize:12, lineHeight:1.35, marginTop:6 }}>{text}</div>
      <div style={{ marginTop:12, height:34, borderRadius:12, background:disabled?'rgba(255,255,255,.06)':'rgba(0,0,0,.22)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:1000, fontSize:12.5 }}>{label}</div>
    </button>
  );
}
function ApexPredatorStrip({ animals = [], onOpenAnimal }) {
  return (
    <div style={{ border:'1px solid rgba(255,255,255,.08)', background:'linear-gradient(180deg,#15171C,#0E0F12)', borderRadius:20, padding:12, overflow:'hidden' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:10, marginBottom:10 }}>
        <div style={{ color:'white', fontSize:16, fontWeight:1000 }}>Predatori apex</div>
        <div style={{ color:'rgba(255,255,255,.42)', fontSize:11, fontWeight:900 }}>{animals.length || 'da affinare'} specie</div>
      </div>
      <div style={{ display:'flex', gap:10, overflowX:'auto', WebkitOverflowScrolling:'touch', paddingBottom:2 }}>
        {animals.length ? animals.map(a => (
          <button key={a.id} onClick={()=>onOpenAnimal?.(a)} style={{ flex:'0 0 116px', height:136, borderRadius:16, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.045)', color:'white', padding:8, fontFamily:'inherit', cursor:'pointer', overflow:'hidden' }}>
            <div style={{ height:82, borderRadius:13, overflow:'hidden', background:'#202228' }}><AnimalImg a={a} size={82} fontSize={28} overrideStatus="catturato" /></div>
            <div style={{ fontSize:11.5, fontWeight:1000, lineHeight:1.12, marginTop:8 }}>{clampWholeWords(a.com || a.sci, 26)}</div>
          </button>
        )) : <div style={{ color:'rgba(255,255,255,.50)', fontSize:12, lineHeight:1.4, padding:'8px 2px 12px' }}>Nessun predatore apex collegato con ID bioregionale preciso in questa versione dei dati.</div>}
      </div>
    </div>
  );
}

function isMediterraneanTerritory(territory) {
  const id = String(territory?.bioregionId || territory?.id || '').toUpperCase();
  const label = `${territory?.label || ''} ${territory?.name_en || ''}`.toLowerCase();
  return id === 'TER_SR_027' || /mediterr/.test(label);
}
function buildMediterraneanConceptGroups(animals = [], territory) {
  const zone = getSubregionAnimals(animals, territory).sort((a,b)=>getAnimalPowerScore(b)-getAnimalPowerScore(a));
  const seen = new Set();
  const take = (predicate, limit) => {
    const rows = zone.filter(a => !seen.has(a.id) && predicate(a)).slice(0, limit);
    rows.forEach(a => seen.add(a.id));
    return rows;
  };
  const apex = take(a => trophicGroup(a) === 'apex' || String(a.trophic) === '4' || /Panthera|Leone|Leopardo|Caracal|Aquila|Falco/i.test(`${a.sci || ''} ${a.com || ''}`), 12);
  const predators = take(a => ['carnivore','omnivore'].includes(trophicGroup(a)) || String(a.trophic) === '3', 16);
  const herbivores = take(a => trophicGroup(a) === 'herbivore' || String(a.trophic) === '1' || /capriolo|lepre|istrice|porcospino|dromedario|ammotrage/i.test(a.com || ''), 16);
  const filters = take(a => trophicGroup(a) === 'filter' || String(a.trophic).toLowerCase() === 'f' || ['Bivalvia','Gastropoda'].includes(a.cls) || /pellicano|airone|anatra|germano|filtr/i.test(`${a.com || ''} ${a.sci || ''}`), 12);
  const remainingPredators = zone.filter(a => !seen.has(a.id) && getAnimalPowerScore(a) > 80).slice(0, Math.max(0, 10 - apex.length - predators.length));
  remainingPredators.forEach(a => { seen.add(a.id); predators.push(a); });
  const resources = [
    { id:'res:leaves', label:'Foglie e germogli', color:'#8FD85B' },
    { id:'res:seeds', label:'Semi', color:'#D6B55A' },
    { id:'res:fruit', label:'Frutti', color:'#D67A52' },
    { id:'res:nectar', label:'Nettare', color:'#E6A8D7' },
    { id:'res:insects', label:'Insetti', color:'#76C7FF' },
    { id:'res:small_fish', label:'Piccoli pesci', color:'#63B7D8' },
    { id:'res:crustaceans', label:'Crostacei', color:'#E0A35B' },
    { id:'res:algae', label:'Alghe', color:'#58D17A' },
    { id:'res:detritus', label:'Detrito organico', color:'#A77A46' },
  ];
  return { apex, predators, herbivores, filters, resources, total:zone.length };
}
function ConceptLifeWebMap({ animals = [], territory, onOpenAnimal }) {
  const groups = useMemo(() => buildMediterraneanConceptGroups(animals, territory), [animals, territory]);
  const [zoom, setZoom] = useState(.62);
  const showAnimals = zoom >= .82;
  const boardW = 1320;
  const boardH = 920;
  const rows = [
    { key:'apex', label:'Predatori apex', sub:'Vertice della rete', y:36, color:'#FF5B66', items:groups.apex, type:'animal', maxPerRow:6 },
    { key:'predators', label:'Predatori', sub:'Controllano popolazioni e carcasse', y:220, color:'#F0A840', items:groups.predators, type:'animal', maxPerRow:7 },
    { key:'herbivores', label:'Erbivori e onnivori base', sub:'Trasformano risorse in biomassa', y:420, color:'#A9DD45', items:groups.herbivores, type:'animal', maxPerRow:7 },
    { key:'resources', label:'Risorse', sub:'Energia e materia del paesaggio', y:635, color:'#6CE5C7', items:groups.resources, type:'resource', maxPerRow:5 },
    { key:'filters', label:'Filtratori e acque basse', sub:'Connettono coste, zone umide e corsi d’acqua', y:780, color:'#5BB8F5', items:groups.filters, type:'animal', maxPerRow:6 },
  ];
  const itemW = 116;
  const itemH = 124;
  const resourceW = 132;
  const resourceH = 56;
  const layoutItems = (row) => {
    const width = row.type === 'resource' ? resourceW : itemW;
    const gap = row.type === 'resource' ? 14 : 18;
    const max = row.maxPerRow;
    const items = row.items || [];
    return items.map((item, idx) => {
      const line = Math.floor(idx / max);
      const col = idx % max;
      const rowCount = Math.min(max, items.length - line * max);
      const totalW = rowCount * width + Math.max(0, rowCount - 1) * gap;
      return { item, x:boardW/2 - totalW/2 + col * (width + gap), y:row.y + 56 + line * (row.type === 'resource' ? 70 : 136), w:width, h:row.type === 'resource' ? resourceH : itemH };
    });
  };
  const animalCard = (a, row, pos) => {
    const cls = CLS[a.cls] || CLS.Mammalia;
    return (
      <button key={a.id} onClick={()=>onOpenAnimal?.(a)} style={{ position:'absolute', left:pos.x, top:pos.y, width:pos.w, height:pos.h, borderRadius:18, border:`2px solid ${row.color}88`, background:`linear-gradient(180deg,${cls.img || '#20242A'},rgba(12,13,16,.96))`, color:'white', padding:8, boxShadow:`0 16px 34px rgba(0,0,0,.24), 0 0 0 1px ${row.color}22`, fontFamily:'inherit', cursor:'pointer', overflow:'hidden' }}>
        <div style={{ height:76, borderRadius:14, overflow:'hidden', background:'#202228', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <AnimalImg a={a} size={76} fontSize={28} overrideStatus={isMysteryStatus(a.status) ? 'misterioso' : 'catturato'} />
        </div>
        <div style={{ marginTop:8, fontSize:10.5, lineHeight:1.12, fontWeight:900 }}>{clampWholeWords(a.com || a.sci, 25)}</div>
      </button>
    );
  };
  const resourceCard = (r, row, pos) => (
    <div key={r.id} style={{ position:'absolute', left:pos.x, top:pos.y, width:pos.w, height:pos.h, borderRadius:16, border:`1.5px solid ${r.color}88`, background:`linear-gradient(135deg,${hexToRgba(r.color,.22)},rgba(18,20,23,.96))`, color:'white', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'0 10px', boxSizing:'border-box', fontSize:11.5, lineHeight:1.15, fontWeight:950, boxShadow:`0 10px 24px ${hexToRgba(r.color,.10)}` }}>{r.label}</div>
  );
  return (
    <div style={{ border:'1px solid rgba(255,255,255,.08)', background:'linear-gradient(180deg,#11151A,#090B0E)', borderRadius:24, padding:12, overflow:'hidden' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:8, alignItems:'center', marginBottom:10 }}>
        <div>
          <div style={{ color:'#6CE5C7', fontSize:11, fontWeight:1000, textTransform:'uppercase', letterSpacing:.8 }}>LifeWeb · test Mediterraneo</div>
          <div style={{ color:'rgba(255,255,255,.62)', fontSize:11.5, lineHeight:1.35, marginTop:3 }}>{groups.total} animali agganciati alla subregione · mappa a gruppi, non rete totale</div>
        </div>
        <button onClick={()=>setZoom(z=>Math.max(.48, Number((z-.08).toFixed(2))))} style={{ width:38, height:38, borderRadius:12, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.06)', color:'white', fontWeight:1000 }}>−</button>
        <button onClick={()=>setZoom(z=>Math.min(1.35, Number((z+.08).toFixed(2))))} style={{ width:38, height:38, borderRadius:12, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.06)', color:'white', fontWeight:1000 }}>+</button>
        <button onClick={()=>setZoom(.62)} style={{ height:38, borderRadius:12, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.06)', color:'white', fontWeight:950, padding:'0 10px' }}>Reset</button>
      </div>
      <div style={{ height:560, overflow:'auto', borderRadius:20, background:'radial-gradient(circle at 50% 20%,rgba(240,168,64,.14),rgba(84,38,20,.20) 34%,rgba(7,9,12,.96) 62%)', border:'1px solid rgba(255,255,255,.07)', WebkitOverflowScrolling:'touch' }}>
        <div style={{ width:boardW*zoom, height:boardH*zoom, position:'relative' }}>
          <div style={{ width:boardW, height:boardH, position:'relative', transform:`scale(${zoom})`, transformOrigin:'top left' }}>
            <svg width={boardW} height={boardH} style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
              <defs>
                <marker id="conceptArrowV1" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="rgba(255,255,255,.32)" /></marker>
              </defs>
              {[
                ['M590 646 C590 610 590 584 590 552', '#6CE5C7'],
                ['M590 528 C590 500 590 470 590 438', '#A9DD45'],
                ['M590 352 C590 322 590 292 590 258', '#F0A840'],
                ['M590 178 C590 142 590 120 590 96', '#FF5B66'],
                ['M770 646 C858 622 905 666 904 726', '#5BB8F5'],
              ].map(([d,c],idx)=><path key={idx} d={d} fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" opacity=".26" markerEnd="url(#conceptArrowV1)" />)}
            </svg>
            {rows.map(row => (
              <div key={row.key} style={{ position:'absolute', left:24, right:24, top:row.y, height:34, borderTop:`1px solid ${hexToRgba(row.color,.30)}` }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, transform:'translateY(-50%)', background:'#101318', border:`1px solid ${hexToRgba(row.color,.45)}`, borderRadius:12, padding:'7px 10px', boxShadow:'0 8px 22px rgba(0,0,0,.22)' }}>
                  <span style={{ width:10, height:10, borderRadius:3, background:row.color }} />
                  <span style={{ color:'white', fontSize:14, fontWeight:1000 }}>{row.label}</span>
                  <span style={{ color:'rgba(255,255,255,.50)', fontSize:11, fontWeight:800 }}>{row.sub}</span>
                </div>
              </div>
            ))}
            {rows.map(row => {
              const count = (row.items || []).length;
              if (showAnimals || row.type === 'resource') return null;
              return <button key={`macro-${row.key}`} onClick={()=>setZoom(1)} style={{ position:'absolute', left:120, right:120, top:row.y+58, height:92, borderRadius:24, border:`2px solid ${hexToRgba(row.color,.46)}`, background:`linear-gradient(135deg,${hexToRgba(row.color,.18)},rgba(14,15,18,.96))`, color:'white', fontFamily:'inherit', cursor:'zoom-in', textAlign:'left', padding:'0 24px', boxShadow:'0 20px 46px rgba(0,0,0,.26)' }}>
                <div style={{ fontSize:24, fontWeight:1000 }}>{row.label}</div>
                <div style={{ color:'rgba(255,255,255,.60)', fontSize:13, marginTop:5 }}>{count} elementi · zoom per aprire il gruppo</div>
              </button>;
            })}
            {rows.flatMap(row => layoutItems(row).map(pos => row.type === 'resource' || showAnimals ? (row.type === 'resource' ? resourceCard(pos.item, row, pos) : animalCard(pos.item, row, pos)) : null))}
          </div>
        </div>
      </div>
      <div style={{ color:'rgba(255,255,255,.54)', fontSize:11.5, lineHeight:1.45, marginTop:10 }}>Dall’alto leggi i macrogruppi. Zoomando si aprono gli animali: i collegamenti restano tra gruppi ecologici, non tra ogni singola card.</div>
    </div>
  );
}

function LifeWebPage({ territory, habitat, animals, onOpenAnimal, focusAnimal=null, onOpenGrid }) {
  const graph = useMemo(() => buildLifeWebGraph(animals, territory, habitat, focusAnimal), [animals, territory, habitat, focusAnimal]);
  const gridAnimals = graph.animals || [];
  const zoneAnimals = useMemo(() => getSubregionAnimals(animals, territory), [animals, territory]);
  const apexAnimals = useMemo(() => getSubregionApexPredators(animals, territory), [animals, territory]);
  const description = useMemo(() => buildSubregionDescription(territory), [territory]);
  const mediterraneanConcept = isMediterraneanTerritory(territory);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ border:'1px solid rgba(255,255,255,.08)', background:'linear-gradient(180deg,rgba(255,255,255,.060),rgba(255,255,255,.030))', borderRadius:22, padding:16 }}>
        <div style={{ color:'#C85D44', fontSize:11, fontWeight:1000, textTransform:'uppercase', letterSpacing:.9 }}>Subregione</div>
        <div style={{ color:'white', fontSize:23, fontWeight:1000, marginTop:4 }}>{territory?.label || habitat?.label || 'LifeWeb'}</div>
        <div style={{ color:'rgba(255,255,255,.62)', fontSize:12.5, lineHeight:1.48, marginTop:8 }}>{description}</div>
        <div style={{ display:'flex', gap:8, marginTop:12, overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
          <div style={{ flex:'0 0 auto', borderRadius:999, background:'rgba(144,216,74,.13)', border:'1px solid rgba(144,216,74,.25)', color:'#CFF2A0', padding:'7px 10px', fontSize:11, fontWeight:950 }}>{zoneAnimals.length} animali con ID bioregione</div>
          <div style={{ flex:'0 0 auto', borderRadius:999, background:'rgba(255,255,255,.055)', border:'1px solid rgba(255,255,255,.08)', color:'rgba(255,255,255,.66)', padding:'7px 10px', fontSize:11, fontWeight:900 }}>{territory?.name_en || 'Subregion'}</div>
        </div>
      </div>
      <ApexPredatorStrip animals={apexAnimals} onOpenAnimal={onOpenAnimal} />
      {mediterraneanConcept ? <ConceptLifeWebMap animals={animals} territory={territory} onOpenAnimal={onOpenAnimal} /> : <div style={{ border:'1px solid rgba(255,255,255,.08)', borderRadius:22, padding:18, background:'linear-gradient(135deg,rgba(255,255,255,.055),rgba(255,255,255,.025))', color:'rgba(255,255,255,.68)', fontSize:13, lineHeight:1.5 }}>LifeWeb per questo territorio è pronto come struttura. Il test interattivo completo è attivo sul Mediterraneo.</div>}
      <LifeWebMiniGrid animals={gridAnimals} onOpenAnimal={onOpenAnimal} />
    </div>
  );
}

function StandaloneLifeWebPage({ onBack, animals = [], initialAnimal = null, onOpenAnimal, theme='dark', statusMap = {}, visitedCountries = [] }) {
  const isLightTheme = theme === 'light';
  const resolvedAnimals = useMemo(() => (animals || []).map(a => ({ ...a, status:getResolvedAnimalStatus(a, statusMap, visitedCountries) })), [animals, statusMap, visitedCountries]);
  const focusAnimal = initialAnimal || resolvedAnimals[0] || null;
  const derivedHabitatId = focusAnimal ? (getAnimalHabitatIds(focusAnimal)[0] || null) : null;
  const habitat = derivedHabitatId ? { id:derivedHabitatId, label:habitatLabel(derivedHabitatId) } : { id:'FOREST_TEMP', label:'Habitat contestuale' };
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:isLightTheme?LIGHT_APP_BG:'#050505', overflow:'hidden' }}>
      <PageHeader title={focusAnimal ? `Web · ${focusAnimal.com}` : 'LifeWeb'} onBack={onBack} theme={theme} />
      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'12px 14px 28px', boxSizing:'border-box' }}>
        <LifeWebPage territory={null} habitat={habitat} animals={resolvedAnimals} focusAnimal={focusAnimal} onOpenAnimal={onOpenAnimal} />
      </div>
    </div>
  );
}

function HabitatCard({ row, onOpen, onOpenGrid }) {
  const animalLikeResources = new Set(['crustaceans','small_fish','small_mammals']);
  const resources = (HABITAT_RESOURCE_MAP[row.id] || []).filter(r=>!animalLikeResources.has(r)).slice(0,4).map(r=>RESOURCE_LABELS[r] || r);
  return (
    <div style={{ width:'100%', maxWidth:'100%', boxSizing:'border-box', textAlign:'left', border:'1px solid rgba(255,255,255,.08)', borderRadius:22, background:'linear-gradient(135deg,#181A1F,#101216)', color:'white', padding:14, marginBottom:10, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:48, height:48, borderRadius:17, background:'rgba(168,70,55,.18)', color:'#E68B73', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>☍</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:17, fontWeight:1000 }}>{row.label}</div>
          <div style={{ color:'rgba(255,255,255,.52)', fontSize:11.5, marginTop:4 }}>{row.count || 'demo'} animali compatibili · {resources.join(' · ')}</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:8, marginTop:12, width:'100%', maxWidth:'100%', boxSizing:'border-box' }}>
        <button data-sound="map" onClick={()=>onOpen?.(row)} style={{ height:40, minWidth:0, borderRadius:12, border:'none', background:'#244A70', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:950, cursor:'pointer' }}>LifeWeb</button>
        <button data-sound="tap" onClick={()=>onOpenGrid?.(row)} style={{ height:40, minWidth:0, borderRadius:12, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.05)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:950, cursor:'pointer' }}>Grid</button>
      </div>
    </div>
  );
}

function RegionsPage({ onBack, statusMap = {}, visitedCountries = [], onVisitedCountriesChange, initialView, onSelect, onOpenCountry, onOpenRegion, onAddDestination, destinationsLoading=false, onOpenHabitatGrid, theme='dark' }) {
  const normalizeInitialView = (v) => {
    if (v && typeof v === 'object') return normalizeInitialView(v.view);
    if (v === 'countries') return 'countries';
    if (v === 'continents' || v === 'realms' || !v) return 'planet';
    return v;
  };
  const [view, setView] = useState(normalizeInitialView(initialView));
  const [selectedContinentId, setSelectedContinentId] = useState(null);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [selectedEcoregion, setSelectedEcoregion] = useState(null);
  const [selectedHabitat, setSelectedHabitat] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedDestinationIso, setSelectedDestinationIso] = useState('');
  const [selectedDestinationIsos, setSelectedDestinationIsos] = useState([]);
  const breadcrumbScrollRef = useRef(null);
  const [unlockMap, setUnlockMap] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('animaldex_region_unlocks_v4') || '{}'); } catch { return {}; }
  });
  useEffect(()=>{ try { window.localStorage.setItem('animaldex_region_unlocks_v4', JSON.stringify(unlockMap)); } catch {} }, [unlockMap]);
  useEffect(()=>{
    if (initialView && typeof initialView === 'object') {
      setSelectedContinentId(initialView.continentId || null);
      setSelectedRegionId(initialView.regionId || null);
      setSelectedEcoregion(initialView.ecoregion || null);
    }
    setView(normalizeInitialView(initialView));
  }, [initialView]);
  useEffect(() => {
    if (view !== 'lifeweb') setSelectedHabitat(null);
    if (!['habitats','lifeweb'].includes(view)) setSelectedEcoregion(null);
    if (!['ecoregions','habitats','lifeweb'].includes(view)) setSelectedRegionId(null);
    if (!['regions','ecoregions','habitats','lifeweb'].includes(view)) setSelectedContinentId(null);
    if (view !== 'animals') setSelectedTerritory(prev => prev?.kind === 'subregion' && selectedEcoregion ? { ...prev, label:selectedEcoregion.label } : prev);
  }, [view]);

  const selectedEcoPath = selectedEcoregion ? BIOREGION_V4_CONTINENTS.reduce((found, cont) => {
    if (found) return found;
    const reg = cont.regions.find(r => r.ecoregions.some(e => e.id === selectedEcoregion.id));
    return reg ? { continent:cont, region:reg } : null;
  }, null) : null;
  const effectiveContinentId = selectedContinentId || selectedEcoPath?.continent?.id || null;
  const continent = BIOREGION_V4_CONTINENTS.find(c => c.id === effectiveContinentId) || null;
  const effectiveRegionId = selectedRegionId || selectedEcoPath?.region?.id || null;
  const region = continent?.regions.find(r => r.id === effectiveRegionId) || null;
  const visitedSet = new Set(normalizeIsoList(visitedCountries));
  const scratchCountries = getAllScratchCountries().filter(code => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return true;
    return code.toLowerCase().includes(q) || getCountryDisplayName(code).toLowerCase().includes(q);
  }).slice(0,160);
  const submitDestination = async () => {
    const selectedList = selectedDestinationIsos.length ? selectedDestinationIsos : (selectedDestinationIso ? [selectedDestinationIso] : []);
    if (!selectedList.length) return;
    const cleanList = Array.from(new Set(selectedList.map(c => String(c).toUpperCase()).filter(Boolean)));
    const next = Array.from(new Set([...visitedCountries, ...cleanList])).sort();
    onVisitedCountriesChange?.(next);
    setSelectedCountry(cleanList[cleanList.length - 1] || null);
    setSelectedDestinationIso('');
    setSelectedDestinationIsos([]);
    try {
      for (const iso of cleanList) await onAddDestination?.(iso, []);
    } catch (err) { console.warn('[Animaldex] aggiunta paese non bloccante:', err); }
  };
  const toggleDestinationIso = (code) => {
    const iso = String(code).toUpperCase();
    setSelectedDestinationIso(iso);
    setSelectedDestinationIsos(prev => prev.includes(iso) ? prev.filter(x => x !== iso) : [...prev, iso]);
  };
  const removeVisitedCountry = (code) => {
    const list = normalizeIsoList(visitedCountries.filter(c=>c!==code));
    onVisitedCountriesChange?.(list);
    if (selectedCountry === code) setSelectedCountry(null);
  };
  const allAnimalsWithStatus = ANIMALS.map(a => ({ ...a, status: getResolvedAnimalStatus(a, statusMap, visitedCountries) }));
  const isLightTheme = theme === 'light';
  const territoryAnimals = selectedTerritory ? allAnimalsWithStatus.filter(a => matchGeographySelection(a, [selectedTerritory.filterValue])) : [];
  const selectedSubregionTerritory = selectedEcoregion ? { ...selectedEcoregion, filterValue:`ecoregion:${selectedEcoregion.id}`, kind:'subregion', label:selectedEcoregion.label } : null;
  const habitatRows = selectedSubregionTerritory ? getHabitatsForTerritory(selectedSubregionTerritory, allAnimalsWithStatus) : [];
  const title = (() => {
    if (view === 'planet') return 'Pianeta Terra';
    if (view === 'countries') return 'Paesi visitati';
    if (view === 'terrestrial') return 'Dominio terrestre';
    if (view === 'marine') return 'Dominio marino';
    if (view === 'regions') return continent?.label || 'Regioni';
    if (view === 'ecoregions') return region?.label || 'Subregioni';
    if (view === 'habitats') return selectedEcoregion?.label || 'Habitat';
    if (view === 'lifeweb') return selectedEcoregion?.label || selectedHabitat?.label || 'LifeWeb';
    if (view === 'animals') return selectedTerritory?.label || 'Animali';
    return 'Territori';
  })();
  const goBack = () => {
    if (view === 'planet') return onBack();
    if (view === 'countries') return setView('planet');
    if (view === 'terrestrial' || view === 'marine') return setView('planet');
    if (view === 'regions') return setView('terrestrial');
    if (view === 'ecoregions') { setSelectedEcoregion(null); return setView('regions'); }
    if (view === 'lifeweb') return setView('ecoregions');
    if (view === 'habitats') { setSelectedHabitat(null); return setView('ecoregions'); }
    if (view === 'animals') {
      if (selectedTerritory?.kind === 'marine') return setView('marine');
      if (selectedTerritory?.kind === 'subregion') return setView('ecoregions');
      if (selectedTerritory?.kind === 'region') return setView('regions');
      return setView('terrestrial');
    }
    return setView('planet');
  };
  const openTerritoryAnimals = (territory, filterValue, kind) => {
    setSelectedTerritory({ ...territory, filterValue, kind, label:territory.label });
    setView('animals');
  };
  const unlock = (id) => setUnlockMap(prev => ({ ...prev, [id]: true }));
  const goBreadcrumb = (targetView) => {
    if (targetView === 'planet') { setSelectedContinentId(null); setSelectedRegionId(null); setSelectedEcoregion(null); setView('planet'); return; }
    if (targetView === 'terrestrial') { setSelectedRegionId(null); setSelectedEcoregion(null); setView('terrestrial'); return; }
    if (targetView === 'marine') { setView('marine'); return; }
    if (targetView === 'regions') { setSelectedRegionId(null); setSelectedEcoregion(null); setView('regions'); return; }
    if (targetView === 'ecoregions') { setSelectedEcoregion(null); setView('ecoregions'); return; }
    if (targetView === 'lifeweb') { setView('lifeweb'); return; }
    setView(targetView);
  };
  const breadcrumbItems = (() => {
    if (view === 'countries') return [{ label:'Pianeta', view:'planet' }, { label:'Paesi visitati', view:'countries' }];
    if (view === 'marine') return [{ label:'Pianeta', view:'planet' }, { label:'Reame marino', view:'marine' }];
    if (['terrestrial','regions','ecoregions','lifeweb','animals'].includes(view) || selectedContinentId) {
      const items = [{ label:'Reame terrestre', view:'terrestrial' }];
      if (continent) items.push({ label:continent.label, view:'regions' });
      if (region) items.push({ label:region.label, view:'ecoregions' });
      if (selectedEcoregion) items.push({ label:selectedEcoregion.label, view:'lifeweb' });
      return items;
    }
    return [];
  })();
  useEffect(() => {
    const node = breadcrumbScrollRef.current;
    if (!node) return;
    requestAnimationFrame(() => {
      node.scrollTo({ left: node.scrollWidth - node.clientWidth, behavior:'smooth' });
    });
  }, [view, selectedContinentId, selectedRegionId, selectedEcoregion?.id, breadcrumbItems.length]);

  const openSubregionLifeWeb = (eco) => {
    const territory = { ...eco, filterValue:`ecoregion:${eco.id}`, kind:'subregion', label:eco.label };
    setSelectedEcoregion(eco);
    setSelectedTerritory(territory);
    setSelectedHabitat(buildGeneralLifeWebHabitat(territory));
    setView('lifeweb');
  };
  const openSubregionGrid = (eco) => {
    const territory = { ...eco, filterValue:`ecoregion:${eco.id}`, kind:'subregion', label:eco.label };
    onOpenHabitatGrid?.(territory, buildGeneralLifeWebHabitat(territory), { view:'ecoregions', continentId:effectiveContinentId, regionId:effectiveRegionId, ecoregion:eco });
  };
  const findHierarchyByBioregionId = (id) => {
    const cleanId = String(id || '');
    for (const cont of BIOREGION_V4_CONTINENTS) {
      for (const reg of cont.regions || []) {
        const eco = (reg.ecoregions || []).find(e => String(e.id) === cleanId);
        if (eco) return { cont, reg, eco };
      }
    }
    return null;
  };
  const openMapHierarchyTarget = (id) => {
    const hit = findHierarchyByBioregionId(id);
    if (!hit) return;
    if (view === 'terrestrial') {
      setSelectedContinentId(hit.cont.id);
      setSelectedRegionId(null);
      setSelectedEcoregion(null);
      setView('regions');
      return;
    }
    if (view === 'regions') {
      setSelectedRegionId(hit.reg.id);
      setSelectedEcoregion(null);
      setView('ecoregions');
      return;
    }
    if (view === 'ecoregions') {
      setSelectedEcoregion(hit.eco);
      setView('habitats');
    }
  };

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:isLightTheme?LIGHT_APP_BG:'#050505', overflow:'hidden' }}>
      <PageHeader title={title} onBack={goBack} theme={theme} />
      {view !== 'planet' && breadcrumbItems.length > 0 && (
        <div ref={breadcrumbScrollRef} style={{ flexShrink:0, overflowX:'auto', WebkitOverflowScrolling:'touch', padding:'10px 14px 9px', borderBottom:isLightTheme?'1px solid rgba(0,0,0,.10)':'1px solid rgba(255,255,255,.07)', background:isLightTheme?'rgba(248,243,234,.96)':'linear-gradient(180deg,rgba(17,18,21,.96),rgba(10,10,12,.94))', scrollPaddingRight:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:'max-content' }}>
            {breadcrumbItems.map((item, index) => {
              const last = index === breadcrumbItems.length - 1;
              return (
                <React.Fragment key={`${item.view}-${item.label}`}>
                  <button onClick={()=>!last && goBreadcrumb(item.view)} disabled={last} style={{ flex:'0 0 auto', minHeight:38, padding:'0 13px', borderRadius:11, border:`1px solid ${last?'rgba(184,77,58,.72)':(isLightTheme?'rgba(0,0,0,.10)':'rgba(255,255,255,.11)')}`, background:last?(isLightTheme?'linear-gradient(135deg,rgba(184,77,58,.20),rgba(248,243,234,.92))':'linear-gradient(135deg,rgba(184,77,58,.36),rgba(44,22,21,.82))'):(isLightTheme?'linear-gradient(180deg,rgba(255,255,255,.84),rgba(238,233,224,.90))':'linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.035))'), color:last?(isLightTheme?'#7B2D24':'#FFE0D6'):(isLightTheme?'rgba(0,0,0,.72)':'rgba(255,255,255,.72)'), fontSize:12, fontWeight:950, fontFamily:'inherit', cursor:last?'default':'pointer', whiteSpace:'nowrap', boxShadow:last?'0 8px 20px rgba(184,77,58,.14), inset 0 1px 0 rgba(255,255,255,.08)':'inset 0 1px 0 rgba(255,255,255,.06)' }}>{item.label}</button>
                  {!last && <span style={{ flex:'0 0 auto', color:isLightTheme?'rgba(0,0,0,.34)':'rgba(255,255,255,.30)', fontSize:15, fontWeight:1000 }}>›</span>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'12px 14px 28px', boxSizing:'border-box' }}>
        {view==='planet' && (
          <>
            <button onClick={()=>setView('countries')} style={{ width:'100%', border:`1px solid ${isLightTheme?'rgba(38,118,94,.22)':'rgba(144,216,74,.28)'}`, borderRadius:24, background:isLightTheme?'linear-gradient(135deg,rgba(144,216,74,.22),rgba(251,247,239,.94))':'linear-gradient(135deg,rgba(144,216,74,.18),rgba(32,178,170,.12))', padding:16, marginBottom:14, color:isLightTheme?'#171717':'white', textAlign:'left', cursor:'pointer', fontFamily:'inherit', boxShadow:isLightTheme?'0 12px 28px rgba(0,0,0,.06)':'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:58, height:58, borderRadius:20, background:isLightTheme?'rgba(255,255,255,.70)':'rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 }}>🗺️</div>
                <div style={{ flex:1 }}><div style={{ fontSize:19, fontWeight:1000 }}>Paesi visitati</div><div style={{ color:isLightTheme?'rgba(0,0,0,.62)':'rgba(255,255,255,.58)', fontSize:12, marginTop:4 }}>Paesi visitati su mappa.</div></div>
                <div style={{ color:isLightTheme?'#2B7A4B':'#90D84A', fontSize:20, fontWeight:1000 }}>{visitedCountries.length}</div>
              </div>
            </button>
            <div style={{ background:'linear-gradient(135deg,#1B2B2A,#0D1517)', border:'1px solid rgba(108,229,199,.20)', borderRadius:24, padding:16, marginBottom:14 }}>
              <div style={{ color:'rgba(255,255,255,.58)', fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:.8 }}>Pianeta Terra</div>
              <div style={{ color:'white', fontSize:26, fontWeight:1000, marginTop:4 }}>Scegli un dominio</div>
              <div style={{ color:'rgba(255,255,255,.62)', fontSize:12.5, lineHeight:1.45, marginTop:7 }}>Il dominio terrestre porta a continenti, regioni e subregioni. Il dominio marino usa i 12 grandi bacini biogeografici.</div>
            </div>
            <TerritoryCard item={{label:'Dominio terrestre', bioregionIds:BIOREGION_V4_ECOREGIONS.map(e=>e.id)}} title="Dominio terrestre" subtitle={`${BIOREGION_V4_CONTINENTS.length} macroaree · ${BIOREGION_V4_REGIONS.length} regioni · ${BIOREGION_V4_ECOREGIONS.length} subregioni`} image={['/regions/continents/pianeta_terra.jpg','/regions/america.jpg','/regions/europa.jpg']} icon="" accent="#6CE5C7" openLabel="Apri" onOpen={()=>setView('terrestrial')} mapIds={BIOREGION_V4_ECOREGIONS.map(e=>e.id)} mapDisabled />
            <TerritoryCard item={{label:'Dominio marino', realmType:'marine', bioregionIds:MARINE_REALMS.map(r=>r.id)}} title="Dominio marino" subtitle={`${MARINE_REALMS.length} domini marini · dati v4`} image={['/regions/marine/reami_marini.jpg','/regions/oceania.jpg']} icon="" accent="#4FB3FF" openLabel="Apri" onOpen={()=>setView('marine')} mapIds={MARINE_REALMS.map(r=>r.id)} mapDisabled />
          </>
        )}

        {view==='terrestrial' && (
          <>
            <div style={{ margin:'0 -14px 14px' }}>
              <BioregionVectorMap highlightIds={BIOREGION_V4_ECOREGIONS.map(e=>e.id)} accent="#6CE5C7" height={310} fullBleed clickable onSelect={openMapHierarchyTarget} />
            </div>
            {BIOREGION_V4_CONTINENTS.map(cont => (
              <TerritoryCard key={cont.id} item={cont} title={cont.label} subtitle={`${cont.regions.length} regioni`} image={cont.image} icon="" accent="#6CE5C7" openLabel="Apri" onOpen={()=>{setSelectedContinentId(cont.id);setSelectedRegionId(null);setSelectedEcoregion(null);setView('regions');}} mapIds={cont.bioregionIds} />
            ))}
          </>
        )}

        {view==='marine' && (
          <>
            <div style={{ margin:'0 -14px 14px' }}>
              <BioregionVectorMap highlightIds={MARINE_REALMS.map(m=>m.id)} marine accent="#4FB3FF" height={310} fullBleed clickable onSelect={(id)=>{ const realm = MARINE_REALMS.find(m => String(m.id) === String(id)); if (realm) openTerritoryAnimals(realm, `marine:${realm.id}`, 'marine'); }} />
            </div>
            {MARINE_REALMS.map(m => {
              const locked = !unlockMap[m.id];
              return <TerritoryCard key={m.id} item={m} title={m.label} subtitle={m.name_en || 'Dominio marino'} image={m.image} icon="" accent="#4FB3FF" locked={locked} onUnlock={()=>unlock(m.id)} openLabel="Vedi animali" onOpen={()=>openTerritoryAnimals(m, `marine:${m.id}`, 'marine')} mapIds={[m.id]} />;
            })}
          </>
        )}

        {view==='regions' && continent && (
          <>
            <div style={{ margin:'0 -14px 14px' }}>
              <BioregionVectorMap highlightIds={continent.bioregionIds} accent="#20B2AA" height={310} fullBleed clickable onSelect={openMapHierarchyTarget} />
            </div>
            {continent.regions.map(reg => {
              const locked = !unlockMap[reg.id];
              return <TerritoryCard key={reg.id} item={reg} title={reg.label} subtitle={`${reg.ecoregions.length} subregioni`} image={reg.image} icon="" accent="#20B2AA" locked={locked} onUnlock={()=>unlock(reg.id)} openLabel="Apri" onOpen={()=>{setSelectedRegionId(reg.id);setSelectedEcoregion(null);setView('ecoregions');}} mapIds={reg.bioregionIds} />;
            })}
          </>
        )}

        {view==='ecoregions' && region && (
          <>
            <div style={{ margin:'0 -14px 14px' }}>
              <BioregionVectorMap highlightIds={region.bioregionIds} accent="#90D84A" height={310} fullBleed clickable onSelect={openMapHierarchyTarget} />
            </div>
            {region.ecoregions.map(eco => {
              const locked = !unlockMap[eco.id];
              return <TerritoryCard key={eco.id} item={eco} title={eco.label} subtitle={`${eco.iso?.length || 0} codici ISO · ${eco.name_en || 'subregione'}`} image={eco.image} icon="" accent="#90D84A" locked={locked} onUnlock={()=>unlock(eco.id)} openLabel="Apri" onOpen={()=>{setSelectedEcoregion(eco); setView('habitats');}} mapIds={[eco.id]} />;
            })}
          </>
        )}

        {view==='habitats' && selectedSubregionTerritory && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ border:'1px solid rgba(255,255,255,.08)', borderRadius:22, padding:16, background:'linear-gradient(135deg,rgba(184,77,58,.14),rgba(255,255,255,.045))' }}>
              <div style={{ color:'#F0A840', fontSize:11, fontWeight:1000, textTransform:'uppercase', letterSpacing:.8 }}>Territorio</div>
              <div style={{ color:'white', fontSize:24, fontWeight:1000, marginTop:5 }}>{selectedEcoregion.label}</div>
              <div style={{ color:'rgba(255,255,255,.62)', fontSize:12.5, lineHeight:1.45, marginTop:8 }}>{buildSubregionDescription(selectedEcoregion)}</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <RegionActionBox title="Grid animali" text="Lista filtrata sugli animali collegati a questo ID bioregionale." label="Apri Grid" tone="#244A70" onClick={()=>openSubregionGrid(selectedEcoregion)} />
              <RegionActionBox title="LifeWeb" text={isMediterraneanTerritory(selectedEcoregion) ? 'Mappa a gruppi pronta per il test Mediterraneo.' : 'Pronta per la rete concettuale del territorio.'} label="Apri LifeWeb" tone="#3A2A22" onClick={()=>openSubregionLifeWeb(selectedEcoregion)} />
            </div>
          </div>
        )}

        {view==='lifeweb' && selectedSubregionTerritory && (
          <LifeWebPage territory={selectedSubregionTerritory} habitat={selectedHabitat || buildGeneralLifeWebHabitat(selectedSubregionTerritory)} animals={allAnimalsWithStatus} onOpenAnimal={onSelect} onOpenGrid={()=>openSubregionGrid(selectedEcoregion)} />
        )}

        {view==='countries' && (
          <div>
            <ScratchMap visitedCountries={visitedCountries} selectedCountry={selectedCountry} onSelectCountry={setSelectedCountry} />
            {selectedCountry && (
              <div style={{ background:'#1A1A1C', border:'1px solid rgba(144,216,74,.2)', borderRadius:16, padding:14, marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:28 }}>{getFlagEmoji(selectedCountry)}</span>
                  <div style={{ flex:1 }}><div style={{ color:'white', fontWeight:900 }}>{getCountryDisplayName(selectedCountry)}</div><div style={{ color:'rgba(255,255,255,.52)', fontSize:12 }}>{countAnimalsForGeoValue(selectedCountry)} animali associati</div></div>
                  <button onClick={()=>onOpenCountry?.(selectedCountry)} style={{ height:36, borderRadius:11, border:'none', background:'#244A70', color:'white', fontWeight:900, padding:'0 12px', cursor:'pointer' }}>Vedi animali</button>
                  {!visitedSet.has(selectedCountry) && <button onClick={()=>{ setSelectedDestinationIsos(prev => Array.from(new Set([...prev, selectedCountry]))); }} style={{ height:36, borderRadius:11, border:'none', background:'#90D84A', color:'#111', fontWeight:900, padding:'0 12px', cursor:'pointer' }}>Aggiungi</button>}
                </div>
              </div>
            )}
            {visitedCountries.length > 0 && (
              <div style={{ background:'#111113', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:14, marginBottom:12 }}>
                <div style={{ color:'white', fontSize:18, fontWeight:900, marginBottom:10 }}>Paesi visitati</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {visitedCountries.map(code => <VisitedCountryCard key={code} code={code} onOpenAnimals={onOpenCountry} onRemove={removeVisitedCountry} />)}
                </div>
              </div>
            )}
            <div style={{ background:'#111113', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:14, marginBottom:12 }}>
              <div style={{ color:'white', fontSize:18, fontWeight:900 }}>Aggiungi paesi visitati</div>
              <input value={countrySearch} onChange={e=>setCountrySearch(e.target.value)} placeholder="Cerca paese..." style={{ marginTop:12, width:'100%', height:42, borderRadius:12, background:'#252527', color:'white', border:'1px solid rgba(255,255,255,.12)', padding:'0 12px', fontSize:14, outline:'none', boxSizing:'border-box' }} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, maxHeight:230, overflowY:'auto', marginTop:10, paddingRight:2 }}>
                {scratchCountries.map(code => {
                  const active = visitedSet.has(code) || selectedDestinationIsos.includes(code);
                  return <button key={code} onClick={()=>toggleDestinationIso(code)} style={{ minHeight:44, borderRadius:12, border:`1px solid ${active?'rgba(144,216,74,.65)':'rgba(255,255,255,.08)'}`, background:active?'rgba(144,216,74,.18)':'#1A1A1C', color:active?'#D8FFC4':'white', padding:'8px 10px', display:'flex', alignItems:'center', gap:8, cursor:'pointer', textAlign:'left', fontFamily:'inherit' }}><span style={{ fontSize:20 }}>{getFlagEmoji(code)}</span><span style={{ flex:1, fontSize:11.5, fontWeight:800, lineHeight:1.15 }}>{getCountryDisplayName(code)}</span><span style={{ color:active?'#90D84A':'rgba(255,255,255,.22)', fontSize:15 }}>{active?'✓':'+'}</span></button>;
                })}
              </div>
              <button disabled={(!selectedDestinationIsos.length && !selectedDestinationIso) || destinationsLoading} onClick={submitDestination} style={{ marginTop:12, width:'100%', height:42, borderRadius:13, border:'none', background:(selectedDestinationIsos.length || selectedDestinationIso)?'#90D84A':'#3A3A3C', color:(selectedDestinationIsos.length || selectedDestinationIso)?'#111':'rgba(255,255,255,.38)', fontWeight:900, cursor:(selectedDestinationIsos.length || selectedDestinationIso)?'pointer':'default' }}>{destinationsLoading ? 'Sblocco animali...' : selectedDestinationIsos.length > 1 ? `Aggiungi ${selectedDestinationIsos.length} paesi` : (selectedDestinationIsos[0] || selectedDestinationIso) ? `Aggiungi ${getCountryDisplayName(selectedDestinationIsos[0] || selectedDestinationIso)}` : 'Seleziona uno o più paesi'}</button>
            </div>
          </div>
        )}

        {view==='animals' && selectedTerritory && (
          <>
            <div style={{ margin:'0 -14px 12px' }}><BioregionVectorMap highlightIds={selectedTerritory.bioregionIds || (selectedTerritory.bioregionId ? [selectedTerritory.bioregionId] : [])} marine={selectedTerritory.kind==='marine'} accent={'#A84637'} height={240} showLabels fullBleed /></div>
            <div style={{ color:'rgba(255,255,255,.58)', fontSize:12, margin:'12px 0' }}>
              Animali filtrati per {selectedTerritory.kind === 'marine' ? 'reame marino' : 'subregione'}.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {territoryAnimals.map(a => <AnimalCard key={a.id} a={a} onClick={onSelect} />)}
            </div>
            {territoryAnimals.length === 0 && <div style={{ color:'rgba(255,255,255,.45)', fontSize:13, textAlign:'center', padding:30 }}>Nessun animale collegato per ora. La struttura è pronta per dati e immagini dedicate.</div>}
          </>
        )}
      </div>
    </div>
  );
}


function ToggleRow({ label, initial = true }) {
  const [on, setOn] = useState(initial);
  return (
    <button onClick={()=>setOn(v=>!v)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#222222', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:16, marginBottom:10, cursor:'pointer', fontFamily:'inherit' }}>
      <span style={{ color:'white', fontSize:14, fontWeight:800 }}>{label}</span>
      <span style={{ width:48, height:28, borderRadius:999, background:on?'#90D84A':'#3A3A3C', position:'relative', transition:'background .2s ease' }}>
        <span style={{ position:'absolute', top:3, left:on?23:3, width:22, height:22, borderRadius:'50%', background:'white', transition:'left .2s ease' }} />
      </span>
    </button>
  );
}

function SettingsSubPage({ title, onBack, children, theme='dark' }) {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:theme==='light'?LIGHT_APP_BG:'#1C1C1E', overflow:'hidden' }}>
      <PageHeader title={title} onBack={onBack} theme={theme} />
      <div style={{ flex:1, overflowY:'auto', padding:16 }}>{children}</div>
    </div>
  );
}


function GalleryPage({ onBack, statusMap = {}, onSelect, theme='dark' }) {
  const captured = ANIMALS.map(a => ({ ...a, status: normalizeAnimalStatus(statusMap[a.id] ?? a.status) })).filter(a => a.status === 'catturato');
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#111113', overflow:'hidden' }}>
      <PageHeader title="Galleria" onBack={onBack} theme={theme} />
      <div style={{ flex:1, overflowY:'auto', padding:'14px 12px 28px' }}>
        {captured.length === 0 ? (
          <div style={{ color:'rgba(255,255,255,.45)', textAlign:'center', padding:40, fontSize:14 }}>Nessun animale fotografato/catturato.</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
            {captured.map(a => {
              const c = CLS[a.cls] || CLS.Mammalia;
              return (
                <button key={a.id} onClick={()=>onSelect?.(a)} style={{ border:'none', borderRadius:18, overflow:'hidden', background:'#222', cursor:'pointer', padding:0, textAlign:'left', fontFamily:'inherit', boxShadow:'0 12px 32px rgba(0,0,0,.28)' }}>
                  <AnimalImg a={a} size={126} fontSize={48} overrideStatus="catturato" />
                  <div style={{ padding:10, background:c.mid }}>
                    <div style={{ color:'white', fontSize:13, fontWeight:900, lineHeight:1.25 }}>{a.com}</div>
                    <div style={{ color:'rgba(255,255,255,.65)', fontSize:10, fontStyle:'italic', marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.sci}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsPage({ onBack, onStartInitialOnboarding, onStartOperationalTutorial, theme='dark', onThemeChange }) {
  const [sub, setSub] = useState(null);
  if (sub === 'audio') return (
    <SettingsSubPage title="Audio" onBack={()=>setSub(null)} theme={theme}>
      <ToggleRow label="Suoni interfaccia" />
      <ToggleRow label="Versi degli animali" />
      <ToggleRow label="Notifiche push eventi" />
    </SettingsSubPage>
  );
  if (sub === 'theme') return (
    <SettingsSubPage title="Tema" onBack={()=>setSub(null)} theme={theme}>
      {[
        { value:'dark', label:'Scuro', desc:'Tema attuale Animaldex, nero e contrastato' },
        { value:'light', label:'Chiaro', desc:'Sfondo bianco per menu, griglia, paesi e schede' },
      ].map(opt=>{
        const active = theme === opt.value;
        return <button key={opt.value} onClick={()=>onThemeChange?.(opt.value)} style={{ width:'100%', background:active?(opt.value==='light'?LIGHT_CARD_BG:'#222222'):(theme==='light'?LIGHT_CARD_BG:'#222222'), border:`1.5px solid ${active?'#90D84A':theme==='light'?'rgba(0,0,0,.10)':'rgba(255,255,255,.06)'}`, borderRadius:14, padding:16, marginBottom:10, color:theme==='light'?'#171717':'white', textAlign:'left', fontSize:14, fontWeight:900, cursor:'pointer', fontFamily:'inherit', boxShadow:active?'0 10px 28px rgba(144,216,74,.20)':'none' }}>
          <div>{active?'●':'○'} {opt.label}</div>
          <div style={{ marginTop:5, fontSize:11.5, fontWeight:700, color:theme==='light'?'rgba(0,0,0,.55)':'rgba(255,255,255,.48)', lineHeight:1.35 }}>{opt.desc}</div>
        </button>;
      })}
    </SettingsSubPage>
  );
  if (sub === 'data') return (
    <SettingsSubPage title="Dati" onBack={()=>setSub(null)} theme={theme}>
      {['Sincronizza ora sul Cloud','Esporta dati Animaldex','Spazio foto: placeholder'].map(t=><button key={t} style={{ width:'100%', background:'#222222', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:16, marginBottom:10, color:'white', textAlign:'left', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>{t}</button>)}
    </SettingsSubPage>
  );
  if (sub === 'privacy') return (
    <SettingsSubPage title="Privacy" onBack={()=>setSub(null)} theme={theme}>
      <ToggleRow label="Permesso fotocamera" />
      <ToggleRow label="Posizione GPS per geotag" />
      {['Termini di servizio','Elimina account'].map((t,i)=><button key={t} style={{ width:'100%', background:i?'rgba(255,59,48,.12)':'#222222', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:16, marginBottom:10, color:i?'#FF6B6B':'white', textAlign:'left', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>{t}</button>)}
    </SettingsSubPage>
  );
  const rows = [
    { id:'audio', title:'Audio', subtitle:'Effetti e notifiche' },
    { id:'theme', title:'Tema', subtitle:'Colori e contrasto' },
    { id:'data', title:'Dati', subtitle:'Backup e sincronizzazione' },
    { id:'privacy', title:'Privacy', subtitle:'Permessi e preferenze' },
  ];
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#1C1C1E', overflow:'hidden' }}>
      <PageHeader title="Impostazioni" onBack={onBack} theme={theme} />
      <div style={{ flex:1, overflowY:'auto', padding:16 }}>
        <div style={{ background:'linear-gradient(135deg,rgba(168,70,55,.20),rgba(240,168,64,.08))', border:'1px solid rgba(168,70,55,.42)', borderRadius:24, padding:16, marginBottom:14, boxShadow:'0 18px 50px rgba(0,0,0,.22)' }}>
          <div style={{ color:'#D98674', fontSize:11, fontWeight:1000, textTransform:'uppercase', letterSpacing:.8 }}>Percorsi guidati</div>
          <div style={{ color:'white', fontSize:18, fontWeight:1000, marginTop:5 }}>Onboarding professionale</div>
          <div style={{ color:'rgba(255,255,255,.62)', fontSize:12.5, lineHeight:1.5, marginTop:7 }}>Puoi rivedere l’intera esperienza: configurazione iniziale, radar, rewards, status animali, filtri, regioni, profilo e statistiche.</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:9, marginTop:13 }}>
            <button onClick={onStartInitialOnboarding} style={{ width:'100%', minHeight:48, borderRadius:17, border:'none', background:'linear-gradient(135deg,#A84637,#C45D3F)', color:'white', fontSize:13, fontWeight:1000, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 12px 30px rgba(168,70,55,.30)' }}>Avvia percorso primo accesso</button>
            <button onClick={onStartOperationalTutorial} style={{ width:'100%', minHeight:48, borderRadius:17, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.06)', color:'white', fontSize:13, fontWeight:1000, cursor:'pointer', fontFamily:'inherit' }}>Avvia tour operativo dell’app</button>
          </div>
        </div>
        {rows.map(row=>(
          <button key={row.id} onClick={()=>setSub(row.id)} style={{ width:'100%', background:'#222222', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:16, marginBottom:8, display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', fontFamily:'inherit' }}>
            <span style={{ textAlign:'left' }}><span style={{ display:'block', color:'white', fontSize:15, fontWeight:900 }}>{row.title}</span><span style={{ display:'block', color:'rgba(255,255,255,.48)', fontSize:12, marginTop:3 }}>{row.subtitle}</span></span>
            <span style={{ color:'rgba(255,255,255,.35)', fontSize:22 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}





function AbilityCard({ meta, onOpen, theme='dark', tutorialHighlight=false }) {
  const badgeUrl=`/badges/${meta.id.toLowerCase()}.png`;
  const group = getAbilityGroupMeta(meta.id);
  const isLightTheme = theme === 'light';
  return (
    <button
      className="interactive-hint"
      onClick={()=>onOpen?.(meta)}
      style={{ minHeight:116, borderRadius:18, background:isLightTheme?LIGHT_CARD_BG:'rgba(255,255,255,.05)', border:`1px solid ${tutorialHighlight ? '#F0A840' : group.color}66`, boxShadow:tutorialHighlight ? '0 0 0 3px rgba(240,168,64,.32), 0 0 28px rgba(240,168,64,.34)' : (isLightTheme?`0 10px 22px rgba(0,0,0,.06), inset 0 0 0 1px ${meta.color}14`:`inset 0 0 0 1px ${meta.color}22`), cursor:'pointer', marginBottom:10, padding:14, display:'flex', alignItems:'center', gap:16, width:'100%', textAlign:'left', fontFamily:'inherit', color:isLightTheme?'#171717':'white', overflow:'hidden', position:'relative', zIndex:tutorialHighlight?180:1 }}
    >
      <img src={badgeUrl} alt={meta.label} onError={e=>{e.currentTarget.style.display='none'; const n=e.currentTarget.nextSibling; if(n) n.style.display='flex';}} style={{ width:96, height:96, objectFit:'contain', flexShrink:0, filter:`drop-shadow(0 0 18px ${meta.color}${isLightTheme?'22':'44'})` }} />
      <span style={{ display:'none', alignItems:'center', justifyContent:'center', width:96, height:96, fontSize:50, flexShrink:0 }}>{meta.icon}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 8px', borderRadius:999, background:`${group.color}22`, border:`1px solid ${group.color}55`, color:group.color, fontSize:10.5, fontWeight:900, marginBottom:8 }}>{group.label}</div>
        <div style={{ color:isLightTheme?'#171717':'white', fontSize:17, fontWeight:900, lineHeight:1.18 }}>{meta.label}</div>
        <div style={{ color:isLightTheme?'rgba(0,0,0,.66)':'rgba(255,255,255,.62)', fontSize:12.5, lineHeight:1.4, marginTop:7 }}>{meta.description}</div>
      </div>
    </button>
  );
}

function AbilityModal({ meta, onClose, onOpenAnimals, onPrev, onNext }) {
  if (!meta) return null;
  const badgeUrl=`/badges/${meta.id.toLowerCase()}.png`;
  const group = getAbilityGroupMeta(meta.id);
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:220, display:'flex', alignItems:'center', justifyContent:'center', padding:18 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:430, borderRadius:28, background:'linear-gradient(180deg,#222226,#111113)', border:`1px solid ${group.color}66`, boxShadow:'0 30px 80px rgba(0,0,0,.55)', padding:22, textAlign:'center', animation:'tabFromRight .18s ease-out', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, width:34, height:34, borderRadius:12, border:'none', background:'rgba(255,255,255,.08)', color:'white', fontSize:20, cursor:'pointer', zIndex:2 }}>×</button>
        <button onClick={onPrev} style={{ position:'absolute', top:'50%', left:12, transform:'translateY(-50%)', width:36, height:36, borderRadius:12, border:'none', background:'rgba(255,255,255,.08)', color:'white', fontSize:22, cursor:'pointer', zIndex:2 }}>‹</button>
        <button onClick={onNext} style={{ position:'absolute', top:'50%', right:12, transform:'translateY(-50%)', width:36, height:36, borderRadius:12, border:'none', background:'rgba(255,255,255,.08)', color:'white', fontSize:22, cursor:'pointer', zIndex:2 }}>›</button>
        <div style={{ height:8 }} />
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:999, background:`${group.color}22`, border:`1px solid ${group.color}55`, color:group.color, fontSize:11, fontWeight:900, marginBottom:10 }}>{group.label}</div>
        <img src={badgeUrl} alt={meta.label} onError={e=>{e.currentTarget.style.display='none'; const n=e.currentTarget.nextSibling; if(n) n.style.display='flex';}} style={{ width:266, height:266, maxWidth:'82vw', objectFit:'contain', filter:`drop-shadow(0 12px 28px ${meta.color}44)`, margin:'0 auto 8px', display:'block' }} />
        <span style={{ display:'none', alignItems:'center', justifyContent:'center', width:266, height:266, maxWidth:'82vw', fontSize:104, margin:'0 auto 8px' }}>{meta.icon}</span>
        <div style={{ color:'white', fontSize:25, fontWeight:900, lineHeight:1.1 }}>{meta.label}</div>
        <div style={{ color:'rgba(255,255,255,.70)', fontSize:14, lineHeight:1.55, marginTop:16 }}>{meta.description}</div>
        <div style={{ marginTop:18, background:'rgba(255,255,255,.07)', borderRadius:16, padding:14, border:`1px solid ${group.color}33` }}>
          <div style={{ color:meta.color, fontSize:28, fontWeight:900 }}>{meta.count}</div>
          <div style={{ color:'rgba(255,255,255,.55)', fontSize:12, fontWeight:800 }}>animali hanno questa abilità</div>
        </div>
        <button onClick={()=>onOpenAnimals?.(meta.id, meta.label)} style={{ marginTop:16, height:46, width:'100%', borderRadius:14, border:'none', background:'#244A70', color:'white', fontWeight:900, fontSize:14, cursor:'pointer' }}>Vedi animali</button>
      </div>
    </div>
  );
}

function AbilitiesPage({ onBack, onOpenAbility, theme='dark', tutorialActive=false, onTutorialAbilityOpen }) {
  const isLightTheme = theme === 'light';
  const abilityRows = Object.entries(CATEGORY_META).map(([id, meta]) => ({ id, ...meta, description:getAbilityDescription(id, meta), count: ANIMALS.filter(a=>a.categories?.includes(id)).length, group:getAbilityGroupId(id) }));
  const [search, setSearch] = useState('');
  const [selectedAbility, setSelectedAbility] = useState(null);
  const rows = abilityRows.filter(a => !search.trim() || a.label.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()));
  const groupedRows = ABILITY_GROUPS.map(group => ({ ...group, rows: rows.filter(r => r.group === group.id) })).filter(group => group.rows.length > 0);
  const flatRows = groupedRows.flatMap(group => group.rows);
  const selectedIndex = selectedAbility ? flatRows.findIndex(r => r.id === selectedAbility.id) : -1;
  const shiftSelected = (dir) => {
    if (!flatRows.length) return;
    const nextIndex = selectedIndex < 0 ? 0 : (selectedIndex + dir + flatRows.length) % flatRows.length;
    setSelectedAbility(flatRows[nextIndex]);
  };
  const openAnimals = (id, label) => { setSelectedAbility(null); onOpenAbility?.(id, label); };
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:isLightTheme?LIGHT_APP_BG:'#111113', overflow:'hidden' }}>
      <PageHeader title="Abilità" onBack={onBack} theme={theme} />
      <div style={{ padding:'12px 14px', flexShrink:0 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca abilità..." style={{ width:'100%', height:44, borderRadius:12, background:theme==='light'?'#F3F1EC':'#222226', color:theme==='light'?'#171717':'white', border:`1px solid ${theme==='light'?'rgba(0,0,0,.12)':'rgba(255,255,255,.1)'}`, padding:'0 14px', fontSize:14, outline:'none', boxSizing:'border-box' }} />
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'0 14px 28px' }}>
        {groupedRows.map(group => (
          <div key={group.id} style={{ marginBottom:18 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', margin:'6px 2px 10px' }}>
              <div style={{ color:group.color, fontSize:15, fontWeight:1000 }}>{group.label}</div>
              <div style={{ color:theme==='light'?'rgba(0,0,0,.45)':'rgba(255,255,255,.42)', fontSize:11, fontWeight:900 }}>{group.rows.length}</div>
            </div>
            <div style={{ borderRadius:18, border:`1px solid ${group.color}44`, padding:10, background:isLightTheme?hexToRgba(group.color,.055):'rgba(255,255,255,.03)' }}>
	              {group.rows.map(meta=><AbilityCard key={meta.id} meta={meta} onOpen={(m)=>{ setSelectedAbility(m); if (tutorialActive) onTutorialAbilityOpen?.(m); }} theme={theme} tutorialHighlight={tutorialActive && meta.id === flatRows[0]?.id} />)}
            </div>
          </div>
        ))}
      </div>
      {selectedAbility && <AbilityModal meta={selectedAbility} onClose={()=>setSelectedAbility(null)} onOpenAnimals={openAnimals} onPrev={()=>shiftSelected(-1)} onNext={()=>shiftSelected(1)} />}
    </div>
  );
}


// ── Comparator ────────────────────────────────────────────────────────
const COMPARE_LEFT_COLOR = '#5BB8F5';
const COMPARE_RIGHT_COLOR = '#F0A840';
const COMPARE_LEFT_GRADIENT = 'linear-gradient(135deg,#5BB8F5,#245B9B)';
const COMPARE_RIGHT_GRADIENT = 'linear-gradient(135deg,#F0A840,#A84637)';
function ComparatorInfoModal({ onClose }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:240, display:'flex', alignItems:'center', justifyContent:'center', padding:18 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:430, maxHeight:'86%', overflowY:'auto', borderRadius:26, background:'linear-gradient(180deg,#222226,#111113)', border:'1px solid rgba(255,255,255,.10)', boxShadow:'0 30px 80px rgba(0,0,0,.58)', padding:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:12 }}>
          <div style={{ color:'white', fontSize:22, fontWeight:1000 }}>Come funziona il duello</div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:12, border:'none', background:'rgba(255,255,255,.08)', color:'white', fontSize:20 }}>×</button>
        </div>
        {[
          ['Vulnerabilità', 'Deriva dallo stato di conservazione IUCN quando disponibile; in mancanza usa una stima inversa basata sulla resistenza. Valori alti indicano fragilità maggiore.'],
          ['Dimensioni', 'Nel radar leggi il valore reale. Se nel dataset c’è un range, Apex usa la fascia più alta: per esempio 34-38 cm diventa 38 cm. Il pentagono usa poi una scala logaritmica interna per confrontare piccoli e giganti senza schiacciare nessuno.'],
          ['Velocità', 'Leggi la velocità reale in km/h quando disponibile. Il pentagono la posiziona rispetto agli altri animali del database, così capisci subito chi sta davvero correndo forte.'],
          ['Peso', 'Nel radar leggi il valore reale. Se il peso è indicato come range, Apex usa la fascia più alta; se esiste body_mass_g lo usa come riferimento diretto. La scala del pentagono resta logaritmica per rendere leggibili anche gli estremi.'],
          ['Adattabilità', 'Percentile del numero di paesi in cui la specie è presente: più paesi = distribuzione più ampia e maggiore adattabilità geografica.'],
          ['Abilità', 'Le abilità sono trait contestuali. Nel duello puoi toccarle: sul retro trovi perché quell’animale le possiede o come vengono interpretate.']
        ].map(([title, body])=>(
          <div key={title} style={{ borderRadius:16, background:'rgba(255,255,255,.055)', border:'1px solid rgba(255,255,255,.07)', padding:13, marginBottom:9 }}>
            <div style={{ color:'#F0A840', fontSize:13, fontWeight:1000 }}>{title}</div>
            <div style={{ color:'rgba(255,255,255,.72)', fontSize:12, lineHeight:1.48, marginTop:5 }}>{body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function ComparatorAbilityChip({ animal, id, accent }) {
  const [flipped,setFlipped]=useState(false);
  const meta = CATEGORY_META?.[id] || { label:id, icon:'🔹', color:accent };
  const badgeUrl = `/badges/${id.toLowerCase()}.png`;
  const why = animal?.cat_curiosities?.[id] || animal?.raw?.cat_curiosities?.[id] || getAbilityDescription(id, meta);
  return (
    <button onClick={()=>setFlipped(v=>!v)} style={{ minHeight:86, perspective:800, border:'none', background:'transparent', padding:0, cursor:'pointer', fontFamily:'inherit', color:'white', textAlign:'left' }}>
      <div style={{ position:'relative', minHeight:86, transformStyle:'preserve-3d', transition:'transform .34s ease', transform:flipped?'rotateY(180deg)':'rotateY(0deg)' }}>
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', display:'grid', gridTemplateColumns:'44px 1fr', alignItems:'center', gap:9, background:'rgba(255,255,255,.055)', border:`1px solid ${(meta.color || accent)}44`, borderRadius:15, padding:'9px 10px', boxSizing:'border-box', overflow:'hidden' }}>
          <img src={badgeUrl} alt="" onError={e=>{e.currentTarget.style.display='none'; const n=e.currentTarget.nextSibling; if(n) n.style.display='flex';}} style={{ width:40, height:40, objectFit:'contain', filter:`drop-shadow(0 0 9px ${(meta.color || accent)}55)` }} />
          <span style={{ display:'none', alignItems:'center', justifyContent:'center', width:40, height:40, fontSize:24 }}>{meta.icon}</span>
          <div style={{ color:'white', fontSize:11.5, lineHeight:1.15, fontWeight:950, overflow:'hidden' }}>{meta.label}</div>
        </div>
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateY(180deg)', display:'flex', alignItems:'center', background:'rgba(0,0,0,.40)', border:`1px solid ${(meta.color || accent)}55`, borderRadius:15, padding:'8px 10px', boxSizing:'border-box', overflow:'hidden' }}>
          <div style={{ color:'rgba(255,255,255,.82)', fontSize:9.6, lineHeight:1.16, fontWeight:720, maxHeight:72, overflowY:'auto' }}>{why}</div>
        </div>
      </div>
    </button>
  );
}


function parseRangeAverage(value, unitKind='mass') {
  if (value == null) return null;
  const s = String(value).toLowerCase().replace(/,/g,'.').replace(/[–—]/g,'-');
  const nums = [...s.matchAll(/\d+(?:\.\d+)?/g)].map(m => Number(m[0])).filter(Number.isFinite);
  if (!nums.length) return null;
  let n = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0];
  if (unitKind === 'mass') {
    if (/\bton|\bt\b|tonnell/.test(s)) n *= 1000000;
    else if (/\bkg\b|chil/.test(s)) n *= 1000;
    else if (/\bmg\b/.test(s)) n /= 1000;
    return n;
  }
  if (unitKind === 'length') {
    if (/\bkm\b/.test(s)) n *= 100000;
    else if (/\bm\b|metro|metri/.test(s)) n *= 100;
    else if (/\bmm\b/.test(s)) n /= 10;
    return n;
  }
  return n;
}
function parseRangeMax(value, unitKind='mass') {
  if (value == null) return null;
  const s = String(value).toLowerCase().replace(/,/g,'.').replace(/[–—]/g,'-');
  const nums = [...s.matchAll(/\d+(?:\.\d)?\d*/g)].map(m => Number(m[0])).filter(Number.isFinite);
  if (!nums.length) return null;
  let n = Math.max(...nums);
  if (unitKind === 'mass') {
    if (/\bton|\bt\b|tonnell/.test(s)) n *= 1000000;
    else if (/\bkg\b|chil/.test(s)) n *= 1000;
    else if (/\bmg\b/.test(s)) n /= 1000;
    return n;
  }
  if (unitKind === 'length') {
    if (/\bkm\b/.test(s)) n *= 100000;
    else if (/\bm\b|metro|metri/.test(s)) n *= 100;
    else if (/\bmm\b/.test(s)) n /= 10;
    return n;
  }
  return n;
}
function getAnimalMassG(a) {
  const m = Number(a?.foodweb?.body_mass_g);
  if (Number.isFinite(m) && m > 0) return m;
  return parseRangeAverage(a?.wt, 'mass') || 1;
}
function getAnimalLengthCm(a) {
  return parseRangeAverage(a?.ln, 'length') || 1;
}
function getComparatorMassG(a) {
  const m = Number(a?.foodweb?.body_mass_g);
  if (Number.isFinite(m) && m > 0) return m;
  return parseRangeMax(a?.wt, 'mass') || 1;
}
function getComparatorLengthCm(a) {
  return parseRangeMax(a?.ln, 'length') || 1;
}
function getCountriesCount(a) {
  return toArraySafe(a?.distribution?.countries_present || a?.geo?.iso?.primary || a?.geo?.iso?.iucn || a?.geo?.iso).length;
}
function percentileRank(value, values) {
  const clean = values.map(Number).filter(v => Number.isFinite(v));
  if (!clean.length || !Number.isFinite(Number(value))) return 0;
  const below = clean.filter(v => v <= Number(value)).length;
  return Math.round((below / clean.length) * 100);
}
function minMaxScore(value, values) {
  const clean = values.map(Number).filter(v => Number.isFinite(v));
  if (!clean.length || !Number.isFinite(Number(value))) return 0;
  const min = Math.min(...clean); const max = Math.max(...clean);
  if (max <= min) return 50;
  return Math.round(((Number(value) - min) / (max - min)) * 100);
}
function vulnerabilityScore(a) {
  const s = String(a?.cons || '').toUpperCase();
  const map = { EX:100, EW:96, CR:92, EN:78, VU:64, NT:42, LC:16, DD:50, NE:45 };
  return map[s] ?? Math.max(0, Math.min(100, 100 - Number(a?.stats?.resistenza || 45)));
}
function getComparatorBenchmarks(animals=[]) {
  const list = (animals || []).filter(Boolean);
  return {
    massLog: list.map(a => Math.log10(getComparatorMassG(a) + 1)),
    lengthLog: list.map(a => Math.log10(getComparatorLengthCm(a) + 1)),
    speeds: list.map(a => Number(a?.stats?.velocita || 0)),
    countries: list.map(getCountriesCount),
  };
}
const COMPARATOR_METRICS = [
  { key:'vulnerabilita', label:'Vulnerabilità' },
  { key:'dimensioni', label:'Dimensioni' },
  { key:'velocita', label:'Velocità' },
  { key:'peso', label:'Peso' },
  { key:'adattabilita', label:'Adattabilità' },
];
function getComparatorMetrics(a, benchmarks) {
  const massG = getComparatorMassG(a);
  const lengthCm = getComparatorLengthCm(a);
  const countries = getCountriesCount(a);
  const speed = Number(a?.stats?.velocita || 0);
  return {
    radar: [
      { key:'vulnerabilita', label:'Vulnerabilità', value:vulnerabilityScore(a), raw:String(a?.cons || 'DD') },
      { key:'dimensioni', label:'Dimensioni', value:minMaxScore(Math.log10(lengthCm + 1), benchmarks.lengthLog), raw:lengthCm ? `${Math.round(lengthCm)} cm` : 'n/d' },
      { key:'velocita', label:'Velocità', value:percentileRank(speed, benchmarks.speeds), raw:speed ? `${speed}` : 'n/d' },
      { key:'peso', label:'Peso', value:minMaxScore(Math.log10(massG + 1), benchmarks.massLog), raw:formatComparatorMassG(massG) },
      { key:'adattabilita', label:'Adattabilità', value:percentileRank(countries, benchmarks.countries), raw:`${countries} paesi` },
    ],
    massG, lengthCm, countries, speed,
  };
}
function formatComparatorRaw(metric) {
  if (!metric) return '';
  const raw = String(metric.raw || '').trim();
  if (metric.key === 'vulnerabilita') return `IUCN ${raw || 'DD'}`;
  if (metric.key === 'velocita') return raw && raw !== 'n/d' ? `${raw} km/h` : 'n/d';
  return raw || 'n/d';
}
function formatComparatorMassG(g) {
  const n = Number(g);
  if (!Number.isFinite(n) || n <= 0) return 'n/d';
  if (n >= 1000000) return `${Number((n / 1000000).toFixed(n >= 10000000 ? 0 : 1))} t`;
  if (n >= 1000) return `${Number((n / 1000).toFixed(n >= 10000 ? 0 : 1))} kg`;
  if (n < 1) return `${Number((n * 1000).toFixed(1))} mg`;
  return `${Number(n.toFixed(n < 10 ? 1 : 0))} g`;
}
function polarPoint(cx, cy, r, angleDeg) {
  const rad = (Math.PI / 180) * angleDeg;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}
function RadarPolygon({ values, color, opacity=.24, strokeWidth=4, cx=220, cy=205, r=105 }) {
  const pts = values.map((v,i)=>{
    const angle = -90 + i * (360 / values.length);
    const [x,y] = polarPoint(cx, cy, r * Math.max(0, Math.min(100, v.value)) / 100, angle);
    return `${x},${y}`;
  }).join(' ');
  return <polygon points={pts} fill={color} fillOpacity={opacity} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />;
}
function radarLabelLines(label='') {
  const s = String(label);
  if (s === 'Velocità centili') return ['Velocità', 'centili'];
  if (s === 'Dimensioni log') return ['Dimensioni', 'log'];
  if (s === 'Peso log') return ['Peso', 'log'];
  if (s === 'Adattabilità') return ['Adattabilità'];
  if (s === 'Vulnerabilità') return ['Vulnerabilità'];
  return s.split(' ');
}
function ComparatorRadar({ left, right, colorLeft, colorRight }) {
  const width = 430, height = 410, cx = width/2, cy = 206, r = 120;
  const axes = left?.radar || right?.radar || COMPARATOR_METRICS.map(m=>({ ...m, value:0 }));
  const pt = (idx,value)=>{ const angle=-Math.PI/2 + idx*(2*Math.PI/axes.length); const rr=r*(Number(value||0)/100); return [cx+Math.cos(angle)*rr, cy+Math.sin(angle)*rr]; };
  const poly = (data)=> data ? data.radar.map((m,i)=>pt(i,m.value).join(',')).join(' ') : '';
  const grid = [20,40,60,80,100].map(v=> axes.map((_,i)=>pt(i,v).join(',')).join(' '));
  const labelSlots = [
    { x:cx, y:34, anchor:'middle' },
    { x:width-52, y:126, anchor:'end' },
    { x:width-68, y:356, anchor:'end' },
    { x:68, y:356, anchor:'start' },
    { x:52, y:126, anchor:'start' },
  ];
  return (
    <div style={{ borderRadius:24, background:'radial-gradient(circle at 50% 48%,rgba(168,70,55,.14),rgba(0,0,0,.36) 58%,rgba(0,0,0,.76))', border:'1px solid rgba(255,255,255,.08)', padding:8, overflow:'hidden', boxShadow:'inset 0 1px 0 rgba(255,255,255,.04)' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width:'100%', maxWidth:430, display:'block', margin:'0 auto' }}>
        {grid.map((g,i)=><polygon key={i} points={g} fill="none" stroke="rgba(255,255,255,.18)" strokeDasharray="5 6" strokeWidth="1" />)}
        {axes.map((m,i)=>{ const [x,y]=pt(i,100); return <line key={m.key} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,.20)" strokeWidth="1" />; })}
        {right && <polygon points={poly(right)} fill={`${colorRight}33`} stroke={colorRight} strokeWidth="4" />}
        {left && <polygon points={poly(left)} fill={`${colorLeft}33`} stroke={colorLeft} strokeWidth="4" />}
        {[left,right].filter(Boolean).map((data,di)=>data.radar.map((m,i)=>{ const [x,y]=pt(i,m.value); const col=di===0?colorLeft:colorRight; return <circle key={`${di}-${m.key}`} cx={x} cy={y} r="4.8" fill={col} stroke="rgba(255,255,255,.65)" strokeWidth="1.2" />; }))}
        {axes.map((m,i)=>{ const slot=labelSlots[i] || {x:cx,y:height-30,anchor:'middle'}; const lv=left?.radar?.[i]; const rv=right?.radar?.[i]; return <g key={m.key}>
          <text x={slot.x} y={slot.y} fill="white" fontSize="15" fontWeight="900" textAnchor={slot.anchor}>{radarLabelLines(m.label)[0]}</text>
          {radarLabelLines(m.label)[1] && <text x={slot.x} y={slot.y+16} fill="white" fontSize="12" fontWeight="850" opacity=".82" textAnchor={slot.anchor}>{radarLabelLines(m.label)[1]}</text>}
          <text x={slot.x} y={slot.y+32} fill={colorLeft} fontSize="10.5" fontWeight="900" textAnchor={slot.anchor}>{lv?formatComparatorRaw(lv):''}</text>
          <text x={slot.x} y={slot.y+45} fill={colorRight} fontSize="10.5" fontWeight="900" textAnchor={slot.anchor}>{rv?formatComparatorRaw(rv):''}</text>
        </g>; })}
      </svg>
    </div>
  );
}
function ComparatorSelector({ label, value, animals, onChange, accent, gradient, onZoom, compact=false }) {
  const [open,setOpen] = useState(false);
  const [q,setQ] = useState('');
  const rows = animals.filter(a => !q.trim() || `${a.com} ${a.sci} ${a.com_en}`.toLowerCase().includes(q.toLowerCase())).slice(0,80);
  const shownLabel = compact ? '' : label;
  return (
    <div style={{ position:'relative', minWidth:0, width:'100%' }}>
      <button data-sound="compare" onClick={()=>setOpen(v=>!v)} style={{ width:'100%', minWidth:0, boxSizing:'border-box', border:'1px solid transparent', background:`linear-gradient(180deg,rgba(18,18,20,.92),rgba(0,0,0,.36)) padding-box, ${gradient || accent} border-box`, borderRadius:20, padding:compact?8:10, color:'white', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:compact?8:10, boxShadow:`0 0 0 1px ${accent}33, 0 14px 34px rgba(0,0,0,.26)` }}>
        <div onClick={e=>{ if (value && onZoom) { e.stopPropagation(); onZoom(value); } }} style={{ width:compact?54:58, height:compact?54:58, borderRadius:16, background:'#202228', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0, boxShadow:`0 0 18px ${accent}22`, cursor:value?'zoom-in':'pointer' }}>
          {value ? <AnimalImg a={{...value,status:'avvistato'}} size={compact?48:52} fontSize={30} overrideStatus="avvistato" /> : <span style={{ fontSize:24, color:accent }}>＋</span>}
        </div>
        <div style={{ minWidth:0, flex:1 }}>
          {shownLabel && <div style={{ color:accent, fontSize:10, fontWeight:950, textTransform:'uppercase', letterSpacing:.6 }}>{shownLabel}</div>}
          <div style={{ color:'white', fontSize:compact?15:14, fontWeight:950, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{value?.com || 'Seleziona animale'}</div>
          <div style={{ color:'rgba(255,255,255,.48)', fontSize:10, fontStyle:'italic', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{value?.sci || 'tocca per cercare'}</div>
        </div>
      </button>
      {open && <div style={{ position:'fixed', left:14, right:14, top:'calc(env(safe-area-inset-top, 0px) + 86px)', bottom:'calc(env(safe-area-inset-bottom, 0px) + 18px)', zIndex:260, background:'#171719', border:'1px solid rgba(255,255,255,.12)', borderRadius:20, padding:10, boxShadow:'0 22px 70px rgba(0,0,0,.72)', display:'flex', flexDirection:'column' }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cerca nome o scientifico..." autoFocus style={{ width:'100%', height:44, borderRadius:12, border:'1px solid rgba(255,255,255,.10)', background:'#252529', color:'white', padding:'0 12px', boxSizing:'border-box', outline:'none', marginBottom:8, fontSize:16 }} />
        <div style={{ flex:1, minHeight:0, overflowY:'auto', display:'flex', flexDirection:'column', gap:7, WebkitOverflowScrolling:'touch' }}>
          {rows.map(a=>{
            return <button data-sound="compare" key={a.id} onClick={()=>{onChange(a); setOpen(false); setQ('');}} style={{ border:'none', background:'rgba(255,255,255,.05)', borderRadius:13, padding:8, color:'white', display:'flex', alignItems:'center', gap:9, cursor:'pointer', textAlign:'left' }}>
              <div style={{ width:38, height:38, borderRadius:12, background:'#202228', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}><AnimalImg a={{...a,status:'avvistato'}} size={34} fontSize={22} overrideStatus="avvistato" /></div>
              <div style={{ minWidth:0 }}><div style={{ fontSize:12.5, fontWeight:900, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.com}</div><div style={{ fontSize:10, color:'rgba(255,255,255,.45)', fontStyle:'italic', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.sci}</div></div>
            </button>;
          })}
        </div>
      </div>}
    </div>
  );
}
function CompareInfoCard({ animal, metrics, accent, sideLabel, gradient, onZoom }) {
  if (!animal) return <div style={{ minHeight:240, borderRadius:22, background:'rgba(255,255,255,.05)', border:'1px dashed rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.45)', fontWeight:850 }}>Scegli un animale</div>;
  const c = CLS[animal.cls] || CLS.Mammalia;
  const abilities = toArraySafe(animal.categories).slice(0,6);
  const stat = (label,value,sub,icon) => <div style={{ background:'rgba(0,0,0,.28)', border:'1px solid rgba(255,255,255,.06)', borderRadius:14, padding:'9px 10px' }}><div style={{ color:'rgba(255,255,255,.55)', fontSize:10, fontWeight:850, textTransform:'uppercase' }}>{icon} {label}</div><div style={{ color:'white', fontSize:14, fontWeight:950, marginTop:3 }}>{value}</div>{sub && <div style={{ color:'rgba(255,255,255,.42)', fontSize:9.5, marginTop:1 }}>{sub}</div>}</div>;
  return (
    <div style={{ borderRadius:24, overflow:'hidden', background:`linear-gradient(180deg,${c.detailTop || '#2A2A2C'},#111113) padding-box, ${gradient || accent} border-box`, border:'1px solid transparent', boxShadow:`0 16px 48px rgba(0,0,0,.28), 0 0 0 1px ${accent}22` }}>
      <div onClick={()=>onZoom?.(animal)} style={{ padding:14, display:'flex', alignItems:'center', gap:12, cursor:'zoom-in' }}>
        <div style={{ width:76, height:76, borderRadius:22, background:'#202228', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0, boxShadow:`0 0 20px ${accent}22` }}><AnimalImg a={{...animal,status:'avvistato'}} size={70} fontSize={38} overrideStatus="avvistato" /></div>
        <div style={{ minWidth:0 }}>
          <div aria-label={sideLabel} style={{ width:38, height:5, borderRadius:999, background:accent, marginBottom:7, boxShadow:`0 0 14px ${accent}44` }} />
          <div style={{ color:'white', fontSize:18, fontWeight:1000, lineHeight:1.05 }}>{animal.com}</div>
          <div style={{ color:'rgba(255,255,255,.58)', fontSize:11, fontStyle:'italic', marginTop:3 }}>{animal.sci}</div>
        </div>
      </div>
      <div style={{ padding:'0 14px 14px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {stat('Morso', animal.stats?.morso != null ? `${animal.stats.morso} PSI` : 'n/d', null, '🦷')}
        {stat('Lifespan', animal.lifespan != null ? `${animal.lifespan} anni` : 'n/d', null, '⏳')}
        {stat('Classe', CLS[animal.cls]?.label || animal.cls || 'n/d', animal.cls, '🧬')}
        {stat('Adattabilità', metrics?.radar?.find(x=>x.key==='adattabilita')?.value + '/100', `${metrics?.countries || 0} paesi`, '🌍')}
      </div>
      <div style={{ padding:'0 14px 16px' }}>
        <div style={{ color:'rgba(255,255,255,.58)', fontSize:11, fontWeight:900, margin:'0 0 8px 2px', textTransform:'uppercase' }}>Abilità</div>
        {abilities.length ? <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>{abilities.map(id=><ComparatorAbilityChip key={id} animal={animal} id={id} accent={accent} />)}</div> : <div style={{ color:'rgba(255,255,255,.45)', fontSize:12, background:'rgba(255,255,255,.05)', borderRadius:13, padding:12 }}>Nessuna abilità speciale registrata.</div>}
      </div>
    </div>
  );
}
function ComparatorPage({ onBack, animals = [], statusMap = {}, visitedCountries = [], initialAnimal = null, theme='dark' }) {
  const normalized = useMemo(() => (animals || ANIMALS || []).map(a => ({ ...a, status: getResolvedAnimalStatus(a, statusMap, visitedCountries) })), [animals, statusMap, visitedCountries]);
  const firstDefault = initialAnimal ? normalized.find(a=>a.id===initialAnimal.id) || initialAnimal : null;
  const [left,setLeft] = useState(firstDefault || null);
  const [right,setRight] = useState(null);
  useEffect(()=>{ setLeft(initialAnimal ? (normalized.find(a=>a.id===initialAnimal.id) || initialAnimal) : null); setRight(null); }, [initialAnimal?.id, normalized.length]);
  const bench = useMemo(() => getComparatorBenchmarks(normalized), [normalized]);
  const leftMetrics = left ? getComparatorMetrics(left, bench) : null;
  const rightMetrics = right ? getComparatorMetrics(right, bench) : null;
  const colorLeft = COMPARE_LEFT_COLOR;
  const colorRight = COMPARE_RIGHT_COLOR;
  const [showInfo,setShowInfo]=useState(false);
  const [zoomAnimal,setZoomAnimal]=useState(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 560;
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:theme==='light'?LIGHT_APP_BG:'#111113', overflow:'hidden' }}>
      <PageHeader title="Comparatore" onBack={onBack} theme={theme} />
      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'14px 14px 28px', boxSizing:'border-box' }}>
        <div style={{ background:'linear-gradient(135deg,rgba(168,70,55,.28),rgba(20,20,22,.88))', border:'1px solid rgba(255,255,255,.08)', borderRadius:24, padding:16, marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
            <div>
              <div style={{ color:'#C85D44', fontSize:11, fontWeight:950, textTransform:'uppercase', letterSpacing:1 }}>Analisi comparativa</div>
              <div style={{ color:'white', fontSize:25, fontWeight:1000, lineHeight:1.05, marginTop:4 }}>Duello biologico</div>
            </div>
            <button onClick={()=>setShowInfo(true)} aria-label="Info comparatore" style={{ width:36, height:36, borderRadius:13, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.06)', color:'#F0A840', fontSize:18, fontWeight:1000, cursor:'pointer' }}>i</button>
          </div>
          <div style={{ color:'rgba(255,255,255,.56)', fontSize:12, lineHeight:1.55, marginTop:8 }}>Il radar mostra i valori reali accanto a ogni voce; il pentagono li normalizza solo per rendere il confronto immediato.</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:10, marginBottom:12, minWidth:0 }}>
          <ComparatorSelector label="Sinistra" value={left} animals={normalized} onChange={setLeft} accent={colorLeft} gradient={COMPARE_LEFT_GRADIENT} compact={isMobile} onZoom={setZoomAnimal} />
          <ComparatorSelector label="Destra" value={right} animals={normalized} onChange={setRight} accent={colorRight} gradient={COMPARE_RIGHT_GRADIENT} compact={isMobile} onZoom={setZoomAnimal} />
        </div>
        {!left && !right && <div style={{ marginBottom:12, borderRadius:18, border:'1px solid rgba(255,255,255,.08)', background:'rgba(255,255,255,.04)', padding:'12px 14px', color:'rgba(255,255,255,.68)', fontSize:12.5, lineHeight:1.45 }}>Seleziona uno o due animali per iniziare il confronto. Da mobile, tocca le card sopra per aprire la ricerca.</div>}
        <ComparatorRadar left={leftMetrics} right={rightMetrics} colorLeft={colorLeft} colorRight={colorRight} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, margin:'12px 0 16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,.76)', fontSize:11, fontWeight:850 }}><span style={{ width:14, height:4, borderRadius:4, background:colorLeft, display:'inline-block' }} />{left?.com || 'Animale A'}</div>
          <div style={{ color:'rgba(255,255,255,.26)', fontSize:13, fontWeight:950 }}>VS</div>
          <div style={{ display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,.76)', fontSize:11, fontWeight:850 }}><span style={{ width:14, height:4, borderRadius:4, background:colorRight, display:'inline-block' }} />{right?.com || 'Animale B'}</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:12 }}>
          <CompareInfoCard animal={left} metrics={leftMetrics} accent={colorLeft} gradient={COMPARE_LEFT_GRADIENT} sideLabel="Animale A" onZoom={setZoomAnimal} />
          <CompareInfoCard animal={right} metrics={rightMetrics} accent={colorRight} gradient={COMPARE_RIGHT_GRADIENT} sideLabel="Animale B" onZoom={setZoomAnimal} />
        </div>
      </div>
      {showInfo && <ComparatorInfoModal onClose={()=>setShowInfo(false)} />}
      {zoomAnimal && <ImageLightbox src={zoomAnimal.image_url} alt={zoomAnimal.com} accentColor={(CLS[zoomAnimal.cls]||CLS.Mammalia).accent} bgColor={(CLS[zoomAnimal.cls]||CLS.Mammalia).img} animal={zoomAnimal} onClose={()=>setZoomAnimal(null)} />}
    </div>
  );
}


// ── Root ──────────────────────────────────────────────────────────────

export default function App() {
  const [session,setSession]=useState(null);
  const [user,setUser]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [dataLoading,setDataLoading]=useState(false);
  const [dataError,setDataError]=useState('');
  const [userProfile,setUserProfile]=useState(null);
  const [toastOpenBadgeId,setToastOpenBadgeId]=useState(null);
  const [tutorialStep,setTutorialStep]=useState(null);
  const [tutorialAnimalId,setTutorialAnimalId]=useState(null);
  const [tutorialStamp,setTutorialStamp]=useState(false);
  const [animalsData,setAnimalsData]=useState(() => LOCAL_ANIMALS.map(normalizeLocalAnimal));
  ANIMALS = animalsData;
  const [sel,setSel]=useState(null);
  const [statusMap,setStatusMap]=useState({});
  const [page,setPage]=useState('grid');
  const [gridPreset,setGridPreset]=useState(null);
  const [gridReturnTarget,setGridReturnTarget]=useState(null);
  const [regionsInitialView,setRegionsInitialView]=useState(null);
  const [comparatorInitialAnimal,setComparatorInitialAnimal]=useState(null);
  const [lifeWebInitialAnimal,setLifeWebInitialAnimal]=useState(null);
  const [featureReturnAnimal,setFeatureReturnAnimal]=useState(null);
  const [photoTarget,setPhotoTarget]=useState(null);
  const [sectionIntro,setSectionIntro]=useState(null);
  const [activeSectionGuide,setActiveSectionGuide]=useState(null);
  const [destinationsLoading,setDestinationsLoading]=useState(false);
  const [awardQueue,setAwardQueue]=useState([]);
  const [earnedBadgeIds,setEarnedBadgeIds]=useState([]);
  const [theme,setTheme]=useState(getInitialAnimaldexTheme);
  const [visitedCountries,setVisitedCountries]=useState(() => normalizeIsoList(getVisitedCountries()));
  const unlockedAwards = useMemo(() => computeUnlockedAwards(statusMap, visitedCountries), [statusMap, visitedCountries]);
  const activeAwardToast = awardQueue[0] || null;
  useAnimaldexSound(true);
  const appHeight = useAppViewportHeight();
  const getTutorialAnimal = () => {
    const list = (animalsData || []).map(a => ({ ...a, status: getResolvedAnimalStatus(a, statusMap, visitedCountries) }));
    return list.find(a => Number(a.id) === 31)
      || list.find(a => /piccione|columba livia/i.test(`${a.com || ''} ${a.sci || ''}`))
      || list.find(a => !isMysteryStatus(a.status) && a.image_url)
      || list.find(a => a.image_url)
      || list[0]
      || null;
  };

  useEffect(()=>{
    const l=document.createElement('link');
    l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap';
    document.head.appendChild(l);
    document.body.style.cssText='margin:0;background:#1C1C1E;overflow:hidden;overscroll-behavior:none;touch-action:manipulation;width:100%;min-width:0';
    const meta = document.querySelector('meta[name=viewport]') || document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1';
    if (!meta.parentNode) document.head.appendChild(meta);
    const style=document.createElement('style');
    style.textContent = RARITY_CSS + `
@keyframes ecosystemStress { 0%,100%{ transform:translate(0,0); } 25%{ transform:translate(1.5px,-1px); } 50%{ transform:translate(-1.3px,1px); } 75%{ transform:translate(1px,1.2px); } }`;
    document.head.appendChild(style);
    return () => { try { document.head.removeChild(l); document.head.removeChild(style); } catch {} };
  },[]);

  useEffect(()=>{
    applyAnimaldexThemeToDocument(theme);
  }, [theme]);

  useEffect(()=>{
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session || null);
      setUser(data.session?.user || null);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession || null);
      setUser(nextSession?.user || null);
      setAuthLoading(false);
      if (nextSession?.user) {
        try { await ensureUserProfile(nextSession.user); } catch (err) { console.warn('[Animaldex] Profilo Supabase:', err); }
      }
    });
    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  },[]);

  const reloadSupabaseData = async (activeUser = user) => {
    if (!activeUser?.id) return;
    setDataLoading(true);
    setDataError('');

    try {
      // Non bloccare mai la UI sul profilo: se Supabase/RLS rallenta, usiamo fallback.
      await withTimeout(
        ensureUserProfile(activeUser).catch(err => {
          console.warn('[Animaldex] ensure profile non bloccante:', err);
          return false;
        }),
        3500,
        false,
        'ensureUserProfile'
      );

      const profile = await withTimeout(
        fetchUserProfile(activeUser),
        4500,
        buildFallbackProfile(activeUser, true),
        'fetchUserProfile'
      );
      setUserProfile(profile || buildFallbackProfile(activeUser, true));

      const [remoteAnimals, destinations, remoteBadgeIds] = await withTimeout(
        Promise.all([
          fetchAnimalsFromSupabase(activeUser.id),
          fetchUserDestinations(activeUser.id),
          fetchUserBadgeIds(activeUser.id),
        ]),
        14000,
        [null, getVisitedCountries(), []],
        'caricamento dati Supabase'
      );

      const sourceAnimals = applyCachedUserStatuses(remoteAnimals?.length ? mergeRemoteWithLocalBioregions(remoteAnimals) : LOCAL_ANIMALS.map(normalizeLocalAnimal), activeUser.id);
      const remoteStatusMap = Object.fromEntries((sourceAnimals || []).map(a => [a.id, normalizeAnimalStatus(a.status)]));
      const nextStatusMap = mergeStatusMapsByRank(remoteStatusMap, getLocalUserStatusMap(activeUser.id), statusMap);
      const nextAnimals = (sourceAnimals || []).map(a => ({ ...a, status:nextStatusMap[a.id] || normalizeAnimalStatus(a.status), userStatus:appStatusToSupabase(nextStatusMap[a.id] || a.status) }));
      setAnimalsData(nextAnimals);
      setStatusMap(nextStatusMap);
      saveLocalUserStatusMap(activeUser.id, nextStatusMap);

      const nextDestinations = normalizeIsoList(destinations || []);
      setVisitedCountries(nextDestinations);
      saveVisitedCountries(nextDestinations);

      setEarnedBadgeIds((remoteBadgeIds || []).map(normalizeBadgeId));
      persistAwardUnlocks(remoteBadgeIds || []);
    } catch (err) {
      console.warn('[Animaldex] Caricamento Supabase fallito, uso fallback locale:', err);
      setDataError(err?.message || 'Errore caricamento Supabase');

      const fallbackSource = applyCachedUserStatuses(LOCAL_ANIMALS.map(normalizeLocalAnimal), activeUser.id);
      const fallbackStatusMap = mergeStatusMapsByRank(Object.fromEntries(fallbackSource.map(a => [a.id, normalizeAnimalStatus(a.status)])), getLocalUserStatusMap(activeUser.id), statusMap);
      const fallback = fallbackSource.map(a => ({ ...a, status:fallbackStatusMap[a.id] || normalizeAnimalStatus(a.status), userStatus:appStatusToSupabase(fallbackStatusMap[a.id] || a.status) }));
      setAnimalsData(fallback);
      setStatusMap(fallbackStatusMap);
      setUserProfile(prev => prev || buildFallbackProfile(activeUser, true));
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(()=>{
    if (user?.id) reloadSupabaseData(user);
  },[user?.id]);

  useEffect(() => {
    if (!userProfile?.onboarding_completed) return;
    if (userProfile?.has_completed_tutorial) return;
    if (tutorialStep) return;
    if (!animalsData?.length) return;
    const target = getTutorialAnimal();
    if (!target) return;
    setTutorialAnimalId(target.id);
    setSel(null);
    setGridPreset(null);
    setGridReturnTarget(null);
    setPage('menu');
    setTutorialStep('home');
  }, [userProfile?.onboarding_completed, userProfile?.has_completed_tutorial, animalsData?.length, Object.keys(statusMap || {}).length, tutorialStep]);

  useEffect(() => {
    const localSaved = getAwardUnlockSet();
    const dbSaved = new Set((earnedBadgeIds || []).map(normalizeBadgeId));
    const alreadyKnown = new Set([...Array.from(localSaved), ...Array.from(dbSaved)]);
    const current = unlockedAwards.map(a => normalizeBadgeId(a.badgeId));
    const fresh = unlockedAwards.filter(a => !alreadyKnown.has(normalizeBadgeId(a.badgeId)));

    if (fresh.length) {
      setAwardQueue(prev => [...prev, ...fresh]);
      if (user?.id) fresh.forEach(award => createSocialBadgeEvent(user.id, award).catch(err => console.warn('[Animaldex] Evento badge non salvato:', err)));
    }

    const merged = Array.from(new Set([...(earnedBadgeIds || []).map(normalizeBadgeId), ...current]));
    if (merged.length !== earnedBadgeIds.length) {
      setEarnedBadgeIds(merged);
      persistAwardUnlocks(merged);
      if (user?.id) {
        persistEarnedBadges(user.id, merged).catch(err => {
          console.warn('[Animaldex] Salvataggio user_badges fallito:', err);
          setDataError(err?.message || 'Errore salvataggio badge');
        });
      }
    } else {
      persistAwardUnlocks(merged);
    }
  }, [unlockedAwards, earnedBadgeIds, user?.id]);

  useEffect(() => {
    if (!activeAwardToast) return;
    const t = setTimeout(() => setAwardQueue(prev => prev.slice(1)), 3200);
    return () => clearTimeout(t);
  }, [activeAwardToast]);

  const handleStatusChange = async (id, status) => {
    if (!user?.id) return;
    const nextStatus = normalizeAnimalStatus(status);
    const previousStatus = normalizeAnimalStatus(statusMap[id]);
    const currentAnimal = animalsData.find(a => a.id === id);
    setStatusMap(prev => ({ ...prev, [id]: nextStatus }));
    setAnimalsData(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus, userStatus: appStatusToSupabase(nextStatus) } : a));
    saveLocalUserAnimalStatus(user.id, id, nextStatus);
    try {
      track('animal_status_changed', { animal_id:id, animal_name:currentAnimal?.com, previous_status:previousStatus, next_status:nextStatus });
      if (nextStatus === 'avvistato') track('animal_marked_seen', { animal_id:id, animal_name:currentAnimal?.com });
      if (nextStatus === 'catturato') track('animal_capture_completed', { animal_id:id, animal_name:currentAnimal?.com });
      await saveUserAnimalStatus(user.id, currentAnimal || { id }, nextStatus);
      if (isSocialCaptureEventWorthy(currentAnimal, nextStatus, previousStatus)) {
        await createSocialCaptureEvent(user.id, currentAnimal).catch(err => console.warn('[Animaldex] Evento social non salvato:', err));
      }
      await reloadSupabaseData(user);
    } catch (err) {
      console.warn('[Animaldex] Salvataggio user_animals fallito:', err);
      setDataError(err?.message || 'Errore salvataggio status animale');
    }
  };

  const handleAddDestination = async (iso, tripTags = []) => {
    if (!user?.id || !iso) return;
    const cleanIso = String(iso).toUpperCase();
    const nextVisited = Array.from(new Set([...visitedCountries, cleanIso])).sort();
    setVisitedCountries(nextVisited);
    saveVisitedCountries(nextVisited);
    setDestinationsLoading(true);
    setDataError('');
    try {
      await withTimeout(persistUserDestination(user.id, cleanIso, tripTags || []), 4500, false, 'persistUserDestination');
      const { error: rpcError } = await withTimeout(supabase.rpc('unlock_animals_for_destination', {
        p_user_id: user.id,
        p_iso: cleanIso,
        p_trip_tags: tripTags || [],
      }), 7000, { error:null }, 'unlock_animals_for_destination');
      if (rpcError) throw rpcError;
      reloadSupabaseData(user).catch(err => console.warn('[Animaldex] reload destinazione non bloccante:', err));
    } catch (err) {
      console.warn('[Animaldex] Aggiungi destinazione fallito:', err);
      setDataError(err?.message || 'Errore aggiunta paese');
    } finally {
      setDestinationsLoading(false);
    }
  };


  const handleCompleteOnboarding = async ({ nickname, countries, seenAnimalIds, tripTags, demographics = {} }) => {
    if (!user?.id) throw new Error('Sessione non valida');
    setDataError('');
    try {
      const rpcResult = await withTimeout(
        supabase.rpc('complete_user_onboarding', {
          p_user_id: user.id,
          p_nickname: nickname,
          p_iso_list: countries,
          p_seen_animal_ids: seenAnimalIds,
          p_trip_tags: tripTags || [],
        }),
        12000,
        { data:{ ok:true, timed_out:true, unlocked_count:(countries || []).length, seen_count:(seenAnimalIds || []).length, badge_ids:['ONB-01-L1'] }, error:null },
        'complete_user_onboarding'
      );
      const { data, error } = rpcResult || {};
      if (error) throw error;

      const badgeIds = (data?.badge_ids || data?.badges || []).map(normalizeBadgeId);
      await persistOnboardingQuestionnaire(user, demographics || {});
      if (badgeIds.length) {
        setEarnedBadgeIds(prev => Array.from(new Set([...prev.map(normalizeBadgeId), ...badgeIds])));
        const awards = badgeIds.map(id => AWARD_RULES.find(rule => normalizeBadgeId(rule.badgeId) === id)).filter(Boolean);
        if (awards.length) setAwardQueue(prev => [...prev, ...awards]);
      }
      return data || {};
    } catch (err) {
      console.warn('[Animaldex] RPC onboarding fallita, uso fallback frontend:', err);
      const cleanCountries = (countries || []).map(c => String(c).toUpperCase()).filter(Boolean);
      for (const iso of cleanCountries) {
        await withTimeout(persistUserDestination(user.id, iso, tripTags || []), 3500, false, 'persistUserDestination');
        const { error: rpcError } = await withTimeout(supabase.rpc('unlock_animals_for_destination', {
          p_user_id: user.id,
          p_iso: iso,
          p_trip_tags: tripTags || [],
        }), 4500, { error:null }, 'unlock_animals_for_destination');
        if (rpcError) console.warn('[Animaldex] unlock fallback non riuscito:', rpcError);
      }

      const now = new Date().toISOString();
      await persistOnboardingQuestionnaire(user, demographics || {});
      if (seenAnimalIds?.length) {
        const rows = seenAnimalIds.map(animal_id => ({
          user_id: user.id,
          animal_id,
          unlock_status:'seen',
          unlocked_at: now,
          seen_at: now,
          updated_at: now,
        }));
        const { error: seenError } = await supabase.from('user_animals').upsert(rows, { onConflict:'user_id,animal_id' });
        if (seenError) throw seenError;
      }

      await supabase.from('user_profiles').upsert({
        user_id:user.id,
        username:userProfile?.username || String(user.email || 'esploratore').split('@')[0],
        nickname,
        onboarding_completed:true,
        onboarding_completed_at:now,
      }, { onConflict:'user_id' });

      await persistEarnedBadges(user.id, ['ONB-01-L1']);
      setEarnedBadgeIds(prev => Array.from(new Set([...prev.map(normalizeBadgeId), 'ONB-01-L1'])));
      const first = AWARD_RULES.find(rule => rule.badgeId === 'ONB-01-L1');
      if (first) setAwardQueue(prev => [...prev, first]);
      return { ok:true, unlocked_count:cleanCountries.length, seen_count:seenAnimalIds?.length || 0, badge_ids:['ONB-01-L1'] };
    }
  };

  const finishOnboarding = async (options = {}) => {
    setUserProfile(prev => mergeProfileDemographics({
      ...(prev || buildFallbackProfile(user, true)),
      onboarding_completed:true,
      has_completed_tutorial:false,
      onboarding_completed_at:new Date().toISOString(),
    }, user?.id));
    setSel(null);
    setPage('grid');
    // Ricarica silenziosa: non bloccare mai la schermata finale dell’onboarding.
    if (!options?.skipReload) {
      reloadSupabaseData(user).catch(err => console.warn('[Animaldex] reload post-onboarding non bloccante:', err));
    }
  };

  const openAwardFromToast = (award) => {
    if (!award?.badgeId) return;
    setToastOpenBadgeId(normalizeBadgeId(award.badgeId));
    setAwardQueue(prev => prev.slice(1));
    setPage('badges');
    maybeShowSectionIntro('badges');
  };

  function maybeShowSectionIntro(section) {
    const enabledSections = new Set(['regions', 'badges', 'abilities', 'compare', 'profile', 'gallery', 'lifeweb', 'quickSeen', 'friends']);
    if (!enabledSections.has(section)) return;
    if (tutorialStep) return;
    setActiveSectionGuide(null);
    try {
      const key = `apex_section_intro_${section}`;
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, '1');
    } catch {}
    setSectionIntro(section);
  }

  const getCurrentTutorialAnimal = () => {
    if (tutorialAnimalId) return animalsData.find(a => a.id === tutorialAnimalId) || getTutorialAnimal();
    return getTutorialAnimal();
  };

  const handleTutorialAnimalSelect = (animal) => {
    setTutorialAnimalId(animal?.id || tutorialAnimalId);
    setTutorialStep('detail-overview');
  };

  const handleTutorialNext = () => {
    if (tutorialStep === 'grid-status') { setTutorialStep('grid-tools'); return; }
    if (tutorialStep === 'grid-tools') { setTutorialStep('grid-open'); return; }
    if (tutorialStep === 'detail-overview') { setTutorialStep('detail-metrics'); return; }
    if (tutorialStep === 'home-finish') { completeOperationalTutorial(); return; }
  };
  const handleTutorialPrev = () => {
    if (tutorialStep === 'home-finish') { setSel(getCurrentTutorialAnimal()); setPage('grid'); setTutorialStep('detail-status'); return; }
    if (tutorialStep === 'detail-status') { setTutorialStep('detail-abilities'); return; }
    if (tutorialStep === 'detail-abilities') { setTutorialStep('detail-metrics'); return; }
    if (tutorialStep === 'detail-metrics') { setTutorialStep('detail-overview'); return; }
    if (tutorialStep === 'detail-overview') { setSel(null); setPage('grid'); setTutorialStep('grid-open'); return; }
    if (tutorialStep === 'grid-open') { setTutorialStep('grid-tools'); return; }
    if (tutorialStep === 'grid-tools') { setTutorialStep('grid-status'); return; }
    if (tutorialStep === 'grid-status') { setPage('menu'); setTutorialStep('home'); return; }
  };

  const handleTutorialAbilityClick = () => {
    if (tutorialStep === 'detail-abilities') {
      setTimeout(() => setTutorialStep('detail-status'), 520);
    }
  };
  const handleTutorialMetricClick = () => {
    if (tutorialStep === 'detail-metrics') setTimeout(() => setTutorialStep('detail-abilities'), 520);
  };
  const handleTutorialStatusClick = () => {
    if (tutorialStep === 'detail-status') setTimeout(() => { setSel(null); setPage('menu'); setTutorialStep('home-finish'); }, 620);
  };

  const completeOperationalTutorial = async () => {
    const now = new Date().toISOString();
    setTutorialStep(null);
    setTutorialAnimalId(null);
    setTutorialStamp(false);
    setUserProfile(prev => ({ ...(prev || {}), has_completed_tutorial:true, tutorial_completed_at:now }));
    try {
      if (user?.id) {
        await supabase
          .from('user_profiles')
          .update({ has_completed_tutorial:true, tutorial_completed_at:now })
          .eq('user_id', user.id);
      }
    } catch (err) {
      console.warn('[Animaldex] Salvataggio tutorial non bloccante:', err);
    }
    setSel(null);
    setPage('grid');
  };


  const startInitialOnboardingFromSettings = () => {
    setDataError('');
    setSel(null);
    setGridPreset(null);
    setGridReturnTarget(null);
    setRegionsInitialView(null);
    setTutorialStep(null);
    setTutorialAnimalId(null);
    setTutorialStamp(false);
    setPage('grid');
    setUserProfile(prev => ({
      ...(prev || buildFallbackProfile(user, false)),
      onboarding_completed:false,
      has_completed_tutorial:false,
    }));
  };

	  const startOperationalTutorialFromSettings = () => {
	    const target = getTutorialAnimal();
	    setSel(null);
	    setGridPreset(null);
	    setGridReturnTarget(null);
	    setRegionsInitialView(null);
	    setPage('menu');
	    setTutorialAnimalId(target?.id || null);
	    setTutorialStamp(false);
	    setTutorialStep('home');
    setUserProfile(prev => ({
      ...(prev || buildFallbackProfile(user, true)),
      onboarding_completed:true,
      has_completed_tutorial:false,
    }));
  };

const enriched = sel ? { ...sel, status: getResolvedAnimalStatus(sel, statusMap, visitedCountries) } : null;
const openPage = (nextPage) => {
  setSel(null);
  setPhotoTarget(null);
  setGridReturnTarget(null);
  setRegionsInitialView(null);
  if (nextPage !== 'compare') setComparatorInitialAnimal(null);
  if (nextPage !== 'lifeweb') setLifeWebInitialAnimal(null);
  setFeatureReturnAnimal(null);
	  if (nextPage === 'grid') {
	    if (tutorialStep === 'home') setGridPreset({ id: Date.now(), type:'tutorial', search:'piccione', statuses:['ricercato'], title:'Apex' });
	    else setGridPreset(null);
	    setPage('grid');
	    if (tutorialStep === 'home') setTutorialStep('grid-status');
	    return;
	  }
	  setPage(nextPage || 'menu');
	  maybeShowSectionIntro(nextPage);
	};
	const openComparator = (animal=null) => {
	  const enrichedAnimal = animal ? { ...animal, status: getResolvedAnimalStatus(animal, statusMap, visitedCountries) } : null;
	  setFeatureReturnAnimal(enrichedAnimal); setSel(null); setGridReturnTarget(null); setComparatorInitialAnimal(enrichedAnimal); setPage('compare');
	  maybeShowSectionIntro('compare');
	};
	const openLifeWeb = (animal=null) => {
	  const enrichedAnimal = animal ? { ...animal, status: getResolvedAnimalStatus(animal, statusMap, visitedCountries) } : null;
	  setFeatureReturnAnimal(enrichedAnimal); setSel(null); setGridReturnTarget(null); setLifeWebInitialAnimal(enrichedAnimal); setPage('lifeweb');
	  maybeShowSectionIntro('lifeweb');
	};
const openPhotoRecognition = (animal=null) => {
  const enrichedAnimal = animal ? { ...animal, status: getResolvedAnimalStatus(animal, statusMap, visitedCountries) } : null;
  setPhotoTarget(enrichedAnimal);
};
const confirmPhotoRecognition = async (animal, meta={}) => {
  if (!animal?.id) return;
  setPhotoTarget(null);
  await handleStatusChange(animal.id, 'catturato');
  try {
    if (user?.id) {
      await supabase.from('animal_photos').insert({
        user_id:user.id,
        animal_id:animal.id,
        ai_guess_animal_id:animal.id,
        ai_confidence:meta.confidence || null,
        confirmed_by_user:true,
        lat:meta.gps?.lat || null,
        lng:meta.gps?.lng || null,
        created_at:new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[Animaldex] animal_photos non bloccante:', err);
  }
};
const openHabitatGrid = (territory, habitat, returnContext = null) => {
  if (!territory || !habitat) return;
  const geographyFilter = territory.filterValue || (territory.kind === 'region' ? `territory-region:${territory.id}` : `ecoregion:${territory.id}`);
  const isGeneralHabitat = habitat.id === 'GENERAL';
  const exactBioregionId = isGeneralHabitat ? (habitat.exactBioregionId || territory.bioregionId || territory.id) : null;
  setSel(null);
  setGridPreset({ id: Date.now(), type:'habitat-grid', customFilter:(a)=> (exactBioregionId ? matchExactBioregion(a, exactBioregionId) : matchGeographySelection(a, [geographyFilter])) && (isGeneralHabitat || animalMatchesHabitat(a, habitat.id)), customSort:isGeneralHabitat ? compareAnimalsRevealedFirst : null, title:isGeneralHabitat ? territory.label : `${habitat.label}` });
  setGridReturnTarget({ page:'regions', view:returnContext || 'ecoregions' });
  setPage('grid');
};
const openGridWithStatus = (statuses) => {
  setSel(null); setGridReturnTarget(null); setGridPreset({ id: Date.now(), type:'status', statuses, title:'Animaldex' }); setPage('grid');
};
const openGridWithCategory = (categoryId, label) => {
  setSel(null); setGridPreset({ id: Date.now(), type:'category', categories:[categoryId], title: label || 'Abilità' }); setGridReturnTarget({ page:'abilities' }); setPage('grid');
};
const openGridWithGeography = (geoValue, label, returnView='countries') => {
  setSel(null); setGridPreset({ id: Date.now(), type:'geography', geography:[geoValue], title: label || 'Geografia' }); setGridReturnTarget({ page:'regions', view:returnView }); setPage('grid');
};
const jumpToClassFromDetail = (cls, animal) => {
  setGridReturnTarget({ page:'detail', animal }); setSel(null); setGridPreset({ id: Date.now(), type:'class', cls, title:`Classe · ${cls}` }); setPage('grid');
};
const returnFromFilteredGrid = () => {
  const target = gridReturnTarget;
  setGridReturnTarget(null);
  setGridPreset(null);
  if (target?.page === 'detail' && target.animal) { setSel(target.animal); setPage('grid'); return; }
  if (target?.page === 'abilities') { setSel(null); setPage('abilities'); return; }
  if (target?.page === 'regions') { setSel(null); setRegionsInitialView(target.view || 'countries'); setPage('regions'); return; }
  setSel(null); setPage('grid');
};

const returnFromFeaturePage = (fallback='menu') => {
  if (featureReturnAnimal?.id) {
    const fresh = animalsData.find(a => a.id === featureReturnAnimal.id) || featureReturnAnimal;
    setComparatorInitialAnimal(null);
    setLifeWebInitialAnimal(null);
    setFeatureReturnAnimal(null);
    setPage('grid');
    setSel({ ...fresh, status: normalizeAnimalStatus(statusMap[fresh.id] ?? fresh.status) });
    return;
  }
  setComparatorInitialAnimal(null);
  setLifeWebInitialAnimal(null);
  setFeatureReturnAnimal(null);
  setPage(fallback);
};

const renderDetailOverlay = () => enriched ? <div style={{ position:'absolute', inset:0, zIndex:80, background:theme==='light'?LIGHT_APP_BG:'#1C1C1E' }}><Detail theme={theme} a={enriched} onBack={()=>setSel(null)} onStatusChange={handleStatusChange} onJumpToClass={jumpToClassFromDetail} onOpenComparator={openComparator} onOpenLifeWeb={openLifeWeb} onOpenPhoto={openPhotoRecognition} visitedCountries={visitedCountries} statusMap={statusMap} tutorialStep={tutorialStep} onTutorialAbilityClick={handleTutorialAbilityClick} onTutorialMetricClick={handleTutorialMetricClick} onTutorialStatusClick={handleTutorialStatusClick}/></div> : null;

  if (authLoading) {
    return (
      <div {...APP_FRAME_PROPS} style={{ height:'var(--animaldex-app-height, 100dvh)', maxWidth:480, margin:'0 auto', background:'#111113', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif" }}>
        <div style={{ color:'rgba(255,255,255,.65)', fontWeight:800 }}>Caricamento sessione...</div>
      </div>
    );
  }

  if (!user) return <AuthScreen onAuthReady={()=>supabase.auth.getSession().then(({data})=>{setSession(data.session||null);setUser(data.session?.user||null);})} />;

  if (!userProfile && dataLoading) {
    return (
      <div {...APP_FRAME_PROPS} style={{ height:'var(--animaldex-app-height, 100dvh)', maxWidth:480, margin:'0 auto', background:'#111113', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif" }}>
        <div style={{ color:'rgba(255,255,255,.65)', fontWeight:800 }}>Caricamento profilo...</div>
      </div>
    );
  }

  if (!userProfile && !dataLoading) {
    setTimeout(() => setUserProfile(buildFallbackProfile(user, true)), 0);
    return (
      <div {...APP_FRAME_PROPS} style={{ height:'var(--animaldex-app-height, 100dvh)', maxWidth:480, margin:'0 auto', background:'#111113', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif" }}>
        <div style={{ color:'rgba(255,255,255,.65)', fontWeight:800 }}>Apertura Animaldex...</div>
      </div>
    );
  }

  if (userProfile && userProfile.onboarding_completed === false) {
    return (
      <div {...APP_FRAME_PROPS} style={{ fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif", height:'var(--animaldex-app-height, 100dvh)', maxWidth:480, margin:'0 auto', overflow:'hidden', background:'#111113', position:'relative' }}>
        <OnboardingFlow user={user} animals={animalsData} initialNickname={userProfile.nickname || userProfile.username} onComplete={handleCompleteOnboarding} onFinish={finishOnboarding} />
      </div>
    );
  }

  const renderPage = () => {
	    if (page === 'menu') return <MainMenu theme={theme} onOpen={openPage} onBack={()=>setPage('grid')} onLogout={()=>supabase.auth.signOut()} tutorialFocus={tutorialStep==='home'?'grid':null} statusMap={statusMap} visitedCountries={visitedCountries} earnedBadgeIds={earnedBadgeIds} userProfile={userProfile} user={user} onOpenGridStatus={openGridWithStatus} onOpenRegions={()=>openPage('regions')} onQuickSeen={()=>{ setPage('quickSeen'); maybeShowSectionIntro('quickSeen'); }} onOpenPhoto={openPhotoRecognition} onOpenBadge={(badgeId)=>{setToastOpenBadgeId(normalizeBadgeId(badgeId)); setPage('badges'); maybeShowSectionIntro('badges');}} />;
    if (page === 'quickSeen') return <QuickSeenPage theme={theme} onBack={()=>setPage('menu')} animals={animalsData} statusMap={statusMap} visitedCountries={visitedCountries} onStatusChange={handleStatusChange} onSelect={setSel} />;
    if (page === 'compare') return <ComparatorPage theme={theme} onBack={()=>returnFromFeaturePage('menu')} animals={animalsData} statusMap={statusMap} visitedCountries={visitedCountries} initialAnimal={comparatorInitialAnimal} />;
    if (page === 'friends') return <FriendsPage theme={theme} onBack={()=>setPage('menu')} user={user} userProfile={userProfile} statusMap={statusMap} visitedCountries={visitedCountries} earnedBadgeIds={earnedBadgeIds} />;
    if (page === 'profile') return <ProfilePage theme={theme} onBack={()=>setPage('menu')} statusMap={statusMap} visitedCountries={visitedCountries} earnedBadgeIds={earnedBadgeIds} userProfile={userProfile} user={user} onLogout={()=>supabase.auth.signOut()} onOpenGridStatus={openGridWithStatus} onOpenBadges={()=>openPage('badges')} onOpenRegions={()=>openPage('regions')} onOpenGallery={()=>openPage('gallery')} />;
	    if (page === 'badges') return <BadgesPage theme={theme} onBack={()=>setPage('menu')} statusMap={statusMap} visitedCountries={visitedCountries} earnedBadgeIds={earnedBadgeIds} openBadgeId={toastOpenBadgeId} onBadgeOpened={()=>setToastOpenBadgeId(null)} tutorialActive={activeSectionGuide==='badges'} onTutorialBadgeOpen={()=>setActiveSectionGuide(null)} />;
    if (page === 'regions') return <div style={{ height:'100%', position:'relative', overflow:'hidden' }}><RegionsPage theme={theme} onBack={()=>setPage('menu')} statusMap={statusMap} visitedCountries={visitedCountries} onVisitedCountriesChange={setVisitedCountries} initialView={regionsInitialView} onSelect={setSel} onOpenCountry={(code)=>openGridWithGeography(code, getCountryDisplayName(code), 'countries')} onOpenRegion={(value,label)=>openGridWithGeography(value, label, 'continents')} onAddDestination={handleAddDestination} destinationsLoading={destinationsLoading} onOpenHabitatGrid={openHabitatGrid} />{renderDetailOverlay()}</div>;
    if (page === 'gallery') return <div style={{ height:'100%', position:'relative', overflow:'hidden' }}><GalleryPage theme={theme} onBack={()=>setPage('profile')} statusMap={statusMap} onSelect={setSel} />{renderDetailOverlay()}</div>;
    if (page === 'lifeweb') return <div style={{ height:'100%', position:'relative', overflow:'hidden' }}><StandaloneLifeWebPage theme={theme} statusMap={statusMap} visitedCountries={visitedCountries} onBack={()=>returnFromFeaturePage('grid')} animals={animalsData} initialAnimal={lifeWebInitialAnimal} onOpenAnimal={setSel} />{renderDetailOverlay()}</div>;
    if (page === 'settings') return <SettingsPage onBack={()=>setPage('menu')} onStartInitialOnboarding={startInitialOnboardingFromSettings} onStartOperationalTutorial={startOperationalTutorialFromSettings} theme={theme} onThemeChange={setTheme} />;
    if (page === 'abilities') return <AbilitiesPage theme={theme} onBack={()=>setPage('menu')} onOpenAbility={openGridWithCategory} tutorialActive={activeSectionGuide==='abilities'} onTutorialAbilityOpen={()=>setActiveSectionGuide(null)} />;
    return <div style={{ height:'100%', position:'relative', overflow:'hidden' }}><Grid theme={theme} onSelect={setSel} statusMap={statusMap} visitedCountries={visitedCountries} onHome={()=>openPage('menu')} onOpenRegions={()=>openPage('regions')} preset={gridPreset} onBackToOrigin={gridReturnTarget ? returnFromFilteredGrid : null} tutorialActive={tutorialStep==='grid-open'} tutorialStep={tutorialStep} tutorialAnimalId={tutorialAnimalId} onTutorialAnimalSelect={handleTutorialAnimalSelect} />{renderDetailOverlay()}</div>;
  };

  return (
    <div id="animaldex-app-root" className="animaldex-app-frame" data-theme={theme} style={{ fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif", height:'var(--animaldex-app-height, 100dvh)', maxWidth:480, margin:'0 auto', display:'flex', flexDirection:'column', overflow:'hidden', background:theme==='light'?LIGHT_APP_BG:'#1C1C1E', position:'relative' }}>
	      {renderPage()}
	      {tutorialStep && <OperationalTutorialOverlay step={tutorialStep} animal={getCurrentTutorialAnimal()} onNext={handleTutorialNext} onPrev={handleTutorialPrev} onFinish={completeOperationalTutorial} onSkip={completeOperationalTutorial} />}
	      {sectionIntro && !tutorialStep && <SectionIntroModal section={sectionIntro} onClose={()=>{ const guided = sectionIntro; setSectionIntro(null); if (guided === 'badges' || guided === 'abilities') setActiveSectionGuide(guided); }} />}
	      {dataError && user && <div style={{ position:'absolute', left:12, right:12, bottom:12, zIndex:250, borderRadius:14, padding:'10px 12px', background:'rgba(255,59,48,.92)', color:'white', fontSize:11, fontWeight:800, boxShadow:'0 10px 30px rgba(0,0,0,.35)' }}>{dataError}</div>}
      {activeAwardToast && <AwardToast award={activeAwardToast} onOpen={openAwardFromToast} onDismiss={()=>setAwardQueue(prev => prev.slice(1))} />}
      {photoTarget && <PhotoRecognitionModal animal={photoTarget} animals={animalsData} user={user} onClose={()=>setPhotoTarget(null)} onConfirm={confirmPhotoRecognition} />}
    </div>
  );
}
