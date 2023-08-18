import { Component } from '@angular/core';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent {
  I18ns = I18ns;
  EmojiName = EmojiName;
  activeTab = 2;

  tabChange(val: number) {
    this.activeTab = val;
  }
}
