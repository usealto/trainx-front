import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { I18ns } from '../../../../../core/utils/i18n/I18n';
import { PillOption } from '../../../models/select-option.model';

@Component({
  selector: 'alto-input-single-select-pill',
  templateUrl: './input-single-select-pill.component.html',
  styleUrls: ['./input-single-select-pill.component.scss'],
})
export class InputSingleSelectPillComponent {
  I18ns = I18ns;

  @Input() placeholder?: string;
  @Input() control: FormControl<PillOption | null> = new FormControl(null);
  @Input() options: PillOption[] = [];
  @Input() hasFormAppearance = false;

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

  toggleOption(option: PillOption): void {
    if (this.control.value === option) {
      this.control.setValue(null);
    } else {
      this.control.setValue(option);
    }
    this.control.markAsDirty();
    this.control.markAsTouched();
    this.isDropdownOpen = false;
  }
}
