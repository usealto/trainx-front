import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'alto-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['input-text.component.scss'],
})
export class InputTextComponent {
  @Input() placeholder = '';
  @Input() control!: FormControl;
}
