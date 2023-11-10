import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';
import { map, tap } from 'rxjs';
import { UsersRestService } from './modules/profile/services/users-rest.service';
import { AltoRoutes } from './modules/shared/constants/routes';
import { AuthService } from '@auth0/auth0-angular';
import { environment } from 'src/environments/environment';

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
      tap((isAdmin) => {
        if (!isAdmin) {
          router.navigate(['/', AltoRoutes.user, AltoRoutes.userHome]);
        }
      }),
    );
};


export const canActivateAltoAdmin: CanActivateFn = () => {  
  // This function decodes the JWT in the browser
  function jwtDecode(token:string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  const router = inject(Router);

  // here we check the token for the roles
  // since we cannot trust the getMe() call which uses localstorage
  return inject(AuthService)
  .getAccessTokenSilently()    
  .pipe(
    map((token) => {
      const decodedToken = jwtDecode(token);
      return decodedToken[ environment.audience + '/roles']?.includes('alto-admin');
    }),
    tap((isAltoAdmin) => {
      if (!isAltoAdmin) {
        localStorage.setItem('impersonatedUser', '');
        router.navigate(['/']);
      }
    }),
  );  
};
