import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { map, tap } from 'rxjs';
import { UsersRestService } from './modules/profile/services/users-rest.service';
import { AltoRoutes } from './modules/shared/constants/routes';
import { UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';

export const canActivateLead: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  return inject(UsersRestService)
    .getMe()
    .pipe(
      map((u) =>
        u.roles.some(
          (r) => r === UserDtoApiRolesEnumApi.AltoAdmin || r === UserDtoApiRolesEnumApi.CompanyAdmin,
        ),
      ),
      tap((isTrue) => {
        if (!isTrue) {
          router.navigate(['/', AltoRoutes.user, AltoRoutes.userHome]);
        }
      }),
    );
};
