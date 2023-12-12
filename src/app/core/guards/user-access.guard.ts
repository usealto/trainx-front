import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import * as FromRoot from '../store/store.reducer';

export const userAccessGuard: CanActivateFn = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const router = inject(Router);

  return combineLatest([store.select(FromRoot.selectUserMe), store.select(FromRoot.selectCompany)]).pipe(
    map(([{ data: user }, { data: company }]) => {
      if (!user.teamId) {
        router.navigate(['/', AltoRoutes.noTeam]);
      } else if (!company.usersHaveWebAccess || user.hasNoAccess()) {
        router.navigate(['/', AltoRoutes.noAccess]);
      }
      return !!user;
    }),
  );
};
