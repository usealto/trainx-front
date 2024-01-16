import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { EColors, PillOption } from '../../../models/select-option.model';
import { FormControl } from '@angular/forms';
import { I18ns } from '../../../../../core/utils/i18n/I18n';

@Component({
  selector: 'alto-input-single-select',
  templateUrl: './input-single-select.component.html',
  styleUrls: ['./input-single-select.component.scss'],
})
export class InputSingleSelectComponent {
  I18ns = I18ns;
  EColors = EColors;

  @Input() title?: string;
  @Input() control: FormControl<PillOption | null> = new FormControl(null);
  @Input() options: PillOption[] = [];

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
  }
}
