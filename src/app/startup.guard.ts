import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsersRestService } from './modules/profile/services/users-rest.service';
import { filter, map } from 'rxjs';
import { AltoRoutes } from './modules/shared/constants/routes';

export const startup: CanActivateFn = () => {
  const router = inject(Router);

  return inject(UsersRestService)
    .getMe()
    .pipe(
      filter((x) => !!x),
      map((user) => {
        if (!user.company || !user.companyId) {
          router.navigate(['/', AltoRoutes.noCompany]);
          return false;
        } else if (!user.company.usersHaveWebAccess) {
          router.navigate(['/', AltoRoutes.noAccess]);
          return false;
        } else if (!user.team || !user.team.id) {
          router.navigate(['/', AltoRoutes.noTeam]);
          return false;
        } else {
          return true;
        }
      }),
    );
};
