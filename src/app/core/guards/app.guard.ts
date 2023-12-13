import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, of, switchMap, withLatestFrom } from 'rxjs';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { CompaniesRestService } from '../../modules/companies/service/companies-rest.service';
import { UsersRestService } from '../../modules/profile/services/users-rest.service';
import { setCompany, setUserMe } from '../store/root/root.action';
import * as FromRoot from '../store/store.reducer';
import { Company, ICompany } from '../../models/company.model';
import { TeamsRestService } from '../../modules/lead-team/services/teams-rest.service';

export const AppGuard: CanActivateFn = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const usersRestService = inject<UsersRestService>(UsersRestService);
  const companiesRestService = inject<CompaniesRestService>(CompaniesRestService);
  const teamsRestService = inject<TeamsRestService>(TeamsRestService);

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
              withLatestFrom(teamsRestService.getTeams()),
              switchMap(([company, teams]) => {
                const updatedCompany = company ?? new Company({} as ICompany);
                const companyWithTeams = new Company({...updatedCompany.rawData, teams: teams.map(team => team.rawData)});

                console.log('companyWithTeams : ', companyWithTeams);

                store.dispatch(setCompany({company: companyWithTeams}));
                return store.select(FromRoot.selectCompany);
              })
            )
            : of(timestampedCompany)
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
