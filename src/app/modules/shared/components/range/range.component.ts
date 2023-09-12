import { Component, Input } from '@angular/core';

@Component({
  selector: 'alto-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss'],
})
export class RangeComponent {
  @Input() formControlName = '';
  @Input() control: any;
}
