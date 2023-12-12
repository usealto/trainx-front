import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ScreenType } from './screen-type';
import { ScoreDuration } from '../../modules/shared/models/score.model';
import { addDays, addHours } from 'date-fns';

export class Helpers {
  static dateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)$/;
  static utcDateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;

  static JSONStringToDate(str: string): any {
    const val = JSON.parse(str);
    this.JSONToDate(val);
    return str ? val : '';
  }

  static JSONToDate(object: any) {
    if (!object || !(object instanceof Object)) {
      return;
    }

    if (object instanceof Array) {
      for (const item of object) {
        this.JSONToDate(item);
      }
    }

    for (const key of Object.keys(object)) {
      const value = object[key];

      if (value instanceof Array) {
        for (const item of value) {
          this.JSONToDate(item);
        }
      }

      if (value instanceof Object) {
        this.JSONToDate(value);
      }

      if (typeof value === 'string' && this.utcDateRegex.test(value)) {
        object[key] = new Date(value);
      } else if (typeof value === 'string' && this.dateRegex.test(value)) {
        object[key] = new Date(`${value}Z`);
      }
    }
  }

  static getFormErrors(form: any) {
    let output: any[] = [];
    for (const [key, value] of Object.entries(form.controls)) {
      const control = value as UntypedFormControl;
      if (control.invalid || control.errors) {
        if (value instanceof UntypedFormGroup) {
          output = [...output, ...this.getFormErrors(control)];
        } else {
          output = [...output, { control: key, errors: control.errors }];
        }
      }
    }

    return output;
  }

  static makeSureItsAnArray(val: unknown) {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }

  static getScreenSize(): ScreenType {
    const innerWidth = window.innerWidth;

    if (innerWidth < 700) {
      return ScreenType.Mobile;
    } else if (innerWidth < 1500) {
      return ScreenType.Medium;
    } else if (innerWidth >= 1500) {
      return ScreenType.Large;
    } else if (innerWidth >= 2000) {
      return ScreenType.ExtraLarge;
    } else {
      throw new Error("Can't get screen dimension");
    }
  }

  static getPreviousPeriod(duration: ScoreDuration): Date[] {
    let date = new Date();
    date = addDays(date, 1); //! TEMPORARY FIX to get data from actual day
    switch (duration) {
      case 'week':
        date = addDays(date, -14);
        break;
      case 'month':
        date = addDays(date, -60);
        break;
      case 'trimester':
        date = addDays(date, -180);
        break;
      case 'year':
        date = addDays(date, -730);
        break;
      default:
        date = addDays(date, -60);
        break;
    }
    return [date, this.getStartDate(duration as ScoreDuration)];
  }

  static getStartDate(duration: ScoreDuration): Date {
    let date = new Date();
    const gmtDataOffset = -date.getTimezoneOffset() / 60;

    switch (duration) {
      case ScoreDuration.Week:
        date = addDays(date, -7);
        break;
      case ScoreDuration.Month:
        date = addDays(date, -30);
        break;
      case ScoreDuration.Trimester:
        date = addDays(date, -90);
        break;
      case ScoreDuration.Year:
        date = addDays(date, -365);
        break;
      case ScoreDuration.All:
        date = new Date(2022, 0, 1);
        break;
    }
    date = addHours(date, gmtDataOffset + 1);
    return date;
  }
}
