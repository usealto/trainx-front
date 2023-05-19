import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pillProgression',
})
export class ProgressionPillPipe implements PipeTransform {
  transform(score: number, ...args: unknown[]): unknown {
    if (score > 0) {
      return 'progression-pill-green';
    } else if (score < 0) {
      return 'progression-pill-red';
    } else {
      return 'progression-pill-neutral';
    }
  }
}
