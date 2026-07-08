const REGION_IMAGES = [
  '/regions/afrotropici_equatoriali.jpg',
  '/regions/amazzonia.jpg',
  '/regions/africa.jpg',
  '/regions/Scandinavia_foreste_boreali.jpg',
  '/regions/eastern_indo_pacific.jpg',
  '/regions/Europa_temperata.jpg',
  '/regions/america.jpg',
  '/regions/antartide.jpg',
];

const METRIC_ACCENT = {
  bio_blades: '/regions/africa.jpg',
  tusks: '/regions/afrotropici_meridionali.jpg',
  cr_count: '/regions/antartide.jpg',
  iucn_variety: '/regions/eastern_indo_pacific.jpg',
  iucn_five_each: '/regions/Western_Indo-Pacific.jpg',
  biomes_count: '/regions/afrotropici_equatoriali.jpg',
  all_biomes: '/regions/amazzonia.jpg',
  countries_count: '/regions/america.jpg',
  home_country_biodiversity: '/regions/Europa_temperata.jpg',
  onboarding_first_trip: '/regions/Europa_temperata.jpg',
  apex_count: '/regions/Tropical_Atlantic.jpg',
  base_trophic_count: '/regions/Tropical_eastern_pacific.jpg',
  record_count: '/regions/Ovest_americano.jpg',
  tiny_species_count: '/regions/Steppe_kazake_foreste.jpg',
  extremes_count: '/regions/Nord_Africa.jpg',
  captured_count: '/regions/amazzonia.jpg',
  sighting_only_count: '/regions/afrotropici_equatoriali.jpg',
  usage_streak: '/backgrounds/background_grid.png',
  ai_corrections: '/backgrounds/background_tree.png',
  total_mass_tons: '/regions/Tropical_Atlantic.jpg',
  max_family_count: '/backgrounds/background_tree.png',
  max_order_count: '/backgrounds/background_tree.png',
  genera_count: '/backgrounds/background_tree.png',
  obs_under_100: '/regions/Steppe_kazake_foreste.jpg',
};

function hashSeed(value = '') {
  return String(value).split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

export function getAnimalThumbUrl(animal) {
  const imageUrl = animal?.image_url || animal?.img || '';
  if (!imageUrl || /^(https?:|data:|blob:)/i.test(imageUrl)) return imageUrl;
  const cleanUrl = String(imageUrl).split('#')[0].split('?')[0];
  const filename = cleanUrl.split('/').pop();
  if (!filename) return imageUrl;
  const basename = filename.replace(/\.[^.]+$/, '');
  return `/animals/thumbs/${basename}.webp`;
}

export function getAnimalHeroUrl(animal) {
  const imageUrl = animal?.image_url || animal?.img || '';
  if (!imageUrl || /^(https?:|data:|blob:)/i.test(imageUrl)) return imageUrl;
  const cleanUrl = String(imageUrl).split('#')[0].split('?')[0];
  if (cleanUrl.startsWith('./')) return cleanUrl.slice(1);
  if (cleanUrl.startsWith('/')) return cleanUrl;
  return `/${cleanUrl}`;
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
  const keys = ['obs_total', 'observations_total', 'observations', 'gbif_obs', 'occurrence_count', 'obs'];
  for (const key of keys) {
    const val = a?.[key] ?? a?.distribution?.[key];
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && /^\d/.test(val)) return Number(val.replace(/[^\d.]/g, '')) || 0;
  }
  return Infinity;
}

function normalizeBadgeBiome(value) {
  const s = String(value || '').trim().toLowerCase();
  if (!s) return '';
  if (/savana|savanna/.test(s)) return 'Savane';
  if (/tropical|pluvial|rainforest/.test(s)) return 'Foreste tropicali';
  if (/desert|arid/.test(s)) return 'Deserti e ambienti aridi';
  if (/mont|alp/.test(s)) return 'Montagne e ambienti rocciosi';
  if (/pelagic|oceano|ocean/.test(s)) return 'Oceano aperto';
  if (/cost|litor|reef|corall/.test(s)) return 'Coste e fondali';
  return s.split(/\s+/).slice(0, 3).join(' ');
}

function getAnimalBiomes(a) {
  const raw = [a?.biome, a?.biomes, a?.habitat, a?.habitats, a?.hab, a?.ecosystem, a?.ecosystems].filter(Boolean).join(',');
  return Array.from(new Set(raw.split(/[;,|]/).map(normalizeBadgeBiome).filter(Boolean)));
}

function isRecorded(animal) {
  return ['avvistato', 'catturato'].includes(String(animal?.status || '').toLowerCase());
}

export function animalQualifiesForMetric(animal, metric) {
  if (!animal || !metric) return false;
  const categories = animal.categories || [];
  const cons = animal.cons;
  const trophic = String(animal.trophic || '');
  const weightKg = extractAverageWeightKg(animal.wt);

  switch (metric) {
    case 'bio_blades':
      return isRecorded(animal) && categories.includes('OFF_BIO_BLADES');
    case 'tusks':
      return isRecorded(animal) && categories.includes('OFF_TUSKS_PIERCERS');
    case 'cr_count':
      return isRecorded(animal) && cons === 'CR';
    case 'iucn_variety':
    case 'iucn_five_each':
      return isRecorded(animal) && !!cons;
    case 'record_count':
      return isRecorded(animal) && (categories.includes('PHYS_RECORD_BREAKERS') || categories.includes('ELITE_WORLD_RECORD') || !!animal.world_record);
    case 'obs_under_100':
      return isRecorded(animal) && getObservationCount(animal) > 0 && getObservationCount(animal) < 100;
    case 'apex_count':
      return isRecorded(animal) && trophic === '4';
    case 'base_trophic_count':
      return isRecorded(animal) && (trophic === '1' || trophic === 'F');
    case 'biomes_count':
    case 'all_biomes':
      return isRecorded(animal) && getAnimalBiomes(animal).length > 0;
    case 'tiny_species_count':
      return isRecorded(animal) && weightKg > 0 && weightKg <= 0.1;
    case 'extremes_count':
      return isRecorded(animal) && categories.some(cat => ['EVO_INSULAR_DWARFISM', 'EVO_INSULAR_GIGANTISM', 'PHYS_RECORD_BREAKERS'].includes(cat));
    case 'captured_count':
      return String(animal.status || '').toLowerCase() === 'catturato';
    case 'sighting_only_count':
      return String(animal.status || '').toLowerCase() === 'avvistato';
    default:
      return isRecorded(animal);
  }
}

export function getMissionAccentImage({ badgeId, metric, macroId } = {}) {
  if (metric && METRIC_ACCENT[metric]) return METRIC_ACCENT[metric];
  if (macroId === 'GEO') return '/regions/afrotropici_equatoriali.jpg';
  if (macroId === 'CON') return '/regions/antartide.jpg';
  if (macroId === 'ARS') return '/regions/africa.jpg';
  if (macroId === 'TRO') return '/regions/amazzonia.jpg';
  if (macroId === 'ELI') return '/regions/Steppe_kazake_foreste.jpg';
  if (macroId === 'ENG') return '/backgrounds/background_grid.png';
  if (macroId === 'MAS') return '/regions/Tropical_Atlantic.jpg';
  if (macroId === 'MOR') return '/regions/Ovest_americano.jpg';
  if (macroId === 'STA') return '/regions/amazzonia.jpg';
  if (macroId === 'TAX') return '/backgrounds/background_tree.png';
  if (macroId === 'ONB') return '/regions/Europa_temperata.jpg';
  return REGION_IMAGES[hashSeed(badgeId || macroId || metric) % REGION_IMAGES.length];
}

export function resolveMissionAccentImage({ badgeId, metric, macroId, animalSlots } = {}) {
  const filled = [...(animalSlots || [])].reverse().find(slot => slot?.type === 'filled' && slot.heroUrl);
  if (filled?.heroUrl) return filled.heroUrl;
  return getMissionAccentImage({ badgeId, metric, macroId });
}

export function formatMissionCopy({ badgeName, remaining, goal, fallbackTitle, fallbackSubtitle }) {
  if (badgeName) {
    const remainingLabel = remaining <= 1 ? 'Manca 1 animale' : `Mancano ${remaining} animali`;
    return {
      titleLine1: badgeName,
      titleLine2: remainingLabel,
      subtitle: goal || '',
    };
  }
  return {
    titleLine1: fallbackTitle || '',
    titleLine2: fallbackSubtitle || '',
    subtitle: '',
  };
}

export function buildMissionAnimalSlots({ metric, current = 0, remaining = 0, animalsWithStatus = [], maxSlots = 4 } = {}) {
  const slotCount = Math.min(maxSlots, Math.max(current + remaining, 1));
  const qualifying = (animalsWithStatus || [])
    .filter(animal => animalQualifiesForMetric(animal, metric))
    .slice(0, slotCount);
  const filledCount = Math.min(current, slotCount);

  const slots = [];
  for (let i = 0; i < slotCount; i += 1) {
    const animal = i < filledCount ? qualifying[i] : null;
    if (animal) {
      slots.push({
        type: 'filled',
        thumbUrl: getAnimalThumbUrl(animal),
        heroUrl: getAnimalHeroUrl(animal),
        label: animal.com || '',
      });
    } else {
      slots.push({ type: 'empty' });
    }
  }
  return slots;
}

export function buildGenericAnimalSlots(animalsWithStatus = [], statusFilter = [], maxSlots = 4) {
  const filtered = (animalsWithStatus || [])
    .filter(animal => statusFilter.includes(String(animal.status || '').toLowerCase()))
    .slice(0, maxSlots);
  const slots = [];
  for (let i = 0; i < maxSlots; i += 1) {
    const animal = filtered[i];
    slots.push(animal
      ? { type: 'filled', thumbUrl: getAnimalThumbUrl(animal), heroUrl: getAnimalHeroUrl(animal), label: animal.com || '' }
      : { type: 'empty' });
  }
  return slots;
}
