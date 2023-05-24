import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ProfileStore } from './modules/profile/profile.store';
import { filter, map, tap } from 'rxjs';
import { AltoRoutes } from './modules/shared/constants/routes';

export const canHaveWebAccess: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const router = inject(Router);

  return inject(ProfileStore).user.value$.pipe(
    filter((x) => !!x),
    map((user) => {
      if (!user.company.usersHasWebAccess) {
        router.navigate(['/', AltoRoutes.noAccess]);
        return false;
      }
      return true;
    }),
  );
};
