import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { QuestionsRestService } from './questions-rest.service';

describe('QuestionsRestService', () => {
  let service: QuestionsRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuestionsRestService],
    });
    service = TestBed.inject(QuestionsRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
