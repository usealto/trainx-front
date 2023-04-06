import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TeamsRestService } from './teams-rest.service';

describe('TeamsRestService', () => {
  let service: TeamsRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeamsRestService],
    });
    service = TestBed.inject(TeamsRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
