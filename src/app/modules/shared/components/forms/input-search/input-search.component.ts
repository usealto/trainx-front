import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { I18ns } from '../../../../../core/utils/i18n/I18n';

@Component({
  selector: 'alto-input-search',
  templateUrl: './input-search.component.html',
  styleUrls: ['./input-search.component.scss'],
})
export class InputSearchComponent {
  @Input() placeholder = I18ns.shared.search;
  @Input() searchControl: FormControl<string | null> = new FormControl(null);

  reset(): void {
    this.searchControl.setValue(null);
  }
}
