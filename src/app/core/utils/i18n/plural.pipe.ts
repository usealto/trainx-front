import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'plural',
})
export class PluralPipe implements PipeTransform {
  transform(value: string[], arg: number | string): string {
    let output = '';

    switch (value.length) {
      case 0:
        console.warn('no translation data available');
        return '';

      case 1:
        output = value[0];
        break;

      case 2:
        // In this case, zero is NOT managed
        output = arg <= 1 ? value[0] : value[1];
        break;

      case 3:
        output = arg < 1 ? value[0] : arg < 2 ? value[1] : value[2];
        break;

      case 4:
        console.warn('confusing translation data found');
        return '';
    }

    return output.replace('{{}}', arg + '');
  }
}
