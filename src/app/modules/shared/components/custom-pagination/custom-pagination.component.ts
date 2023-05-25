import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'alto-custom-pagination',
  templateUrl: './custom-pagination.component.html',
  styleUrls: ['./custom-pagination.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomPaginationComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() collectionSize = 0;
  @Output() pageChange = new EventEmitter<number>();

  onPageChange(event: any) {
    this.pageChange.emit(event);
  }
}
