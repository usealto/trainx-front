import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';
import { map, tap } from 'rxjs';
import { UsersRestService } from '../modules/profile/services/users-rest.service';

export const canAccessAdmin: CanActivateFn = () => {
  const router = inject(Router);
  return inject(UsersRestService)
    .getMe()
    .pipe(
      map((u) =>
        u.roles.some(
          (r) => r === UserDtoApiRolesEnumApi.AltoAdmin,
        ),
      ),
      tap((isAdmin) => {
        if (isAdmin) {
          return true
        }else if(localStorage.getItem('impersonatedUser') !== '' && localStorage.getItem('impersonatedUser')){
          return true
        }else{
          router.navigate(['admin', 'unauthorized']);
          return false
        }
      }),
    );
};
