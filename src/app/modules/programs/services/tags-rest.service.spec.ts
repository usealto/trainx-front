import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TagsRestService } from './tags-rest.service';

describe('TagsRestService', () => {
  let service: TagsRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TagsRestService],
    });
    service = TestBed.inject(TagsRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
