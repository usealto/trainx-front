import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'alto-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  @Input() placeholder = 'Search';
  @Output() searchChange = new EventEmitter<string>();

  searchReq(value: string) {
    this.searchChange.emit(value);
  }
}
