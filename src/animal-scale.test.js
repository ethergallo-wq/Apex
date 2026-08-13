import { getAnimalSilhouetteScale, isSnakeAnimal, SNAKE_SILHOUETTE_SCALE } from './animal-scale';

describe('animal size comparison scale', () => {
  test.each(['Boidae', 'Colubridae', 'Elapidae', 'Homalopsidae', 'Pythonidae', 'Viperidae'])(
    'recognizes the current snake family %s',
    (fam) => {
      expect(isSnakeAnimal({ cls:'Reptilia', ord:'', fam })).toBe(true);
    }
  );

  test('recognizes Serpentes when the family is missing', () => {
    expect(isSnakeAnimal({ cls:'Reptilia', ord:'Serpentes', fam:'' })).toBe(true);
  });

  test('does not mistake snake-like names for snakes when taxonomy says otherwise', () => {
    expect(isSnakeAnimal({ cls:'Reptilia', fam:'Chelydridae', sci:'Chelydra serpentina', com:'Tartaruga Azzannatrice' })).toBe(false);
    expect(isSnakeAnimal({ cls:'Aves', fam:'Sagittariidae', sci:'Sagittarius serpentarius', com:'Serpentario' })).toBe(false);
    expect(isSnakeAnimal({ cls:'Reptilia', fam:'Chelidae', com:'Tartaruga Collo-Serpente Sudamericana' })).toBe(false);
  });

  test('scales only snake silhouettes to 40 percent', () => {
    expect(getAnimalSilhouetteScale({ cls:'Reptilia', fam:'Viperidae' })).toBe(SNAKE_SILHOUETTE_SCALE);
    expect(getAnimalSilhouetteScale({ cls:'Mammalia', fam:'Felidae' })).toBe(1);
  });
});
