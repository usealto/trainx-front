import { ProgressionPillPipe } from './progression-pill.pipe';

describe('ProgressionPillPipe', () => {
  const pipe = new ProgressionPillPipe();

  beforeEach(() => {
    expect(pipe).toBeTruthy();
  });

  it('checks when num is over 0 == progression-pill-green', () => {
    const pillClass = 'progression-pill-green';
    expect(pipe.transform(-3)).not.toBe(pillClass);
    expect(pipe.transform(1)).toBe(pillClass);
    expect(pipe.transform(20)).toBe(pillClass);
  });

  it('checks when num is under 0 == progression-pill-red', () => {
    const pillClass = 'progression-pill-red';
    expect(pipe.transform(-3)).toBe(pillClass);
    expect(pipe.transform(-1)).toBe(pillClass);
    expect(pipe.transform(20)).not.toBe(pillClass);
  });

  it('checks when num is 0 == progression-pill-neutral', () => {
    const pillClass = 'progression-pill-neutral';
    expect(pipe.transform(-3)).not.toBe(pillClass);
    expect(pipe.transform(0)).toBe(pillClass);
    expect(pipe.transform(null)).not.toBe(pillClass);
  });

  it('checks when num is null or undefined', () => {
    const pillClass = 'progression-pill-undefined';
    expect(pipe.transform(-3)).not.toBe(pillClass);
    expect(pipe.transform(1)).not.toBe(pillClass);
    expect(pipe.transform(null)).toBe(pillClass);
    expect(pipe.transform(undefined)).toBe(pillClass);
  });
});
