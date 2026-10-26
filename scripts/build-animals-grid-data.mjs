#!/usr/bin/env node
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'src/animals-data.js');
const TARGET = join(ROOT, 'src/animals-data-grid.js');
const DETAILS = join(ROOT, 'public/data/animal-details');

const STRIP_KEYS = new Set(['desc', 'bio', 'ety', 'cat_curiosities', 'geo', 'iucn', 'bioregions_v4']);

function slimAnimal(animal) {
  const geo = animal.geo || {};
  const next = { ...animal };

  for (const key of STRIP_KEYS) delete next[key];

  next.map_profile = next.map_profile || geo.map_profile || '';
  next.bio_regions = next.bio_regions || geo.bio_regions || [];
  next.game_regions = next.game_regions || geo.game_regions || [];
  next.habitats = next.habitats || next.habitat || geo.habitats || geo.habitat_ids || next.hab || [];
  next.map_bioregion_ids_v4 = next.map_bioregion_ids_v4 || geo.map_bioregion_ids_v4 || [];
  next.map_bioregion_domains_v4 = next.map_bioregion_domains_v4 || geo.map_bioregion_domains_v4 || [];
  next.confidence = next.confidence || geo.confidence || geo.bioregion_confidence || '';

  const distribution = animal.distribution || {};
  next.distribution = {
    countries_present: distribution.countries_present || [],
    ...(distribution.total_observations !== undefined ? { total_observations:distribution.total_observations } : {}),
    ...(distribution.wild_observations !== undefined ? { wild_observations:distribution.wild_observations } : {}),
  };

  return next;
}

const { ANIMALS } = await import(pathToFileURL(SOURCE).href);
mkdirSync(DETAILS, { recursive: true });
const generated = new Set();
const ids = new Set();
const slim = (ANIMALS || []).map(animal => {
  const id = String(animal.id);
  if (!/^\d+$/.test(id) || ids.has(id)) throw new Error(`Invalid or duplicate animal id: ${id}`);
  ids.add(id);
  const json = JSON.stringify(animal);
  const hash = createHash('sha256').update(json).digest('hex').slice(0, 16);
  const filename = `${id}.${hash}.json`;
  writeFileSync(join(DETAILS, filename), json);
  generated.add(filename);
  return { ...slimAnimal(animal), _detailUrl: `/data/animal-details/${filename}` };
});
// Remove only files produced by this generator, keeping its .gitignore.
for (const filename of readdirSync(DETAILS)) {
  if (/^\d+\.[a-f0-9]{16}\.json$/.test(filename) && !generated.has(filename)) unlinkSync(join(DETAILS, filename));
}
const body = `export const ANIMALS = ${JSON.stringify(slim)};\n`;
writeFileSync(TARGET, body, 'utf8');

const mb = (n) => `${(n / (1024 * 1024)).toFixed(2)} MB`;
console.log(`[build-animals-grid] ${slim.length} animals -> ${TARGET}`);
console.log(`[build-animals-grid] output size: ${mb(Buffer.byteLength(body, 'utf8'))}`);
