import { Component, EventEmitter, Input, Output } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  @Input() collectionSize!: number;
  @Input() pageSize!: number;
  @Input() maxSize!: number;
  @Input() page!: number;
  @Output() pageChange: EventEmitter<number> = new EventEmitter();

  I18ns = I18ns;

  paginate(page: number) {
    this.pageChange.emit(page);
  }
}
