import { isMobileInstallEnvironment } from './mobileRuntime';

const media = ({ coarse = false, narrow = false } = {}) => query => ({
  matches:query.includes('pointer: coarse') ? coarse : narrow,
});

test('does not show the install guide on desktop', () => {
  expect(isMobileInstallEnvironment({
    navigatorRef:{ userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X)', platform:'MacIntel', maxTouchPoints:0 },
    matchMediaRef:media(),
  })).toBe(false);
});

test('shows the install guide on phones and tablets', () => {
  expect(isMobileInstallEnvironment({ navigatorRef:{ userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)', platform:'iPhone', maxTouchPoints:5 } })).toBe(true);
  expect(isMobileInstallEnvironment({ navigatorRef:{ userAgent:'Mozilla/5.0 (Linux; Android 15)', platform:'Linux armv8l', maxTouchPoints:5 } })).toBe(true);
  expect(isMobileInstallEnvironment({ navigatorRef:{ userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X)', platform:'MacIntel', maxTouchPoints:5 } })).toBe(true);
});

test('uses touch and viewport signals when the user agent is inconclusive', () => {
  expect(isMobileInstallEnvironment({
    navigatorRef:{ userAgent:'Unknown', platform:'Unknown', maxTouchPoints:1 },
    matchMediaRef:media({ coarse:true, narrow:true }),
  })).toBe(true);
});
