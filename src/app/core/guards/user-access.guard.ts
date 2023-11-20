import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map, of, switchMap, tap } from 'rxjs';

import { UsersRestService } from '../../modules/profile/services/users-rest.service';
import { AltoRoutes } from '../../modules/shared/constants/routes';

import * as FromRoot from '../store/root';
import { RootState } from '../store/root/root.reducer';

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
    private readonly store: Store<RootState>,
    private readonly usersRestService: UsersRestService,
    private readonly teamsRestService: TeamsRestService,
    private readonly companiesRestService: CompaniesRestService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return combineLatest([
      this.store.select(FromRoot.selectUserMe),
      this.store.select(FromRoot.selectUsers),
      this.store.select(FromRoot.selectTeams),
      this.store.select(FromRoot.selectCompany),
    ]).pipe(
      switchMap(([me, users, teams, company]) => {
        console.log('me : ', me);
        console.log('users : ', users);
        console.log('teams : ', teams);
        console.log('company : ', company);

        return combineLatest([
          !me || me.needsUpdate()
            ? this.usersRestService.getMe().pipe(
                map((userDto) => {
                  const user = User.fromDto(userDto);
                  this.store.dispatch(setUserMe({ user }));
                  console.log('setting in store');
                  return user;
                }),
              )
            : of(me.data),
          !users || users.needsUpdate()
            ? this.usersRestService.getUsers().pipe(
                map((usersDto) => {
                  const users = usersDto.map(User.fromDto);
                  this.store.dispatch(setUsers({ users }));
                  console.log('setting in store');

                  return users;
                }),
              )
            : of(users.data),
          !teams || teams.needsUpdate()
            ? this.teamsRestService.getTeams().pipe(
                map((teamsDto) => {
                  const teams = teamsDto.map(Team.fromDto);
                  this.store.dispatch(setTeams({ teams }));
                  console.log('setting in store');

                  return teams;
                }),
              )
            : of(teams.data),
          (!company || company.needsUpdate()) && me?.data?.companyId
            ? this.companiesRestService.getCompanyById(me.data.companyId).pipe(
                map((companyDto) => {
                  const company = Company.fromDto(companyDto);
                  this.store.dispatch(setCompany({ company }));
                  console.log('setting in store');
                  return company;
                }),
              )
            : of(new Company({} as any)),
        ]);
      }),
      tap(() => {
        combineLatest([
          this.store.select(FromRoot.selectUserMe),
          this.store.select(FromRoot.selectUsers),
          this.store.select(FromRoot.selectTeams),
          this.store.select(FromRoot.selectCompany),
        ]).subscribe(([me, users, teams, company]) => {
          console.log('me : ', me);
          console.log('users : ', users);
          console.log('teams : ', teams);
          console.log('company : ', company);
        });
      }),
      map(([user, , , company]) => {
        console.log('route : ', route);

        if (!user) {
          return false;
        } else if (!company) {
          return false;
        }
        return true;

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
