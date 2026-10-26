import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

let mockAuthCallbackReturn;
let mockEmitAuth;
const originalIntersectionObserver = window.IntersectionObserver;

class PassiveIntersectionObserver {
  observe() {}
  disconnect() {}
}

jest.mock('./supabaseClient', () => {
  const profile = {
    user_id: 'test-user-123',
    nickname: 'TestUser',
    username: 'testuser',
    onboarding_completed: true,
    has_completed_tutorial: true,
  };

  const resultFor = (table, selected = '', userId = profile.user_id) => {
    if (table === 'user_profiles') return { data: { ...profile, user_id: userId }, error: null };
    if (userId === 'second-user') return { data: [], error: null };
    if (table === 'user_animals' && selected.includes('unlock_status')) {
      return { data: [{ animal_id: 2, unlock_status: 'collected' }], error: null };
    }
    if (table === 'user_destinations') return { data: [{ iso: 'IT' }], error: null };
    if (table === 'user_badges' && selected === 'badge_id') return { data: [{ badge_id: 'ONB-01-L1' }], error: null };
    return { data: [], error: null };
  };

  const makeQuery = (table) => {
    let selected = '';
    let offset = 0;
    let userId = profile.user_id;
    const chain = {
      select: (columns = '') => { selected = String(columns); return chain; },
      insert: () => chain,
      update: () => chain,
      upsert: () => chain,
      delete: () => chain,
      eq: (column, value) => { if (column === 'user_id') userId = value; return chain; },
      neq: () => chain,
      in: () => chain,
      not: () => chain,
      is: () => chain,
      or: () => chain,
      order: () => chain,
      limit: () => chain,
      range: (start) => { offset = start; return chain; },
      abortSignal: () => chain,
      maybeSingle: async () => resultFor(table, selected, userId),
      single: async () => resultFor(table, selected, userId),
      then: (resolve, reject) => Promise.resolve(offset ? { data: [], error: null } : resultFor(table, selected, userId)).then(resolve, reject),
    };
    return chain;
  };

  return {
    getMockAuthCallbackReturn: () => mockAuthCallbackReturn,
    emitMockAuth: session => mockEmitAuth('SIGNED_IN', session),
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
          mockEmitAuth = cb;
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
import { emitMockAuth, getMockAuthCallbackReturn } from './supabaseClient';

beforeEach(() => {
  window.IntersectionObserver = PassiveIntersectionObserver;
  localStorage.clear();
  localStorage.setItem('animaldex_home_v2_rollout', '1');
  localStorage.setItem('animaldex_user_status_test-user-123', JSON.stringify({ '1': 'catturato', '2': 'avvistato' }));
});

afterEach(() => {
  window.IntersectionObserver = originalIntersectionObserver;
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
  fireEvent.click(screen.getByRole('button', { name: /Misterioso/i }));
  await waitFor(() => {
    const gridScroller = document.querySelector('[data-item-count]');
    expect(Number(gridScroller?.dataset.itemCount || 0)).toBeGreaterThan(60);
    expect(Number(gridScroller?.dataset.renderedCount || 0)).toBe(60);
  });
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

test('switching accounts clears the previous account progress before syncing', async () => {
  render(<App />);
  await screen.findByRole('button', { name: /Esplora Dex/i }, { timeout: 15000 });
  act(() => emitMockAuth({ user: { id: 'second-user', email: 'second@example.test' }, access_token: 'second-token' }));
  await waitFor(() => {
    const stored = JSON.parse(localStorage.getItem('animaldex_user_status_second-user') || 'null');
    expect(stored).not.toBeNull();
    expect(stored['1']).not.toBe('catturato');
    expect(stored['2']).not.toBe('catturato');
    expect(localStorage.getItem('animaldex_visited_countries_second-user')).toBe('[]');
  });
});
