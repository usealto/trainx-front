import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import {
  CreateTeamDtoApi,
  DeleteResponseApi,
  GetTeamsRequestParams,
  PatchTeamRequestParams,
  TeamDtoApi,
  TeamsApiService,
} from '@usealto/sdk-ts-angular';
import { TeamStore } from '../team.store';

@Injectable({
  providedIn: 'root',
})
export class TeamsRestService {
  constructor(private readonly teamApi: TeamsApiService, private teamStore: TeamStore) {}

  getTeam(id: string) {
    return this.teamApi.getTeamById({ id });
  }
  getTeams(req?: GetTeamsRequestParams): Observable<TeamDtoApi[]> {
    if (this.teamStore.teams.value.length) {
      return this.teamStore.teams.value$;
    } else {
      const par = {
        ...req,
        page: req?.page ?? 1,
        itemsPerPage: req?.itemsPerPage ?? 300,
        sortBy: req?.sortBy ?? 'name:asc',
      };

      return this.teamApi.getTeams(par).pipe(
        map((r) => r.data ?? []),
        tap((teams) => (this.teamStore.teams.value = teams)),
      );
    }
  }

  createTeam(createTeamDtoApi: CreateTeamDtoApi): Observable<TeamDtoApi | undefined> {
    return this.teamApi.createTeam({ createTeamDtoApi }).pipe(map((r) => r.data));
  }

  updateTeam(patchTeamRequestParams: PatchTeamRequestParams): Observable<TeamDtoApi | undefined> {
    return this.teamApi.patchTeam(patchTeamRequestParams).pipe(map((r) => r.data));
  }

  deleteTeam(id: string): Observable<DeleteResponseApi | undefined> {
    return this.teamApi.deleteTeam({ id });
  }

  resetCache() {
    this.teamStore.teams.reset();
  }
}
