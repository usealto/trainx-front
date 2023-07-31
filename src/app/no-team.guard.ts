import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsersRestService } from './modules/profile/services/users-rest.service';
import { AltoRoutes } from './modules/shared/constants/routes';
import { filter, map } from 'rxjs';

export const haveTeam: CanActivateFn = () => {
  const router = inject(Router);

  return inject(UsersRestService)
    .getMe()
    .pipe(
      filter((x) => !!x),
      map((user) => {
        if (!user.team || !user.team.id) {
          router.navigate(['/', AltoRoutes.noCompany]);
          return false;
        }
        return true;
      }),
    );
};
