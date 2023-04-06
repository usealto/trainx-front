import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommentsApiService } from 'src/app/sdk';

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
