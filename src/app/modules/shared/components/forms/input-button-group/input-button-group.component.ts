import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { SelectOption } from '../../../models/select-option.model';

@Component({
  selector: 'alto-input-button-group',
  templateUrl: './input-button-group.component.html',
  styleUrls: ['./input-button-group.component.scss'],
})
export class InputButtonGroupComponent {
  I18ns = I18ns;

  @Input() options: SelectOption[] = [];
  @Input() control: FormControl<SelectOption | null> = new FormControl();

  toggleOption(option: SelectOption): void {
    this.control.patchValue(option);
  }
}
