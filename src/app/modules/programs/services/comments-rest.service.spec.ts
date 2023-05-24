import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommentsApiService } from '@usealto/sdk-ts-angular';

describe('CommentsService', () => {
  let service: CommentsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommentsApiService],
    });
    service = TestBed.inject(CommentsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
