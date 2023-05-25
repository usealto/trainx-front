import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'progressionPillArrow',
})
export class ProgressionPillArrowPipe implements PipeTransform {
  transform(score: number | undefined | null): string {
    if (score === null || score === undefined) {
      return '';
    } else if (score > 0) {
      return 'bi-arrow-up-short alto-green';
    } else if (score < 0) {
      return 'bi-arrow-down-short alto-red';
    } else {
      return 'bi-dash alto-neutral';
    }
  }
}
