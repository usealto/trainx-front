import { Component, Input } from '@angular/core';

@Component({
  selector: 'alto-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss'],
})
export class AdminHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() divider = false;
}
