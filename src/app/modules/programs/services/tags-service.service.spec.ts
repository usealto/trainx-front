import { TestBed } from '@angular/core/testing';

import { TagsServiceService } from './tags-service.service';

describe('TagsServiceService', () => {
  let service: TagsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
