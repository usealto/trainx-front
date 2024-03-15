import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

export enum EInputToggleColor {
  ORANGE = 'orange',
  DEFAULT = 'default',
}

@Component({
  selector: 'alto-input-toggle',
  templateUrl: './input-toggle.component.html',
  styleUrls: ['./input-toggle.component.scss'],
})
export class InputToggleComponent {
  EInputToggleColor = EInputToggleColor;
  @Input() control: FormControl<boolean> = new FormControl<boolean>(false, { nonNullable: true });
  @Input() color: EInputToggleColor = EInputToggleColor.DEFAULT;
}
