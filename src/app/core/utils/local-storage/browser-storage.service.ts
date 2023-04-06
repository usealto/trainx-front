import { Injectable } from '@angular/core';
import { Helpers } from '../helpers';

export type LocalStorageKey =
  | 'redirectUrl'
  | 'sodForm'
  | 'sasToken'
  | 'sasTokenExpire'
  | 'accessToken'
  | 'refreshToken'
  | 'defectIdentForm'
  | 'defectIdForm';

export type StorageType = 'object' | 'number' | 'boolean' | 'date' | 'default';

@Injectable({
  providedIn: 'root',
})
export class BrowserStorageService {
  isPersistant = true;

  setItem(itemKey: LocalStorageKey, itemValue: string, needEncoded = false) {
    // Stockage en local si on reste connecté sinon on stock sur la session
    const value = needEncoded ? btoa(encodeURIComponent(itemValue)) : itemValue;
    if (this.isPersistant) {
      localStorage.setItem(itemKey, value);
    } else {
      sessionStorage.setItem(itemKey, value);
    }
  }

  getItem(itemKey: LocalStorageKey, isEncoded = false): string {
    let itemStored = '';
    if (this.isPersistant) {
      itemStored = localStorage.getItem(itemKey) ?? '';
    } else {
      itemStored = sessionStorage.getItem(itemKey) ?? '';
    }
    return isEncoded ? (itemStored ? decodeURIComponent(atob(itemStored)) : '') : itemStored;
  }

  removeItem(itemKey: LocalStorageKey) {
    if (this.isPersistant) {
      localStorage.removeItem(itemKey);
    } else {
      sessionStorage.removeItem(itemKey);
    }
  }

  destroyAll() {
    localStorage.clear();
    sessionStorage.clear();
  }

  getAs(key: LocalStorageKey, storageType: StorageType = 'default', defaultValue?: any): any {
    let output: any;
    const val = this.getItem(key);

    if (val == null) {
      return defaultValue;
    }

    switch (storageType) {
      case 'boolean':
        output = val === 'false' ? false : true;
        break;

      case 'number':
        output = Number(val);
        break;

      case 'date':
        output = val ? new Date(val) : null;
        break;

      case 'object':
        output = Helpers.JSONStringToDate(val);
        break;

      default:
        output = val;
        break;
    }

    return output;
  }
}
