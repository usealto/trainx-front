import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uuid2color',
})
export class Uuid2colorPipe implements PipeTransform {
  defaultColor = '#C0C0C0';
  /**
   * Usage => `[style.backgroundColor]="item.id | uuid2color"`
   * @param uuid
   * @returns HEX color
   */
  transform(value: string | null | undefined): string {
    if (!value || value.length < 6) return this.defaultColor;
    return '#' + value.slice(0, 6);
  }
}
