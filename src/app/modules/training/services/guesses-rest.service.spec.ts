import { TestBed } from '@angular/core/testing';

import { GuessesRestService } from './guesses-rest.service';

describe('GuessesRestService', () => {
  let service: GuessesRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuessesRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
