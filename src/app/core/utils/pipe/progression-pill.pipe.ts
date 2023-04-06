import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pillProgression',
})
export class ProgressionPillPipe implements PipeTransform {
  transform(score: number, ...args: unknown[]): unknown {
    if (score > 0) {
      return 'bg-success';
    } else if (score < 0 && score >= -0.5) {
      return 'bg-warning';
    } else if (score < -0.05) {
      return 'bg-danger';
    } else {
      return 'bg-secondary';
    }
  }
}
