import { Component } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';


@Component({
  selector: 'alto-settings-users',
  templateUrl: './settings-users.component.html',
  styleUrls: ['./settings-users.component.scss']
})
export class SettingsUsersComponent {
  I18ns = I18ns;
}
