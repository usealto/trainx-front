import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role2color',
})
export class Role2colorPipe implements PipeTransform {
  defaultColor = '#C0C0C0';
  /**
   * Usage => `[style.backgroundColor]="role | role2color"`
   * @param role
   * @returns HEX color
   */
  transform(value: string | null | undefined): string {
    if (!value) return this.defaultColor;
    
    return (value === 'alto-admin') 
    ? '#EC4A0A !important' 
    : (value === 'company-admin') 
      ? '#175CD3 !important'
      : '#3E4784 !important';
  }
}
