import React from 'react';
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
    .update({ avatar_url: animal?.image_url || animal?.img || '', updated_at: new Date().toISOString() })
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

export function getProfileAvatarImageUrl(animal) {
  return animal?.image_url || animal?.img || '';
}

export function ProfileAvatarImage({ animal, size = 64, fallbackLetter = '?', fallbackUrl = '' }) {
  const imageUrl = getProfileAvatarImageUrl(animal) || fallbackUrl;
  if (!imageUrl) {
    return (
      <span style={{ color: 'white', fontSize: Math.round(size * 0.38), fontWeight: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        {String(fallbackLetter || '?').slice(0, 1).toUpperCase()}
      </span>
    );
  }
  const pad = Math.round(size * 0.08);
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: pad, boxSizing: 'border-box' }}>
      <img
        src={imageUrl}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.2)', transformOrigin: 'center', display: 'block' }}
      />
    </div>
  );
}
