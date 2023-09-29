import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role2BackgroundColor',
})
export class Role2BackgroundColor implements PipeTransform {
  defaultColor = '#C0C0C0';
  /**
   * Usage => `[style.backgroundColor]="role | role2color"`
   * @param role
   * @returns HEX color
   */
  transform(value: string | null | undefined): string {
    if (!value) return this.defaultColor;
    
    return (value === 'alto-admin') 
    ? '#FFF6ED' 
    : (value === 'company-admin') 
      ? '#EFF8FF'
      : '#F8F9FC';
  }
}
