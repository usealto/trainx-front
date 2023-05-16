import {Pipe, PipeTransform} from '@angular/core';
import {KeyValuePipe} from '@angular/common';

const keepOrder = (a: any, b: any) => a;

// This pipe uses the angular keyvalue pipe. but doesn't change order.
@Pipe({
  name: 'defaultOrderKeyvalue'
})
export class DefaultOrderKeyvaluePipe extends KeyValuePipe implements PipeTransform {

  override transform(value: any, ...args: any[]): any {
    return super.transform(value, keepOrder);
  }

}