import { render, screen } from '@testing-library/react';

jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      signInWithOAuth: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

test('renders Apex login', async () => {
  const App = require('./App').default;
  render(<App />);
  expect(await screen.findByRole('heading', { name: /accedi/i })).toBeInTheDocument();
  expect(screen.getByText(/Apex/i)).toBeInTheDocument();
});
