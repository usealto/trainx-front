import { inject, NgModule } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterModule,
  RouterStateSnapshot,
  Routes,
} from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';
import { combineLatest, take } from 'rxjs';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { NotFoundComponent } from './layout/not-found/not-found.component';
import { TeamsRestService } from './modules/lead-team/services/teams-rest.service';
import { UsersRestService } from './modules/profile/services/users-rest.service';
import { TagsRestService } from './modules/programs/services/tags-rest.service';
import { AltoRoutes } from './modules/shared/constants/routes';
import { ProgramsRestService } from './modules/programs/services/programs-rest.service';

export const appResolver: ResolveFn<any> = () => {
  return combineLatest([
    inject(TagsRestService).getTags(),
    inject(TeamsRestService).getTeams(),
    inject(UsersRestService).getMe(),
  ]).pipe(take(1));
};

export const programResolver: ResolveFn<any> = () => {
  return combineLatest([inject(UsersRestService).getUsers(), inject(ProgramsRestService).getPrograms()]).pipe(
    take(1),
  );
};

const routes: Routes = [
  {
    path: '',
    resolve: {
      appData: appResolver,
    },
    component: AppLayoutComponent,
    children: [
      {
        path: AltoRoutes.lead,
        children: [
          {
            path: AltoRoutes.leadHome,
            loadChildren: () => import('./modules/lead-home/lead-home.module').then((m) => m.LeadHomeModule),
          },
          {
            path: AltoRoutes.programs,
            resolve: {
              appData: programResolver,
            },
            loadChildren: () => import('./modules/programs/programs.module').then((m) => m.ProgramsModule),
          },
          {
            path: AltoRoutes.leadTeams,
            loadChildren: () => import('./modules/lead-team/lead-team.module').then((m) => m.LeadTeamModule),
          },
          {
            path: AltoRoutes.challenges,
            loadChildren: () =>
              import('./modules/challenges/challenges.module').then((m) => m.ChallengesModule),
          },
          {
            path: AltoRoutes.settings,
            loadChildren: () => import('./modules/settings/settings.module').then((m) => m.SettingsModule),
          },
          {
            path: AltoRoutes.profile,
            loadChildren: () => import('./modules/profile/profile.module').then((m) => m.ProfileModule),
          },
        ],
      },
    ],
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
  },
  {
    path: AltoRoutes.admin,
    loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
  },
  {
    path: AltoRoutes.translation,
    loadChildren: () => import('./core/utils/i18n/translation.module').then((m) => m.TranslationModule),
  },
  {
    path: '404',
    component: NotFoundComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
