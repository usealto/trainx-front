import { Component } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  I18ns = I18ns;
  activeTab = 1;

  tabChange(val: number) {
    this.activeTab = val;
  }
}
