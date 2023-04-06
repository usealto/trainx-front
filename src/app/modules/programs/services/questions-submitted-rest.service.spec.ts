import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { QuestionsSubmittedRestService } from './questions-submitted-rest.service';

describe('QuestionsSubmittedRestService', () => {
  let service: QuestionsSubmittedRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuestionsSubmittedRestService],
    });
    service = TestBed.inject(QuestionsSubmittedRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
