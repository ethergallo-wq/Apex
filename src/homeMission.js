import {
  buildGenericAnimalSlots,
  buildMissionAnimalSlots,
  formatMissionCopy,
  resolveMissionAccentImage,
} from './homeMissionUi';

export function buildHomeMission(progress = {}) {
  const nearly = progress.nearlyCompletedBadges?.[0];
  const animalsWithStatus = progress.animalsWithStatus || [];

  if (nearly) {
    const remaining = Math.max(0, nearly.target - nearly.current);
    const copy = formatMissionCopy({
      badgeName: nearly.name,
      remaining,
      goal: nearly.goal || nearly.sub || 'Continua la tua collezione',
    });
    const animalSlots = buildMissionAnimalSlots({
      metric: nearly.metric,
      current: nearly.current,
      remaining,
      animalsWithStatus,
    });
    return {
      eyebrow: 'Missione di oggi',
      title: `${copy.titleLine1} — ${copy.titleLine2}`,
      titleLine1: copy.titleLine1,
      titleLine2: copy.titleLine2,
      subtitle: copy.subtitle,
      cta: 'Vai al Dex ›',
      action: 'badge',
      badgeId: nearly.badgeId,
      badgeName: nearly.name,
      metric: nearly.metric,
      macroId: nearly.macroId,
      accentImage: resolveMissionAccentImage({
        badgeId: nearly.badgeId,
        metric: nearly.metric,
        macroId: nearly.macroId,
      }),
      animalSlots,
    };
  }

  if ((progress.searchedCount || 0) > 0) {
    const count = progress.searchedCount;
    return {
      eyebrow: 'Missione di oggi',
      title: `${count} animali da trovare nel Dex`,
      titleLine1: `${count} animali da trovare`,
      titleLine2: 'Apri il Dex e completa la collezione',
      subtitle: 'Esplora la griglia e avvista nuove specie',
      cta: 'Vai al Dex ›',
      action: 'grid-all',
      accentImage: '/regions/eco-foreste-nordamericane.jpg',
      animalSlots: buildGenericAnimalSlots(animalsWithStatus, ['ricercato']),
    };
  }

  if ((progress.seenCount || 0) > 0) {
    const count = progress.seenCount;
    return {
      eyebrow: 'Missione di oggi',
      title: `${count} avvistati — completali con una cattura`,
      titleLine1: `${count} avvistati`,
      titleLine2: 'Completa con una cattura',
      subtitle: 'Usa la fotocamera o apri le schede animali',
      cta: 'Vai al Dex ›',
      action: 'grid-seen',
      accentImage: '/regions/amazzonia.jpg',
      animalSlots: buildGenericAnimalSlots(animalsWithStatus, ['avvistato']),
    };
  }

  return {
    eyebrow: 'Missione di oggi',
    title: 'Esplora il mondo e inizia la collezione',
    titleLine1: 'Esplora il mondo',
    titleLine2: 'Inizia la collezione',
    subtitle: 'Scegli un territorio e scopri i primi animali',
    cta: 'Esplora Territori ›',
    action: 'regions',
    accentImage: '/regions/afrotropici_equatoriali.jpg',
    animalSlots: buildGenericAnimalSlots(animalsWithStatus, ['ricercato', 'avvistato', 'catturato']),
  };
}
