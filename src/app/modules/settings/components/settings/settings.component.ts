import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ITabOption } from '../../../shared/components/tabs/tabs.component';

@Component({
  selector: 'alto-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  I18ns = I18ns;
  EmojiName = EmojiName;
  activeTab = 1;

  tabOptions: ITabOption[] = [
    { label: I18ns.settings.users.title, value: 1 },
    { label: I18ns.settings.continuousSession.title, value: 2 },
  ];
  tabControl = new FormControl<ITabOption>(this.tabOptions[0], { nonNullable: true });
}
