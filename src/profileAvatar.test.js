import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  getProfileAvatarChoices,
  resolveProfileAvatarAnimal,
  getProfileAvatarImageUrl,
  ProfileAvatarImage,
} from './profileAvatar';

const mockAnimals = [
  { id: 1, com: 'Leone', sci: 'Panthera leo', status: 'catturato', image_url: '/animals/leone.png' },
  { id: 2, com: 'Tigre', sci: 'Panthera tigris', status: 'avvistato', image_url: '/animals/tigre.png' },
  { id: 3, com: 'Orso', sci: 'Ursus arctos', status: 'ricercato', image_url: '/animals/orso.png' },
];

test('getProfileAvatarChoices filters seen/captured animals', () => {
  const choices = getProfileAvatarChoices(mockAnimals);
  expect(choices).toHaveLength(2);
  expect(choices.map(a => a.id)).toEqual([1, 2]);
});

test('resolveProfileAvatarAnimal picks by id then fallback', () => {
  const byId = resolveProfileAvatarAnimal({ animalsWithStatus: mockAnimals, profileAvatarAnimalId: '2' });
  expect(byId?.id).toBe(2);
  const fallback = resolveProfileAvatarAnimal({ animalsWithStatus: mockAnimals, profileAvatarAnimalId: '' });
  expect(fallback?.id).toBe(1);
});

test('ProfileAvatarImage renders without crashing', () => {
  const animal = mockAnimals[0];
  render(<ProfileAvatarImage animal={animal} size={64} fallbackLetter="A" />);
  expect(getProfileAvatarImageUrl(animal)).toContain('/animals/thumbs/leone.webp');
});
