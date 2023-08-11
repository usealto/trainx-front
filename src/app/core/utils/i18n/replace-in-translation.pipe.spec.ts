import { ReplaceInTranslationPipe } from './replace-in-translation.pipe';

describe('Replace In translation', () => {
  const pipe = new ReplaceInTranslationPipe();

  beforeEach(() => {
    expect(pipe).toBeTruthy();
  });

  it('replaces 2 entries', () => {
    expect(pipe.transform('I have {{}} trees and {{}} apples', 5, 7)).toBe('I have 5 trees and 7 apples');
  });
});
