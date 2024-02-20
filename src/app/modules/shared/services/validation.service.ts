import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  uniqueStringValidation(data: string[], error: string): ValidatorFn {
    return (control: AbstractControl) => {
      const inputValue = control.value;
      if (
        inputValue &&
        data.some((term) => term.toLocaleLowerCase().localeCompare(control.value.toLocaleLowerCase()) === 0)
      ) {
        return { error: error };
      }
      return null;
    };
  }
}
