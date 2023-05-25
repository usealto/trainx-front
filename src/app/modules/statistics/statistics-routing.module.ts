import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { PerformanceTeamsTableComponent } from './components/global-performance/performance-teams-table/performance-teams-table.component';

const routes: Routes = [
  {
    path: '',
    component: StatisticsComponent,
  },
  {
    // TODO: Remove
    path: 'teams',
    component: PerformanceTeamsTableComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatisticsRoutingModule {}
