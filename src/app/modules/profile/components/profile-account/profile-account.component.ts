import { Component } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-profile-account',
  templateUrl: './profile-account.component.html',
  styleUrls: ['./profile-account.component.scss'],
})
export class ProfileAccountComponent {
  I18ns = I18ns;
}
