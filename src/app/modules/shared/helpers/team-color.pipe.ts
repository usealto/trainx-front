import { Pipe, PipeTransform } from '@angular/core';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TPillColor } from '../models/select-option.model';

@Pipe({
  name: 'teamColor',
})
export class TeamColorPipe implements PipeTransform {
  colorCodes: TPillColor[] = [
    { color: '#344054', bg: '#f2f4f7' },
    { color: '#175cd3', bg: '#eff8ff' },
    { color: '#b32318', bg: '#fef3f2' },
    { color: '#b54708', bg: '#fffaeb' },
    { color: '#027948', bg: '#ecfdf3' },
    { color: '#363f72', bg: '#f8f9fc' },
    { color: '#026aa2', bg: '#f0f9ff' },
    { color: '#175cd3', bg: '#eff8ff' },
    { color: '#3538cd', bg: '#eef4ff' },
    { color: '#5925dc', bg: '#f4f3ff' },
    { color: '#c01574', bg: '#fdf2fa' },
    { color: '#c01048', bg: '#fff1f3' },
    { color: '#c4320a', bg: '#fff6ed' },
    { color: '#344054', bg: '#f2f4f7' },
  ];

  @memoize()
  transform(id?: string): string {
    if (!id) {
      return `background-color: ${this.colorCodes[0].bg}; color: ${this.colorCodes[0].color}`;
    }
    const num = this.extractNumber(id);
    return `background-color: ${this.colorCodes[num].bg}; color: ${this.colorCodes[num].color}`;
  }

  @memoize()
  extractNumber(str: string): number {
    if (str.length < 8) {
      // console.error('String length must be at least 8');
      return 0;
    }
    let output = 0;
    for (let index = 0; index < str.length; index++) {
      output += str[index].charCodeAt(0);
    }

    return output % this.colorCodes.length;
  }
}
