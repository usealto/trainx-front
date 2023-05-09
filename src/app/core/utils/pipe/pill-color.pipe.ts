import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pillColor',
})
export class PillColorPipe implements PipeTransform {
  transform(num: number | string, ...args: unknown[]): string {
    if (typeof num === 'string') {
      return 'pill-neutral';
    } else if (num > 65) {
      return 'pill-green';
    } else if (num > 30) {
      return 'bg-warning';
    } else if (num >= -100) {
      return 'pill-red';
    }
    return 'pill-neutral';
  }
}
