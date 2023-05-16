import { DefaultOrderKeyvaluePipe } from './default-order-keyvalue.pipe';

describe('DefaultOrderKeyvaluePipe', () => {
  it('create an instance', () => {
    const pipe = new DefaultOrderKeyvaluePipe();
    expect(pipe).toBeTruthy();
  });
});
