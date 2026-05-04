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
const GRID_IMAGE_SCALE = 0.759;
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
  return {
    ...a,
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
    if (remoteIds.length) return remote;
    return {
      ...remote,
      geo:{ ...(remote.geo || {}), ...(local.geo || {}) },
      bioregions_v4: local.bioregions_v4 || [],
      map_bioregion_ids_v4: local.map_bioregion_ids_v4 || [],
      map_bioregion_domains_v4: local.map_bioregion_domains_v4 || [],
      distribution: remote.distribution?.countries_present?.length ? remote.distribution : local.distribution,
      bio_regions: remote.bio_regions?.length ? remote.bio_regions : local.bio_regions,
      game_regions: remote.game_regions?.length ? remote.game_regions : local.game_regions,
      habitats: remote.habitats?.length ? remote.habitats : local.habitats,
    };
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
      return {
        user_id: user.id,
        username,
        nickname: username,
        onboarding_completed: false,
        has_completed_tutorial: false,
        first_login_reward_shown: false,
      };
    }

    return {
      ...data,
      nickname: data.nickname || data.username || username,
      onboarding_completed: Boolean(data.onboarding_completed),
      has_completed_tutorial: Boolean(data.has_completed_tutorial),
      tutorial_completed_at: data.tutorial_completed_at || null,
      first_login_reward_shown: Boolean(data.first_login_reward_shown),
    };
  } catch (err) {
    console.warn('[Animaldex] fetchUserProfile fallback:', err);
    const username = String(user.email || 'esploratore').split('@')[0] || 'esploratore';
    return {
      user_id: user.id,
      username,
      nickname: username,
      onboarding_completed: false,
      has_completed_tutorial: false,
      first_login_reward_shown: false,
    };
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

function buildFallbackProfile(user, onboardingCompleted = true) {
  const username = String(user?.email || 'esploratore').split('@')[0] || 'esploratore';
  return {
    user_id: user?.id,
    username,
    nickname: username,
    onboarding_completed: onboardingCompleted,
    has_completed_tutorial: true,
    first_login_reward_shown: false,
  };
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

function normalizeBadgeId(id) {
  return String(id || '').trim().toUpperCase();
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
  ...MARINE_REALMS.map(region => ({ ...region, type:'marine', continentId:'marine-realms', continentLabel:'Reami marini', realmId:'marine-realms', realmLabel:'Reami marini', realmType:'marine', bioregionIds:[region.id] })),
];
const GEO_REGION_BY_ID = Object.fromEntries(GEO_REGION_MAP.map(r => [r.id, r]));
const GEO_REALM_BY_ID = new Map([
  ...BIOREGION_V4_CONTINENTS.map(r => [r.id, r]),
  ['marine-realms', { id:'marine-realms', label:'Reami marini', image:null, regions:MARINE_REALMS, realmType:'marine', bioregionIds:MARINE_REALMS.map(r=>r.id) }]
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
  { value:'realm-group:terrestrial', label:'Reami terrestri', c:'#6CE5C7', bg:'rgba(108,229,199,.14)', iso: BIOREGION_V4_CONTINENTS.flatMap(c=>c.iso || []), bioregionIds:BIOREGION_V4_ECOREGIONS.map(e=>e.id), matchLabels:['terrestrial','reami terrestri','ecoregioni terrestri'] },
  { value:'realm-group:marine', label:'Reami marini', c:'#4FB3FF', bg:'rgba(79,179,255,.14)', iso: [], bioregionIds:MARINE_REALMS.map(r=>r.id), matchLabels:['marine','reami marini'] },
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
  {badgeId:'ONB-01-L1', macroId:'ONB', macro:'Onboarding', subId:'ONB-01', sub:'Primo Viaggio', level:1, name:'Primo Viaggio', goal:'1 nazione', metric:'onboarding_first_trip', threshold:1},
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

function countryMapPoint(code) {
  const { group, index, total } = getCountryRegionGroup(code);
  const t = total > 1 ? index / (total - 1) : 0;
  const wobble = ((String(code).charCodeAt(0) || 65) % 7 - 3) * .8;
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
  return { x: lerp(x1,x2,t) + wobble, y: lerp(y1,y2, (t*1.37)%1) };
}

function CountryPresenceMap({ countryCodes = [], selectedCountry, onSelectCountry, accent='#F0C449', height=230, title='Mappa paesi' }) {
  const codes = Array.from(new Set((countryCodes || []).map(c=>String(c).toUpperCase()).filter(Boolean))).slice(0,120);
  const selected = selectedCountry || codes[0] || null;
  return (
    <div style={{ position:'relative', height, borderRadius:16, overflow:'hidden', background:'radial-gradient(circle at 50% 45%, #16364D 0%, #071521 60%, #03080E 100%)', border:'1px solid rgba(255,255,255,.08)', boxShadow:'inset 0 0 44px rgba(0,0,0,.45)' }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.72 }}>
        <path d="M10 34 C18 22 31 22 39 30 C48 24 59 25 67 34 C78 29 90 35 94 48 C85 45 79 51 70 49 C61 46 54 50 45 48 C36 46 30 51 22 47 C15 44 8 45 4 50 C4 44 6 38 10 34Z" fill="rgba(255,255,255,.10)" />
        <path d="M24 52 C33 50 43 56 42 67 C41 80 35 89 29 91 C31 79 25 72 22 64 C19 58 19 54 24 52Z" fill="rgba(255,255,255,.08)" />
        <path d="M50 45 C56 40 64 43 68 50 C72 58 69 70 62 77 C56 72 51 66 48 58 C46 53 46 48 50 45Z" fill="rgba(255,255,255,.08)" />
        <path d="M69 57 C76 56 84 61 89 70 C82 73 75 72 69 67 C66 64 65 59 69 57Z" fill="rgba(255,255,255,.09)" />
        <path d="M43 90 C55 88 67 89 78 92" stroke="rgba(255,255,255,.10)" strokeWidth="1.4" fill="none" />
      </svg>
      <div style={{ position:'absolute', left:12, top:10, color:'rgba(255,255,255,.84)', fontSize:12, fontWeight:900, pointerEvents:'none' }}>{title}</div>
      {codes.map(code => {
        const p = countryMapPoint(code);
        const active = code === selected;
        return (
          <button key={code} onClick={()=>onSelectCountry?.(code)} title={getCountryDisplayName(code)} style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, transform:'translate(-50%,-50%)', width:active?19:13, height:active?19:13, borderRadius:'50%', border:`2px solid ${active?'#fff':accent}`, background:active?accent:'rgba(255,255,255,.16)', boxShadow:active?`0 0 0 4px ${accent}33, 0 0 18px ${accent}`:`0 0 10px ${accent}88`, cursor:'pointer', padding:0 }} />
        );
      })}
      {selected && (
        <div style={{ position:'absolute', right:10, bottom:10, maxWidth:'72%', background:'rgba(0,0,0,.54)', border:'1px solid rgba(255,255,255,.10)', borderRadius:14, padding:'8px 10px', color:'white', fontSize:11, fontWeight:900, backdropFilter:'blur(6px)' }}>
          {getFlagEmoji(selected)} {getCountryDisplayName(selected)}
        </div>
      )}
    </div>
  );
}

function useAnimaldexSound(enabled = true) {
  const ctxRef = useRef(null);
  const lastRef = useRef(0);

  const play = (type='tap') => {
    if (!enabled || typeof window === 'undefined') return;
    const nowTs = Date.now();
    if (nowTs - lastRef.current < 38) return;
    lastRef.current = nowTs;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = ctxRef.current || new AC();
      ctxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume?.();
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(type==='reward' ? 0.12 : type==='capture' ? 0.09 : 0.045, now + 0.012);
      master.gain.exponentialRampToValueAtTime(0.0001, now + (type==='reward' ? 0.62 : type==='capture' ? 0.42 : 0.18));
      master.connect(ctx.destination);

      const tone = (freq, start, dur, wave='sine', gain=1, detune=0) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, now + start);
        osc.detune.setValueAtTime(detune, now + start);
        g.gain.setValueAtTime(0.0001, now + start);
        g.gain.exponentialRampToValueAtTime(0.9 * gain, now + start + 0.014);
        g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        osc.connect(g); g.connect(master);
        osc.start(now + start); osc.stop(now + start + dur + 0.03);
      };

      if (type === 'capture') {
        tone(220,0,0.10,'triangle',.75); tone(440,.045,.16,'sine',.55); tone(880,.11,.18,'sine',.28);
      } else if (type === 'map') {
        tone(146.8,0,.09,'triangle',.7); tone(293.7,.05,.13,'triangle',.36);
      } else if (type === 'reward') {
        [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,i*.075,.18,'sine',.35));
      } else if (type === 'back') {
        tone(260,0,.08,'triangle',.45); tone(180,.04,.11,'triangle',.24);
      } else {
        tone(620,0,.055,'sine',.30); tone(930,.035,.075,'sine',.16);
      }
    } catch {}
  };

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    const handler = (e) => {
      const el = e.target?.closest?.('button,[data-sound],.interactive-hint,.rarity-badge');
      if (!el) return;
      const text = String(el.textContent || '').toLowerCase();
      const sound = el.getAttribute?.('data-sound')
        || (text.includes('cattur') || text.includes('fotograf') ? 'capture'
        : text.includes('map') || text.includes('mappa') ? 'map'
        : text.includes('badge') || text.includes('award') ? 'reward'
        : text.includes('indietro') || text.includes('‹') || text.includes('×') ? 'back'
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
        <CountryPresenceMap countryCodes={countryCodes} selectedCountry={activeCountry} onSelectCountry={setSelectedCountry} accent={accentColor} height={280} title="Mappa paesi di presenza" />
      ) : (
        <div style={{ padding:12, borderBottom:'1px solid rgba(255,255,255,.1)' }}>
          <div style={{ color:'rgba(255,255,255,.5)', fontSize:11, fontWeight:700, marginBottom:8, letterSpacing:.3 }}>DISTRIBUZIONE</div>
          <span style={{ color:'rgba(255,255,255,.3)', fontSize:11 }}>Nessun paese di presenza disponibile</span>
        </div>
      )}
      <div style={{ padding:12, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ color:'rgba(255,255,255,.5)', fontSize:11, fontWeight:700, marginBottom:8, letterSpacing:.3 }}>
            PAESI DI PRESENZA
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {hasCountries && countryCodes.slice(0,14).map(code => (
              <span key={code} style={{ background:code===activeCountry?'rgba(36,74,112,.95)':'rgba(36,74,112,.52)', border:'1px solid rgba(91,184,245,.22)', color:'#DCEEFF', fontSize:10.5, fontWeight:850, padding:'5px 9px', borderRadius:9, letterSpacing:.1 }}>
                {getFlagEmoji(code)} {getCountryDisplayName(code)} {isEndemic && countryCodes.length===1 ? <strong style={{ color:'#90D84A', marginLeft:4 }}>· Endemico</strong> : null}
              </span>
            ))}
            {hasCountries && countryCodes.length > 14 && <span style={{ background:'rgba(255,255,255,.10)', color:'rgba(255,255,255,.72)', fontSize:10.5, fontWeight:800, padding:'5px 9px', borderRadius:8 }}>+{countryCodes.length-14}</span>}
            {!hasCountries && hab && hab.slice(0,6).map(h=>{
              const capitalizedH = String(h).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              return <span key={h} style={{ background:'rgba(255,255,255,.15)', color:'white', fontSize:10.5, fontWeight:700, padding:'5px 9px', borderRadius:8, letterSpacing:.1 }}>{capitalizedH}</span>;
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

function AnimalImg({ a, size=102, fontSize=52, overrideStatus, gridMode=false }) {
  const c = CLS[a.cls] || CLS.Mammalia;
  const [imgErr, setImgErr] = useState(false);
  const [mysteryErr, setMysteryErr] = useState(false);
  const status = normalizeAnimalStatus(overrideStatus !== undefined ? overrideStatus : a.status);
  const mystery = isMysteryStatus(status);

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




function AnimalCard({ a, onClick, tutorialHighlight=false, tutorialDim=false }) {
  const c = CLS[a.cls] || CLS.Mammalia;
  const status = normalizeAnimalStatus(a.status);
  const mystery = isMysteryStatus(status);
  const imageVisible = !mystery;
  // Ricercato, Avvistato e Catturato condividono la resa grafica completa in griglia.
  const found = imageVisible;
  const revealed = imageVisible;
  const unrevealed = false;
  const glowAccent = getClassGlowColor(a.cls);
  const glowShadow = found ? `0 0 16px 2px ${glowAccent}55, 0 0 4px 1px ${glowAccent}22` : 'none';
  const isNarrow = typeof window !== 'undefined' && window.innerWidth <= 390;
  const cardH = isNarrow ? 124 : 134;
  const labelH = isNarrow ? 36 : 38;
  const imageH = imageVisible ? cardH : cardH - labelH + 8;
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
        boxShadow:tutorialHighlight ? `0 0 0 3px #90D84A, 0 0 34px 8px ${glowAccent}88` : glowShadow,
        outline:tutorialHighlight ? '1px solid rgba(255,255,255,.55)' : 'none',
        zIndex:tutorialHighlight ? 180 : 1,
        opacity:tutorialDim ? .38 : 1,
        background: imageVisible ? c.img : '#27282D'
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
            background: found
              ? `linear-gradient(180deg, transparent 0%, ${c.mid}D8 26%, ${c.mid} 100%)`
              : 'linear-gradient(180deg, transparent 0%, rgba(125,132,141,.84) 34%, rgba(114,121,130,.98) 100%)',
            color: unrevealed ? '#272B32' : 'white',
            fontSize:isNarrow ? 10.5 : 11.5,
            fontWeight:900,
            textAlign:'center',
            lineHeight:'12.5px',
            textShadow: found ? '0 1px 2px rgba(0,0,0,.55)' : 'none',
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
            textOverflow:'ellipsis',
            wordBreak:'normal',
            overflowWrap:'normal',
            textWrap:'balance',
            width:'100%'
          }}>{a.com}</span></div>
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

function Grid({ onSelect, statusMap = {}, onHome, preset, onBackToOrigin, tutorialActive=false, tutorialAnimalId=null, onTutorialAnimalSelect }) {
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
  const handleCardClick = (animal) => {
    if (tutorialActive && tutorialAnimalId && animal.id !== tutorialAnimalId) return;
    onSelect?.(animal);
    if (tutorialActive && animal.id === tutorialAnimalId) onTutorialAnimalSelect?.(animal);
  };
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
        {list.length===0 ? <p style={{ color:'#555', textAlign:'center', padding:40, fontSize:14 }}>Nessun animale trovato</p> : <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:isNarrow?8:10 }}>{list.map(a=><AnimalCard key={a.id} a={a} onClick={handleCardClick} tutorialHighlight={tutorialActive && a.id === tutorialAnimalId} tutorialDim={tutorialActive && tutorialAnimalId && a.id !== tutorialAnimalId}/>)}</div>}
        <div style={{ height:6 }}/>
      </div>

      <div style={{ background:'#A84637', borderTop:'1px solid #7A3228', padding:isNarrow?'6px 10px 6px':'7px 12px 6px', flexShrink:0, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
          <button data-tour="grid-search" onClick={()=>setShowSearchBar(!showSearchBar)} aria-label="Cerca" style={{ width:buttonSize, height:buttonSize, borderRadius:14, background:'rgba(0,0,0,.10)', border:'1px solid rgba(255,255,255,.08)', color:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="21" height="21" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.7" fill="none"/><path d="M13 13L18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
          </button>
          <div style={{ flex:1, textAlign:'center', color:'rgba(255,255,255,.72)', fontSize:11, fontWeight:800, letterSpacing:'.1px' }}>{list.length} risultati</div>
          <div style={{ display:'flex', alignItems:'center', gap:isNarrow?8:10, flexShrink:0 }}>
            <button onClick={()=>{setSheet('sort');setShowMenu(false);}} aria-label="Ordina" style={{ width:buttonSize, height:buttonSize, borderRadius:14, background:'rgba(0,0,0,.10)', border:'1px solid rgba(255,255,255,.08)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white', flexShrink:0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5v14M8 19l-3-3M8 19l3-3M16 19V5M16 5l-3 3M16 5l3 3" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button data-tour="grid-filters" onClick={()=>setShowMenu(v=>!v)} aria-label="Filtra" style={{ width:buttonSize, height:buttonSize, borderRadius:14, background:'rgba(0,0,0,.10)', border:'1px solid rgba(255,255,255,.08)', color:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
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
  const [zoom, setZoom] = useState(1);
  const [lastTap, setLastTap] = useState(0);
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

  const boxStyle = visible ? {
    position:'fixed', left:0, top:0, width:'100vw', height:'100vh',
    background: bgColor || '#1a1a1c',
    transition:'all .38s cubic-bezier(.4,0,.2,1)',
    display:'flex', alignItems:'center', justifyContent:'center',
    zIndex:300, cursor:'default', overflow:'hidden',
    touchAction:'none',
  } : {
    position:'fixed',
    left: startLeft, top: startTop,
    width: startW, height: startH,
    borderRadius: 16,
    background: bgColor || '#1a1a1c',
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
        <img
          src={src}
          alt={alt}
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
function Detail({ a, onBack, onStatusChange, onJumpToClass, tutorialStep=null, captureStamp=false, onTutorialAbilityClick }) {
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
    if (tutorialStep === 'detail-stats') setStatMode('statistiche');
    if (tutorialStep === 'detail-abilities') setStatMode('abilita');
  }, [tutorialStep]);

  const scale = 1;
  const longName = String(a.com || '').length > 24;
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:`linear-gradient(180deg,${c.detailTop} 0%,${c.detailBg} 45%,#1A1A1C 85%)` }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px 11px', flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:c.accent, fontSize:15, fontWeight:700, cursor:'pointer', padding:0 }}>‹ Animaldex</button>
        <span style={{ color:'white', fontSize:longName?14:17, fontWeight:800, maxWidth:180, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', transform:longName?'scaleX(.8)':'none', transformOrigin:'center' }}>{a.com}</span>
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
              cursor: canViewImage ? 'zoom-in' : 'default',
              boxShadow: canViewImage ? `0 0 18px 3px ${c.accent}44` : 'none',
              transition: pullProgress===0 ? 'width .25s ease, height .25s ease, border-radius .25s ease' : 'none',
            }}>
            <AnimalImg a={a} size={168} fontSize={88} overrideStatus={localStatus} />
          </div>
          <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:8, justifyContent:'center' }}>
            {/* Rarità con stemma */}
            <div data-tour="animal-rarity"><RarityBadge rarity={a.rarity || 'Comune'} full style={{ fontSize:14 }} /></div>
            <div data-tour="animal-conservation" style={{ background:co.bg, borderRadius:12, padding:'9px 12px', color:co.c, fontSize:12, fontWeight:700, textAlign:'center' }}>{co.lbl} · {co.full}</div>
            <div style={{ display:'flex', justifyContent:'center', position:'relative', width:'100%' }}>
              <div data-tour="animal-status" style={{ width:'100%' }}><StatusBadge status={localStatus} accentColor={c.accent} onClick={()=>setShowStatusMenu(!showStatusMenu)}/></div>
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
          <h1 style={{ margin:0, color:'white', fontSize:longName?22:26, fontWeight:900, letterSpacing:longName?-.6:-.3, lineHeight:1.06, transform:longName?'scaleX(.8)':'none', transformOrigin:'center', maxWidth:'124%', marginLeft:longName?'-12%':0, marginRight:longName?'-12%':0 }}>{a.com}</h1>
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
                  <div data-tour="animal-stats" style={{ background:'rgba(0,0,0,.35)', borderRadius:14, padding:'14px 14px 6px' }}>
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
        <DistMap hab={a.hab} accentColor={c.accent} countriesPresent={a.distribution?.countries_present} animal={a}/>
        {/* Endemico sotto mappa */}
        {a.is_endemic && (
          <div style={{ display:'flex', gap:8, marginTop:10, marginBottom:4 }}>
            <div style={{ background:'rgba(0,0,0,.35)', borderRadius:10, padding:'8px 12px', display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:14 }}>📍</span><span style={{ color:'#90D84A', fontSize:11, fontWeight:700 }}>Endemico{a.endemic_iso?.length>0?` (${a.endemic_iso.join(', ')})`:''}</span>
            </div>
          </div>
        )}

      </div>

      {captureStamp && (
        <div style={{ position:'fixed', inset:0, zIndex:180, pointerEvents:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ transform:'rotate(-8deg)', border:'4px solid #90D84A', color:'#90D84A', borderRadius:18, padding:'18px 24px', fontSize:32, fontWeight:1000, letterSpacing:1.2, background:'rgba(0,0,0,.46)', boxShadow:'0 0 28px rgba(144,216,74,.55)' }}>CATTURATO</div>
        </div>
      )}

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
        minHeight:86,
        borderRadius:14,
        background:'rgba(0,0,0,.35)',
        overflow:'hidden',
        cursor:'pointer',
        perspective:900,
        border:`1px solid ${tutorialActive ? '#A84637' : (meta.color || accentColor)}${tutorialActive ? 'cc' : '22'}`,
        boxShadow:tutorialActive?'0 0 0 3px rgba(168,70,55,.32), 0 0 28px rgba(168,70,55,.34)':'none'
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

let BIOREGION_GEOJSON_CACHE = null;
let BIOREGION_GEOJSON_PROMISE = null;
const BIOREGION_GEOJSON_URLS = ['/geo/bioregions-v4-terrestrial-marine-kepler.geojson','/bioregions-v4-terrestrial-marine-kepler.geojson'];
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
function BioregionVectorMap({ highlightIds = [], highlightIsoCodes = [], selectedId=null, onSelect, clickable=false, height=180, accent='#90D84A', marine=false, showLabels=false }) {
  const { data, error } = useBioregionGeoJson();
  const highlightSet = new Set((highlightIds || []).map(String));
  const isoHighlightSet = new Set((highlightIsoCodes || []).map(code => String(code).toUpperCase()).filter(Boolean));
  const features = data?.features || [];
  const [hoverId, setHoverId] = useState(null);
  const relevant = features.filter(f => {
    const p = f.properties || {};
    if (marine) return p.domain === 'marine';
    return p.domain !== 'marine';
  });
  const featureIso2 = (feature) => String(feature?.properties?.countries_iso2 || '')
    .split(/[;,\s]+/)
    .map(v => v.trim().toUpperCase())
    .filter(Boolean);
  if (!data && !error) {
    return <div style={{ height, borderRadius:16, background:'linear-gradient(135deg,#0B1820,#102A35)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.42)', fontSize:11, fontWeight:800 }}>Caricamento mappa vettoriale…</div>;
  }
  if (error) {
    return <div style={{ height, borderRadius:16, background:'linear-gradient(135deg,#102A35,#0B1820)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.42)', fontSize:11, fontWeight:800, textAlign:'center', padding:18 }}>Mappa vettoriale non trovata. Inserisci il GeoJSON in public/geo.</div>;
  }
  return (
    <div style={{ position:'relative', height, borderRadius:16, overflow:'hidden', background:'radial-gradient(circle at 50% 45%,#102A35,#071017)', border:'1px solid rgba(255,255,255,.10)' }}>
      <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
        <rect width="1000" height="500" fill="#071017" />
        <g opacity=".20">
          <path d="M0 110 C160 60 250 130 390 92 S660 62 1000 132" fill="none" stroke="#72D6FF" strokeWidth="1" />
          <path d="M0 375 C150 325 320 404 498 350 S760 330 1000 400" fill="none" stroke="#72D6FF" strokeWidth="1" />
        </g>
        <g>
          {relevant.map(f => {
            const id = String(getFeatureBioregionId(f) || '');
            const isoActive = isoHighlightSet.size > 0 && featureIso2(f).some(code => isoHighlightSet.has(code));
            const active = highlightSet.has(id) || isoActive;
            const selected = selectedId === id || hoverId === id;
            const d = geometryToSvgPath(f.geometry, active ? 220 : 90);
            if (!d) return null;
            return <path key={id} d={d} onClick={clickable ? ()=>onSelect?.(id, f.properties) : undefined} onMouseEnter={()=>setHoverId(id)} onMouseLeave={()=>setHoverId(null)} style={{ cursor:clickable?'pointer':'default' }} fill={active ? accent : (marine ? 'rgba(40,110,150,.42)' : 'rgba(60,98,82,.36)')} stroke={active ? accent : 'rgba(255,255,255,.13)'} strokeWidth={active ? 1.25 : 0.45} opacity={active ? 0.92 : 0.48} />;
          })}
        </g>
      </svg>
      {showLabels && (hoverId || selectedId) && <div style={{ position:'absolute', left:10, bottom:10, right:10, padding:'8px 10px', borderRadius:12, background:'rgba(0,0,0,.58)', color:'white', fontSize:11, fontWeight:900 }}>{BIOREGION_V4_BY_ID[hoverId || selectedId]?.label || hoverId || selectedId}</div>}
    </div>
  );
}
function TerritoryCard({ item, title, subtitle, image, icon='🌍', accent='#90D84A', fallbackColors, locked=false, onUnlock, onOpen, openLabel='Apri', mapIds=[], mapDisabled=false }) {
  const [flipped, setFlipped] = useState(false);
  useAutoUnflip(flipped, setFlipped, 5000);
  const isMarine = item?.realmType === 'marine' || item?.kind === 'marine';
  const ids = mapIds?.length ? mapIds : (item?.bioregionIds || (item?.bioregionId ? [item.bioregionId] : []));
  const coverSources = getRegionCoverSources(item, image || item?.image);
  const hasIcon = !!icon;
  const handleOpen = () => {
    if (locked) return;
    onOpen?.();
  };
  return (
    <div onClick={handleOpen} style={{ marginBottom:14, borderRadius:22, minHeight:204, perspective:900, cursor:locked?'default':'pointer' }}>
      <div style={{ position:'relative', minHeight:204, transition:'transform .35s ease', transformStyle:'preserve-3d', transform:flipped?'rotateY(180deg)':'rotateY(0deg)' }}>
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', borderRadius:22, overflow:'hidden', background:'#1A1A1C', border:'1px solid rgba(255,255,255,.08)' }}>
          <RegionArt src={coverSources} grayscale={locked} fallbackColors={fallbackColors || (isMarine ? ['#0B314A','#116B89','#051B2A'] : ['#30494D','#53706D','#1C2B2E'])} height={126} />
          <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
            {hasIcon && <div style={{ width:44, height:44, borderRadius:16, background:`${accent}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{icon}</div>}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:'white', fontSize:18, fontWeight:1000, lineHeight:1.1 }}>{title || item?.label}</div>
              {subtitle && <div style={{ color:'rgba(255,255,255,.50)', fontSize:11.5, marginTop:4, lineHeight:1.25 }}>{subtitle}</div>}
            </div>
            {locked
              ? <button data-sound="map" onClick={e=>{e.stopPropagation();onUnlock?.();}} style={{ height:36, padding:'0 11px', borderRadius:12, border:'none', background:accent, color:'#071017', fontWeight:950, cursor:'pointer' }}>Sblocca</button>
              : (!mapDisabled && <button data-sound="map" onClick={e=>{e.stopPropagation();setFlipped(true);}} style={{ height:36, padding:'0 13px', borderRadius:12, border:'none', background:'#244A70', color:'white', fontWeight:950, cursor:'pointer' }}>Map</button>)}
          </div>
        </div>
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateY(180deg)', borderRadius:22, overflow:'hidden', background:'#101114', border:`1px solid ${accent}55`, padding:12, boxSizing:'border-box' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <div style={{ color:'white', fontSize:14, fontWeight:1000, lineHeight:1.1 }}>{title || item?.label}</div>
            <div style={{ color:accent, fontSize:10.5, fontWeight:900, textTransform:'uppercase' }}>mappa</div>
          </div>
          <BioregionVectorMap highlightIds={ids} marine={isMarine} accent={accent} height={118} />
          <div style={{ display:'flex', gap:8, marginTop:9 }}>
            <button data-sound="back" onClick={e=>{e.stopPropagation();setFlipped(false);}} style={{ flex:1, height:34, borderRadius:11, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.05)', color:'white', fontWeight:900 }}>Copertina</button>
            <button data-sound="tap" onClick={e=>{e.stopPropagation();setFlipped(false);onOpen?.();}} style={{ flex:1, height:34, borderRadius:11, border:'none', background:'#244A70', color:'white', fontWeight:950 }}>{openLabel}</button>
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
          <div style={{ color:'#F0C449', fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:.7 }}>Nuovo award sbloccato</div>
          <div style={{ color:'white', fontSize:16, fontWeight:900, lineHeight:1.2, marginTop:3 }}>{award.name}</div>
          <div style={{ color:'rgba(255,255,255,.55)', fontSize:11, marginTop:4 }}>{award.macro} · {award.goal}</div>
          <div style={{ color:'rgba(255,255,255,.35)', fontSize:10, marginTop:3 }}>Tocca per aprire · swipe su per chiudere</div>
        </div>
      </div>
    </div>
  );
}



function OperationalTutorialOverlay({ step, animal, onNext, onCapture, onFinish, onSkip }) {
  if (!step) return null;
  const OCHRE = '#A84637';
  const sequence = ['grid','detail-stats','detail-abilities','detail-capture','rewards','reward-modal','regions','profile'];
  const index = Math.max(0, sequence.indexOf(step));
  const pct = Math.round(((index + 1) / sequence.length) * 100);

  const copyMap = {
    grid: {
      icon:'🧭',
      title:'Terminale Animaldex',
      kicker:'Database biologico',
      body:`Questa è la griglia principale. Cerca, ordina e filtra per nome, scientifico, tassonomia, status, rarità, geografia, habitat, confidence e abilità. Il bersaglio evidenziato${animal?.com ? ` (${animal.com})` : ''} è già disponibile: aprilo per leggere la scheda.`,
      chips:['Misterioso: identità nascosta','Ricercato: PNG visibile, da trovare','Avvistato: registrato','Catturato: confermato'],
      hint:'Tocca la card evidenziata nella griglia.',
      action:null,
    },
    'detail-stats': {
      icon:'📊',
      title:'Scheda animale: dati e legenda',
      kicker:'Rarità, status e statistiche',
      body:'Qui leggi la specie in profondità. La Rarità ha quattro livelli: Comune, Non comune, Raro e Leggendario. I comuni sono la base del catalogo, i non comuni richiedono più attenzione, i rari sono bersagli di valore, i leggendari sono specie eccezionali o iconiche. Il box conservazione usa sigle IUCN come LC, NT, VU, EN, CR o DD: tocca “i” per più dettagli.',
      chips:['Statistiche: velocità, vita, forza, resistenza, agilità','Status: ricercato, avvistato, catturato','Tassonomia cliccabile dalla classe'],
      action:'Mostra abilità',
    },
    'detail-abilities': {
      icon:'✨',
      title:'Abilità dell’animale',
      kicker:'Card interattive',
      body:'Le abilità spiegano adattamenti e comportamenti: veleno, corazze, mimetismo, sensi estremi, migrazione, intelligenza, record e molto altro. Ogni card ha un retro con una curiosità che spiega perché questa specie possiede quell’abilità.',
      chips:['Tocca una card abilità','Il retro contiene la curiosità','Le abilità sono filtrabili dalla sezione Abilità'],
      hint:'Tocca una card abilità nella scheda per proseguire.',
      action:null,
    },
    'detail-capture': {
      icon:'📸',
      title:'Registrazione ufficiale',
      kicker:'Avvistato → Catturato',
      body:'Quando hai una prova reale o vuoi confermare la specie, registrala come Catturata. Questo aggiorna user_animals su Supabase, aumenta le statistiche profilo e può sbloccare nuovi award.',
      chips:['Seen = avvistato','Collected = catturato','Progressi sincronizzati'],
      action:'Registra catturato',
    },
    rewards: {
      icon:'🏅',
      title:'Sezione Rewards',
      kicker:'Award e memoria di progresso',
      body:'Ora sei nella sezione Badge. Le card reward sono interattive: aprono un dettaglio con immagine grande, descrizione e progresso. Gli award premiano tassonomia, geografia, abilità, rarità, conservazione, massa, foto e costanza.',
      chips:['Tocca un badge evidenziato','Il dettaglio mostra come ottenerlo','Le notifiche reward sono cliccabili'],
      hint:'Tocca un badge nella griglia per aprire il dettaglio.',
      action:null,
    },
    'reward-modal': {
      icon:'🔍',
      title:'Dettaglio Reward',
      kicker:'Card aperta',
      body:'Questo è il comportamento da ricordare: badge e rewards non sono solo icone, ma schede consultabili. Se non hai ancora completato un award, qui trovi il progresso attuale e la condizione richiesta.',
      chips:['Tap su reward = dettaglio','Progressi permanenti','Categorie filtrabili'],
      action:'Vai alle regioni',
    },
    regions: {
      icon:'🗺️',
      title:'Espansione territoriale',
      kicker:'Regioni e scratch map',
      body:'La sezione Regioni mostra continenti, aree geografiche e scratch map. Quando visiti una nazione o una regione, registrala: Animaldex sblocca gli animali locali come Ricercati, visibili con PNG reale e pronti da avvistare.',
      chips:['Sblocca regioni quando viaggi','Paesi visitati contano per award GEO','“Vedi animali” apre una grid già filtrata'],
      action:'Mostra profilo',
    },
    profile: {
      icon:'👤',
      title:'Profilo esploratore',
      kicker:'Archivio personale',
      body:'Il Profilo riassume il percorso: animali visti, catturati, badge ottenuti e regioni esplorate. Da qui rientri rapidamente in liste filtrate, galleria, badge e mappa.',
      chips:['Dashboard progressi','Collegamenti rapidi','Dati salvati per utente'],
      action:'Inizia spedizione',
    },
  };

  const copy = copyMap[step];
  if (!copy) return null;
  const noPrimary = step === 'grid' || step === 'detail-abilities' || step === 'rewards';
  const primary = step === 'detail-capture' ? onCapture : step === 'profile' ? onFinish : onNext;

  return (
    <div style={{ position:'absolute', inset:0, zIndex:260, pointerEvents:'none' }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 50% 28%, rgba(168,70,55,.08), rgba(0,0,0,.58) 42%, rgba(0,0,0,.72))', pointerEvents:'none' }} />
      <div style={{ position:'absolute', left:12, right:12, bottom:14, pointerEvents:'auto' }}>
        <div style={{ background:'linear-gradient(180deg,rgba(28,28,31,.98),rgba(12,12,14,.99))', border:`1px solid ${OCHRE}88`, borderRadius:28, padding:16, boxShadow:`0 24px 80px rgba(0,0,0,.62), 0 0 34px ${OCHRE}28`, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:52, height:52, borderRadius:20, background:`linear-gradient(135deg,${OCHRE},#6F2D24)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:27, boxShadow:`0 0 28px ${OCHRE}55`, flexShrink:0 }}>{copy.icon}</div>
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

          <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:12 }}>
            {copy.chips.map(chip => (
              <span key={chip} style={{ borderRadius:999, background:'rgba(168,70,55,.14)', border:`1px solid ${OCHRE}33`, color:'rgba(255,255,255,.84)', padding:'6px 9px', fontSize:10.5, fontWeight:850, lineHeight:1.1 }}>{chip}</span>
            ))}
          </div>

          {copy.hint && (
            <div style={{ marginTop:12, borderRadius:16, background:'rgba(240,168,64,.10)', border:'1px solid rgba(240,168,64,.24)', padding:'10px 11px', color:'#F0CFA5', fontSize:11.5, lineHeight:1.38, fontWeight:850 }}>
              {copy.hint}
            </div>
          )}

          <div style={{ display:'flex', gap:9, marginTop:14 }}>
            <button onClick={onSkip} style={{ height:44, padding:'0 14px', borderRadius:15, border:'1px solid rgba(255,255,255,.10)', background:'rgba(255,255,255,.04)', color:'rgba(255,255,255,.62)', fontWeight:950, cursor:'pointer', fontFamily:'inherit' }}>Salta</button>
            {!noPrimary && <button onClick={primary} style={{ flex:1, height:44, borderRadius:15, border:'none', background:`linear-gradient(135deg,${OCHRE},#C45D3F)`, color:'white', fontWeight:1000, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 12px 32px ${OCHRE}40` }}>{copy.action}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}


function OnboardingFlow({ user, animals = [], initialNickname='', onComplete, onFinish }) {
  const OCHRE = '#A84637';
  const [step,setStep]=useState('intro');
  const [nickname,setNickname]=useState(initialNickname || String(user?.email || 'esploratore').split('@')[0] || 'Esploratore');
  const [countrySearch,setCountrySearch]=useState('');
  const [selectedCountries,setSelectedCountries]=useState([]);
  const [selectedTripTags,setSelectedTripTags]=useState(['nature']);
  const [cardIndex,setCardIndex]=useState(0);
  const [seenAnimals,setSeenAnimals]=useState([]);
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState('');

  const steps = ['intro','nickname','countries','radar','review','sync','wow'];
  const stepIndex = Math.max(0, steps.indexOf(step));
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);
  const allCountries = useMemo(() => getAllScratchCountries(), []);
  const filteredCountries = allCountries.filter(code => !countrySearch.trim() || getCountryDisplayName(code).toLowerCase().includes(countrySearch.toLowerCase()) || code.toLowerCase().includes(countrySearch.toLowerCase()));

  const radarAnimals = useMemo(() => {
    if (!selectedCountries.length) return [];
    const set = new Set(selectedCountries);
    return animals
      .filter(a => {
        const iso = a.distribution?.countries_present || a.geo?.iso || a.iso || [];
        return iso.some(code => set.has(code));
      })
      .filter(a => a.image_url)
      .slice(0, 10);
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

  const toggleCountry = (code) => setSelectedCountries(prev => prev.includes(code) ? prev.filter(x=>x!==code) : [...prev, code]);
  const toggleTripTag = (tag) => setSelectedTripTags(prev => prev.includes(tag) ? prev.filter(x=>x!==tag) : [...prev, tag]);

  const markRadar = (seen) => {
    if (seen && currentAnimal) setSeenAnimals(prev => Array.from(new Set([...prev, currentAnimal.id])));
    setCardIndex(i => i + 1);
  };

  const runSync = async () => {
    setLoading(true);
    setError('');
    setStep('sync');
    const payload = { nickname, countries:selectedCountries, seenAnimalIds:seenAnimals, tripTags:selectedTripTags };
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
      setError(err?.message || 'Sincronizzazione non completata. Puoi riprovare o continuare: Animaldex tenterà di salvare in background.');
      setResult({ ok:false, unlocked_count:Math.max(predictedUnlocks, selectedCountries.length), seen_count:seenAnimals.length, badge_ids:['ONB-01-L1'] });
      setStep('review');
    } finally {
      setLoading(false);
    }
  };

  const panel = { margin:16, borderRadius:30, background:'linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.035))', border:'1px solid rgba(255,255,255,.10)', padding:18, boxShadow:'0 28px 80px rgba(0,0,0,.46)' };
  const primaryButton = { width:'100%', minHeight:50, borderRadius:18, border:'none', background:`linear-gradient(135deg,${OCHRE},#C45D3F)`, color:'white', fontWeight:1000, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 14px 34px ${OCHRE}38` };
  const disabledButton = { ...primaryButton, background:'#3A3A3C', color:'rgba(255,255,255,.42)', boxShadow:'none', cursor:'default' };
  const Pill = ({ children, active=false, onClick }) => <button onClick={onClick} style={{ borderRadius:999, border:`1px solid ${active?OCHRE:'rgba(255,255,255,.10)'}`, background:active?`rgba(168,70,55,.22)`:'rgba(255,255,255,.055)', color:active?'#FFD4C8':'rgba(255,255,255,.74)', padding:'8px 11px', fontSize:11.5, fontWeight:900, cursor:'pointer', fontFamily:'inherit' }}>{children}</button>;

  return (
    <div style={{ height:'100%', background:`radial-gradient(circle at 50% 0%, ${OCHRE}2A, transparent 36%), linear-gradient(180deg,#111113,#050506)`, color:'white', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'20px 18px 8px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div>
            <div style={{ color:OCHRE, fontSize:11, fontWeight:1000, letterSpacing:.9, textTransform:'uppercase' }}>Avvio sistema</div>
            <div style={{ color:'white', fontSize:28, fontWeight:1000, letterSpacing:'-.8px', marginTop:3 }}>
              {step==='intro'?'Benvenuto esploratore':step==='nickname'?'Nome in codice':step==='countries'?'Terre esplorate':step==='radar'?'Radar avvistamenti':step==='review'?'Riepilogo missione':step==='sync'?'Sincronizzazione':'Sistema online'}
            </div>
          </div>
          <div style={{ width:54, height:54, borderRadius:20, background:`linear-gradient(135deg,${OCHRE},#6F2D24)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:`0 0 32px ${OCHRE}44` }}>🧬</div>
        </div>
        <div style={{ height:8, background:'rgba(255,255,255,.08)', borderRadius:999, overflow:'hidden', marginTop:14 }}>
          <div style={{ width:`${progress}%`, height:'100%', background:`linear-gradient(90deg,${OCHRE},#F0A840)`, borderRadius:999, transition:'width .28s ease' }} />
        </div>
      </div>

      {step==='intro' && (
        <div style={{ ...panel, flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:48, marginBottom:12 }}>🛰️</div>
            <div style={{ color:'white', fontSize:22, fontWeight:1000, letterSpacing:'-.4px', lineHeight:1.1 }}>Il tuo Animaldex parte già con progressi reali.</div>
            <p style={{ color:'rgba(255,255,255,.68)', fontSize:13.5, lineHeight:1.6 }}>In pochi passaggi registriamo nickname, nazioni visitate e primi avvistamenti. Una sola sincronizzazione batch sbloccherà animali locali, status iniziali e primo reward.</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:14 }}>
              {[
                ['🗺️','Regioni','le nazioni sbloccano animali locali'],
                ['🎯','Ricercati','PNG visibile, ancora da trovare'],
                ['✨','Abilità','adattamenti e curiosità filtrabili'],
                ['🏅','Rewards','badge permanenti sul profilo'],
              ].map(([ic,t,d])=>(
                <div key={t} style={{ borderRadius:20, background:'rgba(255,255,255,.055)', border:'1px solid rgba(255,255,255,.08)', padding:12 }}>
                  <div style={{ fontSize:24 }}>{ic}</div><div style={{ fontWeight:1000, fontSize:13, marginTop:5 }}>{t}</div><div style={{ color:'rgba(255,255,255,.50)', fontSize:10.5, lineHeight:1.3, marginTop:3 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={()=>setStep('nickname')} style={primaryButton}>Inizia configurazione</button>
        </div>
      )}

      {step==='nickname' && (
        <div style={panel}>
          <p style={{ color:'rgba(255,255,255,.66)', fontSize:13.5, lineHeight:1.6, marginTop:0 }}>Scegli un nickname. Verrà salvato nel profilo e usato come identità esploratore.</p>
          <input value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="Es. Lynx-7" style={{ width:'100%', height:52, borderRadius:18, background:'#202024', border:`1px solid ${OCHRE}55`, color:'white', padding:'0 15px', fontSize:15, boxSizing:'border-box', outline:'none', fontFamily:'inherit' }} />
          <button disabled={!nickname.trim()} onClick={()=>setStep('countries')} style={{ ...(nickname.trim()?primaryButton:disabledButton), marginTop:16 }}>Continua</button>
        </div>
      )}

      {step==='countries' && (
        <div style={{ ...panel, flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
          <p style={{ color:'rgba(255,255,255,.66)', fontSize:13.5, lineHeight:1.55, marginTop:0 }}>Seleziona le nazioni in cui sei stato. Non scriviamo ancora nulla: restano in memoria fino alla sincronizzazione finale.</p>
          <input value={countrySearch} onChange={e=>setCountrySearch(e.target.value)} placeholder="Cerca nazione o ISO..." style={{ width:'100%', height:44, borderRadius:16, background:'#202024', border:'1px solid rgba(255,255,255,.12)', color:'white', padding:'0 13px', fontSize:14, boxSizing:'border-box', outline:'none', marginBottom:10, fontFamily:'inherit' }} />
          <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:10 }}>
            {TRIP_TAGS.map(tag=><Pill key={tag} active={selectedTripTags.includes(tag)} onClick={()=>toggleTripTag(tag)}>{tag}</Pill>)}
          </div>
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
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:12 }}>
            <div style={{ borderRadius:18, background:'rgba(255,255,255,.055)', padding:12 }}><div style={{ color:OCHRE, fontWeight:1000, fontSize:18 }}>{selectedCountries.length}</div><div style={{ color:'rgba(255,255,255,.55)', fontSize:11 }}>nazioni</div></div>
            <div style={{ borderRadius:18, background:'rgba(255,255,255,.055)', padding:12 }}><div style={{ color:OCHRE, fontWeight:1000, fontSize:18 }}>{predictedUnlocks}</div><div style={{ color:'rgba(255,255,255,.55)', fontSize:11 }}>animali potenziali</div></div>
          </div>
          <button disabled={!selectedCountries.length} onClick={()=>{ setCardIndex(0); setStep('radar'); }} style={{ ...(selectedCountries.length?primaryButton:disabledButton), marginTop:12 }}>Apri radar</button>
        </div>
      )}

      {step==='radar' && (
        <div style={{ ...panel, flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <p style={{ color:'rgba(255,255,255,.66)', fontSize:13.5, lineHeight:1.45, margin:0 }}>Hai già incrociato alcune specie?</p>
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
                <AnimalImg a={{...currentAnimal, status:'ricercato'}} size={230} fontSize={82} overrideStatus="ricercato" />
                <div style={{ padding:15, textAlign:'center' }}>
                  <div style={{ color:'white', fontSize:19, fontWeight:1000, lineHeight:1.12 }}>{currentAnimal.com}</div>
                  <div style={{ color:'rgba(255,255,255,.45)', fontSize:12, marginTop:5, fontStyle:'italic' }}>{currentAnimal.sci}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:12, marginTop:18, width:'100%' }}>
                <button onClick={()=>markRadar(false)} style={{ flex:1, height:50, borderRadius:17, border:'1px solid rgba(255,255,255,.12)', background:'#2A2A2C', color:'rgba(255,255,255,.72)', fontWeight:1000, cursor:'pointer', fontFamily:'inherit' }}>Mai visto</button>
                <button onClick={()=>markRadar(true)} style={{ flex:1, height:50, borderRadius:17, border:'none', background:`linear-gradient(135deg,${OCHRE},#C45D3F)`, color:'white', fontWeight:1000, cursor:'pointer', fontFamily:'inherit' }}>Visto</button>
              </div>
            </div>
          )}
          <button onClick={()=>setStep('review')} style={{ ...primaryButton, marginTop:14 }}>Vai al riepilogo</button>
        </div>
      )}

      {step==='review' && (
        <div style={{ ...panel, flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div style={{ color:'white', fontSize:21, fontWeight:1000, lineHeight:1.12 }}>Pacchetto iniziale pronto</div>
            <p style={{ color:'rgba(255,255,255,.66)', fontSize:13.5, lineHeight:1.6 }}>Ora una singola RPC batch sincronizza nazioni, animali ricercati, avvistamenti e primo award. Se la rete rallenta, l’app non resta bloccata.</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:12 }}>
              {[
                ['🗺️', selectedCountries.length, 'nazioni visitate'],
                ['🎯', predictedUnlocks, 'ricercati potenziali'],
                ['👁️', seenAnimals.length, 'avvistati radar'],
                ['🏅', 1, 'award iniziale'],
              ].map(([ic,n,l])=>(
                <div key={l} style={{ borderRadius:22, background:'rgba(255,255,255,.055)', border:'1px solid rgba(255,255,255,.08)', padding:13 }}>
                  <div style={{ fontSize:24 }}>{ic}</div><div style={{ color:OCHRE, fontSize:24, fontWeight:1000, marginTop:4 }}>{n}</div><div style={{ color:'rgba(255,255,255,.55)', fontSize:11, lineHeight:1.2 }}>{l}</div>
                </div>
              ))}
            </div>
            {error && <div style={{ marginTop:12, borderRadius:16, background:'rgba(255,70,70,.12)', border:'1px solid rgba(255,70,70,.22)', color:'#FF9A9A', padding:12, fontSize:12, lineHeight:1.45 }}>{error}</div>}
          </div>
          <div style={{ display:'grid', gap:9 }}>
            <button onClick={runSync} disabled={loading || !selectedCountries.length} style={selectedCountries.length && !loading ? primaryButton : disabledButton}>{loading?'Sincronizzazione...':'Sincronizza e sblocca'}</button>
            {error && <button onClick={()=>{ setError(''); onFinish?.({ skipReload:true }); }} style={{ minHeight:46, borderRadius:16, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.06)', color:'white', fontWeight:950, cursor:'pointer', fontFamily:'inherit' }}>Continua comunque</button>}
          </div>
        </div>
      )}

      {step==='sync' && (
        <div style={{ ...panel, flex:1, display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
          <div>
            <div style={{ width:98, height:98, borderRadius:'50%', margin:'0 auto 18px', background:`conic-gradient(from 90deg,${OCHRE},#F0A840,#8f34f5,${OCHRE})`, boxShadow:`0 0 46px ${OCHRE}50`, animation:'interactiveWiggle .7s ease-in-out infinite' }} />
            <div style={{ color:'white', fontSize:19, fontWeight:1000 }}>Sincronizzazione database biologico</div>
            <div style={{ color:'rgba(255,255,255,.55)', fontSize:12.5, marginTop:8, lineHeight:1.45 }}>RPC batch in corso: destinazioni, animali ricercati, avvistamenti, rewards.</div>
          </div>
        </div>
      )}

      {step==='wow' && (
        <div style={{ ...panel, flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', textAlign:'center' }}>
          <div>
            <div style={{ fontSize:64, marginBottom:12 }}>🏅</div>
            <div style={{ color:'#F0C449', fontSize:13, fontWeight:1000, textTransform:'uppercase', letterSpacing:.8 }}>Primo viaggio registrato</div>
            <div style={{ color:'white', fontSize:42, fontWeight:1000, marginTop:8 }}>{result?.unlocked_count ?? predictedUnlocks}</div>
            <div style={{ color:'rgba(255,255,255,.64)', fontSize:13, marginTop:4 }}>animali ricercati o avvistati caricati nel tuo Animaldex</div>
            <div style={{ color:'rgba(255,255,255,.58)', fontSize:12, lineHeight:1.45, marginTop:12 }}>Oltre ai 10 animali proposti dal radar, potrai dichiarare altri avvistamenti filtrando la grid per paese oppure aprendo la scratch map: tocca un paese visitato e usa “Vedi animali” per trovarli già filtrati.</div>
            {result?.timed_out && <div style={{ color:'#FFD4C8', fontSize:11.5, marginTop:12, lineHeight:1.4 }}>La rete è lenta: Animaldex entra subito, la sincronizzazione continua in background.</div>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginTop:20 }}>
              <div style={{ borderRadius:20, background:'rgba(168,70,55,.14)', padding:12 }}><div style={{ fontSize:25 }}>🎯</div><div style={{ fontWeight:1000, fontSize:12, marginTop:5 }}>Ricercati visibili</div></div>
              <div style={{ borderRadius:20, background:'rgba(168,70,55,.14)', padding:12 }}><div style={{ fontSize:25 }}>✨</div><div style={{ fontWeight:1000, fontSize:12, marginTop:5 }}>Abilità filtrabili</div></div>
              <div style={{ borderRadius:20, background:'rgba(168,70,55,.14)', padding:12 }}><div style={{ fontSize:25 }}>🏅</div><div style={{ fontWeight:1000, fontSize:12, marginTop:5 }}>Rewards attivi</div></div>
              <div style={{ borderRadius:20, background:'rgba(168,70,55,.14)', padding:12 }}><div style={{ fontSize:25 }}>📊</div><div style={{ fontWeight:1000, fontSize:12, marginTop:5 }}>Statistiche profilo</div></div>
            </div>
          </div>
          <button onClick={()=>onFinish?.()} style={primaryButton}>Entra nell’Animaldex</button>
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
    <div style={{ height:'100vh', maxWidth:480, margin:'0 auto', background:'#111113', color:'white', fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif", display:'flex', alignItems:'center', justifyContent:'center', padding:22, boxSizing:'border-box' }}>
      <form onSubmit={submit} style={{ width:'100%', background:'linear-gradient(180deg,#222226,#161618)', border:'1px solid rgba(255,255,255,.10)', borderRadius:28, padding:24, boxShadow:'0 28px 80px rgba(0,0,0,.45)' }}>
        <div style={{ color:'#90D84A', fontSize:13, fontWeight:900, textTransform:'uppercase', letterSpacing:.9 }}>Animaldex</div>
        <h1 style={{ margin:'8px 0 6px', fontSize:30, lineHeight:1.05 }}>Accedi</h1>
        <p style={{ margin:'0 0 18px', color:'rgba(255,255,255,.58)', fontSize:13, lineHeight:1.45 }}>Login richiesto per sincronizzare animali, destinazioni, status e badge con Supabase.</p>
        <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{ width:'100%', height:46, borderRadius:14, border:'1px solid rgba(255,255,255,.12)', background:'#2B2B30', color:'white', padding:'0 14px', fontSize:14, boxSizing:'border-box', marginBottom:10 }} />
        <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={{ width:'100%', height:46, borderRadius:14, border:'1px solid rgba(255,255,255,.12)', background:'#2B2B30', color:'white', padding:'0 14px', fontSize:14, boxSizing:'border-box', marginBottom:14 }} />
        <button disabled={loading} type="submit" style={{ width:'100%', height:48, borderRadius:15, border:'none', background:'#90D84A', color:'#101410', fontWeight:900, fontSize:15, cursor:loading?'default':'pointer', opacity:loading?.7:1 }}>{loading ? 'Attendi...' : mode === 'signup' ? 'Crea account' : 'Login'}</button>
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

function MainMenu({ onOpen, onBack, onLogout, tutorialFocus=null }) {
  const items = [
    { id:'grid', label:'Animaldex', icon:'🦁', bg:'#2E5A10', desc:'Griglia animali' },
    { id:'regions', label:'Regioni', icon:'🗺️', bg:'#256344', desc:'Continenti e scratch map' },
    { id:'badges', label:'Badge', icon:'🏅', bg:'#7A3A1B', desc:'Award e obiettivi' },
    { id:'abilities', label:'Abilità', icon:'✨', bg:'#5A2E80', desc:'Catalogo abilità' },
    { id:'profile', label:'Profilo', icon:'👤', bg:'#254A70', desc:'Statistiche giocatore' },
    { id:'settings', label:'Impostazioni', icon:'⚙️', bg:'#4A4A50', desc:'Preferenze app' },
  ];
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#111113', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'18px 12px 14px', borderBottom:'1px solid #2A2A2C', background:'#1C1C1E', flexShrink:0 }}>
        <div style={{ color:'white', fontSize:22, fontWeight:900, letterSpacing:'-.3px' }}>Menu</div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'18px 16px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {items.map(item=>{
            const focused = tutorialFocus === item.id;
            return (
            <button key={item.id} data-tour={`menu-${item.id}`} onClick={()=>{ if(tutorialFocus && !focused) return; onOpen(item.id); }} style={{ minHeight:138, border:'none', borderRadius:20, background:item.bg, color:'white', cursor:'pointer', padding:16, display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'space-between', textAlign:'left', boxShadow:focused?'0 0 0 3px #90D84A, 0 0 34px rgba(144,216,74,.45)':'0 12px 34px rgba(0,0,0,.28)', opacity:tutorialFocus && !focused ? .42 : 1, position:'relative', zIndex:focused?180:1 }}>

              <div style={{ width:54, height:54, borderRadius:18, background:'rgba(255,255,255,.16)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>{item.icon}</div>
              <div><div style={{ fontSize:17, fontWeight:900, marginBottom:4 }}>{item.label}</div><div style={{ fontSize:11, color:'rgba(255,255,255,.66)', lineHeight:1.35 }}>{item.desc}</div></div>
            </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ onBack, statusMap = {}, visitedCountries = [], earnedBadgeIds = [], onOpenGridStatus, onOpenBadges, onOpenRegions, onOpenGallery, userProfile, user, onLogout }) {
  const fileInputRef = useRef(null);
  const animalsWithStatus = ANIMALS.map(a => ({ ...a, status: normalizeAnimalStatus(statusMap[a.id] ?? a.status) }));
  const seenCount = animalsWithStatus.filter(a => a.status === 'avvistato' || a.status === 'catturato').length;
  const capturedCount = animalsWithStatus.filter(a => a.status === 'catturato').length;
  const regionsCount = new Set(animalsWithStatus.filter(a => a.status === 'avvistato' || a.status === 'catturato').flatMap(a => a.distribution?.countries_present || [])).size;
  const badgeCount = new Set([...earnedBadgeIds, ...computeUnlockedAwards(statusMap, visitedCountries).map(a => a.badgeId)].map(normalizeBadgeId)).size;
  const displayName = userProfile?.nickname || userProfile?.username || user?.email?.split('@')[0] || 'Esploratore';
  const residenceCountry = userProfile?.residence_country || userProfile?.country || visitedCountries?.[0] || null;
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
          <div style={{ color:'white', fontSize:26, fontWeight:900, letterSpacing:'-.4px' }}>{displayName}</div>
          <div style={{ color:'#B9D7EF', fontSize:13, marginTop:5, fontWeight:600 }}>{user?.email || 'Profilo Animaldex'}</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {statCards.map(card=>(<button key={card.label} onClick={card.onClick} style={{ background:'#222222', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:16, minHeight:112, textAlign:'left', cursor:'pointer', display:'flex', flexDirection:'column', justifyContent:'space-between', fontFamily:'inherit' }}><div style={{ color:'#90D84A', fontSize:28, fontWeight:900, lineHeight:1 }}>{card.value}</div><div style={{ color:'white', fontSize:13, fontWeight:900, lineHeight:1.25 }}>{card.label}</div></button>))}
        </div>
        <div style={{ marginTop:16, background:'#222226', border:'1px solid rgba(255,255,255,.08)', borderRadius:18, padding:16 }}>
          <div style={{ color:'white', fontSize:18, fontWeight:900, marginBottom:12 }}>Account</div>
          {[
            ['Nome', displayName],
            ['Email', user?.email || '—'],
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
  return (
    <button
      onClick={()=>onOpen?.(rule)}
      style={{
        border:'none',
        borderRadius:18,
        padding:'12px 8px 10px',
        minHeight:158,
        background:unlocked ? 'linear-gradient(180deg,#464646,#272727)' : 'linear-gradient(180deg,#343436,#252527)',
        boxShadow:tutorialHighlight?'0 0 0 3px #A84637, 0 0 34px rgba(168,70,55,.50)':'0 10px 26px rgba(0,0,0,.24)',
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

function BadgesPage({ onBack, statusMap = {}, visitedCountries = [], earnedBadgeIds = [], openBadgeId=null, onBadgeOpened, tutorialActive=false, onTutorialBadgeOpen }) {
  const [macro, setMacro] = useState('Tutti');
  const [onlyUnlocked, setOnlyUnlocked] = useState(false);
  const [selectedAward, setSelectedAward] = useState(null);
  const metrics = computeAwardMetrics(statusMap, visitedCountries);
  const unlockedSet = new Set([...earnedBadgeIds, ...computeUnlockedAwards(statusMap, visitedCountries).map(a => a.badgeId)].map(normalizeBadgeId));
  const macros = ['Tutti', ...AWARD_MACROS];
  const awards = AWARD_RULES.filter(rule => (macro === 'Tutti' || rule.macro === macro) && (!onlyUnlocked || unlockedSet.has(normalizeBadgeId(rule.badgeId))));
  useEffect(() => {
    if (!openBadgeId) return;
    const match = AWARD_RULES.find(rule => normalizeBadgeId(rule.badgeId) === normalizeBadgeId(openBadgeId));
    if (match) {
      setSelectedAward(match);
      setMacro('Tutti');
      onBadgeOpened?.();
    }
  }, [openBadgeId]);
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
          {awards.map((rule,idx)=><AwardCard key={rule.badgeId} rule={rule} unlocked={unlockedSet.has(normalizeBadgeId(rule.badgeId))} tutorialHighlight={tutorialActive && idx===0} onOpen={(r)=>{setSelectedAward(r); if(tutorialActive) onTutorialBadgeOpen?.(r);}} />)}
        </div>
      </div>
      {selectedAward && <AwardModal rule={selectedAward} unlocked={unlockedSet.has(normalizeBadgeId(selectedAward.badgeId))} currentValue={metrics[selectedAward.metric]} onClose={()=>setSelectedAward(null)} />}
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
      <CountryPresenceMap countryCodes={visited} selectedCountry={selectedCountry} onSelectCountry={onSelectCountry} accent="#90D84A" height={250} title="Paesi visitati · paesi visitati" />
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
          <div style={{ color:'#90D84A', fontSize:22, fontWeight:900, minWidth:34, textAlign:'center' }}>{count}</div>
          <div style={{ color:'rgba(255,255,255,.65)', fontSize:11, fontWeight:700, lineHeight:1.2, flex:1 }}>animali associati a questo paese</div>
          <button onClick={e=>{e.stopPropagation();onOpenAnimals?.(code);}} style={{ height:34, borderRadius:10, border:'none', background:'#244A70', color:'white', fontWeight:900, fontSize:11, padding:'0 10px', cursor:'pointer' }}>Vedi animali</button>
        </div>
      </div>
    </div>
  );
}

function RegionsPage({ onBack, statusMap = {}, visitedCountries = [], onVisitedCountriesChange, initialView, onSelect, onOpenCountry, onOpenRegion, onAddDestination, destinationsLoading=false }) {
  const normalizeInitialView = (v) => {
    if (v === 'countries') return 'countries';
    if (v === 'continents' || v === 'realms' || !v) return 'planet';
    return v;
  };
  const [view, setView] = useState(normalizeInitialView(initialView));
  const [selectedContinentId, setSelectedContinentId] = useState(null);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedDestinationIso, setSelectedDestinationIso] = useState('');
  const [unlockMap, setUnlockMap] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('animaldex_region_unlocks_v4') || '{}'); } catch { return {}; }
  });
  useEffect(()=>{ try { window.localStorage.setItem('animaldex_region_unlocks_v4', JSON.stringify(unlockMap)); } catch {} }, [unlockMap]);
  useEffect(()=>{ setView(normalizeInitialView(initialView)); }, [initialView]);

  const continent = BIOREGION_V4_CONTINENTS.find(c => c.id === selectedContinentId) || null;
  const region = continent?.regions.find(r => r.id === selectedRegionId) || null;
  const visitedSet = new Set(visitedCountries);
  const scratchCountries = getAllScratchCountries().filter(code => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return true;
    return code.toLowerCase().includes(q) || getCountryDisplayName(code).toLowerCase().includes(q);
  }).slice(0,160);
  const submitDestination = async () => {
    if (!selectedDestinationIso) return;
    const iso = selectedDestinationIso;
    const next = Array.from(new Set([...visitedCountries, iso])).sort();
    onVisitedCountriesChange?.(next);
    setSelectedCountry(iso);
    setSelectedDestinationIso('');
    try { await onAddDestination?.(iso, []); } catch (err) { console.warn('[Animaldex] aggiunta paese non bloccante:', err); }
  };
  const removeVisitedCountry = (code) => {
    const list = visitedCountries.filter(c=>c!==code);
    onVisitedCountriesChange?.(list);
    if (selectedCountry === code) setSelectedCountry(null);
  };
  const allAnimalsWithStatus = ANIMALS.map(a => ({ ...a, status: normalizeAnimalStatus(statusMap[a.id] ?? a.status) }));
  const territoryAnimals = selectedTerritory ? allAnimalsWithStatus.filter(a => matchGeographySelection(a, [selectedTerritory.filterValue])) : [];
  const title = (() => {
    if (view === 'planet') return 'Pianeta Terra';
    if (view === 'countries') return 'Paesi visitati';
    if (view === 'terrestrial') return 'Dominio terrestre';
    if (view === 'marine') return 'Dominio marino';
    if (view === 'regions') return continent?.label || 'Regioni';
    if (view === 'ecoregions') return region?.label || 'Ecoregioni';
    if (view === 'animals') return selectedTerritory?.label || 'Animali';
    return 'Territori';
  })();
  const goBack = () => {
    if (view === 'planet') return onBack();
    if (view === 'countries') return setView('planet');
    if (view === 'terrestrial' || view === 'marine') return setView('planet');
    if (view === 'regions') return setView('terrestrial');
    if (view === 'ecoregions') return setView('regions');
    if (view === 'animals') {
      if (selectedTerritory?.kind === 'marine') return setView('marine');
      if (selectedTerritory?.kind === 'ecoregion') return setView('ecoregions');
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

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#050505', overflow:'hidden' }}>
      <PageHeader title={title} onBack={goBack} />
      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px 28px' }}>
        {view==='planet' && (
          <>
            <button onClick={()=>setView('countries')} style={{ width:'100%', border:'1px solid rgba(144,216,74,.28)', borderRadius:24, background:'linear-gradient(135deg,rgba(144,216,74,.18),rgba(32,178,170,.12))', padding:16, marginBottom:14, color:'white', textAlign:'left', cursor:'pointer', fontFamily:'inherit' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:58, height:58, borderRadius:20, background:'rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 }}>🗺️</div>
                <div style={{ flex:1 }}><div style={{ fontSize:19, fontWeight:1000 }}>Paesi visitati</div><div style={{ color:'rgba(255,255,255,.58)', fontSize:12, marginTop:4 }}>Paesi visitati su mappa.</div></div>
                <div style={{ color:'#90D84A', fontSize:20, fontWeight:1000 }}>{visitedCountries.length}</div>
              </div>
            </button>
            <div style={{ background:'linear-gradient(135deg,#1B2B2A,#0D1517)', border:'1px solid rgba(108,229,199,.20)', borderRadius:24, padding:16, marginBottom:14 }}>
              <div style={{ color:'rgba(255,255,255,.58)', fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:.8 }}>Pianeta Terra</div>
              <div style={{ color:'white', fontSize:26, fontWeight:1000, marginTop:4 }}>Scegli un dominio</div>
              <div style={{ color:'rgba(255,255,255,.62)', fontSize:12.5, lineHeight:1.45, marginTop:7 }}>Il dominio terrestre porta a continenti, regioni ed ecoregioni. Il dominio marino usa i 12 grandi bacini biogeografici.</div>
            </div>
            <TerritoryCard item={{label:'Dominio terrestre', bioregionIds:BIOREGION_V4_ECOREGIONS.map(e=>e.id)}} title="Dominio terrestre" subtitle={`${BIOREGION_V4_CONTINENTS.length} macroaree · ${BIOREGION_V4_REGIONS.length} regioni · ${BIOREGION_V4_ECOREGIONS.length} ecoregioni`} image={['/regions/continents/pianeta_terra.jpg','/regions/america.jpg','/regions/europa.jpg']} icon="" accent="#6CE5C7" openLabel="Apri" onOpen={()=>setView('terrestrial')} mapIds={BIOREGION_V4_ECOREGIONS.map(e=>e.id)} mapDisabled />
            <TerritoryCard item={{label:'Dominio marino', realmType:'marine', bioregionIds:MARINE_REALMS.map(r=>r.id)}} title="Dominio marino" subtitle={`${MARINE_REALMS.length} domini marini · dati v4`} image={['/regions/marine/reami_marini.jpg','/regions/oceania.jpg']} icon="" accent="#4FB3FF" openLabel="Apri" onOpen={()=>setView('marine')} mapIds={MARINE_REALMS.map(r=>r.id)} mapDisabled />
          </>
        )}

        {view==='terrestrial' && BIOREGION_V4_CONTINENTS.map(cont => (
          <TerritoryCard key={cont.id} item={cont} title={cont.label} subtitle={`${cont.regions.length} regioni · ${cont.bioregionIds.length} ecoregioni`} image={cont.image} icon={cont.label==='Africa'?'🌍':cont.label==='America'?'🌎':cont.label.includes('Oceania')?'🌏':cont.label==='Antartide'?'❄️':'🌍'} accent="#6CE5C7" openLabel="Apri" onOpen={()=>{setSelectedContinentId(cont.id);setView('regions');}} mapIds={cont.bioregionIds} />
        ))}

        {view==='marine' && MARINE_REALMS.map(m => {
          const locked = !unlockMap[m.id];
          return <TerritoryCard key={m.id} item={m} title={m.label} subtitle={m.name_en || 'Dominio marino'} image={m.image} icon="🌊" accent="#4FB3FF" locked={locked} onUnlock={()=>unlock(m.id)} openLabel="Vedi animali" onOpen={()=>openTerritoryAnimals(m, `marine:${m.id}`, 'marine')} mapIds={[m.id]} />;
        })}

        {view==='regions' && continent && continent.regions.map(reg => {
          const locked = !unlockMap[reg.id];
          return <TerritoryCard key={reg.id} item={reg} title={reg.label} subtitle={`${reg.ecoregions.length} ecoregioni`} image={reg.image} icon="▧" accent="#20B2AA" locked={locked} onUnlock={()=>unlock(reg.id)} openLabel="Apri" onOpen={()=>{setSelectedRegionId(reg.id);setView('ecoregions');}} mapIds={reg.bioregionIds} />;
        })}

        {view==='ecoregions' && region && region.ecoregions.map(eco => {
          const locked = !unlockMap[eco.id];
          return <TerritoryCard key={eco.id} item={eco} title={eco.label} subtitle={`${eco.iso?.length || 0} codici ISO · ${eco.name_en || 'ecoregione'}`} image={eco.image} icon="◍" accent="#90D84A" locked={locked} onUnlock={()=>unlock(eco.id)} openLabel="Vedi animali" onOpen={()=>openTerritoryAnimals(eco, `ecoregion:${eco.id}`, 'ecoregion')} mapIds={[eco.id]} />;
        })}

        {view==='countries' && (
          <div>
            <ScratchMap visitedCountries={visitedCountries} selectedCountry={selectedCountry} onSelectCountry={setSelectedCountry} />
            {selectedCountry && (
              <div style={{ background:'#1A1A1C', border:'1px solid rgba(144,216,74,.2)', borderRadius:16, padding:14, marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:28 }}>{getFlagEmoji(selectedCountry)}</span>
                  <div style={{ flex:1 }}><div style={{ color:'white', fontWeight:900 }}>{getCountryDisplayName(selectedCountry)}</div><div style={{ color:'rgba(255,255,255,.52)', fontSize:12 }}>{countAnimalsForGeoValue(selectedCountry)} animali associati</div></div>
                  <button onClick={()=>onOpenCountry?.(selectedCountry)} style={{ height:36, borderRadius:11, border:'none', background:'#244A70', color:'white', fontWeight:900, padding:'0 12px', cursor:'pointer' }}>Vedi animali</button>
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
                  const active = visitedSet.has(code) || selectedDestinationIso === code;
                  return <button key={code} onClick={()=>setSelectedDestinationIso(code)} style={{ minHeight:44, borderRadius:12, border:`1px solid ${active?'rgba(144,216,74,.65)':'rgba(255,255,255,.08)'}`, background:active?'rgba(144,216,74,.18)':'#1A1A1C', color:active?'#D8FFC4':'white', padding:'8px 10px', display:'flex', alignItems:'center', gap:8, cursor:'pointer', textAlign:'left', fontFamily:'inherit' }}><span style={{ fontSize:20 }}>{getFlagEmoji(code)}</span><span style={{ flex:1, fontSize:11.5, fontWeight:800, lineHeight:1.15 }}>{getCountryDisplayName(code)}</span><span style={{ color:active?'#90D84A':'rgba(255,255,255,.22)', fontSize:15 }}>{active?'✓':'+'}</span></button>;
                })}
              </div>
              <button disabled={!selectedDestinationIso || destinationsLoading} onClick={submitDestination} style={{ marginTop:12, width:'100%', height:42, borderRadius:13, border:'none', background:selectedDestinationIso?'#90D84A':'#3A3A3C', color:selectedDestinationIso?'#111':'rgba(255,255,255,.38)', fontWeight:900, cursor:selectedDestinationIso?'pointer':'default' }}>{destinationsLoading ? 'Sblocco animali...' : selectedDestinationIso ? `Aggiungi ${getCountryDisplayName(selectedDestinationIso)}` : 'Seleziona un paese'}</button>
            </div>
          </div>
        )}

        {view==='animals' && selectedTerritory && (
          <>
            <BioregionVectorMap highlightIds={selectedTerritory.bioregionIds || (selectedTerritory.bioregionId ? [selectedTerritory.bioregionId] : [])} marine={selectedTerritory.kind==='marine'} accent={selectedTerritory.kind==='marine'?'#4FB3FF':'#90D84A'} height={190} showLabels />
            <div style={{ color:'rgba(255,255,255,.58)', fontSize:12, margin:'12px 0' }}>
              Animali filtrati per {selectedTerritory.kind === 'marine' ? 'reame marino' : selectedTerritory.kind === 'region' ? 'regione' : 'ecoregione'}.
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

function SettingsPage({ onBack, onStartInitialOnboarding, onStartOperationalTutorial }) {
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
  const [destinationsLoading,setDestinationsLoading]=useState(false);
  const [awardQueue,setAwardQueue]=useState([]);
  const [earnedBadgeIds,setEarnedBadgeIds]=useState([]);
  const [visitedCountries,setVisitedCountries]=useState(() => getVisitedCountries());
  const unlockedAwards = useMemo(() => computeUnlockedAwards(statusMap, visitedCountries), [statusMap, visitedCountries]);
  const activeAwardToast = awardQueue[0] || null;
  useAnimaldexSound(true);
  const getTutorialAnimal = () => {
    const list = (animalsData || []).map(a => ({ ...a, status: normalizeAnimalStatus(statusMap[a.id] ?? a.status) }));
    return list.find(a => !isMysteryStatus(a.status) && a.image_url)
      || list.find(a => a.image_url)
      || list[0]
      || null;
  };

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

      const nextAnimals = remoteAnimals?.length ? mergeRemoteWithLocalBioregions(remoteAnimals) : LOCAL_ANIMALS.map(normalizeLocalAnimal);
      setAnimalsData(nextAnimals);

      const nextStatusMap = Object.fromEntries((nextAnimals || []).map(a => [a.id, normalizeAnimalStatus(a.status)]));
      setStatusMap(nextStatusMap);

      const nextDestinations = destinations || [];
      setVisitedCountries(nextDestinations);
      saveVisitedCountries(nextDestinations);

      setEarnedBadgeIds((remoteBadgeIds || []).map(normalizeBadgeId));
      persistAwardUnlocks(remoteBadgeIds || []);
    } catch (err) {
      console.warn('[Animaldex] Caricamento Supabase fallito, uso fallback locale:', err);
      setDataError(err?.message || 'Errore caricamento Supabase');

      const fallback = LOCAL_ANIMALS.map(normalizeLocalAnimal);
      setAnimalsData(fallback);
      setStatusMap(Object.fromEntries(fallback.map(a => [a.id, normalizeAnimalStatus(a.status)])));
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
    setPage('grid');
    setTutorialStep('grid');
  }, [userProfile?.onboarding_completed, userProfile?.has_completed_tutorial, animalsData?.length, Object.keys(statusMap || {}).length, tutorialStep]);

  useEffect(() => {
    const localSaved = getAwardUnlockSet();
    const dbSaved = new Set((earnedBadgeIds || []).map(normalizeBadgeId));
    const alreadyKnown = new Set([...Array.from(localSaved), ...Array.from(dbSaved)]);
    const current = unlockedAwards.map(a => normalizeBadgeId(a.badgeId));
    const fresh = unlockedAwards.filter(a => !alreadyKnown.has(normalizeBadgeId(a.badgeId)));

    if (fresh.length) setAwardQueue(prev => [...prev, ...fresh]);

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


  const handleCompleteOnboarding = async ({ nickname, countries, seenAnimalIds, tripTags }) => {
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
    setUserProfile(prev => ({
      ...(prev || buildFallbackProfile(user, true)),
      onboarding_completed:true,
      has_completed_tutorial:false,
      onboarding_completed_at:new Date().toISOString(),
    }));
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
  };

  const getCurrentTutorialAnimal = () => {
    if (tutorialAnimalId) return animalsData.find(a => a.id === tutorialAnimalId) || getTutorialAnimal();
    return getTutorialAnimal();
  };

  const handleTutorialAnimalSelect = (animal) => {
    setTutorialAnimalId(animal?.id || tutorialAnimalId);
    setTutorialStep('detail-stats');
  };

  const handleTutorialNext = () => {
    if (tutorialStep === 'detail-stats') { setTutorialStep('detail-abilities'); return; }
    if (tutorialStep === 'detail-abilities') { setTutorialStep('detail-capture'); return; }
    if (tutorialStep === 'reward-modal') { setSel(null); setRegionsInitialView('continents'); setPage('regions'); setTutorialStep('regions'); return; }
    if (tutorialStep === 'regions') { setSel(null); setPage('profile'); setTutorialStep('profile'); return; }
  };

  const handleTutorialAbilityClick = () => {
    if (tutorialStep === 'detail-abilities') {
      setTimeout(() => setTutorialStep('detail-capture'), 520);
    }
  };

  const handleTutorialBadgeOpen = () => {
    if (tutorialStep === 'rewards') {
      setTimeout(() => setTutorialStep('reward-modal'), 360);
    }
  };

  const handleTutorialCapture = async () => {
    const target = getCurrentTutorialAnimal();
    if (target?.id && normalizeAnimalStatus(statusMap[target.id] ?? target.status) !== 'catturato') {
      await handleStatusChange(target.id, 'catturato');
    }
    setTutorialStamp(true);
    setTimeout(() => {
      setTutorialStamp(false);
      setSel(null);
      setToastOpenBadgeId(null);
      setPage('badges');
      setTutorialStep('rewards');
    }, 650);
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
    setPage('grid');
    setTutorialAnimalId(target?.id || null);
    setTutorialStamp(false);
    setTutorialStep('grid');
    setUserProfile(prev => ({
      ...(prev || buildFallbackProfile(user, true)),
      onboarding_completed:true,
      has_completed_tutorial:false,
    }));
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

const renderDetailOverlay = () => enriched ? <div style={{ position:'absolute', inset:0, zIndex:80, background:'#1C1C1E' }}><Detail a={enriched} onBack={()=>setSel(null)} onStatusChange={handleStatusChange} onJumpToClass={jumpToClassFromDetail} statusMap={statusMap} tutorialStep={tutorialStep} captureStamp={tutorialStamp} onTutorialAbilityClick={handleTutorialAbilityClick}/></div> : null;

  if (authLoading) {
    return (
      <div style={{ height:'100vh', maxWidth:480, margin:'0 auto', background:'#111113', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif" }}>
        <div style={{ color:'rgba(255,255,255,.65)', fontWeight:800 }}>Caricamento sessione...</div>
      </div>
    );
  }

  if (!user) return <AuthScreen onAuthReady={()=>supabase.auth.getSession().then(({data})=>{setSession(data.session||null);setUser(data.session?.user||null);})} />;

  if (!userProfile && dataLoading) {
    return (
      <div style={{ height:'100vh', maxWidth:480, margin:'0 auto', background:'#111113', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif" }}>
        <div style={{ color:'rgba(255,255,255,.65)', fontWeight:800 }}>Caricamento profilo...</div>
      </div>
    );
  }

  if (!userProfile && !dataLoading) {
    setTimeout(() => setUserProfile(buildFallbackProfile(user, true)), 0);
    return (
      <div style={{ height:'100vh', maxWidth:480, margin:'0 auto', background:'#111113', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif" }}>
        <div style={{ color:'rgba(255,255,255,.65)', fontWeight:800 }}>Apertura Animaldex...</div>
      </div>
    );
  }

  if (userProfile && userProfile.onboarding_completed === false) {
    return (
      <div style={{ fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif", height:'100vh', maxWidth:480, margin:'0 auto', overflow:'hidden', background:'#111113', position:'relative' }}>
        <OnboardingFlow user={user} animals={animalsData} initialNickname={userProfile.nickname || userProfile.username} onComplete={handleCompleteOnboarding} onFinish={finishOnboarding} />
      </div>
    );
  }

  const renderPage = () => {
    if (page === 'menu') return <MainMenu onOpen={openPage} onBack={()=>setPage('grid')} onLogout={()=>supabase.auth.signOut()} tutorialFocus={tutorialStep==='regions'?'regions':tutorialStep==='profile'?'profile':tutorialStep==='rewards'?'badges':null} />;
    if (page === 'profile') return <ProfilePage onBack={()=>setPage('menu')} statusMap={statusMap} visitedCountries={visitedCountries} earnedBadgeIds={earnedBadgeIds} userProfile={userProfile} user={user} onLogout={()=>supabase.auth.signOut()} onOpenGridStatus={openGridWithStatus} onOpenBadges={()=>openPage('badges')} onOpenRegions={()=>openPage('regions')} onOpenGallery={()=>openPage('gallery')} />;
    if (page === 'badges') return <BadgesPage onBack={()=>setPage('menu')} statusMap={statusMap} visitedCountries={visitedCountries} earnedBadgeIds={earnedBadgeIds} openBadgeId={toastOpenBadgeId} onBadgeOpened={()=>setToastOpenBadgeId(null)} tutorialActive={tutorialStep==='rewards'} onTutorialBadgeOpen={handleTutorialBadgeOpen} />;
    if (page === 'regions') return <div style={{ height:'100%', position:'relative', overflow:'hidden' }}><RegionsPage onBack={()=>setPage('menu')} statusMap={statusMap} visitedCountries={visitedCountries} onVisitedCountriesChange={setVisitedCountries} initialView={regionsInitialView} onSelect={setSel} onOpenCountry={(code)=>openGridWithGeography(code, getCountryDisplayName(code), 'countries')} onOpenRegion={(value,label)=>openGridWithGeography(value, label, 'continents')} onAddDestination={handleAddDestination} destinationsLoading={destinationsLoading} />{renderDetailOverlay()}</div>;
    if (page === 'gallery') return <div style={{ height:'100%', position:'relative', overflow:'hidden' }}><GalleryPage onBack={()=>setPage('profile')} statusMap={statusMap} onSelect={setSel} />{renderDetailOverlay()}</div>;
    if (page === 'settings') return <SettingsPage onBack={()=>setPage('menu')} onStartInitialOnboarding={startInitialOnboardingFromSettings} onStartOperationalTutorial={startOperationalTutorialFromSettings} />;
    if (page === 'abilities') return <AbilitiesPage onBack={()=>setPage('menu')} onOpenAbility={openGridWithCategory} />;
    return <div style={{ height:'100%', position:'relative', overflow:'hidden' }}><Grid onSelect={setSel} statusMap={statusMap} onHome={()=>openPage('menu')} preset={gridPreset} onBackToOrigin={gridReturnTarget ? returnFromFilteredGrid : null} tutorialActive={tutorialStep==='grid'} tutorialAnimalId={tutorialAnimalId} onTutorialAnimalSelect={handleTutorialAnimalSelect} />{renderDetailOverlay()}</div>;
  };

  return (
    <div style={{ fontFamily:"'Sora',-apple-system,BlinkMacSystemFont,sans-serif", height:'100vh', maxWidth:480, margin:'0 auto', display:'flex', flexDirection:'column', overflow:'hidden', background:'#1C1C1E', position:'relative' }}>
      {renderPage()}
      {tutorialStep && <OperationalTutorialOverlay step={tutorialStep} animal={getCurrentTutorialAnimal()} onNext={handleTutorialNext} onCapture={handleTutorialCapture} onFinish={completeOperationalTutorial} onSkip={completeOperationalTutorial} />}
      {dataError && user && <div style={{ position:'absolute', left:12, right:12, bottom:12, zIndex:250, borderRadius:14, padding:'10px 12px', background:'rgba(255,59,48,.92)', color:'white', fontSize:11, fontWeight:800, boxShadow:'0 10px 30px rgba(0,0,0,.35)' }}>{dataError}</div>}
      {activeAwardToast && <AwardToast award={activeAwardToast} onOpen={openAwardFromToast} onDismiss={()=>setAwardQueue(prev => prev.slice(1))} />}
    </div>
  );
}
