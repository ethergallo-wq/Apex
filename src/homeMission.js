export function buildHomeMission(progress = {}) {
  const nearly = progress.nearlyCompletedBadges?.[0];
  if (nearly) {
    const remaining = Math.max(0, nearly.target - nearly.current);
    const remainingLabel = remaining <= 1 ? 'manca 1 animale' : `mancano ${remaining} animali`;
    return {
      eyebrow: 'Missione di oggi',
      title: `Completa il badge ${nearly.name} — ${remainingLabel}`,
      subtitle: nearly.goal || nearly.sub || 'Continua la tua collezione',
      cta: 'Vai al Dex ›',
      action: 'badge',
      badgeId: nearly.badgeId,
      badgeName: nearly.name,
      accentImage: '/regions/afrotropici_equatoriali.jpg',
    };
  }

  if ((progress.searchedCount || 0) > 0) {
    return {
      eyebrow: 'Missione di oggi',
      title: `${progress.searchedCount} animali da trovare nel Dex`,
      subtitle: 'Esplora la griglia e avvista nuove specie',
      cta: 'Vai al Dex ›',
      action: 'grid-all',
      accentImage: '/backgrounds/background_grid.png',
    };
  }

  if ((progress.seenCount || 0) > 0) {
    return {
      eyebrow: 'Missione di oggi',
      title: `${progress.seenCount} avvistati — completali con una cattura`,
      subtitle: 'Usa la fotocamera o apri le schede animali',
      cta: 'Vai al Dex ›',
      action: 'grid-seen',
      accentImage: '/regions/amazzonia.jpg',
    };
  }

  return {
    eyebrow: 'Missione di oggi',
    title: 'Esplora il mondo e inizia la collezione',
    subtitle: 'Scegli un territorio e scopri i primi animali',
    cta: 'Esplora Territori ›',
    action: 'regions',
    accentImage: '/home_regioni.png',
  };
}
