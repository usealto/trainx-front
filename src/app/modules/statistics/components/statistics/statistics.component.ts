import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';

@Component({
  selector: 'alto-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;

  tabs = [
    { label: I18ns.statistics.globalPerformance.navbarTitle, value: AltoRoutes.performance },
    // TODO uncomment when implementing Engagement Tab
    // { label: I18ns.statistics.globalEngagement.title, value: AltoRoutes.engagement },
    { label: I18ns.statistics.perTeams.title, value: AltoRoutes.teams },
  ];
  selectedTab = '';

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.selectedTab =
      this.tabs.find(({ value }) => this.router.url.split('/').includes(value))?.value ?? this.tabs[0].value;
  }

  tabChange(val: string) {
    const selectedTab = this.tabs.find((t) => t.value === val)?.value || this.tabs[0].value;
    this.router.navigate(['/', AltoRoutes.lead, AltoRoutes.statistics, selectedTab]);
  }
}
