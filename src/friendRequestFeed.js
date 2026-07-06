function getFriendRequestFeedStorageKey(userId = 'guest') {
  return `animaldex_friend_request_feed_${userId || 'guest'}`;
}

export function getFriendRequestFeedHistory(userId = 'guest') {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(getFriendRequestFeedStorageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addFriendRequestFeedHistory(userId = 'guest', entry = {}) {
  const clean = {
    id: String(entry.id || ''),
    profileUserId: String(entry.profileUserId || ''),
    nickname: String(entry.nickname || ''),
    username: String(entry.username || ''),
    action: entry.action === 'accepted' ? 'accepted' : 'ignored',
    at: entry.at || new Date().toISOString(),
  };
  if (!clean.id) return getFriendRequestFeedHistory(userId);
  const prev = getFriendRequestFeedHistory(userId).filter(item => item.id !== clean.id);
  const next = [clean, ...prev].slice(0, 40);
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(getFriendRequestFeedStorageKey(userId), JSON.stringify(next)); } catch {}
  }
  return next;
}
