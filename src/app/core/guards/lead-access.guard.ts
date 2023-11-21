import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import * as FromRoot from '../store/store.reducer';

export const leadAccessGuard: CanActivateFn = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const router = inject<Router>(Router);

  return store.select(FromRoot.selectUserMe).pipe(
    map(({ data: user }) => {
      if (!user.isCompanyAdmin()) {
        router.navigate(['/', AltoRoutes.user, AltoRoutes.userHome]);
      }
      return user.isAltoAdmin();
    }),
  );
};
