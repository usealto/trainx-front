import { Component, EventEmitter, Input, Output } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent {
  I18ns = I18ns;

  @Input() labels: string[] = [];
  @Output() tabChanged = new EventEmitter<number>();

  switchTab(index: number) {
    this.tabChanged.emit(index);
  }
}
