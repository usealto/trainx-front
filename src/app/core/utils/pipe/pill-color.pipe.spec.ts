import { PillColorPipe } from './pill-color.pipe';

describe('PillColorPipe', () => {
  const pipe = new PillColorPipe();

  beforeEach(() => {
    expect(pipe).toBeTruthy();
  });

  it('checks when num is over 70 == pill-green', () => {
    expect(pipe.transform(30)).not.toBe('pill-green');
    expect(pipe.transform(71)).toBe('pill-green');
    expect(pipe.transform(80)).toBe('pill-green');
    expect(pipe.transform(100)).toBe('pill-green');
    expect(pipe.transform(200)).toBe('pill-green');
  });

  it('checks when num is over 40 == pill-orange', () => {
    expect(pipe.transform(41)).toBe('pill-orange');
    expect(pipe.transform(50)).toBe('pill-orange');
    expect(pipe.transform(60)).toBe('pill-orange');
    expect(pipe.transform(90)).not.toBe('pill-orange');
  });

  it('checks when num is below 31 == pill-red', () => {
    expect(pipe.transform(30)).toBe('pill-red');
    expect(pipe.transform(90)).not.toBe('pill-red');
  });

  it('checks when num is string then pill-neutral', () => {
    expect(pipe.transform('30')).toBe('pill-neutral');
    expect(pipe.transform(0)).toBe('pill-neutral');
    expect(pipe.transform('NAN')).toBe('pill-neutral');
    expect(pipe.transform('test')).toBe('pill-neutral');
    expect(pipe.transform(90)).not.toBe('pill-neutral');
    expect(pipe.transform(-10)).toBe('pill-neutral');
  });
});
