const HOME_VARIANT_KEY = 'animaldex_home_variant';
const HOME_VARIANT_EVENT = 'animaldex-home-variant';

export const HOME_VARIANTS = {
  classic: 'classic',
  v2: 'v2',
};

function readEnvDefault() {
  const env = process.env.REACT_APP_HOME_VARIANT;
  return env === HOME_VARIANTS.v2 ? HOME_VARIANTS.v2 : HOME_VARIANTS.classic;
}

function readUrlOverride() {
  if (typeof window === 'undefined') return null;
  try {
    const param = new URLSearchParams(window.location.search).get('home');
    if (param === HOME_VARIANTS.v2 || param === HOME_VARIANTS.classic) return param;
  } catch {}
  return null;
}

function readStoredVariant() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(HOME_VARIANT_KEY);
    if (saved === HOME_VARIANTS.v2 || saved === HOME_VARIANTS.classic) return saved;
  } catch {}
  return null;
}

export function getHomeVariant() {
  return readUrlOverride() || readStoredVariant() || readEnvDefault();
}

export function setHomeVariant(variant) {
  const next = variant === HOME_VARIANTS.v2 ? HOME_VARIANTS.v2 : HOME_VARIANTS.classic;
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(HOME_VARIANT_KEY, next); } catch {}
    try { window.dispatchEvent(new CustomEvent(HOME_VARIANT_EVENT, { detail: next })); } catch {}
  }
  return next;
}

export function getHomeVariantLabel(variant) {
  return variant === HOME_VARIANTS.v2 ? 'Home sperimentale (v2)' : 'Home classica';
}

export function subscribeHomeVariant(listener) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => listener(getHomeVariant());
  window.addEventListener(HOME_VARIANT_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(HOME_VARIANT_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
