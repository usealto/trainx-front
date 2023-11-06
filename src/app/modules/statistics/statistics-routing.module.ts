import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatisticsGlobalPerformanceComponent } from './components/global-performance/statistics-global-performance/statistics-global-performance.component';
import { StatisticsGlobalEngagementComponent } from './components/statistics-global-engagement/statistics-global-engagement.component';
import { StatisticsPerTeamsComponent } from './components/statistics-per-teams/statistics-per-teams.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { AltoRoutes } from '../shared/constants/routes';

const routes: Routes = [
  {
    path: AltoRoutes.statTeam,
    loadChildren: () =>
      import('./statistics-details/statistics-details.module').then((m) => m.StatisticsDetailsModule),
  },
  {
    path: AltoRoutes.statUser,
    loadChildren: () =>
      import('./statistics-details/statistics-details.module').then((m) => m.StatisticsDetailsModule),
  },
  {
    path: '',
    component: StatisticsComponent,
    children: [
      {
        path: '',
        redirectTo: AltoRoutes.performance,
        pathMatch: 'full',
      },
      {
        path: AltoRoutes.performance,
        pathMatch: 'full',
        component: StatisticsGlobalPerformanceComponent,
      },
      {
        path: AltoRoutes.engagement,
        component: StatisticsGlobalEngagementComponent,
      },
      {
        path: AltoRoutes.teams,
        component: StatisticsPerTeamsComponent,
      },
      // {
      //   path: AltoRoutes.statTeam + '/:id',
      //   children: [
      //     {
      //       path: '',
      //       redirectTo: AltoRoutes.performance,
      //       pathMatch: 'full',
      //     },
      //     {
      //       path: AltoRoutes.performance,
      //       component: StatisticsGlobalEngagementComponent,
      //     }
      //   ]
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatisticsRoutingModule {}
