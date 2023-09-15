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

  avatarsFolder = 'assets/avatars/';
  avatarsCount = 71;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']?.currentValue) {
      this.thumb = this.getAvatar(this.user?.id);
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
    if (!user) {
      return '';
    }
    return user?.firstname + ' ' + user?.lastname;
  }

  @memoize()
  getAvatar(id?: string) {
    return this.avatarsFolder + this.extractNumber(id ?? '') + '.svg';
  }

  @memoize()
  extractNumber(str: string): number {
    if (str.length < 8) {
      return 0;
    }
    let output = 0;
    for (let index = 0; index < str.length; index++) {
      output += str[index].charCodeAt(0);
    }
    return output % this.avatarsCount;
  }
}
