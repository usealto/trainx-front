import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ChallengesRestService } from './challenges-rest.service';

describe('ChallengesRestService', () => {
  let service: ChallengesRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChallengesRestService],
    });
    service = TestBed.inject(ChallengesRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
