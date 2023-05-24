import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pillProgression',
})
export class ProgressionPillPipe implements PipeTransform {
  transform(score: number | undefined | null): string {
    if (score === null || score === undefined) {
      return 'progression-pill-undefined';
    } else if (score > 0) {
      return 'progression-pill-green';
    } else if (score < 0) {
      return 'progression-pill-red';
    } else {
      return 'progression-pill-neutral';
    }
  }
}
