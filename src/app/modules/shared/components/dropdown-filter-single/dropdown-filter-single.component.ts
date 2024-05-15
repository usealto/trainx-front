import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DropdownPosition } from '@ng-select/ng-select';

@Component({
  selector: 'alto-dropdown-filter-single',
  templateUrl: './dropdown-filter-single.component.html',
  styleUrls: ['./dropdown-filter-single.component.scss'],
})
export class DropdownFilterSingleComponent implements OnInit{
  @Input() data: any[] = [];
  @Input() displayLabel = 'name';
  @Input() placeholder = '';
  @Input() returnValue = 'id';
  @Input() selectedItems: any = null;
  @Input() position: DropdownPosition = 'auto';
  @Input() ngClass: string | any;
  @Input() appendTo = '';
  @Input() disabled: boolean | any;

  @Output() selectChange = new EventEmitter<any>();

  ngOnInit() {
    if (this.data.length > 0) {
      this.selectedItems = this.data[0][this.returnValue];
    }
  }

}
