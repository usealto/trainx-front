import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, of, switchMap, withLatestFrom } from 'rxjs';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { Company, ICompany } from '../../models/company.model';
import { CompaniesRestService } from '../../modules/companies/service/companies-rest.service';
import { TeamsRestService } from '../../modules/lead-team/services/teams-rest.service';
import { UsersRestService } from '../../modules/profile/services/users-rest.service';
import { setCompany, setUserMe } from '../store/root/root.action';
import * as FromRoot from '../store/store.reducer';
import { ProgramsRestService } from '../../modules/programs/services/programs-rest.service';

export const AppGuard: CanActivateFn = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const usersRestService = inject<UsersRestService>(UsersRestService);
  const companiesRestService = inject<CompaniesRestService>(CompaniesRestService);
  const teamsRestService = inject<TeamsRestService>(TeamsRestService);
  const programsRestService = inject<ProgramsRestService>(ProgramsRestService);

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
            ? combineLatest([
                companiesRestService.getCompanyById(user.companyId),
                teamsRestService.getTeams(),
                programsRestService.getProgramsObj(),
              ]).pipe(
                switchMap(([company, teams, programs]) => {
                  if (!company) {
                    return of(company);
                  }
                  const companyWithTeamsAndPrograms = new Company({
                    ...company.rawData,
                    teams: teams.map((team) => team.rawData),
                    programs: programs.map((program) => program.rawData),
                  });

                  store.dispatch(setCompany({ company: companyWithTeamsAndPrograms }));
                  return store.select(FromRoot.selectCompany);
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
