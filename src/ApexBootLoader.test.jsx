import { render, screen } from '@testing-library/react';
import ApexBootLoader from './ApexBootLoader';

test('allows long loading messages to wrap inside narrow screens', () => {
  render(<ApexBootLoader message="Preparando il tuo mondo animale…" />);

  const message = screen.getByText('Preparando il tuo mondo animale…');
  expect(message).toHaveStyle({
    display: 'block',
    width: '100%',
    maxWidth: '100%',
    minWidth: '0',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
    textAlign: 'center',
  });
  expect(message.parentElement).toHaveStyle({ width: '100%', maxWidth: '100%', minWidth: '0' });
});
