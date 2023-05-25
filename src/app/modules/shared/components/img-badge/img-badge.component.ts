import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { memoize } from 'src/app/core/utils/memoize/memoize';

@Component({
  selector: 'alto-img-badge',
  templateUrl: './img-badge.component.html',
  styleUrls: ['./img-badge.component.scss'],
})
export class ImgBadgeComponent implements OnChanges {
  @Input() url: string | null | undefined = '';
  @Input() size = 32;
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() error = new EventEmitter<any>();

  thumb = '';
  public broken = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['url']?.currentValue) {
      this.thumb = changes['url']?.currentValue.replace('s=480', 's=' + this.size) || '';
    }
  }

  @memoize()
  getStyle(size: number): string {
    return `width: ${size}px; height: ${size}px;`;
  }
}
