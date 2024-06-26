import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';
import {
  AppGuard,
  PreventSmallScreenGuard,
  altoAdminGuard,
  leadAccessGuard,
  userAccessGuard,
} from './core/guards';
import { FlagBasedPreloadingStrategy } from './core/interceptors/module-loading-strategy';
import { appResolver, noSplashScreenResolver } from './core/resolvers';
import { leadResolver } from './core/resolvers/lead.resolver';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { ImpersonateComponent } from './layout/impersonate/impersonate.component';
import { JwtComponent } from './layout/jwt/jwt.component';
import { NoCompanyComponent } from './layout/no-company/no-company.component';
import { NoSmallScreenComponent } from './layout/no-small-screen/no-small-screen.component';
import { NoTeamComponent } from './layout/no-team/no-team.component';
import { NoWebAccessComponent } from './layout/no-web-access/no-web-access.component';
import { NotFoundComponent } from './layout/not-found/not-found.component';
import { TestComponent } from './layout/test/test.component';
import { AltoRoutes } from './modules/shared/constants/routes';
import { EResolvers } from './core/resolvers/resolvers.service';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard, AppGuard, PreventSmallScreenGuard],
    resolve: {
      [EResolvers.AppResolver]: appResolver,
    },
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: 'test',
        component: TestComponent,
      },
      {
        path: AltoRoutes.user,
        canActivate: [userAccessGuard],
        children: [
          { path: '', redirectTo: AltoRoutes.userHome, pathMatch: 'full' },
          {
            path: AltoRoutes.userHome,
            loadChildren: () => import('./modules/user-home/user-home.module').then((m) => m.UserHomeModule),
          },
          {
            path: AltoRoutes.userTeams,
            loadChildren: () => import('./modules/user-team/user-team.module').then((m) => m.UserTeamModule),
          },
          {
            path: AltoRoutes.training,
            loadChildren: () => import('./modules/training/training.module').then((m) => m.TrainingModule),
          },
          {
            path: AltoRoutes.profile,
            loadChildren: () => import('./modules/profile/profile.module').then((m) => m.ProfileModule),
          },
        ],
      },
      {
        path: AltoRoutes.lead,
        canActivate: [leadAccessGuard],
        runGuardsAndResolvers: 'always',
        resolve: {
          [EResolvers.LeadResolver]: leadResolver,
        },
        children: [
          { path: '', redirectTo: AltoRoutes.leadHome, pathMatch: 'full' },
          {
            path: AltoRoutes.leadHome,
            runGuardsAndResolvers: 'always',
            loadChildren: () => import('./modules/lead-home/lead-home.module').then((m) => m.LeadHomeModule),
          },
          {
            path: AltoRoutes.programs,
            loadChildren: () => import('./modules/programs/programs.module').then((m) => m.ProgramsModule),
          },
          {
            path: AltoRoutes.leadTeams,
            loadChildren: () => import('./modules/lead-team/lead-team.module').then((m) => m.LeadTeamModule),
          },
          {
            path: AltoRoutes.settings,
            loadChildren: () => import('./modules/settings/settings.module').then((m) => m.SettingsModule),
          },
          {
            path: AltoRoutes.profile,
            loadChildren: () => import('./modules/profile/profile.module').then((m) => m.ProfileModule),
          },
          {
            path: AltoRoutes.statistics,
            loadChildren: () =>
              import('./modules/statistics/statistics.module').then((m) => m.StatisticsModule),
          },
          {
            path: AltoRoutes.collaboration,
            loadChildren: () =>
              import('./modules/collaboration/collaboration.module').then((m) => m.CollaborationModule),
          },
          {
            path: AltoRoutes.parcours,
            loadChildren: () => import('./modules/parcours/parcours.module').then((m) => m.ParcoursModule),
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
    component: ImpersonateComponent,
    canActivate: [AuthGuard, altoAdminGuard],
    resolve: {
      splashscreen: noSplashScreenResolver,
    },
  },
  {
    path: AltoRoutes.translation,
    loadChildren: () => import('./core/utils/i18n/translation.module').then((m) => m.TranslationModule),
  },
  {
    path: '**',
    redirectTo: AltoRoutes.notFound,
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
