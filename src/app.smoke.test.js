import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

let mockAuthCallbackReturn;

jest.mock('./supabaseClient', () => {
  const profile = {
    user_id: 'test-user-123',
    nickname: 'TestUser',
    username: 'testuser',
    onboarding_completed: true,
    has_completed_tutorial: true,
  };

  const resultFor = (table, selected = '') => {
    if (table === 'user_profiles') return { data: profile, error: null };
    if (table === 'user_animals' && selected.includes('unlock_status')) {
      return { data: [{ animal_id: 2, unlock_status: 'collected' }], error: null };
    }
    if (table === 'user_destinations') return { data: [{ iso: 'IT' }], error: null };
    if (table === 'user_badges' && selected === 'badge_id') return { data: [{ badge_id: 'ONB-01-L1' }], error: null };
    return { data: [], error: null };
  };

  const makeQuery = (table) => {
    let selected = '';
    const chain = {
      select: (columns = '') => { selected = String(columns); return chain; },
      insert: () => chain,
      update: () => chain,
      upsert: () => chain,
      delete: () => chain,
      eq: () => chain,
      neq: () => chain,
      in: () => chain,
      not: () => chain,
      is: () => chain,
      or: () => chain,
      order: () => chain,
      limit: () => chain,
      abortSignal: () => chain,
      maybeSingle: async () => resultFor(table, selected),
      single: async () => resultFor(table, selected),
      then: (resolve, reject) => Promise.resolve(resultFor(table, selected)).then(resolve, reject),
    };
    return chain;
  };

  return {
    getMockAuthCallbackReturn: () => mockAuthCallbackReturn,
    supabase: {
      auth: {
        getSession: async () => ({
          data: {
            session: {
              user: { id: 'test-user-123', email: 'test@example.com' },
              access_token: 'mock-token',
            },
          },
          error: null,
        }),
        onAuthStateChange: (cb) => {
          mockAuthCallbackReturn = cb('INITIAL_SESSION', {
            user: { id: 'test-user-123', email: 'test@example.com' },
            access_token: 'mock-token',
          });
          return { data: { subscription: { unsubscribe() {} } } };
        },
        signOut: async () => ({ error: null }),
      },
      from: (table) => makeQuery(table),
      rpc: async () => ({ data: null, error: null }),
    },
  };
});

import App from './Animaldex_sora';
import { getMockAuthCallbackReturn } from './supabaseClient';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('animaldex_home_v2_rollout', '1');
  localStorage.setItem('animaldex_user_status_test-user-123', JSON.stringify({ '1': 'catturato', '2': 'avvistato' }));
});

test('logged-in home renders without crash screen', async () => {
  const warnings = [];
  const spy = jest.spyOn(console, 'warn').mockImplementation((...args) => {
    warnings.push(args.join(' '));
  });

  render(<App />);

  await waitFor(() => {
    const text = document.body.textContent || '';
    expect(text.length).toBeGreaterThan(20);
    expect(text.includes('Apex si sta ricaricando')).toBe(false);
  }, { timeout: 15000 });

  spy.mockRestore();
  const text = document.body.textContent || '';
  if (text.includes('Apex si sta ricaricando')) {
    throw new Error(`Home crashed. Warnings: ${warnings.filter(w => w.includes('fallback') || w.includes('Error')).join(' | ')}`);
  }

  fireEvent.click(await screen.findByRole('button', { name: /Esplora Dex/i }));
  expect(await screen.findByRole('button', { name: 'Cerca' })).toBeInTheDocument();
});

test('auth callback stays synchronous and Supabase progress is applied before home is ready', async () => {
  render(<App />);

  await waitFor(() => {
    expect(getMockAuthCallbackReturn()).toBeUndefined();
    const stored = JSON.parse(localStorage.getItem('animaldex_user_status_test-user-123') || '{}');
    expect(stored['2']).toBe('catturato');
    expect(document.body.textContent).not.toContain('Sincronizzando i tuoi progressi');
  }, { timeout: 15000 });
});
