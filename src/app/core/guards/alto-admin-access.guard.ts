import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

function jwtDecode(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
  return JSON.parse(jsonPayload);
}

export const altoAdminGuard: CanActivateFn = () => {
  const router = inject<Router>(Router);
  const authService = inject(AuthService);

  return authService.getAccessTokenSilently().pipe(
    map((token) => {
      const decodedToken = jwtDecode(token);
      return decodedToken[`${environment.audience}/roles`]?.includes('alto-admin');
    }),
    tap((isAltoAdmin) => {
      if (!isAltoAdmin) {
        localStorage.setItem('impersonatedUser', '');
        router.navigate(['/']);
      }
    }),
  );
};
