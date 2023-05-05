import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { ProfileStore } from './modules/profile/profile.store';
import { UserDtoApiRolesEnumApi } from './sdk';

export const canActivateLead: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return inject(ProfileStore).user.value.roles.some(
    (r) => r === UserDtoApiRolesEnumApi.AltoAdmin || r === UserDtoApiRolesEnumApi.CompanyAdmin,
  );
};
