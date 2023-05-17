import { PillColorPipe } from './pill-color.pipe';

describe('PillColorPipe', () => {
  const pipe = new PillColorPipe();
  const extraClass = ' text-white';

  beforeEach(() => {
    expect(pipe).toBeTruthy();
  });

  it('checks when num is over 65 == pill-green', () => {
    expect(pipe.transform(30)).not.toBe('pill-green' + extraClass);
    expect(pipe.transform(66)).toBe('pill-green' + extraClass);
    expect(pipe.transform(80)).toBe('pill-green' + extraClass);
    expect(pipe.transform(100)).toBe('pill-green' + extraClass);
    expect(pipe.transform(200)).toBe('pill-green' + extraClass);
  });

  it('checks when num is over 30 == bg-warning', () => {
    expect(pipe.transform(31)).toBe('bg-warning' + extraClass);
    expect(pipe.transform(50)).toBe('bg-warning' + extraClass);
    expect(pipe.transform(60)).toBe('bg-warning' + extraClass);
    expect(pipe.transform(90)).not.toBe('g-warning' + extraClass);
  });

  it('checks when num is below 31 == pill-red', () => {
    expect(pipe.transform(30)).toBe('pill-red' + extraClass);
    expect(pipe.transform(90)).not.toBe('pill-red' + extraClass);
  });

  it('checks when num is string then pill-neutral', () => {
    expect(pipe.transform('30')).toBe('pill-neutral' + extraClass);
    expect(pipe.transform(0)).toBe('pill-neutral' + extraClass);
    expect(pipe.transform('NAN')).toBe('pill-neutral' + extraClass);
    expect(pipe.transform('test')).toBe('pill-neutral' + extraClass);
    expect(pipe.transform(90)).not.toBe('pill-neutral' + extraClass);
    expect(pipe.transform(-10)).toBe('pill-neutral' + extraClass);
  });
});
