import { ActivatedRouteSnapshot, CanActivate, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map, of, switchMap, tap, withLatestFrom } from 'rxjs';

import { UsersRestService } from '../../modules/profile/services/users-rest.service';

import * as FromRoot from '../store/store.reducer';

import { User } from '../../models/user.model';
import { setCompany, setTeams, setUserMe, setUsers } from '../store/root/root.action';
import { TeamsRestService } from '../../modules/lead-team/services/teams-rest.service';
import { CompaniesRestService } from '../../modules/companies/service/companies-rest.service';
import { Team } from '../../models/team.model';
import { Company } from '../../models/company.model';
import { Injectable } from '@angular/core';

@Injectable()
export class UserAccessGuard implements CanActivate {
  constructor(
    private readonly store: Store<FromRoot.AppState>,
    private readonly usersRestService: UsersRestService,
    private readonly teamsRestService: TeamsRestService,
    private readonly companiesRestService: CompaniesRestService,
  ) {}

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return combineLatest([
      this.store.select(FromRoot.selectUserMe),
      this.store.select(FromRoot.selectUsers),
      this.store.select(FromRoot.selectTeams),
    ]).pipe(
      switchMap(([me, users, teams]) => {
        console.log('me : ', me);
        console.log('me needs update ? ', me.needsUpdate());
        console.log('users : ', users);
        console.log('users needs update ? ', users.needsUpdate());
        console.log('teams : ', teams);
        console.log('teams needs update ? ', teams.needsUpdate());
        return combineLatest([
          me.needsUpdate()
            ? this.usersRestService.getMe().pipe(
                map((userDto) => {
                  const user = User.fromDto(userDto);
                  this.store.dispatch(setUserMe({ user }));
                  return user;
                }),
              )
            : of(me.data),
          users.needsUpdate()
            ? this.usersRestService.getUsers().pipe(
                map((usersDto) => {
                  const users = usersDto.map(User.fromDto);
                  this.store.dispatch(setUsers({ users }));
                  return users;
                }),
              )
            : of(users.data),
          teams.needsUpdate()
            ? this.teamsRestService.getTeams().pipe(
                map((teamsDto) => {
                  const teams = teamsDto.map(Team.fromDto);
                  this.store.dispatch(setTeams({ teams }));
                  return teams;
                }),
              )
            : of(teams.data),
        ]);
      }),
      withLatestFrom(this.store.select(FromRoot.selectCompany)),
      switchMap(([[user, ,], company]) => {
        console.log('needs update ? ', company, company.needsUpdate());
        return company.needsUpdate()
          ? this.companiesRestService.getCompanyById(user.companyId).pipe(
              map((companyDto) => {
                const company = Company.fromDto(companyDto);
                this.store.dispatch(setCompany({ company }));
                return company;
              }),
            )
          : of(company.data);
      }),
      map((company) => {
        return company && company.usersHaveWebAccess;

        // A METTRE AILLEURS
        // if (!user.companyId || !company) {
        //   this.router.navigate(['/', AltoRoutes.noCompany]);
        //   return false;
        // } else if (!user.teamId && route.url[0].path === AltoRoutes.user) {
        //   this.router.navigate(['/', AltoRoutes.noTeam]);
        //   return false;
        // } else if (!company.usersHaveWebAccess && route.url[0].path === AltoRoutes.user) {
        //   this.router.navigate(['/', AltoRoutes.noAccess]);
        //   return false;
        // } else {
        //   return true;
        // }
      }),
    );
  }
}
