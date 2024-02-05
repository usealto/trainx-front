import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'alto-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss'],
})
export class RangeComponent {
  @Input() formControlName = '';
  @Input() control: FormControl<number | null> = new FormControl(75);
}
