import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EResolverData, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';

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
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
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
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    const users = Array.from((data[EResolverData.UsersById] as Map<string, User>).values());
    const teams = Array.from((data[EResolverData.TeamsById] as Map<string, Team>).values());

    this.type = this.router.url.split('/')[3] === 'team' ? 'team' : 'user';
    this.id = this.router.url.split('/').pop() || '';
    this.selectedTab = this.router.url.split('/')[4] || '';

    if (this.type === 'user') {
      const user = users.find((u) => u.id === this.id);
      if (!user) {
        this.router.navigate(['/', AltoRoutes.lead, AltoRoutes.statistics, AltoRoutes.performance]);
      } else {
        this.name = user.firstname + ' ' + user.lastname;
      }
    } else {
      const team = teams.find((t) => t.id === this.id);
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
