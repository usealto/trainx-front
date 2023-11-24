import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, of, switchMap, withLatestFrom } from 'rxjs';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { CompaniesRestService } from '../../modules/companies/service/companies-rest.service';
import { UsersRestService } from '../../modules/profile/services/users-rest.service';
import { setCompany, setUserMe } from '../store/root/root.action';
import * as FromRoot from '../store/store.reducer';

export const AppGuard: CanActivateFn = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const usersRestService = inject<UsersRestService>(UsersRestService);
  const companiesRestService = inject<CompaniesRestService>(CompaniesRestService);
  const router = inject(Router);

  return store.select(FromRoot.selectUserMe).pipe(
    switchMap((me) => {
      return me.needsUpdate()
        ? usersRestService.getMe().pipe(
            map((user) => {
              if (user) {
                store.dispatch(setUserMe({ user }));
              }
              return user;
            }),
          )
        : of(me.data);
    }),
    switchMap((user) => {
      if (!user) {
        router.navigate(['/', AltoRoutes.noAccess]);
        return of(false);
      }
      return of(user).pipe(
        withLatestFrom(store.select(FromRoot.selectCompany)),
        switchMap(([user, timestampedCompany]) => {
          return timestampedCompany.needsUpdate()
            ? companiesRestService.getCompanyById(user.companyId).pipe(
                map((company) => {
                  if (company) {
                    store.dispatch(setCompany({ company }));
                  }
                  return company;
                }),
              )
            : of(timestampedCompany);
        }),
        map((company) => {
          if (!company) {
            router.navigate(['/', AltoRoutes.noCompany]);
            return false;
          }
          return true;
        }),
      );
    }),
  );
};
