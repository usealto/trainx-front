import { TestBed } from '@angular/core/testing';

import { ParcoursRestService } from './parcours-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ParcoursRestService', () => {
  let service: ParcoursRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ParcoursRestService],
    });
    service = TestBed.inject(ParcoursRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
