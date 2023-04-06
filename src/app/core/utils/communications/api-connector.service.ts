import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BaseRestService } from './base-rest.service';
import { LoadingStore } from '../loading/loading.store';

@Injectable({
  providedIn: 'root',
})
export class ApiConnector extends BaseRestService {
  constructor(override readonly http: HttpClient, override readonly loadingStore: LoadingStore) {
    super(http, loadingStore);
    this.apiURL = environment.apiURL;
    this.config = [{ type: 'GET', responseType: 'json' }];
  }
}
