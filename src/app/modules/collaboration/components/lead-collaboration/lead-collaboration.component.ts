import { Component } from '@angular/core';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

enum ETabValue {
  PENDING = 'pending',
  ARCHIVED = 'archived',
  ALL = 'all',
}

const labels = {
  [ETabValue.PENDING]: 'En attente',
  [ETabValue.ARCHIVED]: 'Archivés',
  [ETabValue.ALL]: 'Tout voir',
};

interface ITab {
  label: string;
  value: ETabValue;
}

@Component({
  selector: 'alto-lead-collaboration',
  templateUrl: './lead-collaboration.component.html',
  styleUrls: ['./lead-collaboration.component.scss'],
})
export class LeadCollaborationComponent {
  Emoji = EmojiName;
  I18ns = I18ns;

  tabs: ITab[] = [
    { label: labels[ETabValue.PENDING], value: ETabValue.PENDING },
    { label: labels[ETabValue.ARCHIVED], value: ETabValue.ARCHIVED },
    { label: labels[ETabValue.ALL], value: ETabValue.ALL },
  ];

  selectedTab = this.tabs[0];

  pendingCount = 2;

  handleTabChange(tab: ITab) {
    this.selectedTab =  tab;
  }
}
