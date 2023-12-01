import { TestBed } from '@angular/core/testing';

import { LicencesRestService as LicensesRestService } from './licenses-rest.service';

describe('LicencesRestService', () => {
  let service: LicensesRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LicensesRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
