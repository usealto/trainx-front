import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { I18ns } from '../../../../../core/utils/i18n/I18n';
import { PillOption } from '../../../models/select-option.model';

@Component({
  selector: 'alto-input-single-select-pill',
  templateUrl: './input-single-select-pill.component.html',
  styleUrls: ['./input-single-select-pill.component.scss'],
})
export class InputSingleSelectPillComponent implements OnInit {
  I18ns = I18ns;

  @Input() placeholder?: string;
  @Input() control: FormControl<PillOption | null> = new FormControl(null);
  @Input() options: PillOption[] = [];
  @Input() hasFormAppearance = false;

  isDropdownOpen = false;
  mandatoryField = false;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.mandatoryField = this.control.hasValidator(Validators.required);
  }

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
