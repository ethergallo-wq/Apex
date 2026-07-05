const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-5.5';

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function extractOutputText(responseData = {}) {
  if (typeof responseData.output_text === 'string') return responseData.output_text;
  const chunks = [];
  for (const item of responseData.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n').trim();
}

function normalizeCandidate(candidate = {}) {
  return {
    id: candidate.id ?? null,
    sci: String(candidate.sci || '').slice(0, 120),
    com: String(candidate.com || '').slice(0, 120),
    com_en: String(candidate.com_en || '').slice(0, 120),
    cls: String(candidate.cls || '').slice(0, 80),
    countries: Array.isArray(candidate.countries) ? candidate.countries.slice(0, 16) : [],
    habitat_ids: Array.isArray(candidate.habitat_ids) ? candidate.habitat_ids.slice(0, 16) : [],
  };
}

const identificationSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    identification_status: {
      type: 'string',
      enum: ['certain', 'alternatives', 'unusable'],
    },
    summary: { type: 'string' },
    image_quality: { type: 'string' },
    unusable_reason: { type: ['string', 'null'] },
    alternatives: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          matched_animal_id: { type: ['integer', 'null'] },
          common_name: { type: 'string' },
          scientific_name: { type: 'string' },
          probability: { type: 'number', minimum: 0, maximum: 100 },
          reasoning: { type: 'string' },
        },
        required: ['matched_animal_id', 'common_name', 'scientific_name', 'probability', 'reasoning'],
      },
    },
  },
  required: ['identification_status', 'summary', 'image_quality', 'unusable_reason', 'alternatives'],
};

module.exports = async function identifyAnimal(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Metodo non consentito.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, { error: 'OPENAI_API_KEY non configurata sul server.' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return sendJson(res, 400, { error: 'Payload non valido.' });
    }
  }

  const imageUrl = body.image_url || body.image_data_url || '';
  if (!imageUrl || typeof imageUrl !== 'string') {
    return sendJson(res, 400, { error: 'Foto mancante.' });
  }
  if (imageUrl.startsWith('data:') && imageUrl.length > 8_000_000) {
    return sendJson(res, 413, { error: 'Foto troppo grande. Riprova con un file più leggero.' });
  }

  const candidates = Array.isArray(body.candidates) ? body.candidates.slice(0, 1400).map(normalizeCandidate) : [];
  const expected = {
    animal_id: body.expected_animal_id ?? null,
    sci: body.expected_sci || '',
    gps: body.gps || null,
    expected_habitat_ids: Array.isArray(body.expected_habitat_ids) ? body.expected_habitat_ids : [],
  };

  const prompt = [
    'Analizza la foto e identifica l\'animale in modo prudente.',
    'Se l\'animale è visivamente inequivocabile, usa identification_status="certain" e una sola alternativa con probabilità 100.',
    'Se non sei certa al 100%, usa identification_status="alternatives" e proponi massimo 5 alternative, con probabilità percentuali realistiche.',
    'Se immagine, distanza, sfocatura, occlusione, illuminazione o soggetto non permettono un\'identificazione utile, usa identification_status="unusable", spiega il motivo in summary con tono chiaro e pratico in italiano, e lascia alternatives vuoto.',
    'Rispondi sempre in italiano. summary massimo 2 frasi brevi.',
    'Quando possibile collega l\'ipotesi a uno degli animali del Dex usando matched_animal_id. Se nessun candidato combacia, usa null.',
    'Non inventare certezza: una foto parziale deve produrre alternative o unusable.',
    '',
    `Contesto atteso: ${JSON.stringify(expected)}`,
    `Candidati Dex disponibili: ${JSON.stringify(candidates)}`,
  ].join('\n');

  try {
    const openaiResponse = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL || DEFAULT_MODEL,
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: prompt },
              { type: 'input_image', image_url: imageUrl },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'animal_identification',
            strict: true,
            schema: identificationSchema,
          },
        },
        max_output_tokens: 900,
      }),
    });

    const responseData = await openaiResponse.json().catch(() => ({}));
    if (!openaiResponse.ok) {
      const message = responseData?.error?.message || 'Riconoscimento OpenAI non riuscito.';
      return sendJson(res, openaiResponse.status, { error: message });
    }

    const text = extractOutputText(responseData);
    const parsed = JSON.parse(text);
    return sendJson(res, 200, parsed);
  } catch (err) {
    return sendJson(res, 500, { error: err?.message || 'Riconoscimento non riuscito.' });
  }
};
