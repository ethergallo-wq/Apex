const { createClient } = require('@supabase/supabase-js');

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function notifyAdminByEmail(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.APEX_ADMIN_EMAIL;
  const from = process.env.APEX_EMAIL_FROM || 'Apex Dex <noreply@apex.local>';
  if (!apiKey || !to) return { sent: false, reason: 'email_not_configured' };

  const subject = `[Apex] Richiesta nuovo animale: ${payload.common_name || 'Specie sconosciuta'}`;
  const body = [
    'Nuova richiesta di aggiunta animale',
    '',
    `Nome comune: ${payload.common_name || '-'}`,
    `Nome scientifico: ${payload.scientific_name || '-'}`,
    `Utente: ${payload.user_email || payload.user_id || 'anonimo'}`,
    `Probabilità AI: ${payload.ai_probability ?? '-'}`,
    `Riepilogo AI: ${payload.ai_summary || '-'}`,
    `Foto: ${payload.photo_url || '-'}`,
    `GPS: ${payload.lat != null ? `${payload.lat}, ${payload.lng}` : '-'}`,
    '',
    'Controlla la tabella animal_add_requests su Supabase.',
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: body,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || 'Invio email non riuscito.');
  }
  return { sent: true };
}

module.exports = async function requestAnimalAdd(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Metodo non consentito.' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return sendJson(res, 400, { error: 'Payload non valido.' }); }
  }

  const commonName = String(body.common_name || '').trim();
  if (!commonName) return sendJson(res, 400, { error: 'Nome animale mancante.' });

  const row = {
    user_id: body.user_id || null,
    user_email: body.user_email || null,
    common_name: commonName.slice(0, 180),
    scientific_name: String(body.scientific_name || '').slice(0, 180) || null,
    photo_url: String(body.photo_url || '').slice(0, 2000) || null,
    photo_storage_path: String(body.photo_storage_path || '').slice(0, 500) || null,
    ai_summary: String(body.ai_summary || '').slice(0, 2000) || null,
    ai_probability: body.ai_probability != null ? Number(body.ai_probability) : null,
    lat: body.lat != null ? Number(body.lat) : null,
    lng: body.lng != null ? Number(body.lng) : null,
    status: 'pending',
  };

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return sendJson(res, 200, { ok: true, stored: false, notified: false, fallback: 'mailto' });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase.from('animal_add_requests').insert(row).select('id').single();
    if (error) throw error;

    let notified = false;
    try {
      const emailResult = await notifyAdminByEmail({ ...row, user_id: body.user_id, user_email: body.user_email });
      notified = !!emailResult.sent;
    } catch (emailErr) {
      console.warn('[Apex] request-animal-add email:', emailErr?.message || emailErr);
    }

    return sendJson(res, 200, { ok: true, stored: true, id: data?.id || null, notified });
  } catch (err) {
    return sendJson(res, 500, { error: err?.message || 'Salvataggio richiesta non riuscito.' });
  }
};
