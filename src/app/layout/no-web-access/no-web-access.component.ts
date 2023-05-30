import { Component } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-no-web-access',
  templateUrl: './no-web-access.component.html',
  styleUrls: ['./no-web-access.component.scss'],
})
export class NoWebAccessComponent {
  I18ns = I18ns;
}
