import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnChanges {
  @Input() collectionSize!: number;
  @Input() pageSize!: number;
  @Input() page!: number;
  @Output() pageChange: EventEmitter<number> = new EventEmitter();

  lastPage = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['collectionSize']) {
      this.lastPage = Math.ceil(this.collectionSize / this.pageSize);
    }
  }

  I18ns = I18ns;

  paginate(page: number) {
    this.pageChange.emit(page);
  }
}
