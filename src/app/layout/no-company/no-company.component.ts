import { Component } from '@angular/core';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-no-company',
  templateUrl: './no-company.component.html',
  styleUrls: ['./no-company.component.scss'],
})
export class NoCompanyComponent {
  I18ns = I18ns;
  Emoji = EmojiName;
}
