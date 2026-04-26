// src/supabaseClient.js
// ============================================================
// Installa: npm install @supabase/supabase-js
// Crea .env.local con:
//   REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
//   REACT_APP_SUPABASE_ANON_KEY=eyJhbGci...
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── AUTH ─────────────────────────────────────────────────────

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── USER ANIMALS ─────────────────────────────────────────────

// Carica tutti gli animal-status dell'utente corrente
// Ritorna: { [animal_sci]: { status, discovery_date, notes, ... } }
export async function loadUserAnimals(userId) {
  const { data, error } = await supabase
    .from('user_animals')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  // Trasforma in mappa per lookup veloce
  const map = {};
  for (const row of data) {
    map[row.animal_sci] = row;
  }
  return map;
}

// Aggiorna o crea lo status di un animale per l'utente
export async function upsertAnimalStatus(userId, animalSci, status) {
  const { data, error } = await supabase
    .from('user_animals')
    .upsert({
      user_id: userId,
      animal_sci: animalSci,
      status,
      discovery_date: status !== 'non visto' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,animal_sci' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Aggiorna note e posizione di un avvistamento
export async function updateAnimalDetails(userId, animalSci, { notes, location_lat, location_lng, photo_url }) {
  const { data, error } = await supabase
    .from('user_animals')
    .update({ notes, location_lat, location_lng, photo_url, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('animal_sci', animalSci)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── USER PREFERENCES ─────────────────────────────────────────

export async function loadUserPreferences(userId) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code === 'PGRST116') {
    // Nessuna preferenza ancora: crea default
    return createDefaultPreferences(userId);
  }
  if (error) throw error;
  return data;
}

export async function createDefaultPreferences(userId) {
  const defaults = {
    user_id: userId,
    ui_theme: 'dark',
    language: 'it',
    notifications_enabled: true,
    filters_saved: {},
  };
  const { data, error } = await supabase
    .from('user_preferences')
    .insert(defaults)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function saveUserPreferences(userId, prefs) {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── BADGES ───────────────────────────────────────────────────

export async function loadUserBadges(userId) {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badges(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function awardBadge(userId, badgeId) {
  const { data, error } = await supabase
    .from('user_badges')
    .upsert({ user_id: userId, badge_id: badgeId }, { onConflict: 'user_id,badge_id' })
    .select();
  if (error) throw error;
  return data;
}

// Controlla e assegna badge automaticamente dopo ogni cambio status
export async function checkAndAwardBadges(userId, userAnimalsMap, newStatus, animalRarity) {
  const { data: allBadges } = await supabase.from('badges').select('*');
  const { data: earned } = await supabase.from('user_badges').select('badge_id').eq('user_id', userId);
  const earnedIds = new Set((earned || []).map(b => b.badge_id));

  const counts = Object.values(userAnimalsMap).reduce((acc, a) => {
    if (a.status === 'avvistato' || a.status === 'fotografato') acc.avvistati++;
    if (a.status === 'fotografato') acc.fotografati++;
    return acc;
  }, { avvistati: 0, fotografati: 0 });

  const newBadges = [];
  for (const badge of (allBadges || [])) {
    if (earnedIds.has(badge.id)) continue;
    let earned = false;
    if (badge.requirement_type === 'count_avvistati' && counts.avvistati >= badge.requirement_value) earned = true;
    if (badge.requirement_type === 'count_fotografati' && counts.fotografati >= badge.requirement_value) earned = true;
    if (badge.requirement_type === 'fotografato_leggendario' && newStatus === 'fotografato' && animalRarity === 'Leggendario') earned = true;
    if (earned) {
      await awardBadge(userId, badge.id);
      newBadges.push(badge);
    }
  }
  return newBadges; // badge appena guadagnati (per mostrare notifica)
}

// ── STORAGE IMMAGINI ─────────────────────────────────────────

// URL pubblico di un'immagine dal bucket 'animals'
export function getAnimalImageUrl(filename) {
  const { data } = supabase.storage.from('animals').getPublicUrl(filename);
  return data.publicUrl;
}

// Upload foto personale avvistamento (bucket 'user-photos')
export async function uploadUserPhoto(userId, animalSci, file) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${animalSci}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('user-photos').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('user-photos').getPublicUrl(path);
  return data.publicUrl;
}
