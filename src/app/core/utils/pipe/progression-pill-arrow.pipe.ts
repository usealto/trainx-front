import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'progressionPillArrow',
})
export class ProgressionPillArrowPipe implements PipeTransform {
  transform(score: number, ...args: unknown[]): unknown {
    if (score > 0) {
      return 'bi-arrow-up-right';
    } else if (score < 0) {
      return 'bi-arrow-down-right';
    } else {
      return 'bi-arrow-right';
    }
  }
}
