export function isMobileInstallEnvironment({ navigatorRef, matchMediaRef } = {}) {
  const nav = navigatorRef || (typeof navigator !== 'undefined' ? navigator : null);
  if (!nav) return false;

  if (nav.userAgentData?.mobile === true) return true;

  const ua = String(nav.userAgent || '');
  const platform = String(nav.platform || '');
  const touchPoints = Number(nav.maxTouchPoints || 0);
  const isPhoneOrTabletUa = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobile/i.test(ua);
  const isIPadDesktopUa = platform === 'MacIntel' && touchPoints > 1;
  if (isPhoneOrTabletUa || isIPadDesktopUa) return true;

  const media = matchMediaRef || (typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia.bind(window)
    : null);
  if (!media || touchPoints < 1) return false;

  const coarsePointer = media('(pointer: coarse)').matches;
  const mobileViewport = media('(max-width: 900px)').matches;
  return Boolean(coarsePointer && mobileViewport);
}
