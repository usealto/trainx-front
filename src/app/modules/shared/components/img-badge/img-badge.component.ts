import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'alto-img-badge',
  templateUrl: './img-badge.component.html',
  styleUrls: ['./img-badge.component.scss'],
})
export class ImgBadgeComponent implements OnChanges {
  @Input() url: string | null | undefined = '';

  thumb = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['url']?.currentValue) {
      this.thumb = changes['url']?.currentValue.replace('s=480', 's=32') || '';
    }
  }
}
