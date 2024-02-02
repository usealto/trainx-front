import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, debounceTime, startWith } from 'rxjs';

import { SelectOption } from '../../../models/select-option.model';
import { I18ns } from '../../../../../core/utils/i18n/I18n';

interface ICheckedOption {
  isChecked: boolean;
  option: SelectOption;
}

@Component({
  selector: 'alto-input-multiple-select',
  templateUrl: './input-multiple-select.component.html',
  styleUrls: ['./input-multiple-select.component.scss'],
})
export class InputMultipleSelectComponent implements OnInit, OnDestroy {
  @Input() placeholder?: string;
  @Input() enableSearch = false;
  @Input() controls: FormControl<FormControl<SelectOption>[]> = new FormControl(
    [] as FormControl<SelectOption>[],
    { nonNullable: true },
  );
  @Input() options: SelectOption[] = [];
  @Input() isForm = false;

  I18ns = I18ns;
  isDropdownOpen = false;
  filteredOptions: ICheckedOption[] = [];
  searchControl: FormControl<string | null> = new FormControl(null);

  private readonly inputMultipleSelectComponentSubscription = new Subscription();

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.filteredOptions = this.options.map((option) => ({
      isChecked: this.controls.value.some((control) => control.value.value === option.value),
      option,
    }));

    this.inputMultipleSelectComponentSubscription.add(
      this.controls.valueChanges.subscribe(() => {
        this.filteredOptions.forEach((option) => {
          option.isChecked = this.controls.value.some(
            (control) => control.value.value === option.option.value,
          );
        });
      }),
    );

    this.inputMultipleSelectComponentSubscription.add(
      this.searchControl.valueChanges.pipe(startWith(null), debounceTime(300)).subscribe((searchTerm) => {
        this.setFilteredOptions(searchTerm);
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

  private setFilteredOptions(searchTerm: string | null): void {
    this.filteredOptions = this.options
      .filter(({ label }) => {
        if (searchTerm === null) {
          return true;
        }

        return label.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .map((option) => ({
        isChecked: this.controls.value.some((control) => control.value.value === option.value),
        option,
      }));
  }

  toggleDropdown(): void {
    if (this.controls.enabled) {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  toggleOption(option: ICheckedOption): void {
    option.isChecked = !option.isChecked;

    if (option.isChecked) {
      this.controls.patchValue([
        ...this.controls.value,
        new FormControl(option.option, { nonNullable: true }),
      ]);
    } else {
      this.controls.patchValue(
        this.controls.value.filter((control) => control.value.value !== option.option.value),
      );
    }
  }

  toggleAllOptions(check?: boolean): void {
    const toCheck = check === undefined ? !this.filteredOptions.every((option) => option.isChecked) : check;

    if (toCheck) {
      this.controls.patchValue(this.options.map((option) => new FormControl(option, { nonNullable: true })));
    } else {
      this.controls.patchValue([]);
    }
  }
}
