import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map, switchMap } from 'rxjs';

import { UsersRestService } from './modules/profile/services/users-rest.service';
import { AltoRoutes } from './modules/shared/constants/routes';

import * as FromRoot from './core/store/root/';
import { RootState } from './core/store/root/root.reducer';

import { User } from './models/user.model';
import { setCompany, setTeams, setUserMe, setUsers } from './core/store/root/root.action';
import { TeamsRestService } from './modules/lead-team/services/teams-rest.service';
import { CompaniesRestService } from './modules/companies/service/companies-rest.service';
import { Team } from './models/team.model';
import { Company } from './models/company.model';

export class UserAccessGuard implements CanActivate {
  constructor(
    private readonly store: Store<RootState>,
    private readonly usersRestService: UsersRestService,
    private readonly teamsRestService: TeamsRestService,
    private readonly companiesRestService: CompaniesRestService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return combineLatest([
      this.store.select(FromRoot.selectUserMe),
      this.store.select(FromRoot.selectUsers),
      this.store.select(FromRoot.selectTeams),
      this.store.select(FromRoot.selectCompany),
    ]).pipe(
      switchMap(([me, users, teams, company]) => {
        return combineLatest([
          me.needsUpdate()
            ? this.usersRestService.getMe().pipe(
                map((userDto) => {
                  const user = User.fromDto(userDto);
                  this.store.dispatch(setUserMe({ user }));
                  return user;
                }),
              )
            : Promise.resolve(me.data),
          users.needsUpdate()
            ? this.usersRestService.getUsers().pipe(
                map((usersDto) => {
                  const users = usersDto.map(User.fromDto);
                  this.store.dispatch(setUsers({ users }));
                  return users;
                }),
              )
            : Promise.resolve(users.data),
          teams.needsUpdate()
            ? this.teamsRestService.getTeams().pipe(
                map((teamsDto) => {
                  const teams = teamsDto.map(Team.fromDto);
                  this.store.dispatch(setTeams({ teams }));
                  return teams;
                }),
              )
            : Promise.resolve(teams.data),
          company.needsUpdate()
            ? this.companiesRestService.getCompanyById(me.data.companyId).pipe(
                map((companyDto) => {
                  const company = Company.fromDto(companyDto);
                  this.store.dispatch(setCompany({ company }));
                  return company;
                }),
              )
            : Promise.resolve(company.data),
        ]);
      }),
      map(([user, , , company]) => {
        if (!user.companyId || !company) {
          this.router.navigate(['/', AltoRoutes.noCompany]);
          return false;
        } else if (!user.teamId && route.url[0].path === AltoRoutes.user) {
          this.router.navigate(['/', AltoRoutes.noTeam]);
          return false;
        } else if (!company.usersHaveWebAccess && route.url[0].path === AltoRoutes.user) {
          this.router.navigate(['/', AltoRoutes.noAccess]);
          return false;
        } else {
          return true;
        }
      }),
    );
  }
}
