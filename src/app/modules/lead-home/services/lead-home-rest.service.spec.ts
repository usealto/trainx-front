import { TestBed } from '@angular/core/testing';

import { LeadHomeRestService } from './lead-home-rest.service';

describe('LeadHomeRestService', () => {
  let service: LeadHomeRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeadHomeRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
