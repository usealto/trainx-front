import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, of, switchMap, withLatestFrom } from 'rxjs';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { Company } from '../../models/company.model';
import { User } from '../../models/user.model';
import { CompaniesRestService } from '../../modules/companies/service/companies-rest.service';
import { UsersRestService } from '../../modules/profile/services/users-rest.service';
import { setCompany, setUserMe } from '../store/root/root.action';
import * as FromRoot from '../store/store.reducer';

export const appGuard: CanActivateFn = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const usersRestService = inject<UsersRestService>(UsersRestService);
  const companiesRestService = inject<CompaniesRestService>(CompaniesRestService);
  const router = inject(Router);

  return store.select(FromRoot.selectUserMe).pipe(
    switchMap((me) => {
      return me.needsUpdate()
        ? usersRestService.getMe().pipe(
            map((userDto) => {
              const user = User.fromDto(userDto);
              store.dispatch(setUserMe({ user }));
              return user;
            }),
          )
        : of(me.data);
    }),
    filter((user) => user.isCompanyUser()),
    withLatestFrom(store.select(FromRoot.selectCompany)),
    switchMap(([user, company]) => {
      return company.needsUpdate()
        ? companiesRestService.getCompanyById(user.companyId).pipe(
            map((companyDto) => {
              const company = Company.fromDto(companyDto);
              store.dispatch(setCompany({ company }));
              return company;
            }),
          )
        : of(company.data);
    }),
    map((company) => {
      if (!company) {
        router.navigate(['/', AltoRoutes.noCompany]);
      }
      return !!company;
    }),
  );
};
