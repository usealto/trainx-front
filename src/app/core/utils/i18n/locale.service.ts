import { registerLocaleData } from '@angular/common';
import { Injectable } from '@angular/core';

/**
 * This service exports js files from Angular locales. 
 * Used to format currencies, dates, numbers
 */
@Injectable({
  providedIn: 'root',
})
export class LocaleService {
  getLocale(): string {
    if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
      return 'en';
    }

    let browserLang: any = window.navigator['languages'] ? window.navigator['languages'][0] : null;
    browserLang = browserLang || window.navigator.language;

    if (browserLang.indexOf('-') !== -1) {
      browserLang = browserLang.split('-')[0];
    }

    if (browserLang.indexOf('_') !== -1) {
      browserLang = browserLang.split('_')[0];
    }

    return browserLang || 'en';
  }
}

export function localeIdFactory(localeService: LocaleService) {
  return localeService.getLocale();
}

export function localeInitializer(localeId: string) {
  return (): Promise<void> => {
    return new Promise((resolve, reject) => {
      import(
        /* webpackInclude: /(hi|de|en|es|fr|it|nl|no|pl|pt-BR|pt|fi|sv|ko|ru|zh|zh-Hans|zh-Hant|ja).mjs$/ */
        /* webpackExports: "default" */
        /* webpackMode: "lazy-once" */
        /* webpackChunkName: "locale" */
        `node_modules/@angular/common/locales/${localeId}`
      ).then((module) => {
        registerLocaleData(module.default);
        resolve();
      }, reject);
    });
  };
}
