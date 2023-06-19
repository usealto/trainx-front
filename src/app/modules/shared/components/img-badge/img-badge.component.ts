import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UserDtoApi, UserLightDtoApi } from '@usealto/sdk-ts-angular';
import { memoize } from 'src/app/core/utils/memoize/memoize';

@Component({
  selector: 'alto-img-badge',
  templateUrl: './img-badge.component.html',
  styleUrls: ['./img-badge.component.scss'],
})
export class ImgBadgeComponent implements OnChanges {
  @Input() user: UserDtoApi | UserLightDtoApi | null | undefined;
  @Input() url: string | null | undefined = '';
  @Input() size = 32;
  @Input() hasBorder = false;
  @Input() toggleTooltip = true;

  // @Output() error = new EventEmitter<any>();

  thumb = '';
  public broken = false;

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
  @memoize()
  getUserName(user: UserDtoApi | UserLightDtoApi | null | undefined) {
    const us = user as UserDtoApi;
    return us?.lastname && us?.firstname ? us?.firstname + ' ' + us?.lastname : user?.username;
  }
}
