import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, startWith } from 'rxjs';

import { PillOption } from '../../../models/select-option.model';
import { I18ns } from '../../../../../core/utils/i18n/I18n';

@Component({
  selector: 'alto-input-pills',
  templateUrl: './input-pills.component.html',
  styleUrls: ['../input-dropdowns.component.scss'],
})
export class InputPillsComponent implements OnInit, OnDestroy {
  I18ns = I18ns;

  @Input() placeholder = '';
  @Input() controls: FormControl<FormControl<PillOption>[]> = new FormControl(
    [] as FormControl<PillOption>[],
    { nonNullable: true },
  );
  @Input() options: PillOption[] = [];
  @Input() hasFormAppearance = false;

  isDropdownOpen = false;
  filteredOptions: PillOption[] = [];

  private readonly inputPillsSubscription = new Subscription();

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.inputPillsSubscription.add(
      this.controls.valueChanges.pipe(startWith(null)).subscribe(() => {
        this.setFilteredOptions();
      }),
    );
  }

  ngOnDestroy(): void {
    this.inputPillsSubscription.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  private setFilteredOptions(): void {
    this.filteredOptions = this.options
      .filter(({ value }) => {
        return this.controls.value.map((ctrl) => ctrl.value).every((opt) => opt.value !== value);
      })
      .map((option) => new PillOption(option.rawData));

    if (this.filteredOptions.length === 0) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    if (this.controls.enabled) {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  private markControlsStatuses(): void {
    this.controls.markAsDirty();
    this.controls.markAsTouched();
  }

  addPill(value: PillOption): void {
    this.controls.patchValue([...this.controls.value, new FormControl(value, { nonNullable: true })]);
    this.markControlsStatuses();
  }

  removePill(index: number): void {
    if (this.controls.value[index].enabled) {
      this.controls.patchValue(this.controls.value.filter((_, i) => i !== index));
      this.markControlsStatuses();
    }
  }

  addAll(): void {
    this.controls.patchValue([
      ...this.controls.value,
      ...this.filteredOptions.map((option) => new FormControl(option, { nonNullable: true })),
    ]);

    this.markControlsStatuses();
    this.isDropdownOpen = false;
  }

  removeAll(): void {
    const filteredControls = this.controls.value.filter((control) => control.enabled);
    filteredControls.forEach((control) => {
      this.removePill(this.controls.value.findIndex((ctrl) => ctrl.value === control.value));
    });
  }
}
