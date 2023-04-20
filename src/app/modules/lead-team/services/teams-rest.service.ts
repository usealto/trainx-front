import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import {
  GetTeamsRequestParams,
  GetUsersRequestParams,
  TeamApi,
  UsersApiService,
  TeamsApiService,
  UserApi,
} from 'src/app/sdk';
import { TeamStore } from '../team.store';

@Injectable({
  providedIn: 'root',
})
export class TeamsRestService {
  constructor(
    private readonly teamApi: TeamsApiService,
    private readonly usersApi: UsersApiService,
    private teamStore: TeamStore,
  ) {}

  getTeams(req?: GetTeamsRequestParams): Observable<TeamApi[]> {
    if (this.teamStore.teams.value.length) {
      return this.teamStore.teams.value$;
    } else {
      const par = {
        ...req,
        page: req?.page ?? 1,
        itemsPerPage: req?.itemsPerPage ?? 300,
        sortBy: req?.sortBy ?? 'longName:asc',
      };

      return this.teamApi.getTeams(par).pipe(
        map((r) => r.data ?? []),
        tap((tags) => (this.teamStore.teams.value = tags)),
      );
    }
  }
}
