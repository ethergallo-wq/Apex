/** Mobile-optimized home tile images (~640px WebP, ~12–35 KB each). */
export const HOME_EXPLORE_TILES = {
  regioni: { webp: '/home/regioni.webp', fallback: '/regions/home_regioni.png' },
  tree: { webp: '/home/background_tree.webp', fallback: '/backgrounds/background_tree.png' },
  amici: { webp: '/home/background_amici.webp', fallback: '/backgrounds/background_amici.png' },
  badges: { webp: '/home/background_badges.webp', fallback: '/backgrounds/background_badges.png' },
};

export function getHomeExploreImage(tileKey) {
  const tile = HOME_EXPLORE_TILES[tileKey];
  return tile?.webp || tile?.fallback || '';
}

export function preloadImageUrl(src, { priority = false } = {}) {
  if (!src || typeof window === 'undefined') return;
  const img = new Image();
  img.decoding = 'async';
  if (priority && 'fetchPriority' in img) img.fetchPriority = 'high';
  img.src = src;
}

export function preloadHomeExploreImages(tileKeys = Object.keys(HOME_EXPLORE_TILES)) {
  if (typeof window === 'undefined') return;
  tileKeys.forEach((key) => preloadImageUrl(getHomeExploreImage(key)));
}
