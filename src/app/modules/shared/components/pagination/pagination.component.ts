import { Component, Input, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnChanges {
  @Input() pageControl = new FormControl(1, { nonNullable: true });
  @Input() itemsCount = 0;
  @Input() itemsPerPage = 0;

  pageCount = 0;
  I18ns = I18ns;

  ngOnChanges(): void {
    this.pageCount = Math.ceil(this.itemsCount / this.itemsPerPage);
  }

  paginate(page: number): void {
    if (page > 0 && page <= this.pageCount) {
      this.pageControl.patchValue(page);
    }
  }
}
