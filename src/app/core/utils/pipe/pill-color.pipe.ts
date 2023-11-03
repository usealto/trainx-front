import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pillColor',
})
export class PillColorPipe implements PipeTransform {
  transform(num: number | string, ...args: unknown[]): string {
    if (typeof num === 'string') {
      return 'pill-neutral';
    } else if (num > 70) {
      return 'pill-green';
    } else if (num > 40) {
      return 'pill-orange';
    } else if (num >= 0) {
      return 'pill-red';
    }
    return 'pill-neutral';
  }
}
