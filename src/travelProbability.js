// Probabilità di viaggio per onboarding: ordina i paesi per residenza dell'utente.
// Le liste "molto probabili" sono curate; probabili/possibili/improbabili derivano
// da macro-regione di origine e continente di destinazione.

export const LIKELIHOOD_GROUPS = {
  molto_probabili: { label: 'Molto probabili', order: 0, defaultCollapsed: false },
  probabili: { label: 'Probabili', order: 1, defaultCollapsed: false },
  possibili: { label: 'Possibili', order: 2, defaultCollapsed: false },
  improbabili: { label: 'Improbabili', order: 3, defaultCollapsed: true },
};

/** Macro-regione semplificata per classificare le destinazioni. */
const ISO_MACRO_REGION = {
  IT:'europe', ES:'europe', FR:'europe', DE:'europe', GB:'europe', PT:'europe', NL:'europe', BE:'europe',
  CH:'europe', AT:'europe', SE:'europe', NO:'europe', DK:'europe', FI:'europe', PL:'europe', CZ:'europe',
  SK:'europe', HU:'europe', RO:'europe', BG:'europe', HR:'europe', SI:'europe', GR:'europe', TR:'europe',
  UA:'europe', RU:'europe', LV:'europe', LT:'europe', EE:'europe', BY:'europe', MD:'europe', RS:'europe',
  BA:'europe', ME:'europe', MK:'europe', AL:'europe', XK:'europe', IE:'europe', IS:'europe', MT:'europe', CY:'europe',
  US:'north_america', CA:'north_america', MX:'north_america',
  CR:'central_america', PA:'central_america', GT:'central_america', HN:'central_america', NI:'central_america', SV:'central_america', BZ:'central_america',
  CU:'caribbean', DO:'caribbean', JM:'caribbean', HT:'caribbean', BS:'caribbean', BB:'caribbean', TT:'caribbean', PR:'caribbean', VI:'caribbean',
  BR:'south_america', AR:'south_america', CL:'south_america', CO:'south_america', PE:'south_america', VE:'south_america',
  EC:'south_america', BO:'south_america', PY:'south_america', UY:'south_america', SR:'south_america', GY:'south_america',
  MA:'north_africa', EG:'north_africa', TN:'north_africa', DZ:'north_africa', LY:'north_africa',
  ZA:'sub_saharan_africa', KE:'sub_saharan_africa', NG:'sub_saharan_africa', TZ:'sub_saharan_africa', UG:'sub_saharan_africa',
  ET:'sub_saharan_africa', GH:'sub_saharan_africa', SN:'sub_saharan_africa', CI:'sub_saharan_africa', CM:'sub_saharan_africa',
  ZM:'sub_saharan_africa', ZW:'sub_saharan_africa', BW:'sub_saharan_africa', NA:'sub_saharan_africa', AO:'sub_saharan_africa',
  MZ:'sub_saharan_africa', MW:'sub_saharan_africa', BI:'sub_saharan_africa', RW:'sub_saharan_africa', MG:'sub_saharan_africa',
  MU:'sub_saharan_africa', SC:'sub_saharan_africa', KM:'sub_saharan_africa', MR:'sub_saharan_africa', ML:'sub_saharan_africa',
  BF:'sub_saharan_africa', NE:'sub_saharan_africa', TD:'sub_saharan_africa', CF:'sub_saharan_africa', CG:'sub_saharan_africa',
  CD:'sub_saharan_africa', GA:'sub_saharan_africa', GQ:'sub_saharan_africa', ST:'sub_saharan_africa', LR:'sub_saharan_africa',
  SL:'sub_saharan_africa', GM:'sub_saharan_africa', GW:'sub_saharan_africa', GN:'sub_saharan_africa', BJ:'sub_saharan_africa', TG:'sub_saharan_africa',
  AE:'middle_east', SA:'middle_east', QA:'middle_east', IL:'middle_east', JO:'middle_east', LB:'middle_east',
  KW:'middle_east', BH:'middle_east', OM:'middle_east', YE:'middle_east', IQ:'middle_east', IR:'middle_east',
  IN:'south_asia', PK:'south_asia', BD:'south_asia', LK:'south_asia', NP:'south_asia', BT:'south_asia',
  JP:'east_asia', CN:'east_asia', KR:'east_asia', KP:'east_asia', TW:'east_asia', MN:'east_asia',
  TH:'southeast_asia', ID:'southeast_asia', VN:'southeast_asia', PH:'southeast_asia', MY:'southeast_asia',
  SG:'southeast_asia', KH:'southeast_asia', LA:'southeast_asia', MM:'southeast_asia', BN:'southeast_asia', TL:'southeast_asia',
  KZ:'central_asia', UZ:'central_asia', TJ:'central_asia', TM:'central_asia', KG:'central_asia', AF:'central_asia',
  AU:'oceania', NZ:'oceania', FJ:'oceania', PG:'oceania', SB:'oceania', VU:'oceania', WS:'oceania',
  KI:'oceania', TO:'oceania', PW:'oceania', FM:'oceania', MH:'oceania', NR:'oceania',
};

/** Cluster di origine per la matrice intercontinentale. */
const ORIGIN_CLUSTER = {
  IT:'eu_med', ES:'eu_med', PT:'eu_med', GR:'eu_med', HR:'eu_med', MT:'eu_med', CY:'eu_med', AL:'eu_med', ME:'eu_med',
  FR:'eu_west', DE:'eu_west', GB:'eu_west', BE:'eu_west', NL:'eu_west', CH:'eu_west', AT:'eu_west', IE:'eu_west',
  SE:'eu_north', NO:'eu_north', DK:'eu_north', FI:'eu_north', IS:'eu_north',
  PL:'eu_east', RO:'eu_east', CZ:'eu_east', HU:'eu_east', BG:'eu_east', SK:'eu_east', SI:'eu_east',
  UA:'eu_east', RS:'eu_east', BA:'eu_east', MK:'eu_east', XK:'eu_east',
  TR:'mena', RU:'mena',
  US:'north_america', CA:'north_america',
  MX:'latam_north', CO:'latam_north', PA:'latam_north', CR:'latam_north', GT:'latam_north', HN:'latam_north',
  NI:'latam_north', SV:'latam_north', BZ:'latam_north', CU:'latam_north', DO:'latam_north', JM:'latam_north',
  HT:'latam_north', BS:'latam_north', BB:'latam_north', TT:'latam_north', PR:'latam_north', VI:'latam_north',
  BR:'latam_south', AR:'latam_south', CL:'latam_south', PE:'latam_south', VE:'latam_south', EC:'latam_south',
  BO:'latam_south', PY:'latam_south', UY:'latam_south', SR:'latam_south', GY:'latam_south',
  AU:'oceania', NZ:'oceania',
  JP:'asia_east', CN:'asia_east', KR:'asia_east', IN:'asia_south',
};

/** Destinazione intercontinentale: probabili | possibili | improbabili (escluso molto_probabili). */
const CROSS_REGION_LIKELIHOOD = {
  default: {
    europe:'possibili', north_america:'possibili', central_america:'possibili', caribbean:'possibili',
    south_america:'possibili', north_africa:'possibili', sub_saharan_africa:'possibili', middle_east:'possibili',
    south_asia:'possibili', east_asia:'possibili', southeast_asia:'possibili', central_asia:'improbabili', oceania:'improbabili',
  },
  eu_med: {
    europe:'probabili', north_africa:'probabili', middle_east:'possibili',
    north_america:'possibili', central_america:'possibili', caribbean:'possibili', south_america:'possibili',
    sub_saharan_africa:'possibili', south_asia:'possibili', east_asia:'possibili', southeast_asia:'possibili',
    central_asia:'improbabili', oceania:'improbabili',
  },
  eu_west: {
    europe:'probabili', north_africa:'probabili', north_america:'possibili', caribbean:'possibili',
    central_america:'possibili', south_america:'possibili', middle_east:'possibili',
    sub_saharan_africa:'possibili', east_asia:'possibili', southeast_asia:'possibili', south_asia:'possibili',
    central_asia:'improbabili', oceania:'improbabili',
  },
  eu_north: {
    europe:'probabili', north_america:'possibili', caribbean:'possibili', north_africa:'possibili',
    central_america:'possibili', south_america:'possibili', middle_east:'possibili', southeast_asia:'possibili',
    east_asia:'possibili', sub_saharan_africa:'possibili', south_asia:'possibili',
    central_asia:'improbabili', oceania:'improbabili',
  },
  eu_east: {
    europe:'probabili', middle_east:'possibili', north_africa:'possibili', southeast_asia:'possibili',
    east_asia:'possibili', north_america:'possibili', south_america:'possibili', caribbean:'possibili',
    central_america:'possibili', sub_saharan_africa:'possibili', south_asia:'possibili',
    central_asia:'possibili', oceania:'improbabili',
  },
  mena: {
    europe:'probabili', middle_east:'probabili', north_africa:'probabili', southeast_asia:'possibili',
    east_asia:'possibili', south_asia:'possibili', north_america:'possibili', sub_saharan_africa:'possibili',
    central_asia:'possibili', caribbean:'possibili', central_america:'possibili', south_america:'possibili',
    oceania:'improbabili',
  },
  north_america: {
    north_america:'probabili', central_america:'probabili', caribbean:'probabili', europe:'possibili',
    south_america:'possibili', north_africa:'possibili', middle_east:'possibili', east_asia:'possibili',
    southeast_asia:'possibili', sub_saharan_africa:'possibili', south_asia:'possibili', oceania:'possibili',
    central_asia:'improbabili',
  },
  latam_north: {
    north_america:'probabili', central_america:'probabili', caribbean:'probabili', south_america:'probabili',
    europe:'possibili', north_africa:'improbabili', middle_east:'improbabili', east_asia:'possibili',
    southeast_asia:'possibili', sub_saharan_africa:'improbabili', south_asia:'improbabili',
    central_asia:'improbabili', oceania:'improbabili',
  },
  latam_south: {
    south_america:'probabili', north_america:'probabili', central_america:'probabili', caribbean:'probabili',
    europe:'possibili', north_africa:'improbabili', middle_east:'improbabili', east_asia:'possibili',
    southeast_asia:'possibili', sub_saharan_africa:'improbabili', south_asia:'improbabili',
    central_asia:'improbabili', oceania:'improbabili',
  },
  oceania: {
    oceania:'probabili', southeast_asia:'probabili', east_asia:'probabili', south_asia:'possibili',
    north_america:'possibili', europe:'possibili', north_africa:'improbabili', middle_east:'improbabili',
    sub_saharan_africa:'improbabili', central_america:'improbabili', caribbean:'improbabili',
    south_america:'improbabili', central_asia:'improbabili',
  },
  asia_east: {
    east_asia:'probabili', southeast_asia:'probabili', south_asia:'possibili', oceania:'possibili',
    north_america:'possibili', europe:'possibili', central_asia:'possibili', middle_east:'possibili',
    north_africa:'improbabili', sub_saharan_africa:'improbabili', caribbean:'improbabili',
    central_america:'improbabili', south_america:'improbabili',
  },
  asia_south: {
    south_asia:'probabili', southeast_asia:'probabili', middle_east:'probabili', east_asia:'possibili',
    europe:'possibili', north_africa:'possibili', north_america:'possibili', sub_saharan_africa:'improbabili',
    oceania:'possibili', central_asia:'possibili', caribbean:'improbabili', central_america:'improbabili',
    south_america:'improbabili',
  },
};


/** Top destinazioni curate per nazionalità/residenza (ISO → ISO[], ordine preservato). */
export const TRAVEL_TOP_BY_ORIGIN = {
  US: ['MX', 'CA', 'GB', 'IT', 'FR', 'DO', 'ES', 'JM', 'DE', 'JP', 'BS', 'CO', 'NL', 'CR', 'IE', 'GR', 'PT', 'IN', 'KR', 'TH'],
  BR: ['AR', 'US', 'CL', 'UY', 'PT', 'PY', 'FR', 'IT', 'ES', 'MX', 'GB', 'DE', 'PE', 'CO', 'DO', 'CA', 'NL', 'AE', 'JP', 'CH'],
  MX: ['US', 'ES', 'CA', 'CO', 'FR', 'IT', 'AR', 'BR', 'PE', 'CL', 'JP', 'GB', 'DE', 'CR', 'DO', 'CU', 'GT', 'PA', 'NL', 'PT'],
  DE: ['IT', 'AT', 'ES', 'FR', 'NL', 'CH', 'TR', 'HR', 'GR', 'PL', 'DK', 'GB', 'SE', 'PT', 'BE', 'CZ', 'US', 'NO', 'HU', 'EG'],
  TR: ['DE', 'GR', 'BG', 'CY', 'IT', 'NL', 'GB', 'FR', 'ES', 'US', 'AE', 'SA', 'BA', 'EG', 'AT', 'CH', 'RS', 'ME'],
  GB: ['ES', 'FR', 'IT', 'GR', 'PT', 'IE', 'NL', 'US', 'DE', 'TR', 'BE', 'PL', 'CY', 'HR', 'AT', 'CH', 'AE', 'CA', 'MT', 'MA'],
  FR: ['ES', 'IT', 'DE', 'BE', 'GB', 'PT', 'MA', 'CH', 'NL', 'US', 'GR', 'TN', 'TR', 'AT', 'HR', 'CA', 'IE', 'JP', 'CZ', 'EG'],
  IT: [
    'ES', 'FR', 'DE', 'GB', 'RO', 'GR', 'AT', 'HR', 'CH', 'PT', 'NL', 'AL', 'US', 'EG', 'TR', 'BE', 'CZ', 'MA', 'IE', 'MT',
    'TN', 'AE', 'PL', 'SI', 'HU', 'SE', 'DK', 'NO', 'BG', 'CY', 'ME', 'JP', 'TH', 'MX', 'DO', 'CU', 'BR', 'CA', 'AR', 'IS',
    'JO', 'ID', 'VN', 'TZ', 'KE', 'IN', 'ZA', 'SC', 'QA',
  ],
  ES: ['FR', 'PT', 'IT', 'MA', 'GB', 'DE', 'US', 'NL', 'CO', 'MX', 'BE', 'GR', 'IE', 'CH', 'AR', 'CL', 'CR', 'PE', 'JP'],
  AR: ['BR', 'CL', 'UY', 'PY', 'US', 'ES', 'IT', 'PE', 'BO', 'MX', 'DO', 'CO', 'FR', 'GB', 'PT', 'DE', 'PA', 'CU', 'CA', 'GR'],
  CO: ['US', 'MX', 'ES', 'PA', 'DO', 'EC', 'PE', 'CL', 'AR', 'BR', 'CR', 'IT', 'FR', 'CA', 'GB', 'PT', 'DE', 'NL'],
  CA: ['US', 'MX', 'DO', 'GB', 'IT', 'CU', 'FR', 'JM', 'ES', 'DE', 'PT', 'NL', 'GR', 'JP', 'IE', 'BS', 'CO', 'CR', 'AU', 'TR'],
  PL: ['DE', 'IT', 'ES', 'GB', 'GR', 'HR', 'CZ', 'SK', 'TR', 'AT', 'FR', 'HU', 'EG', 'NL', 'PT', 'BG', 'SE', 'NO', 'CY', 'US'],
  UA: ['PL', 'TR', 'EG', 'MD', 'RO', 'HU', 'SK', 'DE', 'CZ', 'BG', 'GR', 'ES', 'AT', 'IT', 'GB', 'FR', 'CY', 'ME', 'AE'],
  PE: ['CL', 'US', 'ES', 'CO', 'AR', 'MX', 'BR', 'BO', 'EC', 'PA', 'DO', 'IT', 'FR', 'CA', 'GB', 'CR', 'UY', 'PY', 'PT', 'DE'],
  AU: ['ID', 'NZ', 'JP', 'US', 'CN', 'GB', 'TH', 'IN', 'SG', 'VN', 'IT', 'GR', 'FJ', 'KR', 'PH', 'FR', 'MY', 'CA', 'DE'],
  CL: ['AR', 'BR', 'PE', 'US', 'ES', 'CO', 'MX', 'UY', 'DO', 'IT', 'FR', 'BO', 'PY', 'PT', 'GB', 'DE', 'PA', 'CA', 'CR', 'EC'],
  NL: ['DE', 'FR', 'ES', 'BE', 'IT', 'AT', 'GB', 'GR', 'TR', 'PT', 'SE', 'DK', 'NO', 'CH', 'HR', 'US', 'PL', 'CZ', 'IE', 'MA'],
  RO: ['IT', 'GR', 'ES', 'AT', 'BG', 'DE', 'FR', 'TR', 'HU', 'GB', 'NL', 'HR', 'BE', 'CZ', 'CY', 'EG', 'PT', 'PL', 'US', 'AE'],
  BE: ['FR', 'ES', 'NL', 'IT', 'DE', 'GB', 'AT', 'GR', 'PT', 'CH', 'TR', 'MA', 'HR', 'US', 'EG', 'TN', 'IE', 'SE', 'DK'],
  RU: ['TR', 'AE', 'EG', 'TH', 'CN', 'KZ', 'RS', 'ME', 'CU', 'IN', 'QA', 'ID', 'VN', 'LK', 'UZ'],
  SE: ['DE', 'ES', 'NO', 'GR', 'PL', 'DK', 'IT', 'FI', 'FR', 'GB', 'NL', 'TR', 'TH', 'PT', 'AT', 'US', 'HR', 'CH', 'CZ', 'CY'],
  CZ: ['SK', 'IT', 'AT', 'HR', 'PL', 'DE', 'GR', 'ES', 'HU', 'FR', 'TR', 'EG', 'GB', 'NL', 'RO', 'SI', 'BG', 'PT', 'CH', 'ME'],
  PT: ['ES', 'FR', 'IT', 'GB', 'CH', 'DE', 'NL', 'BR', 'US', 'BE', 'MA', 'GR', 'IE', 'HR', 'MX', 'CA', 'TR'],
  GR: ['IT', 'AL', 'GB', 'TR', 'DE', 'BG', 'CY', 'FR', 'ES', 'AT', 'NL', 'RO', 'RS', 'HR', 'EG', 'AE', 'US', 'CH', 'BE', 'CZ'],
  CH: ['DE', 'IT', 'FR', 'ES', 'AT', 'PT', 'GB', 'GR', 'NL', 'HR', 'TR', 'US', 'BE', 'TH', 'SE', 'CZ', 'HU', 'SI', 'MA', 'EG'],
};

const DEFAULT_TOP = ['ES', 'FR', 'DE', 'GB', 'US', 'GR', 'PT', 'NL', 'CH', 'AT', 'TH', 'JP', 'MX', 'BR', 'EG', 'MA', 'TR', 'AE', 'CA', 'AU'];

function getOriginCluster(originIso) {
  return ORIGIN_CLUSTER[String(originIso || '').toUpperCase()] || 'default';
}

function getMacroRegion(iso) {
  return ISO_MACRO_REGION[String(iso || '').toUpperCase()] || 'other';
}

function isSameBloc(originMacro, destMacro) {
  if (originMacro === destMacro) return true;
  if (originMacro === 'north_america' && (destMacro === 'central_america' || destMacro === 'caribbean')) return true;
  if (originMacro === 'central_america' && (destMacro === 'north_america' || destMacro === 'caribbean')) return true;
  if (originMacro === 'caribbean' && (destMacro === 'north_america' || destMacro === 'central_america')) return true;
  return false;
}

function classifyDestination(originIso, destIso) {
  const origin = String(originIso || '').toUpperCase();
  const dest = String(destIso || '').toUpperCase();
  if (!dest || dest === origin) return null;

  const originMacro = getMacroRegion(origin);
  const destMacro = getMacroRegion(dest);
  const cluster = getOriginCluster(origin);
  const matrix = CROSS_REGION_LIKELIHOOD[cluster] || CROSS_REGION_LIKELIHOOD.default;

  if (originMacro === 'europe' && destMacro === 'europe') return 'probabili';
  if (isSameBloc(originMacro, destMacro)) return 'probabili';

  return matrix[destMacro] || CROSS_REGION_LIKELIHOOD.default[destMacro] || 'improbabili';
}

/**
 * Raggruppa i paesi disponibili per onboarding in base alla residenza.
 * @param {string} residenceIso - ISO2 paese di residenza
 * @param {string[]} availableCountries - paesi presenti nell'app
 * @returns {{ key: string, label: string, defaultCollapsed: boolean, countries: string[] }[]}
 */
export function buildOnboardingCountryGroups(residenceIso, availableCountries = []) {
  const residence = String(residenceIso || '').toUpperCase();
  const available = new Set(
    (availableCountries || [])
      .map(c => String(c).toUpperCase())
      .filter(c => c && c !== residence)
  );

  const topRaw = TRAVEL_TOP_BY_ORIGIN[residence] || DEFAULT_TOP;
  const moltoProbabili = topRaw.filter(c => available.has(c));
  const assigned = new Set(moltoProbabili);

  const buckets = {
    molto_probabili: moltoProbabili,
    probabili: [],
    possibili: [],
    improbabili: [],
  };

  [...available].filter(c => !assigned.has(c)).forEach(iso => {
    const group = classifyDestination(residence, iso);
    if (group && buckets[group]) buckets[group].push(iso);
    else buckets.improbabili.push(iso);
  });

  return Object.entries(LIKELIHOOD_GROUPS)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key, meta]) => ({
      key,
      label: meta.label,
      defaultCollapsed: meta.defaultCollapsed,
      countries: buckets[key],
    }))
    .filter(g => g.countries.length > 0);
}

/**
 * Ordine piatto per compatibilità (ricerca, fallback senza residenza).
 */
export function sortCountriesForOnboarding(residenceIso, availableCountries = [], compareNames) {
  const groups = buildOnboardingCountryGroups(residenceIso, availableCountries);
  const sorted = groups.flatMap(g => {
    if (g.key === 'molto_probabili') return g.countries;
    if (typeof compareNames === 'function') {
      return [...g.countries].sort(compareNames);
    }
    return [...g.countries].sort();
  });
  return sorted;
}
