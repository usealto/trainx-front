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
    map(([{ data: user }]) => {
      if (user.isCompanyAdmin()) {
        router.navigate(['/', AltoRoutes.lead]);
      } else {
        router.navigate(['/', AltoRoutes.noAccess]);
      }
      return !!user;
    }),
  );
};
