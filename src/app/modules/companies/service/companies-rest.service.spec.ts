import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CompaniesRestService } from './companies-rest.service';

describe('CompaniesRestService', () => {
  let service: CompaniesRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CompaniesRestService],
    });
    service = TestBed.inject(CompaniesRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
