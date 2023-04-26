import { Component, EventEmitter, Input, Output } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';

@Component({
  selector: 'alto-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent {
  I18ns = I18ns;

  @Input() labels: string[] = [];
  @Input() data: { label: string; value: any }[] = [];
  @Output() tabChanged = new EventEmitter<any>();

  switchTab(val: any) {
    this.tabChanged.emit(val);
  }

  @memoize()
  getId(i: number): number {
    return Math.round(Math.random() * 1000);
  }
}
