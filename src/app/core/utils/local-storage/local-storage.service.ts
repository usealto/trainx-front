import { Injectable } from '@angular/core';
import { BrowserStorageService } from './browser-storage.service';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService extends BrowserStorageService {
  override isPersistant = true;
}
