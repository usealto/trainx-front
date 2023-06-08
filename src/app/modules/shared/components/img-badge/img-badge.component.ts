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
  @Input() url: string | null | undefined = '';
  @Input() size = 32;
  @Input() hasBorder = false;

  thumb = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']?.currentValue) {
      this.thumb = this.user?.pictureUrl?.replace('s=480', 's=' + this.size) || '';
    } else if (changes['url']?.currentValue) {
      this.thumb = this.url || '';
    }
  }

  @memoize()
  getStyle(size: number): string {
    return `width: ${size}px; height: ${size}px;`;
  }
}
