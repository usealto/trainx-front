import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TriggersService } from './triggers.service';

describe('TriggersService', () => {
  let service: TriggersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TriggersService]
    });
    service = TestBed.inject(TriggersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
