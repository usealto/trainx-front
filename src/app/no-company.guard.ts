import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsersRestService } from './modules/profile/services/users-rest.service';
import { AltoRoutes } from './modules/shared/constants/routes';
import { filter, map } from 'rxjs';

export const haveCompany: CanActivateFn = () => {
  const router = inject(Router);

  return inject(UsersRestService)
    .getMe()
    .pipe(
      filter((x) => !!x),
      map((user) => {
        if (!user.company || !user.companyId) {
          router.navigate(['/', AltoRoutes.noCompany]);
          return false;
        }
        return true;
      }),
    );
};
