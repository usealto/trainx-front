import { Component, EventEmitter, Input, Output } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  @Input() placeholder = I18ns.shared.search;
  /**
   * To avoid server clog when a request is connected to the search
   */
  @Input() debounceTime = 750;
  @Output() searchChange = new EventEmitter<string>();

  timeOut: any;

  searchReq(value: string) {
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      this.searchChange.emit(value);
    }, this.debounceTime);
  }
}
