import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsDetailsComponent } from './components/statistics-details/statistics-details.component';
import { ChartsModule } from '../../charts/charts.module';
import { SharedModule } from '../../shared/shared.module';
import { TeamPerformanceComponent } from './components/team-performance/team-performance.component';
import { StatisticsDetailsRoutingModule } from './statistics-details-routing.module';
import { TeamEngagementComponent } from './components/team-engagement/team-engagement.component';

@NgModule({
  declarations: [StatisticsDetailsComponent, TeamPerformanceComponent, TeamEngagementComponent],
  imports: [CommonModule, StatisticsDetailsRoutingModule, ChartsModule, SharedModule],
})
export class StatisticsDetailsModule {}
