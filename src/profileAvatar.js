import { supabase } from './supabaseClient';

function getProfileAvatarStorageKey(userId = 'guest') {
  return `animaldex_profile_avatar_animal_${userId || 'guest'}`;
}

export function getProfileAvatarAnimalId(userId = 'guest') {
  if (typeof window === 'undefined') return '';
  try { return String(window.localStorage.getItem(getProfileAvatarStorageKey(userId)) || ''); } catch { return ''; }
}

export function persistProfileAvatarAnimalId(userId = 'guest', animalId = '') {
  if (typeof window === 'undefined') return;
  try {
    const key = getProfileAvatarStorageKey(userId);
    const clean = String(animalId || '');
    if (clean) window.localStorage.setItem(key, clean);
    else window.localStorage.removeItem(key);
  } catch {}
}

export async function saveProfileAvatarAnimal(userId, animal) {
  const cleanId = String(animal?.id || '');
  persistProfileAvatarAnimalId(userId || 'guest', cleanId);
  if (!userId || userId === 'guest' || userId === 'local' || !cleanId) return true;
  const { error } = await supabase
    .from('user_profiles')
    .update({ avatar_url: animal?.image_url || '', updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error && error.code !== '42703') throw error;
  return true;
}

export function getProfileAvatarChoices(animalsWithStatus = []) {
  return (animalsWithStatus || []).filter(a => ['avvistato', 'catturato'].includes(String(a.status || '').toLowerCase()));
}

export function resolveProfileAvatarAnimal({ animalsWithStatus = [], profileAvatarAnimalId = '', userProfile = null } = {}) {
  const choices = getProfileAvatarChoices(animalsWithStatus);
  const byId = choices.find(a => String(a.id) === String(profileAvatarAnimalId));
  if (byId) return byId;
  const avatarUrl = userProfile?.avatar_url || '';
  if (avatarUrl) {
    const byUrl = choices.find(a => a.image_url === avatarUrl);
    if (byUrl) return byUrl;
  }
  return choices[0] || null;
}
