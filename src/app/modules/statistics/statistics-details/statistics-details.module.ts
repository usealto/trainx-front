import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsDetailsComponent } from './components/statistics-details/statistics-details.component';
import { ChartsModule } from '../../charts/charts.module';
import { SharedModule } from '../../shared/shared.module';
import { TeamPerformanceComponent } from './components/team-performance/team-performance.component';
import { StatisticsDetailsRoutingModule } from './statistics-details-routing.module';

@NgModule({
  declarations: [StatisticsDetailsComponent, TeamPerformanceComponent],
  imports: [CommonModule, StatisticsDetailsRoutingModule, ChartsModule, SharedModule],
})
export class StatisticsDetailsModule {}
