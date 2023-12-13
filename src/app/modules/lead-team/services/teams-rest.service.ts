import { Injectable } from '@angular/core';
import {
  CreateTeamDtoApi,
  DeleteResponseApi,
  PatchTeamRequestParams,
  TeamDtoApi,
  TeamsApiService,
} from '@usealto/sdk-ts-angular';
import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';
import { Team } from 'src/app/models/team.model';
import { TeamStore } from '../team.store';

@Injectable({
  providedIn: 'root',
})
export class TeamsRestService {
  constructor(private readonly teamApi: TeamsApiService, private teamStore: TeamStore) {}

  getTeam(id: string) {
    return this.teamApi.getTeamById({ id });
  }
  getTeams(): Observable<Team[]> {
    return this.teamApi.getTeams({ page: 1, sortBy: 'createdAt:asc', itemsPerPage: 1000 }).pipe(
      switchMap(({ data, meta }) => {
        const reqs: Observable<TeamDtoApi[]>[] = [of(data ? data : [])];
        let totalPages = meta.totalPage ?? 1;

        for (let i = 2; i <= totalPages; i++) {
          reqs.push(
            this.teamApi.getTeams({ page: i, sortBy: 'createdAt:asc', itemsPerPage: 1000 }).pipe(
              tap(({ meta }) => {
                if (meta.totalPage !== totalPages) {
                  totalPages = meta.totalPage;
                }
              }),
              map(({ data }) => (data ? data : [])),
            ),
          );
        }
        return combineLatest(reqs);
      }),
      map((teamsDtos) => {
        return teamsDtos.flat().map(Team.fromDto);
      }),
    );
  }

  createTeam(createTeamDtoApi: CreateTeamDtoApi): Observable<TeamDtoApi | undefined> {
    return this.teamApi.createTeam({ createTeamDtoApi }).pipe(
      map((r) => r.data),
      tap((team) => {
        if (team) {
          this.teamStore.teams.add(team);
        }
      }),
    );
  }

  updateTeam(patchTeamRequestParams: PatchTeamRequestParams): Observable<TeamDtoApi | undefined> {
    return this.teamApi.patchTeam(patchTeamRequestParams).pipe(
      map((r) => r.data),
      tap((team) => {
        if (team) {
          this.teamStore.teams.patchWithId(team);
        }
      }),
    );
  }

  deleteTeam(id: string): Observable<DeleteResponseApi | undefined> {
    return this.teamApi.deleteTeam({ id }).pipe(
      tap(() => {
        this.teamStore.teams.value = this.teamStore.teams.value.filter((x) => x.id !== id);
      }),
    );
  }

  resetCache() {
    this.teamStore.teams.reset();
  }
}
