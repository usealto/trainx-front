import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

interface IRangeOption {
  value: number;
  label: string;
}

@Component({
  selector: 'alto-input-range',
  templateUrl: './input-range.component.html',
  styleUrls: ['./input-range.component.scss'],
})
export class InputRangeComponent {
  @Input() control = new FormControl(50, { nonNullable: true });

  min = 0;
  max = 100;
  step = 1;
  options: IRangeOption[] = [
    { value: 0, label: '0' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 75, label: '75' },
    { value: 100, label: '100%' },
  ];

  selectOption(option: IRangeOption): void {
    this.control.patchValue(option.value);
    this.control.markAsTouched();
    this.control.markAsDirty();
  }
}
