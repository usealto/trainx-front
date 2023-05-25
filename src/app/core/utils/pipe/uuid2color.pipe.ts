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
    // if (!value || value.length < 6) return this.defaultColor;
    // const color = '#' + value.slice(0, 6);
    // console.log(color);
    // return color;
    let hash = 0;
    if (!value) return this.defaultColor;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }

    return `hsl(${hash % 360}, 100%, 65%, 90%)`;
  }
}
