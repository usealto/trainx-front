import { TestBed } from '@angular/core/testing';

import { GuessesRestService } from './guesses-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('GuessesRestService', () => {
  let service: GuessesRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(GuessesRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
