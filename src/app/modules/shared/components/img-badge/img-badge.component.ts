import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UserDtoApi } from '@usealto/sdk-ts-angular';
import { memoize } from 'src/app/core/utils/memoize/memoize';

@Component({
  selector: 'alto-img-badge',
  templateUrl: './img-badge.component.html',
  styleUrls: ['./img-badge.component.scss'],
})
export class ImgBadgeComponent implements OnChanges {
  @Input() user: UserDtoApi | null | undefined;
  @Input() size = 32;

  thumb = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']?.currentValue?.pictureUrl) {
      this.thumb = changes['user']?.currentValue.pictureUrl.replace('s=480', 's=' + this.size) || '';
    }
  }

  @memoize()
  getStyle(size: number): string {
    return `width: ${size}px; height: ${size}px;`;
  }
}
