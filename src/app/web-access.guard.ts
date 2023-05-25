import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { UsersRestService } from './modules/profile/services/users-rest.service';
import { AltoRoutes } from './modules/shared/constants/routes';

export const canHaveWebAccess: CanActivateFn = () => {
  const router = inject(Router);

  return inject(UsersRestService)
    .getMe()
    .pipe(
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
