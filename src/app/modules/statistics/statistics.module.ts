import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { StatisticsRoutingModule } from './statistics-routing.module';
import { SharedModule } from '../shared/shared.module';
import { StatisticsGlobalEngagementComponent } from './components/statistics-global-engagement/statistics-global-engagement.component';
import { StatisticsGlobalPerformanceComponent } from './components/statistics-global-performance/statistics-global-performance.component';
import { StatisticsPerTeamsComponent } from './components/statistics-per-teams/statistics-per-teams.component';
@NgModule({
  declarations: [
    StatisticsComponent,
    StatisticsGlobalEngagementComponent,
    StatisticsGlobalPerformanceComponent,
    StatisticsPerTeamsComponent,
  ],
  imports: [CommonModule, StatisticsRoutingModule, SharedModule],
})
export class StatisticsModule {}
