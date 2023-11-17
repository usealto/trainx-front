import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';
import {
  AppResolver,
  homeResolver,
  programResolver,
  trainingResolver,
  leadResolver,
  noSplashScreenResolver,
} from './core/resolvers';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { JwtComponent } from './layout/jwt/jwt.component';
import { NoCompanyComponent } from './layout/no-company/no-company.component';
import { NoSmallScreenComponent } from './layout/no-small-screen/no-small-screen.component';
import { NoTeamComponent } from './layout/no-team/no-team.component';
import { NoWebAccessComponent } from './layout/no-web-access/no-web-access.component';
import { NotFoundComponent } from './layout/not-found/not-found.component';
import { TestComponent } from './layout/test/test.component';
import { AltoRoutes } from './modules/shared/constants/routes';
import { noSmallScreen } from './no-small-screen.guard';
import { canActivateAltoAdmin, canActivateLead } from './roles.guard';
import { startup } from './startup.guard';
import { FlagBasedPreloadingStrategy } from './core/interceptors/module-loading-strategy';
import { ImpersonateComponent } from './layout/impersonate/impersonate.component';

const routes: Routes = [
  {
    path: '',
    resolve: {
      data: AppResolver,
    },
    children: [
      {
        path: '',
        component: AppLayoutComponent,
        canActivate: [startup, AuthGuard, noSmallScreen],
        canActivateChild: [AuthGuard],
        children: [
          {
            path: 'test',
            component: TestComponent,
          },
          {
            path: AltoRoutes.user,
            children: [
              { path: '', redirectTo: AltoRoutes.userHome, pathMatch: 'full' },
              {
                path: AltoRoutes.userHome,
                loadChildren: () =>
                  import('./modules/user-home/user-home.module').then((m) => m.UserHomeModule),
              },
              {
                path: AltoRoutes.userTeams,
                loadChildren: () =>
                  import('./modules/user-team/user-team.module').then((m) => m.UserTeamModule),
              },
              {
                path: AltoRoutes.training,
                resolve: {
                  appData: trainingResolver,
                },
                loadChildren: () =>
                  import('./modules/training/training.module').then((m) => m.TrainingModule),
              },
              {
                path: AltoRoutes.profile,
                loadChildren: () => import('./modules/profile/profile.module').then((m) => m.ProfileModule),
              },
            ],
          },
          {
            path: AltoRoutes.lead,
            canActivate: [canActivateLead],
            resolve: {
              appData: leadResolver,
            },
            children: [
              { path: '', redirectTo: AltoRoutes.leadHome, pathMatch: 'full' },
              {
                path: AltoRoutes.leadHome,
                resolve: {
                  appData: homeResolver,
                },
                loadChildren: () =>
                  import('./modules/lead-home/lead-home.module').then((m) => m.LeadHomeModule),
              },
              {
                path: AltoRoutes.programs,
                resolve: {
                  appData: programResolver,
                },
                loadChildren: () =>
                  import('./modules/programs/programs.module').then((m) => m.ProgramsModule),
                data: {
                  preload: true,
                },
              },
              {
                path: AltoRoutes.leadTeams,
                loadChildren: () =>
                  import('./modules/lead-team/lead-team.module').then((m) => m.LeadTeamModule),
              },
              {
                path: AltoRoutes.challenges,
                loadChildren: () =>
                  import('./modules/challenges/challenges.module').then((m) => m.ChallengesModule),
              },
              {
                path: AltoRoutes.settings,
                loadChildren: () =>
                  import('./modules/settings/settings.module').then((m) => m.SettingsModule),
              },
              {
                path: AltoRoutes.profile,
                loadChildren: () => import('./modules/profile/profile.module').then((m) => m.ProfileModule),
              },
              {
                path: AltoRoutes.statistics,
                loadChildren: () =>
                  import('./modules/statistics/statistics.module').then((m) => m.StatisticsModule),
                data: {
                  preload: true,
                },
              },
              {
                path: AltoRoutes.collaboration,
                loadChildren: () =>
                  import('./modules/collaboration/collaboration.module').then((m) => m.CollaborationModule),
              },
            ],
          },
          {
            path: AltoRoutes.notFound,
            component: NotFoundComponent,
          },
        ],
      },
      {
        path: '',
        canActivate: [AuthGuard],
        resolve: {
          splashscreen: noSplashScreenResolver,
        },
        children: [
          {
            path: AltoRoutes.noAccess,
            component: NoWebAccessComponent,
          },
          {
            path: AltoRoutes.noCompany,
            component: NoCompanyComponent,
          },
          {
            path: AltoRoutes.noTeam,
            component: NoTeamComponent,
          },
          {
            path: 'jwt',
            component: JwtComponent,
          },
          {
            path: AltoRoutes.noSmallScreen,
            component: NoSmallScreenComponent,
          },
        ],
      },
      {
        path: AltoRoutes.impersonate + '/:id',
        resolve: {
          splashscreen: noSplashScreenResolver,
        },
        component: ImpersonateComponent,
        canActivate: [AuthGuard, canActivateAltoAdmin],
      },
      {
        path: AltoRoutes.translation,
        loadChildren: () => import('./core/utils/i18n/translation.module').then((m) => m.TranslationModule),
      },
      {
        path: '**',
        redirectTo: AltoRoutes.notFound,
      },
    ],
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: FlagBasedPreloadingStrategy,
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
