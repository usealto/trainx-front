import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';
import { map, tap } from 'rxjs';
import { UsersRestService } from './modules/profile/services/users-rest.service';
import { AltoRoutes } from './modules/shared/constants/routes';

export const canActivateLead: CanActivateFn = () => {
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
