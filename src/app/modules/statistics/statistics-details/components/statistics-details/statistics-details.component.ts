import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { TeamStore } from 'src/app/modules/lead-team/team.store';

@Component({
  selector: 'alto-statistics-details',
  templateUrl: './statistics-details.component.html',
  styleUrls: ['./statistics-details.component.scss'],
})
export class StatisticsDetailsComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;

  constructor(
    private readonly router: Router,
    private readonly profileStore: ProfileStore,
    private readonly teamsStore: TeamStore,
  ) {}

  type: 'team' | 'user' = 'team';
  id!: string;
  name!: string;

  tabs = [
    { label: I18ns.statistics.globalPerformance.navbarTitle, value: AltoRoutes.performance },
    { label: I18ns.statistics.globalEngagement.title, value: AltoRoutes.engagement },
  ];

  selectedTab = '';

  ngOnInit(): void {
    this.type = this.router.url.split('/')[3] === 'team' ? 'team' : 'user';
    this.id = this.router.url.split('/').pop() || '';

    if (this.type === 'user') {
      const user = this.profileStore.users.value.find((u) => u.id === this.id);
      if (!user) {
        this.router.navigate(['/', AltoRoutes.lead, AltoRoutes.statistics, AltoRoutes.performance]);
      } else {
        this.name = user.firstname + ' ' + user.lastname;
      }
    } else {
      const team = this.teamsStore.teams.value.find((t) => t.id === this.id);
      if (!team) {
        this.router.navigate(['/', AltoRoutes.lead, AltoRoutes.statistics, AltoRoutes.performance]);
      } else {
        this.name = team.name;
      }
    }
  }

  tabChange(val: string) {
    const selectedTab = this.tabs.find((t) => t.value === val)?.value || this.tabs[0].value;
    this.router.navigate(['/', AltoRoutes.lead, AltoRoutes.statistics, this.type, selectedTab, this.id]);
  }
}
