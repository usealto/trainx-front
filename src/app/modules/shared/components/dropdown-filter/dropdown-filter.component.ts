import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'alto-dropdown-filter',
  templateUrl: './dropdown-filter.component.html',
  styleUrls: ['./dropdown-filter.component.scss'],
})
export class DropdownFilterComponent {
  @Input() data: any[] = [];
  @Input() placeholder = '';
  @Input() displayLabel = 'name';
  @Input() returnValue = '';
  @Input() isColored = false;
  selectedItems = [];

  @Output() selectChange = new EventEmitter<any>();

  search(a: NgSelectComponent, b: any) {
    a.filter(b.target.value);
  }
}
