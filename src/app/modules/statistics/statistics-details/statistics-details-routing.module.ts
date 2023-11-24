import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AltoRoutes } from '../../shared/constants/routes';
import { StatisticsDetailsEngagementComponent } from './components/statistics-details-engagement/statistics-details-engagement.component';
import { StatisticsDetailsPerformanceComponent } from './components/statistics-details-performance/statistics-details-performance.component';
import { StatisticsDetailsComponent } from './components/statistics-details/statistics-details.component';

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
        component: StatisticsDetailsPerformanceComponent,
      },
      {
        path: AltoRoutes.engagement + '/:id',
        component: StatisticsDetailsEngagementComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatisticsDetailsRoutingModule {}
