import { Uuid2colorPipe } from './uuid2color.pipe';

describe('Uuid2colorPipe', () => {
  const pipe = new Uuid2colorPipe();
  beforeEach(() => {
    expect(pipe).toBeTruthy();
  });

  it('checks when string length is below 6', () => {
    expect(pipe.transform('test')).toBe(pipe.defaultColor);
    expect(pipe.transform('')).toBe(pipe.defaultColor);
    expect(pipe.transform(null)).toBe(pipe.defaultColor);
  });

  it('checks with uuid', () => {
    expect(pipe.transform('ab99ec0a-714e-4ed9-a576-c90df4733f2b')).toBe('#ab99ec');
    expect(pipe.transform('2359b0a2-7064-4926-b1c8-fac7f6b2716b')).toBe('#2359b0');
    expect(pipe.transform('825ff84a-df08-459c-b2c4-d22bc2c72e9e')).toBe('#825ff8');
  });
});
