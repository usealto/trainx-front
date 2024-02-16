import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsDetailsComponent } from './components/statistics-details/statistics-details.component';
import { ChartsModule } from '../../charts/charts.module';
import { SharedModule } from '../../shared/shared.module';
import { TeamPerformanceComponent } from './components/team-performance/team-performance.component';
import { StatisticsDetailsRoutingModule } from './statistics-details-routing.module';
import { TeamEngagementComponent } from './components/team-engagement/team-engagement.component';
import { UserPerformanceComponent } from './components/user-performance/user-performance.component';
import { StatisticsDetailsPerformanceComponent } from './components/statistics-details-performance/statistics-details-performance.component';
import { StatisticsDetailsEngagementComponent } from './components/statistics-details-engagement/statistics-details-engagement.component';
import { UserEngagementComponent } from './components/user-engagement/user-engagement.component';

@NgModule({
  declarations: [
    StatisticsDetailsComponent,
    TeamPerformanceComponent,
    TeamEngagementComponent,
    UserPerformanceComponent,
    StatisticsDetailsPerformanceComponent,
    StatisticsDetailsEngagementComponent,
    UserEngagementComponent,
  ],
  imports: [CommonModule, StatisticsDetailsRoutingModule, ChartsModule, SharedModule],
})
export class StatisticsDetailsModule {}
