import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pillColor',
})
export class PillColorPipe implements PipeTransform {
  transform(num: number | string, ...args: unknown[]): string {
    if (typeof num === 'string') {
      return 'pill-neutral text-white';
    } else if (num > 65) {
      return 'pill-green text-white';
    } else if (num > 30) {
      return 'bg-warning text-white';
    } else if (num >= -100) {
      return 'pill-red text-white';
    }
    return 'pill-neutral text-white';
  }
}
