import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pillColor',
})
export class PillColorPipe implements PipeTransform {
  transform(num: number | string, ...args: unknown[]): string {
    if (typeof num === 'string') {
      return 'bg-secondary';
    } else if (num > 65) {
      return 'bg-success';
    } else if (num > 30) {
      return 'bg-warning';
    } else if (num >= -100) {
      return 'bg-danger';
    }
    return 'bg-secondary';
  }
}
