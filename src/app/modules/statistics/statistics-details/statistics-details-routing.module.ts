import { RouterModule, Routes } from '@angular/router';
import { StatisticsDetailsComponent } from './components/statistics-details/statistics-details.component';
import { AltoRoutes } from '../../shared/constants/routes';
import { TeamPerformanceComponent } from './components/team-performance/team-performance.component';
import { NgModule } from '@angular/core';

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
        component: TeamPerformanceComponent,
      },
      {
        path: AltoRoutes.engagement + '/:id',
        component: TeamPerformanceComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatisticsDetailsRoutingModule {}
