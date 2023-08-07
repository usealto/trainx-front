import { TestBed } from '@angular/core/testing';

import { N8nService } from './n8n.service';

describe('N8nService', () => {
  let service: N8nService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(N8nService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
