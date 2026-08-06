import { fireEvent, render } from '@testing-library/react';
import MainMenuV2 from './MainMenuV2';

test('explore tiles fall back to tracked PNG assets when an optimized WebP fails', () => {
  const { container } = render(<MainMenuV2 onOpen={() => {}} />);
  const regionImage = container.querySelector('img[src="/home/regioni.webp"]');

  expect(regionImage).toBeInTheDocument();
  fireEvent.error(regionImage);
  expect(container.querySelector('img[src="/regions/home_regioni.png"]')).toBeInTheDocument();
});
