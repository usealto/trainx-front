import { Injectable } from '@angular/core';
import { BrowserStorageService } from './browser-storage.service';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService extends BrowserStorageService {
  override isPersistant = false;
}
