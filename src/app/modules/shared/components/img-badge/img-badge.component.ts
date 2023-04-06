import { Component, Input } from '@angular/core';

@Component({
  selector: 'alto-img-badge',
  templateUrl: './img-badge.component.html',
  styleUrls: ['./img-badge.component.scss'],
})
export class ImgBadgeComponent {
  @Input() url: string | null | undefined = '';
}
