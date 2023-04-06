import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProgramRunsRestService } from './program-runs-rest.service';

describe('ProgramRunsRestService', () => {
  let service: ProgramRunsRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProgramRunsRestService],
    });
    service = TestBed.inject(ProgramRunsRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
