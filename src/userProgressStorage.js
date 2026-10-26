let activeUserId = 'guest';

export function setProgressStorageUser(userId) {
  activeUserId = userId || 'guest';
}

function keyFor(name, userId = activeUserId) {
  // Legacy unowned data stays available to guests, but is never silently
  // assigned to a signed-in account. Remote progress restores that account.
  return userId === 'guest' ? `animaldex_${name}` : `animaldex_${name}_${userId}`;
}

export function readUserProgress(name, fallback, userId) {
  try {
    const stored = localStorage.getItem(keyFor(name, userId));
    return stored === null ? fallback : JSON.parse(stored);
  } catch { return fallback; }
}

export function writeUserProgress(name, value, userId) {
  try { localStorage.setItem(keyFor(name, userId), JSON.stringify(value)); } catch {}
}
