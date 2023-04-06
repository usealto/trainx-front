import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProgramsRestService } from './programs-rest.service';

describe('ProgramsRestService', () => {
  let service: ProgramsRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProgramsRestService],
    });
    service = TestBed.inject(ProgramsRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
