import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ITabOption } from '../../../shared/components/tabs/tabs.component';

@Component({
  selector: 'alto-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;

  tabOptions: ITabOption[] = [
    { label: I18ns.statistics.globalPerformance.navbarTitle, value: AltoRoutes.performance },
    { label: I18ns.statistics.globalEngagement.title, value: AltoRoutes.engagement },
  ];
  tabControl = new FormControl<ITabOption>(this.tabOptions[0], { nonNullable: true });

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    const selectedTab =
      this.tabOptions.find(({ value }) => this.router.url.split('/').includes(value)) ?? this.tabOptions[0];

    this.tabControl.patchValue(selectedTab, { emitEvent: false });

    this.tabControl.valueChanges.subscribe(({ value }) => {
      const selectedTab = this.tabOptions.find((t) => t.value === value)?.value || this.tabOptions[0].value;
      this.router.navigate(['/', AltoRoutes.lead, AltoRoutes.statistics, selectedTab]);
    });
  }
}
