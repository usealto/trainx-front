import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { I18ns } from '../../../../../core/utils/i18n/I18n';
import { SelectOption } from '../../../models/select-option.model';

@Component({
  selector: 'alto-input-single-select',
  templateUrl: './input-single-select.component.html',
  styleUrls: ['./input-single-select.component.scss'],
})
export class InputSingleSelectComponent {
  I18ns = I18ns;

  @Input() placeholder?: string;
  @Input() options: SelectOption[] = [];
  @Input() control: FormControl<SelectOption | null> = new FormControl();
  @Input() hasPillAppearance = true;

  isDropdownOpen = false;

  constructor(private el: ElementRef) {}

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    if (this.control.enabled) {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  toggleOption(option: SelectOption): void {
    if (this.control.value === option) {
      this.control.setValue(null);
    } else {
      this.control.setValue(option);
    }
  }
}
