import { TestBed } from '@angular/core/testing';

import { ParcoursRestService } from './parcours-rest.service';

describe('ParcoursRestService', () => {
  let service: ParcoursRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParcoursRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
