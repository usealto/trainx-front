import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { UsersRestService } from './users-rest.service';

describe('UsersRestService', () => {
  let service: UsersRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsersRestService],
    });
    service = TestBed.inject(UsersRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
