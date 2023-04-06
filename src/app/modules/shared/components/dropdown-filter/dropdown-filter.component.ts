import { Component, Input } from '@angular/core';

@Component({
  selector: 'alto-dropdown-filter',
  templateUrl: './dropdown-filter.component.html',
  styleUrls: ['./dropdown-filter.component.scss'],
})
export class DropdownFilterComponent {
  @Input() data: any[] = [];
  @Input() placeholder = '';
  @Input() displayLabel = 'name';
  selectedItems = [];
}
