import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'alto-icon-badge',
  templateUrl: './icon-badge.component.html',
  styleUrls: ['./icon-badge.component.scss'],
})
export class IconBadgeComponent {
  @HostBinding('style.--size')
  @Input()
  size = '3rem';

  @HostBinding('class')
  @Input()
  color: 'badge-double-primary' | 'badge-double-warning' | 'badge-double-success' = 'badge-double-primary';

  @Input() icon = 'bi-question-circle';
}
