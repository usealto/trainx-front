import { TestBed } from '@angular/core/testing';

import { PicturesService } from './pictures.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PicturesService', () => {
  let service: PicturesService;

  beforeEach(() => {
     TestBed.configureTestingModule({
       imports: [HttpClientTestingModule],
       providers: [PicturesService],
     });
    service = TestBed.inject(PicturesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
