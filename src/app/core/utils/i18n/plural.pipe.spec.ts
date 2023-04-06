import { PluralPipe } from './plural.pipe';

describe('PluralPipe', () => {
  const pipe = new PluralPipe();

  const arr0: string[] = [];
  const arr1 = ['{{}} line'];
  const arr2 = ['{{}} line', '{{}} lines'];
  const arr3 = ['No line', '{{}} line', '{{}} lines'];

  beforeEach(() => {
    expect(pipe).toBeTruthy();
  });

  it('manages 0 entry', () => {
    expect(pipe.transform(arr0, 5)).toBe('');
  });

  it('manages 1 entry', () => {
    expect(pipe.transform(arr1, 5)).toBe('5 line');
  });

  it('manages 2 entries', () => {
    expect(pipe.transform(arr2, 0)).toBe('0 line');
    expect(pipe.transform(arr2, 1)).toBe('1 line');
    expect(pipe.transform(arr2, 33)).toBe('33 lines');
  });

  it('manages 3 entries', () => {
    expect(pipe.transform(arr3, 0)).toBe('No line');
    expect(pipe.transform(arr3, 1)).toBe('1 line');
    expect(pipe.transform(arr3, 33)).toBe('33 lines');
  });
});
