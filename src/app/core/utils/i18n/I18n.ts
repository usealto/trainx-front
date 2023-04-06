import { EN } from 'src/app/I18n/EN';
import { FR } from 'src/app/I18n/FR';

/**
 * French is the reference Type.
 * Every properties declared in FR must be present in other lang, even if empty
 *
 * To use dynamic values in translations, use the 'replaceInTranslation' pipe
 */

/**
 * * CHANGE THIS PART IF YOU NEED TO CHANGE THE DEFAULT LANG
 */
type I18n = typeof FR;
export const defaultLang = FR;
export const allLangs: I18n[] = [defaultLang, EN as unknown as I18n];
/**  */

function getLang(lg: string | null): I18n {
  switch (lg) {
    case 'fr':
      return FR;
    case 'en':
    case 'uk':
    case 'us':
      return EN as unknown as I18n; // TODO remove 'as unknown as I18n'

    default:
      return defaultLang;
  }
}

export const I18ns: I18n = getLang(localStorage.getItem('lang'));

/**
 * Returns a translation from a key as an object property
 *
 * ex: getTranslation(I18n.shared, 'Yes');
 *
 * @param obj Object containing translations
 * @param key Property of the object
 * @returns String containing the translation
 */
export function getTranslation(obj: any, key: string): string {
  if (obj && key && Object.keys(obj).some((k) => k === key)) {
    return obj[key];
  }
  return '';
}
