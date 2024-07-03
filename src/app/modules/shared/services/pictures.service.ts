import { Injectable } from '@angular/core';
import {
  DefaultApiService,
} from '@usealto/sdk-ts-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PicturesService {
  constructor(private readonly pictureRestService: DefaultApiService) {}

  postPicture(picture: File): Observable<any> {
    return this.pictureRestService.picturesControllerUploadPicture(
      { file: picture },
    );
  }
}
