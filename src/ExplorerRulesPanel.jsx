import React, { useMemo } from 'react';

const EXPEDITION_CREDIT_MAX = 3;
const AI_RECOGNITION_MONTHLY_FREE = 5;

function currentYearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthsBetweenYearMonths(fromYm, toYm) {
  const [fy, fm] = String(fromYm || '').split('-').map(Number);
  const [ty, tm] = String(toYm || '').split('-').map(Number);
  if (!fy || !ty) return 0;
  return Math.max(0, (ty - fy) * 12 + (tm - fm));
}

function loadExpeditionCredits(userId) {
  if (typeof window === 'undefined') return { credits: 1, lastMonth: currentYearMonth() };
  const nowYm = currentYearMonth();
  const key = `animaldex_expedition_credits_${userId || 'guest'}`;
  try {
    const raw = JSON.parse(localStorage.getItem(key) || 'null');
    if (!raw || !raw.lastMonth) {
      const fresh = { credits: 1, lastMonth: nowYm };
      localStorage.setItem(key, JSON.stringify(fresh));
      return fresh;
    }
    const accrued = monthsBetweenYearMonths(raw.lastMonth, nowYm);
    const next = { credits: Math.min(EXPEDITION_CREDIT_MAX, Math.max(0, Number(raw.credits || 0)) + accrued), lastMonth: nowYm };
    if (accrued > 0) localStorage.setItem(key, JSON.stringify(next));
    return next;
  } catch {
    return { credits: 1, lastMonth: nowYm };
  }
}

function getAiGift(userId) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = JSON.parse(localStorage.getItem(`animaldex_ai_gift_${userId || 'guest'}`) || 'null');
    if (!raw || Number(raw.expiresAt || 0) < Date.now() || Number(raw.remaining || 0) <= 0) return null;
    return raw;
  } catch {
    return null;
  }
}

function getAiRecognitionAllowance(userId) {
  let used = 0;
  try { used = Number(localStorage.getItem(`animaldex_ai_usage_${userId || 'guest'}_${currentYearMonth()}`) || 0); } catch {}
  const gift = getAiGift(userId);
  const giftRemaining = gift ? Math.max(0, Number(gift.remaining || 0)) : 0;
  const baseRemaining = Math.max(0, AI_RECOGNITION_MONTHLY_FREE - used);
  return { used, baseRemaining, giftRemaining, remaining: baseRemaining + giftRemaining, giftExpiresAt: gift?.expiresAt || null };
}

function formatGiftExpiry(ts) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

function RuleRow({ icon, label, value, hint, accent, isLightTheme, last = false }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: last ? 'none' : `1px solid ${isLightTheme ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.06)'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
          <span style={{ color: isLightTheme ? '#171717' : 'rgba(255,255,255,.88)', fontSize: 12.5, fontWeight: 900 }}>{label}</span>
        </div>
        <span style={{ color: accent, fontSize: 12.5, fontWeight: 1000, flexShrink: 0 }}>{value || ''}</span>
      </div>
      {hint && <div style={{ color: isLightTheme ? 'rgba(0,0,0,.52)' : 'rgba(255,255,255,.48)', fontSize: 11, lineHeight: 1.4, marginTop: 5, paddingLeft: 24 }}>{hint}</div>}
    </div>
  );
}

export default function ExplorerRulesPanel({ userId = 'guest', theme = 'dark', compact = false }) {
  const isLightTheme = theme === 'light';
  const panelBg = isLightTheme ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.045)';
  const panelBorder = isLightTheme ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.08)';
  const mainText = isLightTheme ? '#171717' : 'white';

  const { expeditionCredits, aiAllowance } = useMemo(() => ({
    expeditionCredits: loadExpeditionCredits(userId),
    aiAllowance: getAiRecognitionAllowance(userId),
  }), [userId]);

  const giftHint = aiAllowance.giftRemaining > 0
    ? `+${aiAllowance.giftRemaining} Regalo di Spedizione attivo${aiAllowance.giftExpiresAt ? ` · scade ${formatGiftExpiry(aiAllowance.giftExpiresAt)}` : ''}`
    : null;

  return (
    <div style={{
      background: panelBg,
      border: `1px solid ${panelBorder}`,
      borderRadius: 18,
      padding: compact ? '12px 14px' : '14px 16px',
      marginBottom: compact ? 0 : 16,
    }}>
      <div style={{ color: mainText, fontSize: compact ? 16 : 18, fontWeight: 1000, marginBottom: 4 }}>
        {compact ? 'Le tue risorse' : 'Esploratore & Naturalista'}
      </div>
      {!compact && (
        <div style={{ color: isLightTheme ? 'rgba(0,0,0,.52)' : 'rgba(255,255,255,.48)', fontSize: 11.5, lineHeight: 1.45, marginBottom: 8 }}>
          Sul Campo = viaggi reali e catture. Atlante = conoscenza da casa (Documentato).
        </div>
      )}
      <RuleRow
        icon="🗺️"
        label="Crediti Spedizione"
        value={`${expeditionCredits.credits} / ${EXPEDITION_CREDIT_MAX}`}
        hint="1 al mese, cumulabili fino a 3. Attivano le ondate di specie in un nuovo paese Sul Campo."
        accent="#90D84A"
        isLightTheme={isLightTheme}
      />
      <RuleRow
        icon="📷"
        label="Riconoscimenti AI"
        value={`${aiAllowance.remaining} rimasti`}
        hint={giftHint || `${AI_RECOGNITION_MONTHLY_FREE} al mese. Servono per catturare: senza AI verificata niente trofeo.`}
        accent="#F0A840"
        isLightTheme={isLightTheme}
      />
      <RuleRow
        icon="📖"
        label="Documentato (Atlante)"
        hint="Sblocca scheda e curiosità da casa. Le statistiche di gioco restano premio di Avvistato/Catturato sul campo."
        accent="#9DD3FF"
        isLightTheme={isLightTheme}
        last
      />
    </div>
  );
}
