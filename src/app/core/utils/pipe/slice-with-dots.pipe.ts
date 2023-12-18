import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sliceWithDots',
})
export class SliceWithDotsPipe implements PipeTransform {
  transform(value: string, limit: number): string {
    if (!value || value.length < limit) {
      return value;
    }
    return value.slice(0, limit) + '...';
  }
}
