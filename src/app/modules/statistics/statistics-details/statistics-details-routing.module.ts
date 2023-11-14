import { RouterModule, Routes } from '@angular/router';
import { StatisticsDetailsComponent } from './components/statistics-details/statistics-details.component';
import { AltoRoutes } from '../../shared/constants/routes';
import { TeamPerformanceComponent } from './components/team-performance/team-performance.component';
import { NgModule } from '@angular/core';
import { TeamEngagementComponent } from './components/team-engagement/team-engagement.component';
import { StatisticsDetailsPerformanceComponent } from './components/statistics-details-performance/statistics-details-performance.component';
import { StatisticsDetailsEngagementComponent } from './components/statistics-details-engagement/statistics-details-engagement.component';

const routes: Routes = [
  {
    path: '',
    component: StatisticsDetailsComponent,
    children: [
      {
        path: '',
        redirectTo: AltoRoutes.performance + '/:id',
        pathMatch: 'full',
      },
      {
        path: AltoRoutes.performance + '/:id',
        component:  StatisticsDetailsPerformanceComponent,
      },
      {
        path: AltoRoutes.engagement + '/:id',
        component:  StatisticsDetailsEngagementComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatisticsDetailsRoutingModule {}
