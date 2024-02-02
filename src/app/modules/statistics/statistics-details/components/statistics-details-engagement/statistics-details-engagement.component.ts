import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AltoRoutes } from '../../../../shared/constants/routes';

enum EStatisticsDetailsEngagementTabs {
  Team = 'team',
  User = 'user',
}

@Component({
  selector: 'alto-statistics-details-engagement',
  templateUrl: './statistics-details-engagement.component.html',
  styleUrls: ['./statistics-details-engagement.component.scss'],
})
export class StatisticsDetailsEngagementComponent implements OnInit {
  EStatisticsDetailsEngagementTabs = EStatisticsDetailsEngagementTabs;

  readonly tabOptions = [
    { label: EStatisticsDetailsEngagementTabs.Team, value: EStatisticsDetailsEngagementTabs.Team },
    { label: EStatisticsDetailsEngagementTabs.User, value: EStatisticsDetailsEngagementTabs.User },
  ];

  activeTab = new FormControl(this.tabOptions[0], { nonNullable: true });

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    if (this.router.url.split('/')[3] !== AltoRoutes.statTeam) {
      this.activeTab.patchValue(this.tabOptions[1]);
    }
  }
}
