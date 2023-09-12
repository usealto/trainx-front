import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnChanges {
  @Input() placeholder = I18ns.shared.search;
  /**
   * To avoid server clog when a request is connected to the search
   */
  @Input() debounceTime = 450;
  @Input() searchItems? = '';
  @Output() searchChange = new EventEmitter<string>();
  @ViewChild('qSearch') searchInput?: ElementRef;

  timeOut: any;

  inputText = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchItems']) {
      if (this.searchInput && this.inputText !== changes['searchItems'].currentValue) {
        this.searchInput.nativeElement.value = changes['searchItems'].currentValue ?? '';
      }
    }
  }

  searchReq(value: string) {
    this.inputText = value;
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      this.searchChange.emit(value);
    }, this.debounceTime);
  }
}
