import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pillDanger',
})
export class PillDangerPipe implements PipeTransform {
  transform(num: number | string): string {
    if (typeof num === 'string') {
      return 'pill-neutral';
    } else if (num < 20) {
      return 'pill-red';
    }
    return 'pill-neutral';
  }
}
