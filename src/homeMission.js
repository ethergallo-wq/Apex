export function buildHomeMission(progress = {}) {
  const nearly = progress.nearlyCompletedBadges?.[0];
  if (nearly) {
    const remaining = Math.max(0, nearly.target - nearly.current);
    return {
      eyebrow: 'Missione di oggi',
      title: `Completa il badge ${nearly.name}`,
      subtitle: remaining <= 1 ? 'Manca 1 passo per sbloccarlo' : `Mancano ${remaining} per sbloccarlo`,
      cta: 'Vai al badge',
      action: 'badge',
      badgeId: nearly.badgeId,
    };
  }

  if ((progress.searchedCount || 0) > 0) {
    return {
      eyebrow: 'Missione di oggi',
      title: `${progress.searchedCount} animali da trovare`,
      subtitle: 'Esplora il Dex e avvista nuove specie',
      cta: 'Vai al Dex',
      action: 'grid-all',
    };
  }

  if ((progress.seenCount || 0) > 0) {
    return {
      eyebrow: 'Missione di oggi',
      title: `${progress.seenCount} avvistati da catturare`,
      subtitle: 'Completa le catture nel tuo percorso',
      cta: 'Vai alle catture',
      action: 'grid-seen',
    };
  }

  return {
    eyebrow: 'Missione di oggi',
    title: 'Esplora il mondo animale',
    subtitle: 'Apri Territori o il Dex per iniziare la collezione',
    cta: 'Esplora Territori',
    action: 'regions',
  };
}
