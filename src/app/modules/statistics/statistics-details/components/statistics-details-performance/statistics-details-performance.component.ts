import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AltoRoutes } from '../../../../shared/constants/routes';

enum EStatisticsDetailsPerformanceTabs {
  Team = 'team',
  User = 'user',
}

@Component({
  selector: 'alto-statistics-details-performance',
  templateUrl: './statistics-details-performance.component.html',
  styleUrls: ['./statistics-details-performance.component.scss'],
})
export class StatisticsDetailsPerformanceComponent implements OnInit {
  EStatisticsDetailsPerformanceTabs = EStatisticsDetailsPerformanceTabs;

  readonly tabOptions = [
    { label: EStatisticsDetailsPerformanceTabs.Team, value: EStatisticsDetailsPerformanceTabs.Team },
    { label: EStatisticsDetailsPerformanceTabs.User, value: EStatisticsDetailsPerformanceTabs.User },
  ];

  activeTab = new FormControl(this.tabOptions[0], { nonNullable: true });

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    if (this.router.url.split('/')[3] !== AltoRoutes.statTeam) {
      this.activeTab.patchValue(this.tabOptions[1]);
    }
  }
}
