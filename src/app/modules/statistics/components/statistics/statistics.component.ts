import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';

@Component({
  selector: 'alto-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent {
  Altoroutes = AltoRoutes;
  I18ns = I18ns;
  EmojiName = EmojiName;
  activeTab = 1;

  tabs = [
    { label: I18ns.statistics.globalPerformance.navbarTitle, value: AltoRoutes.performance },
    // TODO uncomment when implementing Engagement Tab
    // { label: I18ns.statistics.globalEngagement.title, value: AltoRoutes.engagement },
    { label: I18ns.statistics.perTeams.title, value: AltoRoutes.teams },
  ];

  constructor(private readonly router: Router) {}

  tabChange(val: string) {
    this.router.navigate(['/', AltoRoutes.lead, AltoRoutes.statistics, val]);
  }
}
