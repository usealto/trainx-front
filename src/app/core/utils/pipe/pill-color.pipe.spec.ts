import { PillColorPipe } from './pill-color.pipe';

describe('PillColorPipe', () => {
  const pipe = new PillColorPipe();

  beforeEach(() => {
    expect(pipe).toBeTruthy();
  });

  it('checks when num is over 65 == bg-success', () => {
    expect(pipe.transform(30)).not.toBe('bg-success');
    expect(pipe.transform(66)).toBe('bg-success');
    expect(pipe.transform(80)).toBe('bg-success');
    expect(pipe.transform(100)).toBe('bg-success');
    expect(pipe.transform(200)).toBe('bg-success');
  });

  it('checks when num is over 30 == bg-warning', () => {
    expect(pipe.transform(31)).toBe('bg-warning');
    expect(pipe.transform(50)).toBe('bg-warning');
    expect(pipe.transform(60)).toBe('bg-warning');
    expect(pipe.transform(90)).not.toBe('g-warning');
  });

  it('checks when num is below 31 == bg-danger', () => {
    expect(pipe.transform(30)).toBe('bg-danger');
    expect(pipe.transform(-10)).toBe('bg-danger');
    expect(pipe.transform(0)).toBe('bg-danger');
    expect(pipe.transform(90)).not.toBe('bg-danger');
  });

  it('checks when num is string then bg-secondary', () => {
    expect(pipe.transform('30')).toBe('bg-secondary');
    expect(pipe.transform('NAN')).toBe('bg-secondary');
    expect(pipe.transform('test')).toBe('bg-secondary');
    expect(pipe.transform(90)).not.toBe('bg-secondary');
  });
});
