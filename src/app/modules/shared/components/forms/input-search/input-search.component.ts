import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'alto-input-search',
  templateUrl: './input-search.component.html',
  styleUrls: ['./input-search.component.scss'],
})
export class InputSearchComponent {
  @Input() placeholder = 'Rechercher';
  @Input() searchControl: FormControl<string | null> = new FormControl(null);

  reset(): void {
    this.searchControl.setValue(null);
  }
}
