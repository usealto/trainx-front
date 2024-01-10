import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, startWith } from 'rxjs';

import { SelectOption } from '../../../models/select-option.model';

@Component({
  selector: 'alto-input-multiple-select',
  templateUrl: './input-multiple-select.component.html',
  styleUrls: ['./input-multiple-select.component.scss'],
})
export class InputMultipleSelectComponent implements OnInit, OnDestroy {
  @Input() title?: string;
  @Input() enableSearch = false;
  @Input() controls: FormControl<FormControl<SelectOption>[]> = new FormControl(
    [] as FormControl<SelectOption>[],
    { nonNullable: true },
  );
  @Input() options: SelectOption[] = [];

  isDropdownOpen = false;
  filteredOptions: SelectOption[] = [];

  private readonly inputMultipleSelectComponentSubscription = new Subscription();

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.inputMultipleSelectComponentSubscription.add(
      this.controls.valueChanges.pipe(startWith(null)).subscribe(() => {
        this.setFilteredOptions();
      }),
    );
  }

  ngOnDestroy(): void {
    this.inputMultipleSelectComponentSubscription.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    if (this.controls.enabled) {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  private setFilteredOptions(): void {
    this.filteredOptions = this.options
      .filter(({ value }) => {
        return this.controls.value.map((ctrl) => ctrl.value).every((opt) => opt.value !== value);
      })
      .map((option) => new SelectOption(option.rawData));

    if (this.filteredOptions.length === 0) {
      this.isDropdownOpen = false;
    }
  }

  addOption(option: SelectOption): void {
    this.controls.patchValue([...this.controls.value, new FormControl(option, { nonNullable: true })]);
  }

  removeOption(index: number): void {
    if (this.controls.value[index].enabled) {
      this.controls.patchValue(this.controls.value.filter((_, i) => i !== index));
    }
  }

  addAllOptions(): void {
    this.controls.patchValue(this.options.map((option) => new FormControl(option, { nonNullable: true })));
    this.isDropdownOpen = false;
  }

  removeAllOptions(): void {
    this.controls.patchValue([]);
  }
}
