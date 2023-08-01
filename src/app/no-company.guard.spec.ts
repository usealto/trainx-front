import { TestBed } from '@angular/core/testing';

import { NoCompanyGuard } from './no-company.guard';

describe('NoCompanyGuard', () => {
  let guard: NoCompanyGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NoCompanyGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
