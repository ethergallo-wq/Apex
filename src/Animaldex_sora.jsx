import { useState, useEffect, useMemo, useRef } from "react";
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
const GRID_IMAGE_SCALE = 0.949;
const GRID_MYSTERY_SCALE = 1.14;
const GRID_SILHOUETTE_SCALE = 0.74;

const ANIMAL_STATUS = {
  misterioso: { label:'Misterioso', short:'MIST.', c:'#b7bbc3', bg:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.18)', dot:'#b7bbc3', desc:'Bloccato: identità nascosta e nome non mostrato.' },
  ricercato:  { label:'Ricercato',  short:'RIC.',  c:'#ffffff', bg:'rgba(255,255,255,.10)', border:'1.5px solid rgba(255,255,255,.24)', dot:'#ffffff', desc:'Non visto: nome visibile, animale ancora da trovare.' },
  avvistato:  { label:'Avvistato',  short:'AVV.',  c:'#90D84A', bg:'rgba(144,216,74,.12)', border:'1.5px solid #90D84A', dot:'#90D84A', desc:'Avvistato in natura.' },
  catturato:  { label:'Catturato',  short:'CAT.',  c:'#ffffff', bg:'#90D84A', border:'1.5px solid rgba(255,255,255,.32)', dot:'#ffffff', desc:'Catturato/registrato: massimo riconoscimento.' },
};
const ANIMAL_STATUS_ORDER = ['misterioso','ricercato','avvistato','catturato'];

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
function getStatusMeta(status) { return ANIMAL_STATUS[normalizeAnimalStatus(status)] || ANIMAL_STATUS.ricercato; }


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
  const raw = row?.raw && typeof row.raw === 'object' ? row.raw : {};
  const geo = Array.isArray(row?.animal_geo) ? row.animal_geo[0] : row?.animal_geo;
  const countries = toArraySafe(geo?.iso || raw?.distribution?.countries_present || raw?.countries_present || raw?.iso);
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
    cls: row?.cls || raw.cls || raw.class || 'Mammalia',
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
    map_profile: geo?.map_profile || raw.map_profile || '',
    confidence: geo?.confidence || raw.confidence || '',
    bio_regions: toArraySafe(geo?.bio_regions || raw.bio_regions),
    game_regions: toArraySafe(geo?.game_regions || raw.game_regions),
    habitats: toArraySafe(geo?.habitats || raw.habitats || raw.habitat),
    userStatus: userAnimal?.unlock_status || 'locked',
    userAnimal: userAnimal || null,
    status,
  };
}

function normalizeLocalAnimal(a) {
  return {
    ...a,
    geo: a.geo || null,
    confidence: a.confidence || a.geo?.confidence || '',
    map_profile: a.map_profile || a.geo?.map_profile || '',
    bio_regions: toArraySafe(a.bio_regions || a.geo?.bio_regions),
    game_regions: toArraySafe(a.game_regions || a.geo?.game_regions),
    habitats: toArraySafe(a.habitats || a.habitat || a.geo?.habitats),
    userStatus: appStatusToSupabase(a.status),
    status: normalizeAnimalStatus(a.status),
  };
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
const TROPHIC = {
  1:{ label:'Produttore',      c:'#5CC85A', bg:'#1A3B19' },
  2:{ label:'Erbivoro',        c:'#A8D84A', bg:'#283B14' },
  3:{ label:'Predatore',       c:'#F5A828', bg:'#3B2205' },
  4:{ label:'Predatore Apice', c:'#F55454', bg:'#3B0B0B' },
  D:{ label:'Decomponente',    c:'#9E7CF5', bg:'#20153B' },
  F:{ label:'Filtratore',      c:'#5BB8F5', bg:'#0A1E3B' },
};

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
  background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,.012) 22%, rgba(255,255,255,.155) 42%, rgba(255,255,255,.024) 58%, transparent 76%);
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
  background: linear-gradient(115deg, transparent 18%, rgba(255,255,255,.14) 40%, rgba(255,255,255,.03) 54%, transparent 70%);
  mix-blend-mode: screen;
}
.rarity-badge.compact { min-height: 28px; padding: 5px 10px 5px 40px; border-radius: 999px; }
.rarity-badge.compact::before { inset: 3px 4px 3px 21px; border-radius: 999px; }
.rarity-badge.compact::after { inset: 2px 5px 2px 22px; border-radius: 999px; }
.rarity-badge.compact .rarity-shield-wrap { width: 36px; height: 36px; left: -4px; }
.rarity-badge.small { min-height: 26px; padding: 4px 9px 4px 38px; font-size: 11px; border-radius: 999px; }
.rarity-badge.small::before { inset: 3px 4px 3px 20px; border-radius: 999px; }
.rarity-badge.small::after { inset: 2px 5px 2px 21px; border-radius: 999px; }
.rarity-badge.small .rarity-shield-wrap { width: 34px; height: 34px; left: -4px; }
.rarity-badge.full { width: 100%; box-sizing: border-box; padding-left:82px; }
.rarity-badge.full::before { left: 48px; }
.rarity-badge.full::after { left: 49px; }
.rarity-badge.full .rarity-shield-wrap { left: 5px; width:58px; height:58px; }
.rarity-metal-comune { background: linear-gradient(180deg,#f4c39a 0%,#d0895c 45%,#7b3c1d 100%); }
.rarity-metal-comune::before { background: radial-gradient(circle at 25% 20%, rgba(255,238,210,.42), transparent 28%), linear-gradient(135deg,#532311,#d0895c 38%,#ffd0a4 50%,#8a421f 72%,#3b170a 100%); }
.rarity-metal-non-comune { background: linear-gradient(180deg,#eef2f6 0%,#a1a8b2 48%,#4e5660 100%); }
.rarity-metal-non-comune::before { background: radial-gradient(circle at 22% 22%, rgba(255,255,255,.44), transparent 30%), linear-gradient(135deg,#3d454d,#a1a8b2 40%,#ffffff 50%,#67717c 72%,#252a30 100%); }
.rarity-metal-raro { background: linear-gradient(180deg,#fff0a5 0%,#f0c449 46%,#8c6500 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.75), inset 0 -2px 5px rgba(0,0,0,.45), 0 0 12px rgba(240,196,73,.35), 0 5px 12px rgba(0,0,0,.28); }
.rarity-metal-raro::before { background: radial-gradient(circle at 26% 20%, rgba(255,247,190,.42), transparent 30%), linear-gradient(135deg,#5a3900,#f0c449 38%,#fff5b8 50%,#a77b00 72%,#3b2500 100%); }
.rarity-metal-leggendario { background: linear-gradient(180deg,#d2a9ff 0%,#8f34f5 48%,#2d064e 100%); border-color: rgba(220,220,235,.86); box-shadow: inset 0 1px 0 rgba(255,255,255,.82), inset 0 -2px 5px rgba(0,0,0,.48), 0 0 16px rgba(143,52,245,.38), 0 0 32px rgba(143,52,245,.15), 0 5px 12px rgba(0,0,0,.28); }
.rarity-metal-leggendario::before { background: radial-gradient(circle at 28% 22%, rgba(255,255,255,.44), transparent 18%), radial-gradient(circle at 72% 64%, rgba(255,255,255,.14), transparent 14%), linear-gradient(135deg,#210036 0%,#8f34f5 34%,#f4d9ff 50%,#7b1de1 66%,#260046 100%); }

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

`;

// ── Flag Emoji Generator ──────────────────────────────────────────────
const getFlagEmoji = (code) => {
  try {
    return String.fromCodePoint(...[...code.toUpperCase()].map(char => 127397 + char.charCodeAt(0)));
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
  {code:'STP',name:'São Tomé e Príncipe'},{code:'LR',name:'Liberia'},{code:'SL',name:'Sierra Leone'},{code:'GM',name:'Gambia'},{code:'GW',name:'Guinea-Bissau'},
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


const GEO_REGION_GROUPS = [
  {
    id:'europa', label:'Europa', image:'/regions/europa.jpg', regions:[
      { id:'europa-boreale', label:'Europa boreale', image:'/regions/Europa_boreale.jpg', iso:['IS','NO','SE','FI','DK','FO','AX'] },
      { id:'europa-temperata', label:'Europa temperata', image:'/regions/Europa-temperata.jpg', iso:['IE','GB','GG','IM','JE','FR','BE','NL','LU','DE','CH','AT','LI','MC','AD','PL','CZ','SK','HU','RO','BG','MD','UA','BY','LT','LV','EE'] },
      { id:'europa-mediterranea', label:'Europa mediterranea', image:'/regions/Europa_mediterranea.jpg', iso:['ES','PT','IT','MT','SM','VA','GI','GR','CY','AL','HR','BA','ME','SI','MK','RS'] },
    ]
  },
  {
    id:'america', label:'America', image:'/regions/america.jpg', regions:[
      { id:'nord-america-boreale', label:'Nord America boreale', image:'/regions/nord_America_boreale.jpg', iso:['CA'] },
      { id:'nord-america-temperato', label:'Nord America temperato', image:'/regions/nord_america_temperato.jpg', iso:['US','BM','PM'] },
      { id:'nord-america-desertico', label:'Nord America desertico', image:'/regions/Nord_America_desertico.jpg', iso:['GL'] },
      { id:'america-tropicale', label:'America tropicale', image:'/regions/America_tropicale.jpg', iso:['MX','BZ','GT','HN','SV','NI','CR','PA','CU','JM','HT','DO','PR','VI','VG','AI','AG','BL','MF','SX','KN','LC','VC','DM','GP','MQ','MS','GD','BB','TT','TC','AW','CW','BQ','BS','KY','CO','VE','EC','PE','BO','BR','GF','GY','SR'] },
      { id:'sud-america-temperato', label:'Sud America temperato', image:'/regions/America_temperato.jpg', iso:['AR','CL','UY','PY','FK'] },
    ]
  },
  {
    id:'africa', label:'Africa', image:'/regions/africa.jpg', regions:[
      { id:'africa-arida', label:'Africa arida', image:'/regions/africa_arida.jpg', iso:['MA','DZ','TN','LY','EG','EH','MR','ML','NE','TD','SD'] },
      { id:'africa-tropicale', label:'Africa tropicale', image:'/regions/africa_tropicale.jpg', iso:['SN','GM','GW','GN','SL','LR','CI','GH','TG','BJ','BF','NG','CV','CM','CF','GQ','GA','CG','CD','ST','AO','ET','ER','DJ','SO','KE','TZ','UG','RW','BI','SS'] },
      { id:'africa-australe', label:'Africa australe', image:'/regions/africa_australe.jpg', iso:['ZA','NA','BW','ZW','ZM','MW','MZ','SZ','LS'] },
      { id:'madagascar', label:'Madagascar', image:'/regions/madagascar.jpg', iso:['MG'] },
    ]
  },
  {
    id:'asia', label:'Asia', image:'/regions/asia.jpg', regions:[
      { id:'asia-boreale-steppa', label:'Asia boreale e steppa', image:'/regions/asia_boreale_steppa.jpg', iso:['RU','KZ','MN'] },
      { id:'asia-occidentale-centrale', label:'Asia occidentale e centrale', image:'/regions/asia_occidentale_centrale.jpg', iso:['TR','GE','AM','AZ','IR','IL','PS','JO','LB','SY','IQ','SA','YE','OM','AE','QA','BH','KW','UZ','TM','TJ','KG','AF'] },
      { id:'asia-meridionale', label:'Asia meridionale', image:'/regions/asia_meridionale.jpg', iso:['PK','IN','BD','LK','NP','BT','MV'] },
      { id:'asia-orientale', label:'Asia orientale', image:'/regions/asia_orientale.jpg', iso:['CN','HK','MO','TW','KR','KP'] },
      { id:'giappone', label:'Giappone', image:'/regions/giappone.jpg', iso:['JP'] },
      { id:'sud-est-asiatico', label:'Sud-est asiatico', image:'/regions/sudest_asiatico.jpg', iso:['MM','TH','LA','KH','VN','MY','SG','ID','BN','TL','PH'] },
    ]
  },
  {
    id:'oceania', label:'Oceania', image:'/regions/oceania.jpg', regions:[
      { id:'australia', label:'Australia', image:'/regions/australia.jpg', iso:['AU','NF','CX','CC'] },
      { id:'nuova-zelanda', label:'Nuova Zelanda', image:'/regions/nuova_zelanda.jpg', iso:['NZ'] },
      { id:'pacifico-tropicale', label:'Pacifico tropicale', image:'/regions/pacifico_tropicale.jpg', iso:['PG','SB','VU','NC','FJ','FM','GU','KI','MH','MP','NR','PW','UM','AS','CK','NU','PF','PN','TK','TO','TV','WF','WS'] },
    ]
  },
  {
    id:'speciali', label:'Regioni speciali', image:'/regions/regioni_speciali.jpg', regions:[
      { id:'isole-oceano-indiano', label:'Isole Oceano Indiano', image:'/regions/isole_oceano_indiano.jpg', iso:['MU','RE','YT','KM','SC','IO'] },
      { id:'artide', label:'Artide', image:'/regions/artide.jpg', iso:['GL','SJ'] },
      { id:'antartide', label:'Antartide', image:'/regions/antartide.jpg', iso:['AQ','BV','GS','HM','TF','SH'] },
    ]
  },
];
const GEO_REGION_MAP = GEO_REGION_GROUPS.flatMap(group => group.regions.map(region => ({ ...region, continentId: group.id, continentLabel: group.label })));
const GEO_REGION_BY_ID = Object.fromEntries(GEO_REGION_MAP.map(r => [r.id, r]));
const GEO_FILTER_OPTIONS = [
  ...GEO_REGION_GROUPS.map(group => ({ value:`continent:${group.id}`, label:`${group.label} (continente)`, c:'#6CE5C7', bg:'rgba(108,229,199,.14)', iso: group.regions.flatMap(r=>r.iso) })),
  ...GEO_REGION_MAP.map(region => ({ value:`region:${region.id}`, label:region.label, c:'#20B2AA', bg:'rgba(32,178,170,.15)', iso:region.iso }))
];

function getVisitedCountries() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(window.localStorage.getItem('animaldex_visited_countries') || '[]'); } catch { return []; }
}
function saveVisitedCountries(list = []) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem('animaldex_visited_countries', JSON.stringify(Array.from(new Set(list)).sort())); } catch {}
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
  return overrides[c] || 'Nazione';
}
function getAllScratchCountries() {
  const set = new Set([
    ...COUNTRIES.map(c => c.code),
    ...GEO_REGION_MAP.flatMap(r => r.iso),
  ]);
  return Array.from(set).sort((a,b)=>getCountryDisplayName(a).localeCompare(getCountryDisplayName(b),'it'));
}

function getGeoOptionIsoCodes(value) {
  if (!value) return [];
  const opt = GEO_FILTER_OPTIONS.find(o => o.value === value);
  return opt?.iso || [];
}
function matchGeographySelection(animal, selections = []) {
  if (!selections.length) return true;
  const countries = animal.distribution?.countries_present || animal.geo?.iso || animal.iso || [];
  return selections.some(sel => {
    if (sel.startsWith('region:') || sel.startsWith('continent:')) {
      const iso = getGeoOptionIsoCodes(sel);
      return countries.some(code => iso.includes(code));
    }
    return countries.includes(sel);
  });
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
    const val = a?.[key];
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && /^\d/.test(val)) return Number(val.replace(/[^\d.]/g,'')) || 0;
  }
  return Infinity;
}
function getAnimalBiomes(a) {
  const raw = [a.biome, a.biomes, a.habitat, a.habitats, a.hab, a.ecosystem, a.ecosystems].filter(Boolean).join(',');
  return raw.split(/[;,|]/).map(v => String(v).trim()).filter(Boolean);
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
  {badgeId:'ARS-01-L1', macroId:'ARS', macro:'Arsenale', subId:'ARS-01', sub:'Lame Biologiche (Artigli)', level:1, name:'Incisore di Solchi', goal:'3 specie', metric:'bio_blades', threshold:3},
  {badgeId:'ARS-01-L2', macroId:'ARS', macro:'Arsenale', subId:'ARS-01', sub:'Lame Biologiche (Artigli)', level:2, name:'Curatore di Artigli', goal:'10 specie', metric:'bio_blades', threshold:10},
  {badgeId:'ARS-01-L3', macroId:'ARS', macro:'Arsenale', subId:'ARS-01', sub:'Lame Biologiche (Artigli)', level:3, name:'Maestro della Presa Mortale', goal:'30 specie', metric:'bio_blades', threshold:30},
  {badgeId:'ARS-02-L1', macroId:'ARS', macro:'Arsenale', subId:'ARS-02', sub:'Zanne e Perforatori', level:1, name:"Interprete delle Zanne", goal:'3 specie', metric:'tusks', threshold:3},
  {badgeId:'ARS-02-L2', macroId:'ARS', macro:'Arsenale', subId:'ARS-02', sub:'Zanne e Perforatori', level:2, name:'Archivista dei Perforatori', goal:'10 specie', metric:'tusks', threshold:10},
  {badgeId:'ARS-02-L3', macroId:'ARS', macro:'Arsenale', subId:'ARS-02', sub:'Zanne e Perforatori', level:3, name:'Araldo del Morso Primordiale', goal:'30 specie', metric:'tusks', threshold:30},
  {badgeId:'CON-01-L1', macroId:'CON', macro:'Conservazione', subId:'CON-01', sub:'Specie Critiche (CR)', level:1, name:'Sentinella del Rischio', goal:'1 specie', metric:'cr_count', threshold:1},
  {badgeId:'CON-01-L2', macroId:'CON', macro:'Conservazione', subId:'CON-01', sub:'Specie Critiche (CR)', level:2, name:'Cronista della Fragilità', goal:'5 specie', metric:'cr_count', threshold:5},
  {badgeId:'CON-01-L3', macroId:'CON', macro:'Conservazione', subId:'CON-01', sub:'Specie Critiche (CR)', level:3, name:'Ultimo Baluardo', goal:'15 specie', metric:'cr_count', threshold:15},
  {badgeId:'CON-02-L1', macroId:'CON', macro:'Conservazione', subId:'CON-02', sub:'Varietà Stati IUCN', level:1, name:'Cartografo del Rischio', goal:'3 stati', metric:'iucn_variety', threshold:3},
  {badgeId:'CON-02-L2', macroId:'CON', macro:'Conservazione', subId:'CON-02', sub:'Varietà Stati IUCN', level:2, name:'Atlante della Vulnerabilità', goal:'tutti i 6 stati', metric:'iucn_variety', threshold:6},
  {badgeId:'CON-02-L3', macroId:'CON', macro:'Conservazione', subId:'CON-02', sub:'Varietà Stati IUCN', level:3, name:'Sigillo della Lista Rossa', goal:'5 specie per stato', metric:'iucn_five_each', threshold:1},
  {badgeId:'ELI-01-L1', macroId:'ELI', macro:'Elite', subId:'ELI-01', sub:'Record Mondiali', level:1, name:'Rilevatore di Primati', goal:'1 record', metric:'record_count', threshold:1},
  {badgeId:'ELI-01-L2', macroId:'ELI', macro:'Elite', subId:'ELI-01', sub:'Record Mondiali', level:2, name:'Archivista dei Record', goal:'5 record', metric:'record_count', threshold:5},
  {badgeId:'ELI-01-L3', macroId:'ELI', macro:'Elite', subId:'ELI-01', sub:'Record Mondiali', level:3, name:'Cacciatore di Record', goal:'10 record', metric:'record_count', threshold:10},
  {badgeId:'ELI-02-L1', macroId:'ELI', macro:'Elite', subId:'ELI-02', sub:'Rarità Assoluta (Obs. <100)', level:1, name:"Cercatore dell'Improbabile", goal:'1 specie', metric:'obs_under_100', threshold:1},
  {badgeId:'ELI-02-L2', macroId:'ELI', macro:'Elite', subId:'ELI-02', sub:'Rarità Assoluta (Obs. <100)', level:2, name:'Archivista del Quasi Impossibile', goal:'5 specie', metric:'obs_under_100', threshold:5},
  {badgeId:'ELI-02-L3', macroId:'ELI', macro:'Elite', subId:'ELI-02', sub:'Rarità Assoluta (Obs. <100)', level:3, name:'Mito Vivente', goal:'10 specie', metric:'obs_under_100', threshold:10},
  {badgeId:'ENG-01-L1', macroId:'ENG', macro:'Engagement', subId:'ENG-01', sub:'Giorni consecutivi', level:1, name:'Sentinella della Costanza', goal:'3 giorni', metric:'usage_streak', threshold:3},
  {badgeId:'ENG-01-L2', macroId:'ENG', macro:'Engagement', subId:'ENG-01', sub:'Giorni consecutivi', level:2, name:'Custode del Ritmo', goal:'10 giorni', metric:'usage_streak', threshold:10},
  {badgeId:'ENG-01-L3', macroId:'ENG', macro:'Engagement', subId:'ENG-01', sub:'Giorni consecutivi', level:3, name:'Naturalista Perpetuo', goal:'30 giorni', metric:'usage_streak', threshold:30},
  {badgeId:'ENG-02-L1', macroId:'ENG', macro:'Engagement', subId:'ENG-02', sub:'Correzione dati AI', level:1, name:'Occhio Critico', goal:'5 correzioni', metric:'ai_corrections', threshold:5},
  {badgeId:'ENG-02-L2', macroId:'ENG', macro:'Engagement', subId:'ENG-02', sub:'Correzione dati AI', level:2, name:'Scriba della Verifica', goal:'20 correzioni', metric:'ai_corrections', threshold:20},
  {badgeId:'ENG-02-L3', macroId:'ENG', macro:'Engagement', subId:'ENG-02', sub:'Correzione dati AI', level:3, name:"Arbitro dell'Evidenza", goal:'100 correzioni', metric:'ai_corrections', threshold:100},
  {badgeId:'TRO-01-L1', macroId:'TRO', macro:'Gruppo Alimentare', subId:'TRO-01', sub:'Predatori Apex', level:1, name:'Avvistatore Alfa', goal:'3 specie', metric:'apex_count', threshold:3},
  {badgeId:'TRO-01-L2', macroId:'TRO', macro:'Gruppo Alimentare', subId:'TRO-01', sub:'Predatori Apex', level:2, name:'Curatore dei Predatori Apicali', goal:'10 specie', metric:'apex_count', threshold:10},
  {badgeId:'TRO-01-L3', macroId:'TRO', macro:'Gruppo Alimentare', subId:'TRO-01', sub:'Predatori Apex', level:3, name:'Sovrano della Catena', goal:'25 specie', metric:'apex_count', threshold:25},
  {badgeId:'TRO-02-L1', macroId:'TRO', macro:'Gruppo Alimentare', subId:'TRO-02', sub:'Produttori / Filtratori', level:1, name:'Rilevatore Trofico', goal:'5 specie', metric:'base_trophic_count', threshold:5},
  {badgeId:'TRO-02-L2', macroId:'TRO', macro:'Gruppo Alimentare', subId:'TRO-02', sub:'Produttori / Filtratori', level:2, name:'Atlante della Biomassa', goal:'20 specie', metric:'base_trophic_count', threshold:20},
  {badgeId:'TRO-02-L3', macroId:'TRO', macro:'Gruppo Alimentare', subId:'TRO-02', sub:'Produttori / Filtratori', level:3, name:'Custode delle Sorgenti', goal:'50 specie', metric:'base_trophic_count', threshold:50},
  {badgeId:'GEO-01-L1', macroId:'GEO', macro:'Geografia', subId:'GEO-01', sub:'Numero di Nazioni diverse', level:1, name:'Esploratore di Frontiere', goal:'3 nazioni', metric:'countries_count', threshold:3},
  {badgeId:'GEO-01-L2', macroId:'GEO', macro:'Geografia', subId:'GEO-01', sub:'Numero di Nazioni diverse', level:2, name:'Cartografo dei Continenti', goal:'10 nazioni', metric:'countries_count', threshold:10},
  {badgeId:'GEO-01-L3', macroId:'GEO', macro:'Geografia', subId:'GEO-01', sub:'Numero di Nazioni diverse', level:3, name:'Diplomatico della Biodiversità', goal:'30 nazioni', metric:'countries_count', threshold:30},
  {badgeId:'GEO-02-L1', macroId:'GEO', macro:'Geografia', subId:'GEO-02', sub:'Biodiversità Nazione', level:1, name:'Rilevatore del Territorio', goal:'10%', metric:'home_country_biodiversity', threshold:10},
  {badgeId:'GEO-02-L2', macroId:'GEO', macro:'Geografia', subId:'GEO-02', sub:'Biodiversità Nazione', level:2, name:'Atlante del Patrimonio Locale', goal:'50%', metric:'home_country_biodiversity', threshold:50},
  {badgeId:'GEO-02-L3', macroId:'GEO', macro:'Geografia', subId:'GEO-02', sub:'Biodiversità Nazione', level:3, name:'Sigillo del Patrimonio Vivente', goal:'100%', metric:'home_country_biodiversity', threshold:100},
  {badgeId:'GEO-03-L1', macroId:'GEO', macro:'Geografia', subId:'GEO-03', sub:'Diversità Biomi', level:1, name:'Esploratore dei Biomi', goal:'3 biomi', metric:'biomes_count', threshold:3},
  {badgeId:'GEO-03-L2', macroId:'GEO', macro:'Geografia', subId:'GEO-03', sub:'Diversità Biomi', level:2, name:'Ecologo di Frontiera', goal:'7 biomi', metric:'biomes_count', threshold:7},
  {badgeId:'GEO-03-L3', macroId:'GEO', macro:'Geografia', subId:'GEO-03', sub:'Diversità Biomi', level:3, name:'Signore degli Ecosistemi', goal:'tutti i biomi', metric:'all_biomes', threshold:1},
  {badgeId:'MAS-01-L1', macroId:'MAS', macro:'Massa', subId:'MAS-01', sub:'Peso Massimo (Gigantismo)', level:1, name:'Araldo dei Colossi', goal:'50 t', metric:'total_mass_tons', threshold:50},
  {badgeId:'MAS-01-L2', macroId:'MAS', macro:'Massa', subId:'MAS-01', sub:'Peso Massimo (Gigantismo)', level:2, name:'Censore di Giganti', goal:'500 t', metric:'total_mass_tons', threshold:500},
  {badgeId:'MAS-01-L3', macroId:'MAS', macro:'Massa', subId:'MAS-01', sub:'Peso Massimo (Gigantismo)', level:3, name:'Collezionista di Titani', goal:'2.000 t', metric:'total_mass_tons', threshold:2000},
  {badgeId:'MAS-02-L1', macroId:'MAS', macro:'Massa', subId:'MAS-02', sub:'Massa Minima', level:1, name:'Rilevatore del Minuscolo', goal:'3 specie', metric:'tiny_species_count', threshold:3},
  {badgeId:'MAS-02-L2', macroId:'MAS', macro:'Massa', subId:'MAS-02', sub:'Massa Minima', level:2, name:'Decifratore delle Microforme', goal:'10 specie', metric:'tiny_species_count', threshold:10},
  {badgeId:'MAS-02-L3', macroId:'MAS', macro:'Massa', subId:'MAS-02', sub:'Massa Minima', level:3, name:"Maestro dell'Infinitesimo", goal:'30 specie', metric:'tiny_species_count', threshold:30},
  {badgeId:'MOR-01-L1', macroId:'MOR', macro:'Morfologia', subId:'MOR-01', sub:'Estremi (Giganti / Nani)', level:1, name:"Misuratore d'Estremi", goal:'2 specie', metric:'extremes_count', threshold:2},
  {badgeId:'MOR-01-L2', macroId:'MOR', macro:'Morfologia', subId:'MOR-01', sub:'Estremi (Giganti / Nani)', level:2, name:'Cartografo delle Taglie', goal:'5 specie', metric:'extremes_count', threshold:5},
  {badgeId:'MOR-01-L3', macroId:'MOR', macro:'Morfologia', subId:'MOR-01', sub:'Estremi (Giganti / Nani)', level:3, name:'Sovrano delle Proporzioni', goal:'10 specie', metric:'extremes_count', threshold:10},
  {badgeId:'STA-01-L1', macroId:'STA', macro:'Status User', subId:'STA-01', sub:'Foto caricate', level:1, name:'Cronista Visivo', goal:'10 foto', metric:'captured_count', threshold:10},
  {badgeId:'STA-01-L2', macroId:'STA', macro:'Status User', subId:'STA-01', sub:'Foto caricate', level:2, name:'Fotografo Naturalista', goal:'50 foto', metric:'captured_count', threshold:50},
  {badgeId:'STA-01-L3', macroId:'STA', macro:'Status User', subId:'STA-01', sub:'Foto caricate', level:3, name:'Iconografo del Selvatico', goal:'200 foto', metric:'captured_count', threshold:200},
  {badgeId:'STA-02-L1', macroId:'STA', macro:'Status User', subId:'STA-02', sub:'Avvistati (non foto)', level:1, name:'Scout Silenzioso', goal:'5 avvistamenti', metric:'sighting_only_count', threshold:5},
  {badgeId:'STA-02-L2', macroId:'STA', macro:'Status User', subId:'STA-02', sub:'Avvistati (non foto)', level:2, name:'Ombra del Territorio', goal:'20 avvistamenti', metric:'sighting_only_count', threshold:20},
  {badgeId:'STA-02-L3', macroId:'STA', macro:'Status User', subId:'STA-02', sub:'Avvistati (non foto)', level:3, name:'Fantasma dei Boschi', goal:'50 avvistamenti', metric:'sighting_only_count', threshold:50},
  {badgeId:'TAX-01-L1', macroId:'TAX', macro:'Tassonomia', subId:'TAX-01', sub:'Specie per Famiglia', level:1, name:'Araldista di Stirpe', goal:'3 specie', metric:'max_family_count', threshold:3},
  {badgeId:'TAX-01-L2', macroId:'TAX', macro:'Tassonomia', subId:'TAX-01', sub:'Specie per Famiglia', level:2, name:'Genealogista di Famiglia', goal:'10 specie', metric:'max_family_count', threshold:10},
  {badgeId:'TAX-01-L3', macroId:'TAX', macro:'Tassonomia', subId:'TAX-01', sub:'Specie per Famiglia', level:3, name:'Monografo di Famiglia', goal:'30 specie', metric:'max_family_count', threshold:30},
  {badgeId:'TAX-02-L1', macroId:'TAX', macro:'Tassonomia', subId:'TAX-02', sub:'Specie stesso Ordine', level:1, name:"Decifratore d'Ordine", goal:'10 specie', metric:'max_order_count', threshold:10},
  {badgeId:'TAX-02-L2', macroId:'TAX', macro:'Tassonomia', subId:'TAX-02', sub:'Specie stesso Ordine', level:2, name:'Curatore del Clade', goal:'50 specie', metric:'max_order_count', threshold:50},
  {badgeId:'TAX-02-L3', macroId:'TAX', macro:'Tassonomia', subId:'TAX-02', sub:'Specie stesso Ordine', level:3, name:'Architetto Filogenetico', goal:'150 specie', metric:'max_order_count', threshold:150},
  {badgeId:'TAX-03-L1', macroId:'TAX', macro:'Tassonomia', subId:'TAX-03', sub:'Numero Generi diversi', level:1, name:'Censitore di Generi', goal:'5 generi', metric:'genera_count', threshold:5},
  {badgeId:'TAX-03-L2', macroId:'TAX', macro:'Tassonomia', subId:'TAX-03', sub:'Numero Generi diversi', level:2, name:'Cartografo dei Generi', goal:'20 generi', metric:'genera_count', threshold:20},
  {badgeId:'TAX-03-L3', macroId:'TAX', macro:'Tassonomia', subId:'TAX-03', sub:'Numero Generi diversi', level:3, name:'Maestro della Sistematica', goal:'100 generi', metric:'genera_count', threshold:100},
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
  const familyCounts = recorded.reduce((acc, a) => { acc[a.fam] = (acc[a.fam] || 0) + 1; return acc; }, {});
  const orderCounts = recorded.reduce((acc, a) => { acc[a.ord] = (acc[a.ord] || 0) + 1; return acc; }, {});
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
    obs_under_100: recorded.filter(a => getObservationCount(a) < 100).length,
    usage_streak: getUsageStreak(),
    ai_corrections: Number((typeof window !== 'undefined' && (window.ANIMALDEX_AI_CORRECTIONS || window.localStorage.getItem('animaldex_ai_corrections'))) || 0),
    apex_count: recorded.filter(a => String(a.trophic) === '4').length,
    base_trophic_count: recorded.filter(a => String(a.trophic) === '1' || String(a.trophic) === 'F').length,
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
  try { return new Set(JSON.parse(window.localStorage.getItem('animaldex_awards_unlocked') || '[]')); } catch { return new Set(); }
}
function persistAwardUnlocks(ids = []) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem('animaldex_awards_unlocked', JSON.stringify(Array.from(new Set(ids)))); } catch {}
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
  const classes = ['rarity-badge', rarityMetalClass(r), compact ? 'compact' : '', small ? 'small' : '', full ? 'full' : ''].filter(Boolean).join(' ');
  return (
    <div className={classes} onClick={onClick} style={{ cursor:onClick?'pointer':'default', ...style }}>
      <span className="rarity-shield-wrap" aria-hidden="true">
        <img className="rarity-shield" src={SHIELD_PATHS[r]} alt="" />
        <span className="rarity-shield-sheen" />
      </span>
      <span style={{ position:'relative', zIndex:4 }}>{r}{suffix}</span>
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

// ── Weight gauge with logarithmic scale ────────────────────────────────
const WEIGHT_CATS = [
  { id:'piuma', label:'Piuma', range:'1g–5kg', color:'#5BB8F5' },
  { id:'medio', label:'Medio', range:'5kg–100kg', color:'#F0C84E' },
  { id:'massimo', label:'Massimo', range:'100kg–2000kg', color:'#F55454' },
];

function logMap(weight_kg) {
  const logMin = -3, logMax = 3.3;
  const logVal = Math.log10(Math.max(0.001, weight_kg));
  const frac = (logVal - logMin) / (logMax - logMin);
  return -80 + frac * 160;
}

function getWeightCat(wt_str) {
  if (!wt_str) return WEIGHT_CATS[1];
  const s = wt_str.toLowerCase();
  let mult = s.includes(' kg') ? 1 : s.includes(' g') ? 0.001 : 1;
  const nums = s.match(/[\d.]+/g);
  if (!nums) return WEIGHT_CATS[1];
  const avg = (parseFloat(nums[0]) + parseFloat(nums[nums.length-1])) / 2 * mult;
  if (avg < 5) return WEIGHT_CATS[0];
  if (avg < 100) return WEIGHT_CATS[1];
  return WEIGHT_CATS[2];
}

function getGaugeAngle(wt_str) {
  if (!wt_str) return 0;
  const s = wt_str.toLowerCase();
  let mult = s.includes(' kg') ? 1 : s.includes(' g') ? 0.001 : 1;
  const nums = s.match(/[\d.]+/g);
  if (!nums) return 0;
  const avg = (parseFloat(nums[0]) + parseFloat(nums[nums.length-1])) / 2 * mult;
  return logMap(avg);
}

function GaugeSVG({ wt_str }) {
  const cat = getWeightCat(wt_str);
  const angle = getGaugeAngle(wt_str);
  const col = cat.color;
  const cx = 60, cy = 58;

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

  const segColors = WEIGHT_CATS.map(c => c.color);
  const catIdx = WEIGHT_CATS.indexOf(cat);
  let arcs = '';
  for (let i = 0; i < 3; i++) {
    const s = -80 + i * 53.33, e = s + 50;
    const isActive = i === catIdx;
    arcs += `<path d="${arcPath(s, e, 42, 52)}" fill="${isActive ? segColors[i] : 'rgba(255,255,255,.08)'}"/>`;
  }

  const needleRad = (angle - 90) * Math.PI / 180;
  const nx = cx + 36 * Math.cos(needleRad);
  const ny = cy + 36 * Math.sin(needleRad);
  const n1 = polarToXY(angle - 4, 8);
  const n2 = polarToXY(angle + 4, 8);

  return (
    <svg viewBox="0 0 120 78" width="100%" height="42" xmlns="http://www.w3.org/2000/svg">
      <g dangerouslySetInnerHTML={{ __html: arcs }} />
      <polygon points={`${n1.x},${n1.y} ${nx},${ny} ${n2.x},${n2.y}`} fill={col} />
      <circle cx={cx} cy={cy} r="4" fill={col} />
      <circle cx={cx} cy={cy} r="2" fill="#111113" />
    </svg>
  );
}

// ── Human silhouette SVG ────────────────────────────────────────────────
function HumanSilhouette({ h = 50 }) {
  return (
    <svg viewBox="0 0 32 120" width="14" height={h} xmlns="http://www.w3.org/2000/svg" style={{ display:'block' }}>
      <circle cx="16" cy="15" r="8" fill="rgba(255,255,255,.3)"/>
      <rect x="14" y="23" width="4" height="4" fill="rgba(255,255,255,.3)"/>
      <ellipse cx="16" cy="32" rx="14" ry="7" fill="rgba(255,255,255,.3)"/>
      <rect x="8" y="35" width="16" height="18" rx="4" fill="rgba(255,255,255,.3)"/>
      <rect x="9" y="53" width="14" height="14" rx="3" fill="rgba(255,255,255,.25)"/>
      <ellipse cx="16" cy="72" rx="13" ry="8" fill="rgba(255,255,255,.2)"/>
      <rect x="6" y="77" width="6" height="38" rx="3" fill="rgba(255,255,255,.25)"/>
      <rect x="20" y="77" width="6" height="38" rx="3" fill="rgba(255,255,255,.25)"/>
      <rect x="2" y="37" width="5" height="28" rx="2.5" fill="rgba(255,255,255,.25)" transform="rotate(-20 4.5 37)"/>
      <rect x="25" y="37" width="5" height="28" rx="2.5" fill="rgba(255,255,255,.25)" transform="rotate(20 27.5 37)"/>
    </svg>
  );
}

// ── Trophic pyramid ────────────────────────────────────────────────────
function TrophicPyramid({ trophic, compact = false }) {
  const levels = [4, 3, 2, 1];
  const widths = compact ? [22, 32, 44, 56] : [32, 46, 62, 76];
  const vbW = compact ? 60 : 80;
  const rowH = compact ? 9 : 13;
  const barH = compact ? 6 : 9;
  const svgW = compact ? 52 : 68;
  const svgH = compact ? 36 : 52;
  const colors = { 1:'#5CC85A', 2:'#A8D84A', 3:'#F5A828', 4:'#F55454' };
  return (
    <svg viewBox={`0 0 ${vbW} ${rowH*4}`} width={svgW} height={svgH} xmlns="http://www.w3.org/2000/svg">
      {levels.map((lv, i) => {
        const isActive = lv === trophic;
        const x = (vbW - widths[i]) / 2;
        return <rect key={lv} x={x} y={i*rowH} width={widths[i]} height={barH} rx="2" fill={isActive ? colors[lv] : 'rgba(255,255,255,.1)'} />;
      })}
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────
function StatRow({ label, base, scale, color, unit }) {
  const statKey = Object.keys(STAT_MAXES).find(k => STATS_DEF.some(s => s.k === k && s.l === label));
  const maxValue = statKey ? STAT_MAXES[statKey] : 100;
  const realValue = Math.round(base * scale);
  const barWidth = Math.min(100, Math.round((realValue / maxValue) * 100));
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:11 }}>
      <span style={{ color:'rgba(255,255,255,.6)', fontSize:12, fontWeight:600, width:90, flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, height:7, background:'rgba(0,0,0,.4)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${barWidth}%`, background:color, borderRadius:4, transition:'width .65s cubic-bezier(.4,0,.2,1)' }} />
      </div>
      <span style={{ color:'white', fontSize:12, fontWeight:700, minWidth:60, textAlign:'right' }}>{realValue} {unit}</span>
    </div>
  );
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

function DistMap({ hab, accentColor, countriesPresent }) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  useEffect(() => {
    if (!mapContainer.current || !countriesPresent || countriesPresent.length === 0) return;
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else { initMap(); }
    function initMap() {
      console.log('[Map] countriesPresent:', countriesPresent);
      const L = window.L;
      if (mapInstance.current) { mapInstance.current.remove(); }
      mapInstance.current = L.map(mapContainer.current, { zoomControl: false, attributionControl: false }).setView([20, 0], 2);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, minZoom: 1 }).addTo(mapInstance.current);
      fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
        .then(r => r.json())
        .then(data => {
          const isoSet = new Set(countriesPresent.map(c => c.toUpperCase()));
          let highlightedBounds = null;
          L.geoJSON(data, {
            style: () => ({ color: 'rgba(255,255,255,.15)', weight: 0.5, fillOpacity: 0.25, fillColor: 'rgba(120,120,120,.12)' }),
            onEachFeature: (feature, layer) => {
              const p = feature.properties || {};
              const iso2 = (p.ISO_A2 || p.iso_a2 || '').toUpperCase();
              const iso2alt = (p.ADM0_A3 || '').toUpperCase();
              const nameEn = ISO_TO_EN;
              // also try matching via our ISO_TO_EN reverse lookup
              const matchByName = Object.entries(nameEn).some(([k,v]) =>
                isoSet.has(k.toUpperCase()) && (v === p.NAME || v === p.ADMIN || v === p.NAME_LONG)
              );
              const isMatch = (iso2 && isoSet.has(iso2)) || matchByName;
              if (isMatch) {
                layer.setStyle({ fillColor: accentColor, fillOpacity: 0.75, color: accentColor, weight: 1.5 });
                layer.bringToFront();
                try {
                  const bounds = layer.getBounds();
                  if (bounds?.isValid()) { highlightedBounds = highlightedBounds ? highlightedBounds.extend(bounds) : bounds; }
                } catch (e) {}
              }
              layer.bindPopup(`<b>${p.NAME || p.ADMIN || ''}</b>`);
            }
          }).addTo(mapInstance.current);
          if (highlightedBounds?.isValid()) {
            setTimeout(() => { mapInstance.current.fitBounds(highlightedBounds, { padding: [40, 40], maxZoom: 6 }); }, 300);
          }
        }).catch(err => console.warn('Map GeoJSON error:', err));
    }
  }, [countriesPresent, accentColor]);
  return (
    <div style={{ borderRadius:12, overflow:'hidden', background:'#07131F' }}>
      {countriesPresent && countriesPresent.length > 0 && (
        <div ref={mapContainer} style={{ width: '100%', height: 280, borderBottom:'1px solid rgba(255,255,255,.1)', background:'#0a0e1a' }} />
      )}
      {(!countriesPresent || countriesPresent.length === 0) && (
        <div style={{ padding:12, borderBottom:'1px solid rgba(255,255,255,.1)' }}>
          <div style={{ color:'rgba(255,255,255,.5)', fontSize:11, fontWeight:700, marginBottom:8, letterSpacing:.3 }}>DISTRIBUZIONE GEOGRAFICA</div>
          <span style={{ color:'rgba(255,255,255,.3)', fontSize:11 }}>Nessun dato disponibile</span>
        </div>
      )}
      <div style={{ padding:12, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ color:'rgba(255,255,255,.5)', fontSize:11, fontWeight:700, marginBottom:8, letterSpacing:.3 }}>HABITAT</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {hab && hab.map(h=>{
              const capitalizedH = h.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              return <span key={h} style={{ background:'rgba(255,255,255,.15)', color:'white', fontSize:11, fontWeight:700, padding:'5px 10px', borderRadius:8, letterSpacing:.3 }}>{capitalizedH}</span>;
            })}
          </div>
        </div>
        <button onClick={()=>setShowLimitsModal(true)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.6)', fontSize:16, cursor:'pointer', padding:0, width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>ℹ️</button>
      </div>
      {showLimitsModal && (
        <div style={{ position:'fixed', inset:0, background:'#000000', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:16 }}>
          <div style={{ background:'#0A0A0C', borderRadius:16, padding:24, maxWidth:400, width:'100%', border:'2px solid rgba(255,215,0,.3)', boxShadow:'0 20px 80px rgba(0,0,0,.95)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <h3 style={{ margin:0, color:'#FFD700', fontSize:18, fontWeight:800 }}>⚠️ Limiti della Visualizzazione</h3>
              <button onClick={()=>setShowLimitsModal(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.6)', fontSize:20, cursor:'pointer', padding:0, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
            <div style={{ background:'#050505', padding:16, borderRadius:12, border:'1px solid rgba(255,215,0,.15)' }}>
              <p style={{ margin:'0 0 12px', color:'#FFD700', fontWeight:700, fontSize:13 }}>📍 I dati provengono da GBIF e possono includere:</p>
              <ul style={{ margin:'0 0 14px', paddingLeft:20, color:'#E0E0E0', fontSize:12 }}>
                <li style={{ marginBottom:6 }}>Osservazioni in cattività (zoo, acquari)</li>
                <li style={{ marginBottom:6 }}>Dati storici non aggiornati</li>
                <li style={{ marginBottom:6 }}>Errori di geo-localizzazione</li>
                <li>Aree amministrative non attuali</li>
              </ul>
              <p style={{ margin:'0', padding:'12px 14px', background:'#000000', borderLeft:'4px solid #FFD700', color:'#FFFFFF', fontSize:12, borderRadius:6, lineHeight:1.6 }}>💡 <strong>Esempio:</strong> la "Guyana francese" (parte della Francia) può riportare specie con distribuzione diversa da quella reale.</p>
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
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px 12px', borderRadius:12, background:cfg.bg, color:cfg.c, fontSize:12, fontWeight:800, border:cfg.border||'none', cursor:onClick?'pointer':'default', textTransform:'uppercase', letterSpacing:0.5, width:'100%' }}>
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

function AnimalImg({ a, size=102, fontSize=52, overrideStatus, gridMode=false }) {
  const c = CLS[a.cls] || CLS.Mammalia;
  const [imgErr, setImgErr] = useState(false);
  const [iconErr, setIconErr] = useState(false);
  const [mysteryErr, setMysteryErr] = useState(false);
  const status = normalizeAnimalStatus(overrideStatus !== undefined ? overrideStatus : a.status);
  const mystery = isMysteryStatus(status);
  const revealed = isRevealedStatus(status);
  const classIcon = CLASS_ICONS[a.cls];

  // ── Misterioso: placeholder dedicato, identità nascosta ──
  if (mystery) {
    return (
      <div style={{ width:'100%', height:size, position:'relative', overflow:'hidden', background:'#242428', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {!mysteryErr ? (
          <img src={MYSTERY_PLACEHOLDER} alt="misterioso" onError={()=>setMysteryErr(true)}
            style={{ width:'100%', height:'100%', objectFit:'contain', opacity:0.68, transform:`scale(${gridMode ? GRID_MYSTERY_SCALE : 1.15})`, filter:'drop-shadow(0 0 10px rgba(255,255,255,.10))' }} />
        ) : (
          <div style={{ width:54, height:54, borderRadius:'50%', background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.14)', color:'rgba(255,255,255,.34)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, fontWeight:900 }}>?</div>
        )}
      </div>
    );
  }

  // ── Ricercato: mostra silhouette della classe, nome visibile nella card ──
  if (!revealed) {
    if (classIcon && !iconErr) {
      return (
        <div style={{ width:'100%', height:size, position:'relative', overflow:'hidden', background:'#2a2a2e', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <img src={classIcon} alt={a.cls} onError={()=>setIconErr(true)}
            style={{ width:'100%', height:'100%', objectFit:'contain', opacity:0.55, transform: `scale(${gridMode ? GRID_SILHOUETTE_SCALE : 1.2})` }} />
        </div>
      );
    }
    return (
      <div style={{ width:'100%', height:size, background:'#111113', display:'flex', alignItems:'center', justifyContent:'center', fontSize, opacity:0.18 }}>{c.icon}</div>
    );
  }

  // ── Avvistato / Catturato: immagine reale ──
  if (a.image_url && !imgErr) {
    const glowColor = getClassGlowColor(a.cls);
    const dropShadow = `drop-shadow(0 0 ${Math.round(size*0.08)}px ${glowColor}ff) drop-shadow(0 0 ${Math.round(size*0.17)}px ${glowColor}cc) drop-shadow(0 0 ${Math.round(size*0.25)}px ${glowColor}66)`;
    const pad = gridMode ? 0 : Math.round(size * 0.12);
    const imgScale = gridMode ? GRID_IMAGE_SCALE : 1.2;
    return (
      <div style={{ width:'100%', height:size, background:c.img, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', padding:pad, boxSizing:'border-box' }}>
        <img src={a.image_url} alt={a.sci} onError={()=>setImgErr(true)}
          style={{ width:'100%', height:'100%', objectFit:'contain',
            transform: `scale(${imgScale})`,
            filter: dropShadow,
            WebkitFilter: dropShadow }} />
      </div>
    );
  }
  return (
    <div style={{ width:'100%', height:size, background:c.img, display:'flex', alignItems:'center', justifyContent:'center', fontSize }}>{c.icon}</div>
  );
}





function AnimalCard({ a, onClick }) {
  const c = CLS[a.cls] || CLS.Mammalia;
  const status = normalizeAnimalStatus(a.status);
  const mystery = isMysteryStatus(status);
  const revealed = isRevealedStatus(status);
  const unrevealed = !revealed && !mystery;
  const glowAccent = getClassGlowColor(a.cls);
  const glowShadow = revealed ? `0 0 16px 2px ${glowAccent}55, 0 0 4px 1px ${glowAccent}22` : 'none';
  const isNarrow = typeof window !== 'undefined' && window.innerWidth <= 390;
  const cardH = isNarrow ? 124 : 134;
  const labelH = isNarrow ? 36 : 38;
  const imageH = revealed ? cardH : cardH - labelH + 8;
  return (
    <div
      onClick={()=>onClick(a)}
      style={{
        height:cardH,
        borderRadius:18,
        overflow:'hidden',
        cursor:'pointer',
        position:'relative',
        userSelect:'none',
        transition:'transform .1s ease, box-shadow .3s ease',
        boxShadow:glowShadow,
        background: revealed ? c.img : '#27282D'
      }}
      onMouseDown={e=>e.currentTarget.style.transform='scale(0.94)'}
      onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
    >
      {revealed ? (
        <AnimalImg a={a} size={cardH} fontSize={52} gridMode={true} />
      ) : (
        <div style={{ position:'absolute', left:0, right:0, top:0, height:imageH, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
          <AnimalImg a={a} size={imageH} fontSize={52} gridMode={true} />
        </div>
      )}
      <div style={{ position:'absolute', top:7, left:7, zIndex:3, background:'rgba(0,0,0,.62)', color:'rgba(255,255,255,.74)', fontSize:10, fontWeight:800, padding:'2px 7px', borderRadius:999, backdropFilter:'blur(4px)' }}>{a.no}</div>
      <div className={`rarity-dot ${rarityDotClass(a.rarity)}`} style={{ position:'absolute', top:8, right:8, zIndex:3, width:11, height:11, borderRadius:'50%' }}/>
      {!mystery && (
        <div
          style={{
            position:'absolute',
            left:0,
            right:0,
            bottom:0,
            minHeight:labelH,
            padding:'8px 8px 8px',
            boxSizing:'border-box',
            background: revealed
              ? `linear-gradient(180deg, transparent 0%, ${c.mid}D8 26%, ${c.mid} 100%)`
              : 'linear-gradient(180deg, transparent 0%, rgba(125,132,141,.84) 34%, rgba(114,121,130,.98) 100%)',
            color: unrevealed ? '#272B32' : 'white',
            fontSize:isNarrow ? 10.5 : 11.5,
            fontWeight:900,
            textAlign:'center',
            lineHeight:'12.5px',
            textShadow: revealed ? '0 1px 2px rgba(0,0,0,.55)' : 'none',
            display:'-webkit-box',
            WebkitLineClamp:2,
            WebkitBoxOrient:'vertical',
            overflow:'hidden',
            wordBreak:'break-word',
          }}
        >{a.com}</div>
      )}
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

function MultiSheet({ title, options, selected, onApply, onClose, withSearch }) {
  const [local, setLocal] = useState(new Set(selected));
  const [search, setSearch] = useState('');
  const toggle = v => setLocal(s => { const n=new Set(s); n.has(v)?n.delete(v):n.add(v); return n; });
  const allKeys = options.map(o=>o.value);
  const filteredOptions = search.trim() ? options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase())) : options;
  return (
    <Sheet title={title} onClose={onClose}>
      {withSearch && (
        <div style={{ padding:'0 14px 12px', flexShrink:0 }}>
          <input type="text" placeholder={title==='Geografia'?'Cerca nazione...':'Cerca...'} value={search} onChange={e => setSearch(e.target.value)} style={{ width:'100%', height:38, borderRadius:10, background:'#2A2A2C', color:'white', border:'1px solid rgba(255,255,255,.2)', padding:'0 12px', fontSize:14, outline:'none' }} />
        </div>
      )}
      <div style={{ display:'flex', gap:8, padding:'0 14px 12px', flexShrink:0 }}>
        <button onClick={()=>setLocal(new Set(allKeys))} style={{ flex:1, height:34, borderRadius:10, background:'#3A3A3C', color:'rgba(255,255,255,.7)', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>Seleziona tutto</button>
        <button onClick={()=>setLocal(new Set())} style={{ flex:1, height:34, borderRadius:10, background:'#3A3A3C', color:'rgba(255,255,255,.7)', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>Cancella</button>
      </div>
      <div style={{ padding:'0 14px 80px' }}>
        {filteredOptions.length > 0 ? filteredOptions.map(opt => {
          const on = local.has(opt.value);
          const flag = withSearch ? getFlagEmoji(opt.value) : '';
          const isRarity = ['Comune','Non comune','Raro','Leggendario'].includes(opt.value);
          if (isRarity) {
            return (
              <div key={opt.value} onClick={()=>toggle(opt.value)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'8px 6px 8px 18px', marginBottom:8, borderRadius:14, background:on?'rgba(255,255,255,.08)':'rgba(0,0,0,.12)', border:`1.5px solid ${on?'rgba(255,255,255,.28)':'transparent'}`, cursor:'pointer' }}>
                <RarityBadge rarity={opt.value} compact style={{ flex:1, minWidth:0 }} />
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
                <span style={{ fontSize:14, fontWeight:700 }}>{opt.label}</span>
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
          <RarityBadge rarity={k} compact style={{ width:150, flexShrink:0 }} />
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

function Grid({ onSelect, statusMap = {}, onHome, preset, onBackToOrigin }) {
  const [search, setSearch]   = useState('');
  const [clsF, setClsF]       = useState(null);
  const [sheet, setSheet]     = useState(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showInfoModalGrid, setShowInfoModalGrid] = useState(false);
  const [fRarity, setFRarity]     = useState([]);
  const [fCons,   setFCons]       = useState([]);
  const [fStatus, setFStatus]     = useState([]);
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

  useEffect(() => {
    if (!preset?.id) return;
    setSearch(preset.search || '');
    setClsF(preset.type === 'class' ? preset.cls : null);
    setFRarity(preset.rarity || []);
    setFCons(preset.cons || []);
    setFStatus(preset.type === 'status' ? (preset.statuses || []) : (preset.statuses || []));
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

  const list = ANIMALS
    .map(a => ({ ...a, status: normalizeAnimalStatus(statusMap[a.id] ?? a.status) }))
    .filter(a => {
      const q = search.toLowerCase().trim();
      const status = normalizeAnimalStatus(a.status);
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
      return true;
    })
    .sort((a,b) => {
      const noA = Number(a.no || a.id || 0), noB = Number(b.no || b.id || 0);
      if (sortBy === 'name_asc') return String(a.com).localeCompare(String(b.com), 'it');
      if (sortBy === 'name_desc') return String(b.com).localeCompare(String(a.com), 'it');
      if (sortBy === 'rarity') return (RARITY[b.rarity]?.s || 0) - (RARITY[a.rarity]?.s || 0) || noA - noB;
      if (sortBy === 'status') return ANIMAL_STATUS_ORDER.indexOf(a.status) - ANIMAL_STATUS_ORDER.indexOf(b.status) || noA - noB;
      if (sortBy === 'class') return String(a.cls).localeCompare(String(b.cls), 'it') || noA - noB;
      return noA - noB;
    });

  const anyExtra = fRarity.length||fCons.length||fStatus.length||fTrophic.length||fGeography.length||fCategory.length||fConfidence.length||fMapProfile.length||fBioRegion.length||fGameRegion.length||fHabitat.length||fTax||sortBy!=='no';
  const rarityOpts = Object.entries(RARITY).map(([k,v])=>({ value:k, label:k, c:v.c, bg:v.bg }));
  const consOpts   = Object.entries(CONS).map(([k,v])=>({ value:k, label:`${k} · ${v.full}`, c:v.c, bg:v.bg }));
  const statusOpts = ANIMAL_STATUS_ORDER.map(k => ({ value:k, label:ANIMAL_STATUS[k].label, c:ANIMAL_STATUS[k].c, bg:ANIMAL_STATUS[k].bg }));
  const trophicOpts = Object.entries(TROPHIC).map(([k,v])=>({ value:String(k), label:v.label, c:v.c, bg:v.bg }));
  const geographyOpts = [...GEO_FILTER_OPTIONS, ...COUNTRIES.map(c=>({ value:c.code, label:c.name, c:'#20B2AA', bg:'rgba(32,178,170,.15)' }))];
  const categoryOpts = Object.entries(CATEGORY_META).map(([id,meta])=>({ value:id, label:meta.label, c:meta.color, bg:`${meta.color}22` }));
  const uniqueOpt = (values, color='#7AC7FF') => Array.from(new Set(values.flatMap(v => toArraySafe(v)).filter(Boolean))).sort().map(v=>({ value:v, label:v, c:color, bg:`${color}22` }));
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
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#1C1C1E', position:'relative', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:isNarrow?'6px 10px 6px':'8px 12px 8px', borderBottom:'1px solid #2A2A2C', flexShrink:0 }}>
        {onBackToOrigin ? (
          <button onClick={onBackToOrigin} aria-label="Torna alla scheda" style={{ width:buttonSize, height:buttonSize, borderRadius:10, background:'transparent', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 5L8 12l7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        ) : (
          <button onClick={onHome} aria-label="Home" style={{ width:buttonSize, height:buttonSize, borderRadius:10, background:'transparent', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 10.5L12 3.25l8.5 7.25" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 9.75V20h11V9.75" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.5 20v-6h5v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
        <span style={{ color:'white', fontSize:isNarrow?17:18, fontWeight:900, flex:1, textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{preset?.title || 'Animaldex'}</span>
        <button onClick={()=>setShowInfoModalGrid(!showInfoModalGrid)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.8)', fontSize:22, cursor:'pointer', padding:0, width:buttonSize, height:buttonSize, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:10, flexShrink:0 }}>ⓘ</button>
      </div>

      {(anyExtra||clsF||search) && (
        <div style={{ display:'flex', gap:6, padding:'8px 12px 4px', flexWrap:'wrap', flexShrink:0 }}>
          {search && <span onClick={()=>setSearch('')} style={{ background:'rgba(255,255,255,.1)', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>🔎 {search} ×</span>}
          {clsF && <span onClick={()=>setClsF(null)} style={{ background:CLS[clsF].mid, color:CLS[clsF].accent, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{CLS[clsF].icon} {CLS[clsF].label} ×</span>}
          {fTax && <span onClick={()=>setFTax(null)} style={{ background:'rgba(232,192,64,.2)', color:'#E8C040', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{fTax.label} ×</span>}
          {fRarity.map(r=><RarityBadge key={r} rarity={r} small suffix=" ×" onClick={()=>setFRarity(p=>p.filter(x=>x!==r))} style={{ flexShrink:0 }} />)}
          {fCons.map(c=><span key={c} onClick={()=>setFCons(p=>p.filter(x=>x!==c))} style={{ background:CONS[c].bg, color:CONS[c].c, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{c} ×</span>)}
          {fStatus.map(s=>{ const so = getStatusMeta(s); return <span key={s} onClick={()=>setFStatus(p=>p.filter(x=>x!==s))} style={{ background:so.bg||'#2A2A2C', color:so.c||'rgba(255,255,255,.6)', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{so.label} ×</span>; })}
          {fTrophic.map(t=><span key={t} onClick={()=>setFTrophic(p=>p.filter(x=>x!==t))} style={{ background:TROPHIC[t]?.bg||'#222', color:TROPHIC[t]?.c||'#aaa', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{TROPHIC[t]?.label||t} ×</span>)}
          {fGeography.map(g=>{ const opt = geographyOpts.find(o=>o.value===g); return <span key={g} onClick={()=>setFGeography(p=>p.filter(x=>x!==g))} style={{ background:'rgba(32,178,170,.15)', color:'#20B2AA', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{opt?.label || g} ×</span>; })}
          {fCategory.map(cat=>{ const meta=CATEGORY_META[cat]; return <span key={cat} onClick={()=>setFCategory(p=>p.filter(x=>x!==cat))} style={{ background:`${meta?.color||'#777'}22`, color:meta?.color||'#ccc', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{meta?.label||cat} ×</span>; })}
          {fConfidence.map(v=><span key={v} onClick={()=>setFConfidence(p=>p.filter(x=>x!==v))} style={{ background:'rgba(255,255,255,.10)', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>confidence {v} ×</span>)}
          {fMapProfile.map(v=><span key={v} onClick={()=>setFMapProfile(p=>p.filter(x=>x!==v))} style={{ background:'rgba(91,190,248,.16)', color:'#5BBEF8', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{v} ×</span>)}
          {fBioRegion.map(v=><span key={v} onClick={()=>setFBioRegion(p=>p.filter(x=>x!==v))} style={{ background:'rgba(108,229,199,.16)', color:'#6CE5C7', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{v} ×</span>)}
          {fGameRegion.map(v=><span key={v} onClick={()=>setFGameRegion(p=>p.filter(x=>x!==v))} style={{ background:'rgba(184,96,248,.16)', color:'#B860F8', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{v} ×</span>)}
          {fHabitat.map(v=><span key={v} onClick={()=>setFHabitat(p=>p.filter(x=>x!==v))} style={{ background:'rgba(240,168,64,.16)', color:'#F0A840', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>{v} ×</span>)}
          {sortBy!=='no' && <span onClick={()=>setSortBy('no')} style={{ background:'rgba(255,255,255,.10)', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, cursor:'pointer' }}>↕ {sortOpts.find(o=>o.value===sortBy)?.label||'Ordina'} ×</span>}
        </div>
      )}

      <div style={{ flex:1, overflowY:'auto', padding:isNarrow?'10px 10px 0':'12px 12px 0' }}>
        {list.length===0 ? <p style={{ color:'#555', textAlign:'center', padding:40, fontSize:14 }}>Nessun animale trovato</p> : <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:isNarrow?8:10 }}>{list.map(a=><AnimalCard key={a.id} a={a} onClick={onSelect}/>)}</div>}
        <div style={{ height:6 }}/>
      </div>

      <div style={{ background:'#A84637', borderTop:'1px solid #7A3228', padding:isNarrow?'6px 10px 4px':'6px 12px 4px', flexShrink:0, position:'relative' }}>
        <div style={{ display:'flex', gap:isNarrow?8:12, alignItems:'center', marginBottom:6 }}>
          <button onClick={()=>setShowSearchBar(!showSearchBar)} style={{ width:buttonSize, height:buttonSize, borderRadius:10, background:'transparent', border:'none', color:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M13 13L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <button onClick={()=>{setSheet('tax');setShowMenu(false);}} style={{ flex:1, height:buttonSize, borderRadius:10, background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:12, fontWeight:700 }}>Tassonomia {fTax && ' ✓'}</button>
          <button onClick={()=>{setSheet('sort');setShowMenu(false);}} style={{ width:isNarrow?90:106, height:buttonSize, borderRadius:10, background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, color:'white', fontSize:12, fontWeight:800, flexShrink:0 }}>↕ Ordina</button>
          <button onClick={()=>setShowMenu(v=>!v)} style={{ width:buttonSize, height:buttonSize, borderRadius:10, background:'transparent', border:'none', color:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M7 12h13M10 17h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div style={{ textAlign:'center', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.7)', padding:'2px 0' }}>{list.length} risultati</div>
      </div>

      {showMenu && (
        <div style={{ position:'absolute', top:isNarrow?94:100, right:12, width:280, background:'#252527', border:'1px solid #333', borderRadius:14, boxShadow:'0 12px 32px rgba(0,0,0,.5)', zIndex:40, overflow:'hidden' }}>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {[
              { label:'Rarità', icon:'★', onClick:()=>{setSheet('rarity');setShowMenu(false);}, active:fRarity.length>0, color:'#C9A961' },
              { label:'Conservazione', icon:'🛡', onClick:()=>{setSheet('cons');setShowMenu(false);}, active:fCons.length>0, color:'#DC143C' },
              { label:'Gerarchia', icon:'⛓', onClick:()=>{setSheet('trophic');setShowMenu(false);}, active:fTrophic.length>0, color:'#F5A828' },
              { label:'Status', icon:'📷', onClick:()=>{setSheet('status');setShowMenu(false);}, active:fStatus.length>0, color:'#00BFFF' },
              { label:'Categorie', icon:'◉', onClick:()=>{setSheet('category');setShowMenu(false);}, active:fCategory.length>0, color:'#B860F8' },
              { label:'Geografia', icon:'🌍', onClick:()=>{setSheet('geography');setShowMenu(false);}, active:fGeography.length>0, color:'#20B2AA' },
              { label:'Confidence', icon:'✓', onClick:()=>{setSheet('confidence');setShowMenu(false);}, active:fConfidence.length>0, color:'#90D84A' },
              { label:'Map profile', icon:'▣', onClick:()=>{setSheet('mapProfile');setShowMenu(false);}, active:fMapProfile.length>0, color:'#5BBEF8' },
              { label:'Bio regioni', icon:'☘', onClick:()=>{setSheet('bioRegion');setShowMenu(false);}, active:fBioRegion.length>0, color:'#6CE5C7' },
              { label:'Game regioni', icon:'◆', onClick:()=>{setSheet('gameRegion');setShowMenu(false);}, active:fGameRegion.length>0, color:'#B860F8' },
              { label:'Habitat', icon:'⌁', onClick:()=>{setSheet('habitat');setShowMenu(false);}, active:fHabitat.length>0, color:'#F0A840' },
              { label:'Classe', icon:'🧬', onClick:()=>{setSheet('cls');setShowMenu(false);}, active:!!clsF, color:'#90D84A' },
            ].map((item,i)=>(
              <button key={i} onClick={item.onClick} style={{ width:'100%', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,.05)', background:'transparent', border:'none', display:'flex', alignItems:'center', gap:12, cursor:'pointer', color:item.active?item.color:'white', fontWeight:item.active?700:600 }}>
                <span style={{ fontSize:18 }}>{item.icon}</span>
                <span style={{ fontSize:14 }}>{item.label}</span>
                {item.active && <span style={{ marginLeft:'auto', color:item.color, fontSize:12 }}>✓</span>}
              </button>
            ))}
            <button onClick={()=>{setSearch('');setClsF(null);setFRarity([]);setFCons([]);setFStatus([]);setFTrophic([]);setFGeography([]);setFCategory([]);setFConfidence([]);setFMapProfile([]);setFBioRegion([]);setFGameRegion([]);setFHabitat([]);setFTax(null);setSortBy('no');setShowMenu(false);}} style={{ width:'100%', padding:'14px 16px', background:'rgba(255,0,0,.1)', border:'none', color:'#FF6B6B', cursor:'pointer', fontWeight:700, fontSize:14 }}>Resetta filtri</button>
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

      {sheet==='cls' && <ClassSheet sel={clsF} onSel={k=>{setClsF(k);setSheet(null);}} onClose={()=>setSheet(null)}/>}
      {sheet==='rarity'  && <MultiSheet title="Rarità" options={rarityOpts} selected={fRarity} onApply={setFRarity} onClose={()=>setSheet(null)}/>}
      {sheet==='cons'    && <MultiSheet title="Stato di Conservazione" options={consOpts} selected={fCons} onApply={setFCons} onClose={()=>setSheet(null)}/>}
      {sheet==='status'  && <MultiSheet title="Status Animale" options={statusOpts} selected={fStatus} onApply={setFStatus} onClose={()=>setSheet(null)}/>}
      {sheet==='trophic' && <MultiSheet title="Catena Alimentare" options={trophicOpts} selected={fTrophic} onApply={setFTrophic} onClose={()=>setSheet(null)}/>}
      {sheet==='geography' && <MultiSheet title="Geografia" options={geographyOpts} selected={fGeography} onApply={setFGeography} onClose={()=>setSheet(null)} withSearch/>}
      {sheet==='category' && <MultiSheet title="Categorie" options={categoryOpts} selected={fCategory} onApply={setFCategory} onClose={()=>setSheet(null)} withSearch/>}
      {sheet==='confidence' && <MultiSheet title="Confidence" options={confidenceOpts} selected={fConfidence} onApply={setFConfidence} onClose={()=>setSheet(null)} />}
      {sheet==='mapProfile' && <MultiSheet title="Map profile" options={mapProfileOpts} selected={fMapProfile} onApply={setFMapProfile} onClose={()=>setSheet(null)} withSearch/>}
      {sheet==='bioRegion' && <MultiSheet title="Bio regioni" options={bioRegionOpts} selected={fBioRegion} onApply={setFBioRegion} onClose={()=>setSheet(null)} withSearch/>}
      {sheet==='gameRegion' && <MultiSheet title="Game regioni" options={gameRegionOpts} selected={fGameRegion} onApply={setFGameRegion} onClose={()=>setSheet(null)} withSearch/>}
      {sheet==='habitat' && <MultiSheet title="Habitat" options={habitatOpts} selected={fHabitat} onApply={setFHabitat} onClose={()=>setSheet(null)} withSearch/>}
      {sheet==='sort' && <SortSheet title="Ordina" options={sortOpts} selected={sortBy} onApply={setSortBy} onClose={()=>setSheet(null)}/>}
      {sheet==='tax' && <TaxSheet current={fTax} onApply={v=>{setFTax(v);}} onClose={()=>setSheet(null)}/>}
    </div>
  );
}


// ── Image Lightbox ────────────────────────────────────────────────────
function ImageLightbox({ src, alt, accentColor, bgColor, originRect, onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }, []);
  const handleClose = () => { setVisible(false); setTimeout(onClose, 350); };

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Starting box position and size (the image container in the detail page)
  const startLeft   = originRect ? originRect.left : vw * 0.1;
  const startTop    = originRect ? originRect.top  : vh * 0.1;
  const startW      = originRect ? originRect.width  : vw * 0.4;
  const startH      = originRect ? originRect.height : vh * 0.3;

  // Interpolate box from origin → fullscreen
  const boxStyle = visible ? {
    position:'fixed', left:0, top:0, width:'100vw', height:'100vh',
    background: bgColor || '#1a1a1c',
    transition:'all .38s cubic-bezier(.4,0,.2,1)',
    display:'flex', alignItems:'center', justifyContent:'center',
    zIndex:300, cursor:'zoom-out',
  } : {
    position:'fixed',
    left: startLeft, top: startTop,
    width: startW, height: startH,
    borderRadius: 16,
    background: bgColor || '#1a1a1c',
    transition:'all .38s cubic-bezier(.4,0,.2,1)',
    display:'flex', alignItems:'center', justifyContent:'center',
    zIndex:300, cursor:'zoom-out',
  };

  return (
    <>
      {/* Dark overlay */}
      <div onClick={handleClose} style={{
        position:'fixed', inset:0, zIndex:299,
        background: visible ? 'rgba(0,0,0,.7)' : 'rgba(0,0,0,0)',
        transition:'background .35s ease',
      }}/>
      {/* Expanding colored box */}
      <div onClick={handleClose} style={boxStyle}>
        <img src={src} alt={alt} onClick={e=>e.stopPropagation()} style={{
          maxWidth:'88%', maxHeight:'88%',
          objectFit:'contain',
          opacity: visible ? 1 : 0,
          transition:'opacity .25s ease .1s',
          filter: `drop-shadow(0 0 40px ${accentColor}99)`,
          cursor:'default',
        }}/>
        <button onClick={handleClose} style={{
          position:'absolute', top:16, right:16,
          background:'rgba(0,0,0,.25)', border:'none',
          color:'white', fontSize:20, width:40, height:40,
          borderRadius:'50%', cursor:'pointer', display:'flex',
          alignItems:'center', justifyContent:'center',
          opacity: visible ? 1 : 0, transition:'opacity .3s ease .15s',
        }}>×</button>
      </div>
    </>
  );
}

// ── Detail ────────────────────────────────────────────────────────────
const TAB_ORDER = ['abilita','statistiche','tassonomia'];
function Detail({ a, onBack, onStatusChange, onJumpToClass }) {
  const [statMode,setStatMode]=useState('statistiche');
  const [slideDir,setSlideDir]=useState(1);
  const [localStatus,setLocalStatus]=useState(normalizeAnimalStatus(a.status));
  const [showStatusMenu,setShowStatusMenu]=useState(false);
  const [showInfoModal,setShowInfoModal]=useState(false);
  const [showLightbox,setShowLightbox]=useState(false);
  const [lightboxRect,setLightboxRect]=useState(null);
  const [pullProgress,setPullProgress]=useState(0);
  const scrollRef = useRef(null);
  const imgRef = useRef(null);
  const touchStartY = useRef(0);
  const c=CLS[a.cls]||CLS.Mammalia;
  const co=CONS[a.cons]||CONS.DD;
  const found = isRevealedStatus(localStatus);

  const handleTab = (m) => {
    if (m===statMode) return;
    setSlideDir(TAB_ORDER.indexOf(m) > TAB_ORDER.indexOf(statMode) ? 1 : -1);
    setStatMode(m);
  };

  const openLightbox = (rect) => {
    if (!found || !a.image_url) return;
    setLightboxRect(rect || (imgRef.current ? imgRef.current.getBoundingClientRect() : null));
    setShowLightbox(true);
    setPullProgress(0);
  };

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchMove  = (e) => {
    if (!scrollRef.current || scrollRef.current.scrollTop > 2) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && found && a.image_url) {
      const progress = Math.min(1, delta / 120);
      setPullProgress(progress);
      if (delta > 110) openLightbox();
    }
  };
  const handleTouchEnd = () => { if (!showLightbox) setPullProgress(0); };
  
  const scale = 1;
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:`linear-gradient(180deg,${c.detailTop} 0%,${c.detailBg} 45%,#1A1A1C 85%)` }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px 11px', flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:c.accent, fontSize:15, fontWeight:700, cursor:'pointer', padding:0 }}>‹ Animaldex</button>
        <span style={{ color:'white', fontSize:17, fontWeight:800 }}>{a.com}</span>
        <button onClick={()=>setShowInfoModal(!showInfoModal)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.8)', fontSize:20, cursor:'pointer', padding:'4px 8px', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8 }}>ⓘ</button>
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

        <div style={{ display:'flex', gap:12, marginBottom:16, padding:'0 4px' }}>
          <div ref={imgRef}
            onClick={()=>openLightbox(imgRef.current?.getBoundingClientRect())}
            style={{
              width: Math.round(168 + pullProgress * (window.innerWidth - 168)),
              height: Math.round(168 + pullProgress * (window.innerWidth - 168)),
              borderRadius: Math.round(16 - pullProgress * 16),
              overflow:'hidden', flexShrink:0, background:c.img,
              cursor: found && a.image_url ? 'zoom-in' : 'default',
              boxShadow: found ? `0 0 18px 3px ${c.accent}44` : 'none',
              transition: pullProgress===0 ? 'width .25s ease, height .25s ease, border-radius .25s ease' : 'none',
            }}>
            <AnimalImg a={a} size={168} fontSize={88} overrideStatus={localStatus} />
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, justifyContent:'center' }}>
            {/* Rarità con stemma */}
            <RarityBadge rarity={a.rarity || 'Comune'} full style={{ fontSize:14 }} />
            <div style={{ background:co.bg, borderRadius:12, padding:'9px 12px', color:co.c, fontSize:12, fontWeight:700, textAlign:'center' }}>{co.lbl} · {co.full}</div>
            <div style={{ display:'flex', justifyContent:'center', position:'relative', width:'100%' }}>
              <StatusBadge status={localStatus} accentColor={c.accent} onClick={()=>setShowStatusMenu(!showStatusMenu)}/>
              {showStatusMenu && (
                <div style={{ position:'absolute', top:40, left:0, right:0, background:c.detailBg, border:`1px solid ${c.accent}33`, borderRadius:12, padding:8, display:'flex', flexDirection:'column', gap:6, zIndex:10 }}>
                  {ANIMAL_STATUS_ORDER.map(s=>(
                    <button key={s} onClick={()=>{const next=normalizeAnimalStatus(s);setLocalStatus(next);setShowStatusMenu(false);if(onStatusChange)onStatusChange(a.id,next);}} style={{ background:'transparent', border:'none', color:c.accent, cursor:'pointer', padding:'6px 12px', borderRadius:8, fontSize:13, fontWeight:700, textAlign:'left', textTransform:'capitalize' }}>{getStatusMeta(s).label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ textAlign:'center', marginBottom:18 }}>
          <h1 style={{ margin:0, color:'white', fontSize:26, fontWeight:900, letterSpacing:-.3 }}>{a.com}</h1>
          <p style={{ margin:'4px 0 0', color:c.accent, fontSize:15, fontStyle:'italic', fontWeight:400 }}>{a.sci}</p>
        </div>
        <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:14, marginBottom:16 }}>
          <p style={{ margin:0, color:'rgba(255,255,255,.82)', fontSize:13, lineHeight:1.7 }}>{a.desc}</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:18 }}>
          {/* PESO: tachimetro */}
          <div style={{ background:'#111113', borderRadius:12, padding:'6px 6px 6px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:0 }}>
            <div style={{ fontSize:9, fontWeight:800, color:getWeightCat(a.wt).color, textTransform:'uppercase', letterSpacing:'.4px', textAlign:'center', lineHeight:1 }}>{getWeightCat(a.wt).label.toUpperCase()}</div>
            <div style={{ width:'100%', maxWidth:'110px', marginTop:1, marginBottom:-2 }}><GaugeSVG wt_str={a.wt} /></div>
            <div style={{ fontSize:11, fontWeight:800, color:'white', textAlign:'center', letterSpacing:'-.3px' }}>{a.wt}</div>
          </div>

          {/* DIMENSIONI */}
          <div style={{ background:'#111113', borderRadius:12, padding:'7px 7px 8px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', minHeight:70 }}>
            <div style={{ fontSize:12, fontWeight:800, color:'white', textAlign:'center', letterSpacing:'-.3px' }}>{a.ln}</div>
          </div>

          {/* PIRAMIDE: trofico */}
          <div style={{ background:'#111113', borderRadius:12, padding:'7px 6px 8px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', gap:4 }}>
            <TrophicPyramid trophic={a.trophic} compact={false} />
            <div style={{ fontSize:11, fontWeight:800, color:TROPHIC[a.trophic]?.c || c.accent, textAlign:'center', letterSpacing:'-.2px', lineHeight:1.2 }}>{TROPHIC[a.trophic]?.label || ''}</div>
          </div>
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
          <div style={{ background:'rgba(0,0,0,.28)', borderRadius:'0 0 14px 14px', padding:'12px 10px', height:290, boxSizing:'border-box', overflow:'hidden', position:'relative' }}>
            <div key={statMode} className={slideDir>0?'tab-from-right':'tab-from-left'} style={{ height:'100%' }}>

              {/* Abilità */}
              {statMode==='abilita'&&(
                <div
                  onTouchStart={e=>e.stopPropagation()}
                  onTouchMove={e=>e.stopPropagation()}
                  style={{ height:'100%', overflowY:'auto', WebkitOverflowScrolling:'touch', overscrollBehavior:'contain', touchAction:'pan-y', paddingRight:2 }}
                >
                  {a.categories?.length>0?(
                    <div style={{ display:'flex', flexDirection:'column', gap:8, paddingBottom:10 }}>
                      {a.categories.map(cat=>(
                        <DetailAbilityCard key={cat} cat={cat} animal={a} accentColor={c.accent} />
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
                  <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:'14px 14px 6px' }}>
                    <StatRow label='Velocità' base={a.stats?.velocita ?? 0} scale={scale} color={c.accent} unit='km/h'/>
                    <StatRow label='Morso' base={a.stats?.morso ?? 0} scale={scale} color={c.accent} unit='PSI'/>
                    {a.lifespan != null && (
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:11 }}>
                        <span style={{ color:'rgba(255,255,255,.6)', fontSize:12, fontWeight:600, width:90, flexShrink:0 }}>Vita</span>
                        <div style={{ flex:1, height:7, background:'rgba(0,0,0,.4)', borderRadius:4, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${Math.min(100, Math.round((a.lifespan / 200) * 100))}%`, background:c.accent, borderRadius:4, transition:'width .65s cubic-bezier(.4,0,.2,1)' }} />
                        </div>
                        <span style={{ color:'white', fontSize:12, fontWeight:700, minWidth:60, textAlign:'right' }}>{a.lifespan} anni</span>
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
                <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:'4px 16px 16px' }}>
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
        <p style={{ color:'white', fontSize:16, fontWeight:800, margin:'0 0 10px', paddingLeft:4 }}>Etimologia</p>
        <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:14, marginBottom:20 }}><p style={{ margin:0, color:'rgba(255,255,255,.82)', fontSize:13, lineHeight:1.7 }}>{a.ety}</p></div>
        {a.bio && (
          <>
            <p style={{ color:'white', fontSize:16, fontWeight:800, margin:'0 0 10px', paddingLeft:4 }}>Biologia</p>
            <div style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:14, marginBottom:20 }}><p style={{ margin:0, color:'rgba(255,255,255,.82)', fontSize:13, lineHeight:1.7 }}>{a.bio}</p></div>
          </>
        )}
        <p style={{ color:'white', fontSize:16, fontWeight:800, margin:'0 0 10px', paddingLeft:4 }}>Distribuzione</p>
        <DistMap hab={a.hab} accentColor={c.accent} countriesPresent={a.distribution?.countries_present}/>
        {/* Endemico sotto mappa */}
        {a.is_endemic && (
          <div style={{ display:'flex', gap:8, marginTop:10, marginBottom:4 }}>
            <div style={{ background:'rgba(0,0,0,.35)', borderRadius:10, padding:'8px 12px', display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:14 }}>📍</span><span style={{ color:'#90D84A', fontSize:11, fontWeight:700 }}>Endemico{a.endemic_iso?.length>0?` (${a.endemic_iso.join(', ')})`:''}</span>
            </div>
          </div>
        )}

      </div>

      {/* Info Modal */}
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
      {showLightbox && <ImageLightbox src={a.image_url} alt={a.com} accentColor={c.accent} bgColor={c.img} originRect={lightboxRect} onClose={()=>{setShowLightbox(false);setPullProgress(0);}}/>}
    </div>
  );
}



// ── Main Menu & Extra Pages ──────────────────────────────────────────

function PageHeader({ title, onBack, right }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderBottom:'1px solid #2A2A2C', flexShrink:0, background:'#1C1C1E' }}>
      <button onClick={onBack} aria-label="Indietro" style={{ width:46, height:46, borderRadius:10, background:'transparent', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5L8 12l7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <div style={{ color:'white', fontSize:20, fontWeight:900, letterSpacing:'-.2px', flex:1, textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{title}</div>
      <div style={{ width:46, height:46, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{right}</div>
    </div>
  );
}


function getAwardDescription(rule) {
  if (!rule) return '';
  return `Sblocca questo award completando l'obiettivo: ${rule.goal.toLowerCase()} in ${rule.sub}.`;
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


function DetailAbilityCard({ cat, animal, accentColor }) {
  const [flipped, setFlipped] = useState(false);
  const meta = CATEGORY_META?.[cat] || { label:cat, icon:'🔹', color:accentColor };
  const curiosity = animal.cat_curiosities?.[cat] || getAbilityDescription(cat, meta);
  const badgeUrl = `/badges/${cat.toLowerCase()}.png`;
  return (
    <div
      className="interactive-hint"
      onClick={()=>setFlipped(v=>!v)}
      style={{
        minHeight:86,
        borderRadius:14,
        background:'rgba(0,0,0,.35)',
        overflow:'hidden',
        cursor:'pointer',
        perspective:900,
        border:`1px solid ${(meta.color || accentColor)}22`
      }}
    >
      <div style={{ position:'relative', minHeight:86, transformStyle:'preserve-3d', transition:'transform .36s cubic-bezier(.2,.8,.2,1)', transform:flipped?'rotateX(180deg)':'rotateX(0deg)' }}>
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', padding:'12px 14px', display:'flex', alignItems:'center', gap:14, boxSizing:'border-box' }}>
          <img src={badgeUrl} alt={meta.label} onError={e=>{e.currentTarget.style.display='none'; const n=e.currentTarget.nextSibling; if(n) n.style.display='inline-flex';}} style={{ width:66, height:66, objectFit:'contain', flexShrink:0, filter:`drop-shadow(0 0 14px ${(meta.color || accentColor)}44)` }} />
          <span style={{ display:'none', width:66, height:66, alignItems:'center', justifyContent:'center', fontSize:36, flexShrink:0 }}>{meta.icon}</span>
          <div style={{ color:'white', fontSize:15, fontWeight:900, lineHeight:1.2 }}>{meta.label}</div>
        </div>
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateX(180deg)', padding:'13px 14px 13px 94px', boxSizing:'border-box', display:'flex', alignItems:'center', background:'linear-gradient(135deg,rgba(0,0,0,.44),rgba(255,255,255,.04))' }}>
          <div style={{ color:'rgba(255,255,255,.75)', fontSize:12, lineHeight:1.45, fontWeight:650, textAlign:'left' }}>{curiosity}</div>
        </div>
        <button onClick={onLogout} style={{ marginTop:14, width:'100%', height:46, borderRadius:14, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,59,48,.12)', color:'#FF7B7B', fontWeight:900, cursor:'pointer' }}>Logout</button>
      </div>
    </div>
  );
}

function RegionArt({ src, fallbackColors = ['#2B5D58','#4F8B78','#203A3B'], grayscale=false, height=128 }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return <img src={src} alt="" onError={()=>setErr(true)} style={{ width:'100%', height, objectFit:'cover', filter:grayscale?'grayscale(1) saturate(.1)':'none', display:'block' }} />;
  }
  return <div style={{ width:'100%', height, background:`linear-gradient(125deg, ${fallbackColors[0]}, ${fallbackColors[1]} 55%, ${fallbackColors[2]})`, filter:grayscale?'grayscale(1)':'none' }} />;
}

function AwardToast({ award }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div style={{ position:'absolute', top:18, left:12, right:12, zIndex:200, display:'flex', justifyContent:'center', pointerEvents:'none' }}>
      <div className="award-toast-sparkles" style={{ position:'relative', width:'100%', maxWidth:360, background:'rgba(18,18,22,.96)', border:'1px solid rgba(255,255,255,.12)', borderRadius:22, padding:'14px 16px', boxShadow:'0 16px 40px rgba(0,0,0,.38)', display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:64, height:64, borderRadius:16, background:'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
          {!imgErr ? <img src={award.image} alt={award.name} onError={()=>setImgErr(true)} style={{ width:56, height:56, objectFit:'contain' }} /> : <span style={{ fontSize:34 }}>🏅</span>}
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ color:'#F0C449', fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:.7 }}>Nuovo award sbloccato</div>
          <div style={{ color:'white', fontSize:16, fontWeight:900, lineHeight:1.2, marginTop:3 }}>{award.name}</div>
          <div style={{ color:'rgba(255,255,255,.55)', fontSize:11, marginTop:4 }}>{award.macro} · {award.goal}</div>
        </div>
      </div>
    </div>
  );
}


function AuthScreen({ onAuthReady }) {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [mode,setMode]=useState('login');
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState('');

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
    <div style={{ height:'100vh', maxWidth:480, margin:'0 auto', background:'#111113', color:'white', fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif", display:'flex', alignItems:'center', justifyContent:'center', padding:22, boxSizing:'border-box' }}>
      <form onSubmit={submit} style={{ width:'100%', background:'linear-gradient(180deg,#222226,#161618)', border:'1px solid rgba(255,255,255,.10)', borderRadius:28, padding:24, boxShadow:'0 28px 80px rgba(0,0,0,.45)' }}>
        <div style={{ color:'#90D84A', fontSize:13, fontWeight:900, textTransform:'uppercase', letterSpacing:.9 }}>Animaldex</div>
        <h1 style={{ margin:'8px 0 6px', fontSize:30, lineHeight:1.05 }}>Accedi</h1>
        <p style={{ margin:'0 0 18px', color:'rgba(255,255,255,.58)', fontSize:13, lineHeight:1.45 }}>Login richiesto per sincronizzare animali, destinazioni, status e badge con Supabase.</p>
        <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{ width:'100%', height:46, borderRadius:14, border:'1px solid rgba(255,255,255,.12)', background:'#2B2B30', color:'white', padding:'0 14px', fontSize:14, boxSizing:'border-box', marginBottom:10 }} />
        <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={{ width:'100%', height:46, borderRadius:14, border:'1px solid rgba(255,255,255,.12)', background:'#2B2B30', color:'white', padding:'0 14px', fontSize:14, boxSizing:'border-box', marginBottom:14 }} />
        <button disabled={loading} type="submit" style={{ width:'100%', height:48, borderRadius:15, border:'none', background:'#90D84A', color:'#101410', fontWeight:900, fontSize:15, cursor:loading?'default':'pointer', opacity:loading?.7:1 }}>{loading ? 'Attendi...' : mode === 'signup' ? 'Crea account' : 'Login'}</button>
        <button type="button" onClick={()=>setMode(mode==='signup'?'login':'signup')} style={{ width:'100%', height:42, marginTop:10, borderRadius:13, border:'1px solid rgba(255,255,255,.10)', background:'transparent', color:'rgba(255,255,255,.78)', fontWeight:800, cursor:'pointer' }}>{mode === 'signup' ? 'Ho già un account' : 'Crea nuovo account'}</button>
        {message && <div style={{ marginTop:14, color:message.toLowerCase().includes('erro')?'#FF7777':'#BFEFA4', fontSize:12, lineHeight:1.4 }}>{message}</div>}
      </form>
    </div>
  );
}

const TRIP_TAGS = ['city','nature','coast','diving','snorkeling','boat','desert','mountain'];

function MainMenu({ onOpen, onBack, onLogout }) {
  const items = [
    { id:'grid', label:'Animaldex', icon:'🦁', bg:'#2E5A10', desc:'Torna alla griglia animali' },
    { id:'profile', label:'Profilo', icon:'👤', bg:'#254A70', desc:'Statistiche giocatore' },
    { id:'badges', label:'Badge', icon:'🏅', bg:'#7A3A1B', desc:'Award e obiettivi' },
    { id:'regions', label:'Regioni', icon:'🗺️', bg:'#256344', desc:'Continenti e regioni' },
    { id:'settings', label:'Impostazioni', icon:'⚙️', bg:'#4A4A50', desc:'Preferenze app' },
    { id:'abilities', label:'Abilità', icon:'✨', bg:'#5A2E80', desc:'Catalogo abilità' },
  ];
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#111113', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'18px 12px 14px', borderBottom:'1px solid #2A2A2C', background:'#1C1C1E', flexShrink:0 }}>
        <div style={{ color:'white', fontSize:22, fontWeight:900, letterSpacing:'-.3px' }}>Menu</div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'18px 16px 24px' }}>
        <div style={{ background:'linear-gradient(135deg,#2E5A10,#1A3808)', borderRadius:22, padding:22, marginBottom:16, boxShadow:'0 18px 50px rgba(0,0,0,.32)' }}>
          <div style={{ color:'#90D84A', fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:.8, marginBottom:6 }}>Animaldex</div>
          <div style={{ color:'white', fontSize:28, fontWeight:900, letterSpacing:'-.7px' }}>Menu principale</div>
          <div style={{ color:'rgba(255,255,255,.68)', fontSize:13, lineHeight:1.6, marginTop:8 }}>Scegli una sezione per profilo, award, regioni, impostazioni o abilità.</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {items.map(item=>(
            <button key={item.id} onClick={()=>onOpen(item.id)} style={{ minHeight:138, border:'none', borderRadius:20, background:item.bg, color:'white', cursor:'pointer', padding:16, display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'space-between', textAlign:'left', boxShadow:'0 12px 34px rgba(0,0,0,.28)' }}>
              <div style={{ width:54, height:54, borderRadius:18, background:'rgba(255,255,255,.16)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>{item.icon}</div>
              <div><div style={{ fontSize:17, fontWeight:900, marginBottom:4 }}>{item.label}</div><div style={{ fontSize:11, color:'rgba(255,255,255,.66)', lineHeight:1.35 }}>{item.desc}</div></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ onBack, statusMap = {}, visitedCountries = [], onOpenGridStatus, onOpenBadges, onOpenRegions, onOpenGallery }) {
  const fileInputRef = useRef(null);
  const animalsWithStatus = ANIMALS.map(a => ({ ...a, status: normalizeAnimalStatus(statusMap[a.id] ?? a.status) }));
  const seenCount = animalsWithStatus.filter(a => a.status === 'avvistato' || a.status === 'catturato').length;
  const capturedCount = animalsWithStatus.filter(a => a.status === 'catturato').length;
  const regionsCount = new Set(animalsWithStatus.filter(a => a.status === 'avvistato' || a.status === 'catturato').flatMap(a => a.distribution?.countries_present || [])).size;
  const badgeCount = computeUnlockedAwards(statusMap, visitedCountries).length;
  const statCards = [
    { label:'Animali visti', value:seenCount, onClick:()=>onOpenGridStatus?.(['avvistato','catturato']) },
    { label:'Fotografati', value:capturedCount, onClick:onOpenGallery },
    { label:'Badge', value:badgeCount, onClick:onOpenBadges },
    { label:'Regioni', value:regionsCount, onClick:onOpenRegions },
  ];
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#1C1C1E', overflow:'hidden' }}>
      <PageHeader title="Profilo" onBack={onBack} />
      <div style={{ flex:1, overflowY:'auto', padding:18 }}>
        <div style={{ background:'linear-gradient(135deg,#102B4D 0%,#1B567B 58%,#0B1D35 100%)', borderRadius:24, padding:24, textAlign:'center', marginBottom:16, boxShadow:'0 18px 42px rgba(0,0,0,.28)', border:'1px solid rgba(255,255,255,.08)' }}>
          <button onClick={()=>fileInputRef.current?.click()} aria-label="Cambia foto profilo" style={{ width:102, height:102, borderRadius:'50%', background:'rgba(135,198,255,.18)', border:'1px solid rgba(255,255,255,.12)', color:'#9DD3FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48, margin:'0 auto 14px', cursor:'pointer', boxShadow:'inset 0 0 22px rgba(255,255,255,.06)' }}>👤</button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={()=>{}} />
          <div style={{ color:'white', fontSize:26, fontWeight:900, letterSpacing:'-.4px' }}>Esploratore</div>
          <div style={{ color:'#B9D7EF', fontSize:13, marginTop:5, fontWeight:600 }}>Profilo placeholder</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {statCards.map(card=>(<button key={card.label} onClick={card.onClick} style={{ background:'#222222', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:16, minHeight:112, textAlign:'left', cursor:'pointer', display:'flex', flexDirection:'column', justifyContent:'space-between', fontFamily:'inherit' }}><div style={{ color:'#90D84A', fontSize:28, fontWeight:900, lineHeight:1 }}>{card.value}</div><div style={{ color:'white', fontSize:13, fontWeight:900, lineHeight:1.25 }}>{card.label}</div></button>))}
        </div>
      </div>
    </div>
  );
}



function AwardCard({ rule, unlocked, onOpen }) {
  const img = buildAwardImagePath(rule.badgeId);
  return (
    <button
      onClick={()=>onOpen?.(rule)}
      style={{
        border:'none',
        borderRadius:18,
        padding:'12px 8px 10px',
        minHeight:158,
        background:unlocked ? 'linear-gradient(180deg,#464646,#272727)' : 'linear-gradient(180deg,#343436,#252527)',
        boxShadow:'0 10px 26px rgba(0,0,0,.24)',
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
      <span style={{ display:'none', alignItems:'center', justifyContent:'center', width:108, height:108, fontSize:50 }}>🏅</span>
      <div style={{ color:unlocked?'#fff':'rgba(255,255,255,.62)', fontSize:12.5, fontWeight:900, lineHeight:1.13, textAlign:'center', minHeight:30, display:'flex', alignItems:'center' }}>{rule.name}</div>
    </button>
  );
}

function AwardModal({ rule, unlocked, currentValue, onClose }) {
  if (!rule) return null;
  const img = buildAwardImagePath(rule.badgeId);
  const progress = Math.min(100, Math.round((Number(currentValue || 0) / Math.max(1, Number(rule.threshold || 1))) * 100));
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:220, display:'flex', alignItems:'center', justifyContent:'center', padding:18 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:430, borderRadius:28, background:'linear-gradient(180deg,#2D2D31,#151517)', border:'1px solid rgba(255,255,255,.12)', boxShadow:'0 30px 80px rgba(0,0,0,.55)', padding:22, textAlign:'center', animation:'tabFromRight .18s ease-out', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, width:34, height:34, borderRadius:12, border:'none', background:'rgba(255,255,255,.08)', color:'white', fontSize:20, cursor:'pointer', zIndex:2 }}>×</button>
        <div style={{ height:8 }} />
        <img src={img} alt={rule.name} onError={e=>{e.currentTarget.style.display='none'; const n=e.currentTarget.nextSibling; if(n) n.style.display='flex';}} style={{ width:266, height:266, maxWidth:'82vw', objectFit:'contain', filter:unlocked?'drop-shadow(0 12px 28px rgba(0,0,0,.45))':'grayscale(1) opacity(.78)', margin:'0 auto 8px', display:'block' }} />
        <span style={{ display:'none', alignItems:'center', justifyContent:'center', width:266, height:266, maxWidth:'82vw', fontSize:104, margin:'0 auto 8px' }}>🏅</span>
        <div style={{ color:'white', fontSize:24, fontWeight:900, lineHeight:1.1, marginTop:4 }}>{rule.name}</div>
        <div style={{ color:'rgba(255,255,255,.48)', fontSize:12, fontWeight:800, marginTop:6 }}>{rule.macro} · Livello {rule.level}</div>
        <div style={{ color:'rgba(255,255,255,.76)', fontSize:14, lineHeight:1.55, marginTop:18 }}>{getAwardDescription(rule)}</div>
        {!unlocked && (
          <div style={{ marginTop:18, background:'rgba(255,255,255,.07)', borderRadius:16, padding:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', color:'rgba(255,255,255,.68)', fontSize:12, fontWeight:800, marginBottom:8 }}>
              <span>Progresso</span><span>{Number(currentValue || 0)} / {rule.threshold}</span>
            </div>
            <div style={{ height:10, borderRadius:999, background:'rgba(0,0,0,.35)', overflow:'hidden' }}>
              <div style={{ width:`${progress}%`, height:'100%', borderRadius:999, background:'#90D84A' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BadgesPage({ onBack, statusMap = {}, visitedCountries = [] }) {
  const [macro, setMacro] = useState('Tutti');
  const [onlyUnlocked, setOnlyUnlocked] = useState(false);
  const [selectedAward, setSelectedAward] = useState(null);
  const metrics = computeAwardMetrics(statusMap, visitedCountries);
  const unlockedSet = new Set(computeUnlockedAwards(statusMap, visitedCountries).map(a => a.badgeId));
  const macros = ['Tutti', ...AWARD_MACROS];
  const awards = AWARD_RULES.filter(rule => (macro === 'Tutti' || rule.macro === macro) && (!onlyUnlocked || unlockedSet.has(rule.badgeId)));
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#2A2A2C', overflow:'hidden' }}>
      <PageHeader title="Badge" onBack={onBack} />
      <div style={{ padding:'12px 12px 8px', flexShrink:0 }}>
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:6 }}>
          {macros.map(c=><button key={c} onClick={()=>setMacro(c)} style={{ padding:'8px 14px', borderRadius:12, border:'none', background:macro===c?'#777':'#3A3A3C', color:'white', fontSize:13, fontWeight:800, whiteSpace:'nowrap', cursor:'pointer' }}>{c}</button>)}
        </div>
        <button onClick={()=>setOnlyUnlocked(v=>!v)} style={{ marginTop:8, width:'100%', height:40, borderRadius:12, background:onlyUnlocked?'rgba(144,216,74,.2)':'#3A3A3C', border:'1px solid rgba(255,255,255,.08)', color:onlyUnlocked?'#90D84A':'white', fontWeight:800, cursor:'pointer' }}>{onlyUnlocked ? 'Mostra tutti' : 'Solo sbloccati'}</button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'10px 12px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {awards.map(rule=><AwardCard key={rule.badgeId} rule={rule} unlocked={unlockedSet.has(rule.badgeId)} onOpen={setSelectedAward} />)}
        </div>
      </div>
      {selectedAward && <AwardModal rule={selectedAward} unlocked={unlockedSet.has(selectedAward.badgeId)} currentValue={metrics[selectedAward.metric]} onClose={()=>setSelectedAward(null)} />}
    </div>
  );
}




function ScratchMap({ visitedCountries, selectedCountry, onSelectCountry }) {
  const visited = visitedCountries.slice(0, 60);
  const [mapErr, setMapErr] = useState(false);
  const getPoint = (code, i) => {
    const c = String(code || '');
    const seed = [...c].reduce((n,ch)=>n+ch.charCodeAt(0),0) + i*17;
    const bands = {
      EU:[51,39], AF:[52,58], AS:[70,42], NA:[24,38], SA:[34,67], OC:[82,74], SP:[73,83]
    };
    let b = bands.EU;
    if (['US','CA','MX','GL','BM','PM'].includes(c) || ['BZ','GT','HN','SV','NI','CR','PA','CU','JM','HT','DO','PR','VI','VG','AI','AG','BL','MF','SX','KN','LC','VC','DM','GP','MQ','MS','GD','BB','TT','TC','AW','CW','BQ','BS','KY'].includes(c)) b=bands.NA;
    if (['CO','VE','EC','PE','BO','BR','GF','GY','SR','AR','CL','UY','PY','FK'].includes(c)) b=bands.SA;
    if (['MA','DZ','TN','LY','EG','EH','MR','ML','NE','TD','SD','SN','GM','GW','GN','SL','LR','CI','GH','TG','BJ','BF','NG','CV','CM','CF','GQ','GA','CG','CD','ST','AO','ET','ER','DJ','SO','KE','TZ','UG','RW','BI','SS','ZA','NA','BW','ZW','ZM','MW','MZ','SZ','LS','MG'].includes(c)) b=bands.AF;
    if (['RU','KZ','MN','TR','GE','AM','AZ','IR','IL','PS','JO','LB','SY','IQ','SA','YE','OM','AE','QA','BH','KW','UZ','TM','TJ','KG','AF','PK','IN','BD','LK','NP','BT','MV','CN','HK','MO','TW','KR','KP','JP','MM','TH','LA','KH','VN','MY','SG','ID','BN','TL','PH'].includes(c)) b=bands.AS;
    if (['AU','NF','CX','CC','NZ','PG','SB','VU','NC','FJ','FM','GU','KI','MH','MP','NR','PW','UM','AS','CK','NU','PF','PN','TK','TO','TV','WF','WS'].includes(c)) b=bands.OC;
    if (['AQ','BV','GS','HM','TF','SH'].includes(c)) b=bands.SP;
    return { x:b[0] + ((seed % 9)-4), y:b[1] + (((seed*7) % 9)-4) };
  };
  const fallbackContinents = [
    'M70,78 C92,38 150,30 174,72 C142,78 136,116 96,118 C74,112 54,98 70,78 Z',
    'M154,122 C190,122 214,156 198,202 C172,192 158,160 154,122 Z',
    'M235,82 C264,48 322,52 348,92 C324,116 284,110 252,124 C236,114 224,102 235,82 Z',
    'M294,124 C332,128 354,172 330,214 C292,204 280,162 294,124 Z',
    'M378,78 C426,38 504,52 542,100 C500,132 448,116 404,144 C372,132 360,104 378,78 Z',
    'M470,190 C506,176 552,194 566,224 C534,246 488,240 462,216 C458,204 460,196 470,190 Z'
  ];
  return (
    <div style={{ position:'relative', height:240, borderRadius:20, overflow:'hidden', background:'linear-gradient(180deg,#0E1B24,#071017)', border:'1px solid rgba(255,255,255,.09)', boxShadow:'inset 0 0 40px rgba(32,178,170,.08)', marginBottom:12 }}>
      {!mapErr ? (
        <img src="/maps/world-map.svg" alt="Mappa del mondo" onError={()=>setMapErr(true)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.72, filter:'sepia(.25) hue-rotate(110deg) saturate(.9) brightness(.62)' }} />
      ) : (
        <svg viewBox="0 0 620 260" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} preserveAspectRatio="xMidYMid slice">
          <rect x="0" y="0" width="620" height="260" fill="#0B1820" />
          <g opacity=".24">
            <path d="M0 62 C120 22 210 88 320 50 S500 38 620 82" fill="none" stroke="#72D6FF" strokeWidth="1"/>
            <path d="M0 190 C120 150 210 216 320 178 S500 166 620 210" fill="none" stroke="#72D6FF" strokeWidth="1"/>
          </g>
          <g>{fallbackContinents.map((d,i)=><path key={i} d={d} fill="#214A3D" stroke="rgba(255,255,255,.16)" strokeWidth="1.5" />)}</g>
        </svg>
      )}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 50% 50%, transparent, rgba(0,0,0,.42))' }} />
      <div style={{ position:'absolute', left:14, top:12, color:'rgba(255,255,255,.84)', fontSize:12, fontWeight:900 }}>Mappa nazioni visitate</div>
      {visited.length === 0 && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.42)', fontSize:13, fontWeight:700, textAlign:'center', padding:24 }}>Aggiungi una nazione visitata per evidenziarla sulla mappa.</div>}
      {visited.map((code,i)=>{
        const p = getPoint(code,i);
        const active = selectedCountry === code;
        return (
          <button key={code} onClick={()=>onSelectCountry(code)} title={getCountryDisplayName(code)} style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, transform:'translate(-50%,-50%)', width:active?28:22, height:active?28:22, borderRadius:'50%', border:`2px solid ${active?'#90D84A':'rgba(255,255,255,.78)'}`, background:active?'rgba(144,216,74,.78)':'rgba(240,196,73,.86)', color:'white', cursor:'pointer', boxShadow:active?'0 0 16px rgba(144,216,74,.7)':'0 4px 12px rgba(0,0,0,.34)' }} />
        );
      })}
    </div>
  );
}


function VisitedCountryCard({ code, onOpenAnimals, onRemove }) {
  const [flipped, setFlipped] = useState(false);
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
          <div style={{ color:'#90D84A', fontSize:22, fontWeight:900, minWidth:34, textAlign:'center' }}>{count}</div>
          <div style={{ color:'rgba(255,255,255,.65)', fontSize:11, fontWeight:700, lineHeight:1.2, flex:1 }}>animali associati a questa nazione</div>
          <button onClick={e=>{e.stopPropagation();onOpenAnimals?.(code);}} style={{ height:34, borderRadius:10, border:'none', background:'#244A70', color:'white', fontWeight:900, fontSize:11, padding:'0 10px', cursor:'pointer' }}>Vedi animali</button>
        </div>
      </div>
    </div>
  );
}

function RegionsPage({ onBack, statusMap = {}, visitedCountries = [], onVisitedCountriesChange, onSelect, onOpenCountry, onOpenRegion, onAddDestination, destinationsLoading=false, initialView }) {
  const [view, setView] = useState(initialView || 'continents');
  const [continentId, setContinentId] = useState(null);
  const [regionId, setRegionId] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [unlockMap, setUnlockMap] = useState(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(window.localStorage.getItem('animaldex_region_unlocks') || '{}'); } catch { return {}; }
  });
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedDestinationIso, setSelectedDestinationIso] = useState('');
  const [selectedTripTags, setSelectedTripTags] = useState([]);
  const toggleTripTag = (tag) => setSelectedTripTags(prev => prev.includes(tag) ? prev.filter(t=>t!==tag) : [...prev, tag]);
  const submitDestination = async () => {
    if (!selectedDestinationIso) return;
    await onAddDestination?.(selectedDestinationIso, selectedTripTags);
    setSelectedCountry(selectedDestinationIso);
    setSelectedTripTags([]);
  };
  useEffect(() => { if (initialView) setView(initialView); }, [initialView]);
  useEffect(() => { if (typeof window !== 'undefined') window.localStorage.setItem('animaldex_region_unlocks', JSON.stringify(unlockMap)); }, [unlockMap]);
  const continent = GEO_REGION_GROUPS.find(c => c.id === continentId) || null;
  const region = GEO_REGION_BY_ID[regionId] || null;
  const scratchCountries = getAllScratchCountries().filter(code => !countrySearch.trim() || getCountryDisplayName(code).toLowerCase().includes(countrySearch.toLowerCase()) || code.toLowerCase().includes(countrySearch.toLowerCase()));
  const visitedSet = new Set(visitedCountries);
  const toggleVisitedCountry = (code) => {
    const next = new Set(visitedCountries);
    if (next.has(code)) next.delete(code); else next.add(code);
    const list = Array.from(next).sort();
    saveVisitedCountries(list);
    onVisitedCountriesChange?.(list);
    setSelectedCountry(code);
  };
  const removeVisitedCountry = (code) => {
    const list = visitedCountries.filter(c => c !== code);
    saveVisitedCountries(list);
    onVisitedCountriesChange?.(list);
    if (selectedCountry === code) setSelectedCountry(null);
  };
  const regionAnimals = region ? ANIMALS.map(a => ({ ...a, status: normalizeAnimalStatus(statusMap[a.id] ?? a.status) })).filter(a => (a.distribution?.countries_present || []).some(code => region.iso.includes(code))) : [];
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#050505', overflow:'hidden' }}>
      <PageHeader title={view==='countries' ? 'Scratch map' : view==='continents' ? 'Regioni' : view==='regions' ? (continent?.label || 'Continente') : (region?.label || 'Regione')} onBack={()=>{ if (view==='continents') onBack(); else if (view==='regions') setView('continents'); else if (view==='countries') setView('continents'); else setView('regions'); }} />
      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px 28px' }}>
        {view==='continents' && (
          <button onClick={()=>setView('countries')} style={{ width:'100%', border:'1px solid rgba(144,216,74,.28)', borderRadius:18, background:'linear-gradient(135deg,rgba(144,216,74,.18),rgba(32,178,170,.12))', padding:16, marginBottom:14, color:'white', textAlign:'left', cursor:'pointer', fontFamily:'inherit' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:52, height:52, borderRadius:16, background:'rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🗺️</div>
              <div style={{ flex:1 }}><div style={{ fontSize:18, fontWeight:900 }}>Scratch map nazioni visitate</div><div style={{ color:'rgba(255,255,255,.58)', fontSize:12, marginTop:4 }}>Conta per gli award Geografia.</div></div>
              <div style={{ color:'#90D84A', fontSize:20, fontWeight:900 }}>{visitedCountries.length}</div>
            </div>
          </button>
        )}
        {view==='continents' && GEO_REGION_GROUPS.map(group=>(
          <button key={group.id} onClick={()=>{ setContinentId(group.id); setView('regions'); }} style={{ width:'100%', marginBottom:14, border:'none', borderRadius:14, padding:0, overflow:'hidden', background:'#1A1A1C', cursor:'pointer', textAlign:'left' }}>
            <RegionArt src={group.image} fallbackColors={['#245B58','#4A8F7D','#25474A']} height={118} />
            <div style={{ padding:'10px 12px' }}><div style={{ color:'white', fontSize:18, fontWeight:900 }}>{group.label}</div><div style={{ color:'rgba(255,255,255,.45)', fontSize:11, marginTop:4 }}>{group.regions.length} regioni</div></div>
          </button>
        ))}
        {view==='countries' && (
          <div>
            <ScratchMap visitedCountries={visitedCountries} selectedCountry={selectedCountry} onSelectCountry={setSelectedCountry} />
            {selectedCountry && (
              <div style={{ background:'#151517', border:'1px solid rgba(144,216,74,.28)', borderRadius:16, padding:14, marginBottom:12, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:28 }}>{getFlagEmoji(selectedCountry)}</span>
                <div style={{ flex:1 }}><div style={{ color:'white', fontSize:16, fontWeight:900 }}>{getCountryDisplayName(selectedCountry)}</div><div style={{ color:'rgba(255,255,255,.48)', fontSize:11, marginTop:3 }}>{countAnimalsForGeoValue(selectedCountry)} animali collegati</div></div>
                <button onClick={()=>onOpenCountry?.(selectedCountry)} style={{ height:38, borderRadius:10, border:'none', background:'#244A70', color:'white', fontWeight:900, padding:'0 12px', cursor:'pointer' }}>Vedi animali</button>
              </div>
            )}
            <div style={{ color:'white', fontSize:18, fontWeight:900, margin:'16px 0 10px' }}>Nazioni visitate</div>
            {visitedCountries.length === 0 ? <div style={{ color:'rgba(255,255,255,.42)', fontSize:13, padding:'16px 6px', marginBottom:12 }}>Nessuna nazione visitata aggiunta.</div> : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>{visitedCountries.map(code=><VisitedCountryCard key={code} code={code} onOpenAnimals={onOpenCountry} onRemove={removeVisitedCountry}/>)}</div>}
            <div style={{ background:'#151517', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:14, marginBottom:12 }}>
              <div style={{ color:'white', fontSize:18, fontWeight:900 }}>Aggiungi nazioni visitate</div>
              <input value={countrySearch} onChange={e=>setCountrySearch(e.target.value)} placeholder="Cerca nazione..." style={{ marginTop:12, width:'100%', height:42, borderRadius:12, background:'#252527', color:'white', border:'1px solid rgba(255,255,255,.12)', padding:'0 12px', fontSize:14, outline:'none', boxSizing:'border-box' }} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, maxHeight:230, overflowY:'auto', marginTop:10, paddingRight:2 }}>
                {scratchCountries.map(code => {
                  const active = visitedSet.has(code) || selectedDestinationIso === code;
                  return <button key={code} onClick={()=>setSelectedDestinationIso(code)} style={{ minHeight:44, borderRadius:12, border:`1px solid ${active?'rgba(144,216,74,.65)':'rgba(255,255,255,.08)'}`, background:active?'rgba(144,216,74,.18)':'#1A1A1C', color:active?'#D8FFC4':'white', padding:'8px 10px', display:'flex', alignItems:'center', gap:8, cursor:'pointer', textAlign:'left', fontFamily:'inherit' }}><span style={{ fontSize:20 }}>{getFlagEmoji(code)}</span><span style={{ flex:1, fontSize:11.5, fontWeight:800, lineHeight:1.15 }}>{getCountryDisplayName(code)}</span><span style={{ color:active?'#90D84A':'rgba(255,255,255,.22)', fontSize:15 }}>{active?'✓':'+'}</span></button>;
                })}
              </div>
              <div style={{ marginTop:12, display:'flex', flexWrap:'wrap', gap:7 }}>
                {TRIP_TAGS.map(tag=>(
                  <button key={tag} onClick={()=>toggleTripTag(tag)} style={{ border:'none', borderRadius:999, padding:'7px 10px', background:selectedTripTags.includes(tag)?'rgba(144,216,74,.24)':'rgba(255,255,255,.08)', color:selectedTripTags.includes(tag)?'#BFEFA4':'rgba(255,255,255,.68)', fontSize:11, fontWeight:800, cursor:'pointer' }}>{tag}</button>
                ))}
              </div>
              <button disabled={!selectedDestinationIso || destinationsLoading} onClick={submitDestination} style={{ marginTop:12, width:'100%', height:42, borderRadius:13, border:'none', background:selectedDestinationIso?'#90D84A':'#3A3A3C', color:selectedDestinationIso?'#111':'rgba(255,255,255,.38)', fontWeight:900, cursor:selectedDestinationIso?'pointer':'default' }}>{destinationsLoading ? 'Sblocco animali...' : selectedDestinationIso ? `Aggiungi ${getCountryDisplayName(selectedDestinationIso)}` : 'Seleziona una nazione'}</button>
            </div>
          </div>
        )}
        {view==='regions' && continent && continent.regions.map(reg=>(
          <div key={reg.id} style={{ marginBottom:14, borderRadius:14, overflow:'hidden', background:'#1A1A1C', border:'1px solid rgba(255,255,255,.08)' }}>
            <RegionArt src={reg.image} grayscale={!unlockMap[reg.id]} fallbackColors={['#4B5A62','#7E8B93','#39464D']} height={120} />
            <div style={{ padding:'10px 12px', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ flex:1, minWidth:0 }}><div style={{ color:'white', fontSize:17, fontWeight:900 }}>{reg.label}</div></div>
              {!unlockMap[reg.id] ? <button onClick={()=>setUnlockMap(prev=>({ ...prev, [reg.id]: true }))} style={{ height:38, padding:'0 12px', borderRadius:10, border:'none', background:'#90D84A', color:'#111', fontWeight:900, cursor:'pointer' }}>Sblocca regione</button> : <button onClick={()=>onOpenRegion?.(`region:${reg.id}`, reg.label)} style={{ height:38, padding:'0 12px', borderRadius:10, border:'none', background:'#244A70', color:'white', fontWeight:900, cursor:'pointer' }}>Vedi animali</button>}
            </div>
          </div>
        ))}
        {view==='animals' && region && (
          <><div style={{ color:'rgba(255,255,255,.58)', fontSize:12, marginBottom:12 }}>Animali presenti nella regione sbloccata.</div><div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>{regionAnimals.map(a => <AnimalCard key={a.id} a={a} onClick={onSelect} />)}</div></>
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

function SettingsSubPage({ title, onBack, children }) {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#1C1C1E', overflow:'hidden' }}>
      <PageHeader title={title} onBack={onBack} />
      <div style={{ flex:1, overflowY:'auto', padding:16 }}>{children}</div>
    </div>
  );
}


function GalleryPage({ onBack, statusMap = {}, onSelect }) {
  const captured = ANIMALS.map(a => ({ ...a, status: normalizeAnimalStatus(statusMap[a.id] ?? a.status) })).filter(a => a.status === 'catturato');
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#111113', overflow:'hidden' }}>
      <PageHeader title="Galleria" onBack={onBack} />
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

function SettingsPage({ onBack }) {
  const [sub, setSub] = useState(null);
  if (sub === 'audio') return (
    <SettingsSubPage title="Audio" onBack={()=>setSub(null)}>
      <ToggleRow label="Suoni interfaccia" />
      <ToggleRow label="Versi degli animali" />
      <ToggleRow label="Notifiche push eventi" />
    </SettingsSubPage>
  );
  if (sub === 'theme') return (
    <SettingsSubPage title="Tema" onBack={()=>setSub(null)}>
      {['Scuro','Chiaro','Sistema','Modalità daltonismo'].map((t,i)=><button key={t} style={{ width:'100%', background:'#222222', border:`1px solid ${i===0?'#90D84A':'rgba(255,255,255,.06)'}`, borderRadius:12, padding:16, marginBottom:10, color:'white', textAlign:'left', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>{i===0?'●':'○'} {t}</button>)}
    </SettingsSubPage>
  );
  if (sub === 'data') return (
    <SettingsSubPage title="Dati" onBack={()=>setSub(null)}>
      {['Sincronizza ora sul Cloud','Esporta dati Animaldex','Spazio foto: placeholder'].map(t=><button key={t} style={{ width:'100%', background:'#222222', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:16, marginBottom:10, color:'white', textAlign:'left', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>{t}</button>)}
    </SettingsSubPage>
  );
  if (sub === 'privacy') return (
    <SettingsSubPage title="Privacy" onBack={()=>setSub(null)}>
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
      <PageHeader title="Impostazioni" onBack={onBack} />
      <div style={{ flex:1, overflowY:'auto', padding:16 }}>
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



function AbilityCard({ meta, onOpen }) {
  const badgeUrl=`/badges/${meta.id.toLowerCase()}.png`;
  return (
    <button
      className="interactive-hint"
      onClick={()=>onOpen?.(meta)}
      style={{ minHeight:116, borderRadius:18, background:'rgba(255,255,255,.05)', border:`1px solid ${meta.color}33`, cursor:'pointer', marginBottom:10, padding:14, display:'flex', alignItems:'center', gap:16, width:'100%', textAlign:'left', fontFamily:'inherit', color:'white', overflow:'hidden' }}
    >
      <img src={badgeUrl} alt={meta.label} onError={e=>{e.currentTarget.style.display='none'; const n=e.currentTarget.nextSibling; if(n) n.style.display='flex';}} style={{ width:96, height:96, objectFit:'contain', flexShrink:0, filter:`drop-shadow(0 0 18px ${meta.color}44)` }} />
      <span style={{ display:'none', alignItems:'center', justifyContent:'center', width:96, height:96, fontSize:50, flexShrink:0 }}>{meta.icon}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:'white', fontSize:17, fontWeight:900, lineHeight:1.18 }}>{meta.label}</div>
        <div style={{ color:'rgba(255,255,255,.62)', fontSize:12.5, lineHeight:1.4, marginTop:7 }}>{meta.description}</div>
      </div>
    </button>
  );
}

function AbilityModal({ meta, onClose, onOpenAnimals }) {
  if (!meta) return null;
  const badgeUrl=`/badges/${meta.id.toLowerCase()}.png`;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:220, display:'flex', alignItems:'center', justifyContent:'center', padding:18 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:430, borderRadius:28, background:'linear-gradient(180deg,#222226,#111113)', border:`1px solid ${meta.color}55`, boxShadow:'0 30px 80px rgba(0,0,0,.55)', padding:22, textAlign:'center', animation:'tabFromRight .18s ease-out', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, width:34, height:34, borderRadius:12, border:'none', background:'rgba(255,255,255,.08)', color:'white', fontSize:20, cursor:'pointer', zIndex:2 }}>×</button>
        <div style={{ height:8 }} />
        <img src={badgeUrl} alt={meta.label} onError={e=>{e.currentTarget.style.display='none'; const n=e.currentTarget.nextSibling; if(n) n.style.display='flex';}} style={{ width:266, height:266, maxWidth:'82vw', objectFit:'contain', filter:`drop-shadow(0 12px 28px ${meta.color}44)`, margin:'0 auto 8px', display:'block' }} />
        <span style={{ display:'none', alignItems:'center', justifyContent:'center', width:266, height:266, maxWidth:'82vw', fontSize:104, margin:'0 auto 8px' }}>{meta.icon}</span>
        <div style={{ color:'white', fontSize:25, fontWeight:900, lineHeight:1.1 }}>{meta.label}</div>
        <div style={{ color:'rgba(255,255,255,.70)', fontSize:14, lineHeight:1.55, marginTop:16 }}>{meta.description}</div>
        <div style={{ marginTop:18, background:'rgba(255,255,255,.07)', borderRadius:16, padding:14 }}>
          <div style={{ color:meta.color, fontSize:28, fontWeight:900 }}>{meta.count}</div>
          <div style={{ color:'rgba(255,255,255,.55)', fontSize:12, fontWeight:800 }}>animali hanno questa abilità</div>
        </div>
        <button onClick={()=>onOpenAnimals?.(meta.id, meta.label)} style={{ marginTop:16, height:46, width:'100%', borderRadius:14, border:'none', background:'#244A70', color:'white', fontWeight:900, fontSize:14, cursor:'pointer' }}>Vedi animali</button>
      </div>
    </div>
  );
}

function AbilitiesPage({ onBack, onOpenAbility }) {
  const abilityRows = Object.entries(CATEGORY_META).map(([id, meta]) => ({ id, ...meta, description:getAbilityDescription(id, meta), count: ANIMALS.filter(a=>a.categories?.includes(id)).length }));
  const [search, setSearch] = useState('');
  const [selectedAbility, setSelectedAbility] = useState(null);
  const rows = abilityRows.filter(a => !search.trim() || a.label.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()));
  const openAnimals = (id, label) => { setSelectedAbility(null); onOpenAbility?.(id, label); };
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#111113', overflow:'hidden' }}>
      <PageHeader title="Abilità" onBack={onBack} />
      <div style={{ padding:'12px 14px', flexShrink:0 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca abilità..." style={{ width:'100%', height:44, borderRadius:12, background:'#222226', color:'white', border:'1px solid rgba(255,255,255,.1)', padding:'0 14px', fontSize:14, outline:'none', boxSizing:'border-box' }} />
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'0 14px 28px' }}>
        {rows.map(meta=><AbilityCard key={meta.id} meta={meta} onOpen={setSelectedAbility} />)}
      </div>
      {selectedAbility && <AbilityModal meta={selectedAbility} onClose={()=>setSelectedAbility(null)} onOpenAnimals={openAnimals} />}
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
  const [animalsData,setAnimalsData]=useState(() => LOCAL_ANIMALS.map(normalizeLocalAnimal));
  ANIMALS = animalsData;
  const [sel,setSel]=useState(null);
  const [statusMap,setStatusMap]=useState({});
  const [page,setPage]=useState('grid');
  const [gridPreset,setGridPreset]=useState(null);
  const [gridReturnTarget,setGridReturnTarget]=useState(null);
  const [regionsInitialView,setRegionsInitialView]=useState(null);
  const [destinationsLoading,setDestinationsLoading]=useState(false);
  const [awardQueue,setAwardQueue]=useState([]);
  const [visitedCountries,setVisitedCountries]=useState(() => getVisitedCountries());
  const unlockedAwards = useMemo(() => computeUnlockedAwards(statusMap, visitedCountries), [statusMap, visitedCountries]);
  const activeAwardToast = awardQueue[0] || null;

  useEffect(()=>{
    const l=document.createElement('link');
    l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap';
    document.head.appendChild(l);
    document.body.style.cssText='margin:0;background:#1C1C1E;overflow:hidden';
    const style=document.createElement('style');
    style.textContent = RARITY_CSS;
    document.head.appendChild(style);
    return () => { try { document.head.removeChild(l); document.head.removeChild(style); } catch {} };
  },[]);

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
      ensureUserProfile(activeUser);
      const [remoteAnimals, destinations] = await Promise.all([
        fetchAnimalsFromSupabase(activeUser.id),
        fetchUserDestinations(activeUser.id),
      ]);
      if (remoteAnimals?.length) setAnimalsData(remoteAnimals);
      const nextStatusMap = Object.fromEntries((remoteAnimals || []).map(a => [a.id, normalizeAnimalStatus(a.status)]));
      setStatusMap(nextStatusMap);
      setVisitedCountries(destinations);
      saveVisitedCountries(destinations);
    } catch (err) {
      console.warn('[Animaldex] Caricamento Supabase fallito, uso fallback locale:', err);
      setDataError(err?.message || 'Errore caricamento Supabase');
      const fallback = LOCAL_ANIMALS.map(normalizeLocalAnimal);
      setAnimalsData(fallback);
      setStatusMap(Object.fromEntries(fallback.map(a => [a.id, normalizeAnimalStatus(a.status)])));
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(()=>{
    if (user?.id) reloadSupabaseData(user);
  },[user?.id]);

  useEffect(() => {
    const saved = getAwardUnlockSet();
    const current = unlockedAwards.map(a => a.badgeId);
    const fresh = unlockedAwards.filter(a => !saved.has(a.badgeId));
    if (fresh.length) {
      setAwardQueue(prev => [...prev, ...fresh]);
      persistAwardUnlocks([...Array.from(saved), ...current]);
    }
  }, [unlockedAwards]);

  useEffect(() => {
    if (!activeAwardToast) return;
    const t = setTimeout(() => setAwardQueue(prev => prev.slice(1)), 3200);
    return () => clearTimeout(t);
  }, [activeAwardToast]);

  const handleStatusChange = async (id, status) => {
    if (!user?.id) return;
    const nextStatus = normalizeAnimalStatus(status);
    const currentAnimal = animalsData.find(a => a.id === id);
    setStatusMap(prev => ({ ...prev, [id]: nextStatus }));
    setAnimalsData(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus, userStatus: appStatusToSupabase(nextStatus) } : a));
    try {
      await saveUserAnimalStatus(user.id, currentAnimal || { id }, nextStatus);
      await reloadSupabaseData(user);
    } catch (err) {
      console.warn('[Animaldex] Salvataggio user_animals fallito:', err);
      setDataError(err?.message || 'Errore salvataggio status animale');
    }
  };

  const handleAddDestination = async (iso, tripTags = []) => {
    if (!user?.id || !iso) return;
    const cleanIso = String(iso).toUpperCase();
    setDestinationsLoading(true);
    setDataError('');
    try {
      const { error: insertError } = await supabase
        .from('user_destinations')
        .insert({
          user_id: user.id,
          iso: cleanIso,
          trip_tags: tripTags,
          visited_at: new Date().toISOString().slice(0,10),
        });
      if (insertError && insertError.code !== '23505') throw insertError;

      const { error: rpcError } = await supabase.rpc('unlock_animals_for_destination', {
        p_user_id: user.id,
        p_iso: cleanIso,
        p_trip_tags: tripTags,
      });
      if (rpcError) throw rpcError;

      const nextVisited = Array.from(new Set([...visitedCountries, cleanIso])).sort();
      setVisitedCountries(nextVisited);
      saveVisitedCountries(nextVisited);
      await reloadSupabaseData(user);
    } catch (err) {
      console.warn('[Animaldex] Aggiungi destinazione fallito:', err);
      setDataError(err?.message || 'Errore aggiunta destinazione');
    } finally {
      setDestinationsLoading(false);
    }
  };


const enriched = sel ? { ...sel, status: statusMap[sel.id] ?? sel.status } : null;
const openPage = (nextPage) => {
  setSel(null);
  setGridReturnTarget(null);
  if (nextPage !== 'regions') setRegionsInitialView(null);
  if (nextPage === 'grid') { setGridPreset(null); setPage('grid'); return; }
  setPage(nextPage || 'menu');
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

const renderDetailOverlay = () => enriched ? <div style={{ position:'absolute', inset:0, zIndex:80, background:'#1C1C1E' }}><Detail a={enriched} onBack={()=>setSel(null)} onStatusChange={handleStatusChange} onJumpToClass={jumpToClassFromDetail} statusMap={statusMap}/></div> : null;

  if (authLoading) {
    return (
      <div style={{ height:'100vh', maxWidth:480, margin:'0 auto', background:'#111113', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif" }}>
        <div style={{ color:'rgba(255,255,255,.65)', fontWeight:800 }}>Caricamento sessione...</div>
      </div>
    );
  }

  if (!user) return <AuthScreen onAuthReady={()=>supabase.auth.getSession().then(({data})=>{setSession(data.session||null);setUser(data.session?.user||null);})} />;

  const renderPage = () => {
    if (page === 'menu') return <MainMenu onOpen={openPage} onBack={()=>setPage('grid')} onLogout={()=>supabase.auth.signOut()} />;
    if (page === 'profile') return <ProfilePage onBack={()=>setPage('menu')} statusMap={statusMap} visitedCountries={visitedCountries} onOpenGridStatus={openGridWithStatus} onOpenBadges={()=>openPage('badges')} onOpenRegions={()=>openPage('regions')} onOpenGallery={()=>openPage('gallery')} />;
    if (page === 'badges') return <BadgesPage onBack={()=>setPage('menu')} statusMap={statusMap} visitedCountries={visitedCountries} />;
    if (page === 'regions') return <div style={{ height:'100%', position:'relative', overflow:'hidden' }}><RegionsPage onBack={()=>setPage('menu')} statusMap={statusMap} visitedCountries={visitedCountries} onVisitedCountriesChange={setVisitedCountries} initialView={regionsInitialView} onSelect={setSel} onOpenCountry={(code)=>openGridWithGeography(code, getCountryDisplayName(code), 'countries')} onOpenRegion={(value,label)=>openGridWithGeography(value, label, 'continents')} onAddDestination={handleAddDestination} destinationsLoading={destinationsLoading} />{renderDetailOverlay()}</div>;
    if (page === 'gallery') return <div style={{ height:'100%', position:'relative', overflow:'hidden' }}><GalleryPage onBack={()=>setPage('profile')} statusMap={statusMap} onSelect={setSel} />{renderDetailOverlay()}</div>;
    if (page === 'settings') return <SettingsPage onBack={()=>setPage('menu')} />;
    if (page === 'abilities') return <AbilitiesPage onBack={()=>setPage('menu')} onOpenAbility={openGridWithCategory} />;
    return <div style={{ height:'100%', position:'relative', overflow:'hidden' }}><Grid onSelect={setSel} statusMap={statusMap} onHome={()=>openPage('menu')} preset={gridPreset} onBackToOrigin={gridReturnTarget ? returnFromFilteredGrid : null} />{renderDetailOverlay()}</div>;
  };

  return (
    <div style={{ fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif", height:'100vh', maxWidth:480, margin:'0 auto', display:'flex', flexDirection:'column', overflow:'hidden', background:'#1C1C1E', position:'relative' }}>
      {renderPage()}
      {(dataLoading || dataError) && user && <div style={{ position:'absolute', left:12, right:12, bottom:12, zIndex:250, borderRadius:14, padding:'10px 12px', background:dataError?'rgba(255,59,48,.92)':'rgba(20,20,24,.88)', color:'white', fontSize:11, fontWeight:800, boxShadow:'0 10px 30px rgba(0,0,0,.35)' }}>{dataLoading ? 'Sincronizzazione Supabase...' : dataError}</div>}
      {activeAwardToast && <AwardToast award={activeAwardToast} />}
    </div>
  );
}
