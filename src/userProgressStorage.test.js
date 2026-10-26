import { readUserProgress, setProgressStorageUser, writeUserProgress } from './userProgressStorage';

beforeEach(() => { localStorage.clear(); setProgressStorageUser(null); });

test('destinations and awards cannot transfer between accounts on the same device', () => {
  writeUserProgress('visited_countries', ['IT']);
  setProgressStorageUser('alice');
  expect(readUserProgress('visited_countries', [])).toEqual([]);
  writeUserProgress('visited_countries', ['FR']);
  writeUserProgress('awards_unlocked', ['A1']);
  setProgressStorageUser('bob');
  expect(readUserProgress('visited_countries', [])).toEqual([]);
  expect(readUserProgress('awards_unlocked', [])).toEqual([]);
  setProgressStorageUser('alice');
  expect(readUserProgress('visited_countries', [])).toEqual(['FR']);
  expect(readUserProgress('awards_unlocked', [])).toEqual(['A1']);
  setProgressStorageUser(null);
  expect(readUserProgress('visited_countries', [])).toEqual(['IT']);
});

test('an explicitly owned async write remains attached to its original account', () => {
  setProgressStorageUser('bob');
  writeUserProgress('awards_unlocked', ['A1'], 'alice');
  expect(readUserProgress('awards_unlocked', [])).toEqual([]);
  expect(readUserProgress('awards_unlocked', [], 'alice')).toEqual(['A1']);
});
