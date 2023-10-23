import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  uniqueStringValidation(data: string[], error: string): ValidatorFn {
    return (control: AbstractControl) => {
      const typedName = control.value?.toLowerCase();

      if (data && typedName && data.includes(typedName)) {
        return { [error]: true };
      }
      return null;
    };
  }
}
