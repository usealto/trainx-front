import { Component, Input } from '@angular/core';

@Component({
  selector: 'alto-colored-pill-list',
  templateUrl: './colored-pill.component.html',
  styleUrls: ['./colored-pill.component.scss'],
})
export class ColoredPillListComponent {
  @Input() data: any[] = [];
  @Input() hasDynamicColor = false;
  @Input() limit = 0;
  @Input() tooltip: any;
}
