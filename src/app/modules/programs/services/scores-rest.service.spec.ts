import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ScoresRestService } from './scores-rest.service';

describe('ScoresRestService', () => {
  let service: ScoresRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ScoresRestService],
    });
    service = TestBed.inject(ScoresRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
