import { Component, HostBinding, HostListener, Input, OnInit } from '@angular/core';

@Component({
  selector: 'alto-icon-badge',
  templateUrl: './icon-badge.component.html',
  styleUrls: ['./icon-badge.component.scss'],
})
export class IconBadgeComponent implements OnInit {
  @Input()
  size = 3;
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.rawSize = this.size + 'rem';

    if (event.target.innerWidth < 840) {
      this.rawSize = this.size / 2 + 'rem';
    } else if (event.target.innerWidth < 1160) {
      this.rawSize = this.size / 1.5 + 'rem';
    }
  }
  @HostBinding('class')
  @Input()
  color:
    | 'badge-double-primary'
    | 'badge-double-warning'
    | 'badge-double-success'
    | 'badge-double-gray'
    | 'badge-double-purple' = 'badge-double-primary';

  @Input() icon = 'bi-question-circle';
  @HostBinding('style.--rawSize')
  rawSize = '3rem';

  ngOnInit(): void {
    this.rawSize = this.size + 'rem';
  }
}
