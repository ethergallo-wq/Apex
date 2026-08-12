import { lazy } from 'react';

const AUTO_RELOAD_KEY = 'animaldex_auto_recovery_ts';

export async function clearAppCaches() {
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {}
}

export function hardReloadApp({ bustCache = true } = {}) {
  const run = async () => {
    if (bustCache) await clearAppCaches();
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('_apex', String(Date.now()));
      window.location.replace(url.toString());
      return;
    } catch {}
    try {
      const target = `${window.location.pathname}${window.location.search}${window.location.hash || ''}` || '/';
      window.location.assign(target);
      return;
    } catch {}
    window.location.reload();
  };
  run();
}

export function tryAutoRecoveryOnce() {
  try {
    const last = Number(window.sessionStorage.getItem(AUTO_RELOAD_KEY) || 0);
    if (Date.now() - last < 15000) return false;
    window.sessionStorage.setItem(AUTO_RELOAD_KEY, String(Date.now()));
    hardReloadApp({ bustCache: true });
    return true;
  } catch {
    return false;
  }
}

export function isRecoverableLoadError(error) {
  const message = String(error?.message || error || '');
  return /Loading chunk|ChunkLoadError|dynamically imported module|Importing a module script failed|Failed to fetch/i.test(message);
}

export function lazyWithRetry(importer, retries = 2, delayMs = 800) {
  return lazy(() => {
    const attempt = (left) => importer().catch((error) => {
      if (left <= 0) throw error;
      return new Promise((resolve) => window.setTimeout(resolve, delayMs)).then(() => attempt(left - 1));
    });
    return attempt(retries);
  });
}
