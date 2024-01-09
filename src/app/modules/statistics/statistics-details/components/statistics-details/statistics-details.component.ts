import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { IAppData } from '../../../../../core/resolvers';
import { ITabOption } from '../../../../shared/components/tabs/tabs.component';
import { FormControl } from '@angular/forms';

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

  tabsOptions: ITabOption[] = [
    { label: I18ns.statistics.globalPerformance.navbarTitle, value: AltoRoutes.performance },
    { label: I18ns.statistics.globalEngagement.title, value: AltoRoutes.engagement },
  ];

  tabControl = new FormControl<ITabOption>(this.tabsOptions[0], { nonNullable: true });
  emptyTeam = false;

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    const users = Array.from((data[EResolvers.AppResolver] as IAppData).userById.values());
    const teams = (data[EResolvers.AppResolver] as IAppData).company.teams;

    this.type = this.router.url.split('/')[3] === 'team' ? 'team' : 'user';
    this.id = this.router.url.split('/').pop() || '';
    const selectedTab = this.tabsOptions.find((t) => t.value === this.router.url.split('/')[4]);

    if (selectedTab) {
      this.tabControl.patchValue(selectedTab, { emitEvent: false });
    }

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
        this.emptyTeam = users.every(({ teamId }) => teamId !== team.id);
      }
    }
  }

  tabChange(val: string) {
    const selectedTab = this.tabsOptions.find((t) => t.value === val)?.value || this.tabsOptions[0].value;
    this.router.navigate(['/', AltoRoutes.lead, AltoRoutes.statistics, this.type, selectedTab, this.id]);
  }
}
