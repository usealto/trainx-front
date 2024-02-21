import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { I18ns } from '../../../../../core/utils/i18n/I18n';
import { SelectOption } from '../../../models/select-option.model';

@Component({
  selector: 'alto-input-single-select',
  templateUrl: './input-single-select.component.html',
  styleUrls: ['./input-single-select.component.scss'],
})
export class InputSingleSelectComponent implements OnInit {
  I18ns = I18ns;

  @Input() placeholder?: string;
  @Input() options: SelectOption[] = [];
  @Input() control: FormControl<SelectOption | null> = new FormControl();
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

  toggleOption(option: SelectOption): void {
    this.control.patchValue(option);
    this.control.markAsDirty();
    this.control.markAsTouched();
    this.isDropdownOpen = false;
  }
}
