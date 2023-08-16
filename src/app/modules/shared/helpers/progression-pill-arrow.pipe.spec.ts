import { TestBed } from '@angular/core/testing';
import { ProgressionPillArrowPipe } from './progression-pill-arrow.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('ProgressionPillArrowPipe', () => {
  let pipe: ProgressionPillArrowPipe;
  let sanitized: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DomSanitizer],
    });
    sanitized = TestBed.inject(DomSanitizer);
    pipe = new ProgressionPillArrowPipe(sanitized);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
