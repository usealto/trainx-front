import { Component, Input } from '@angular/core';

@Component({
  selector: 'alto-admin-tab',
  styles: [
    `
      .pane {
        padding: 1em;
      }
    `,
  ],
  template: `
    <div [hidden]="!active" class="pane">
      <ng-content></ng-content>
    </div>
  `,
})
export class AdminTabComponent {
  @Input() tabTitle = '';
  @Input() active = false;
}
