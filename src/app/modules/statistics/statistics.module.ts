import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PerformanceByTeamsComponent } from './components/global-performance/performance-by-teams/performance-by-teams.component';
import { PerformanceByThemesComponent } from './components/global-performance/performance-by-themes/performance-by-themes.component';
import { PerformanceQuestionsTableComponent } from './components/global-performance/performance-questions-table/performance-questions-table.component';
import { PerformanceTeamsTableComponent } from './components/global-performance/performance-teams-table/performance-teams-table.component';
import { StatisticsGlobalPerformanceComponent } from './components/global-performance/statistics-global-performance/statistics-global-performance.component';
import { StatisticsGlobalEngagementComponent } from './components/statistics-global-engagement/statistics-global-engagement.component';
import { StatisticsPerTeamsComponent } from './components/statistics-per-teams/statistics-per-teams.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { StatisticsRoutingModule } from './statistics-routing.module';

@NgModule({
  declarations: [
    StatisticsComponent,
    StatisticsGlobalEngagementComponent,
    StatisticsGlobalPerformanceComponent,
    StatisticsPerTeamsComponent,
    PerformanceByTeamsComponent,
    PerformanceByThemesComponent,
    PerformanceTeamsTableComponent,
    PerformanceQuestionsTableComponent,
  ],
  imports: [CommonModule, StatisticsRoutingModule, SharedModule],
})
export class StatisticsModule {}
