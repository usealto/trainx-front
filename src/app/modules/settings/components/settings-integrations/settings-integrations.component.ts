import { Component } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-settings-integrations',
  templateUrl: './settings-integrations.component.html',
  styleUrls: ['./settings-integrations.component.scss']
})
export class SettingsIntegrationsComponent {
  I18ns = I18ns;
}
