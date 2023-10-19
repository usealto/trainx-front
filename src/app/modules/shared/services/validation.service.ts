import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  uniqueStringValidation(data: string[]): ValidatorFn {
    return (control: AbstractControl) => {
      const typedName = control.value.toLowerCase();

      if (data && data.includes(typedName)) {
        return { nameNotAllowed: true };
      }
      return null;
    };
  }
}
