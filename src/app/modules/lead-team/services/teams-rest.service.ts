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

@Injectable({
  providedIn: 'root',
})
export class TeamsRestService {
  constructor(private readonly teamApi: TeamsApiService) {}

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

  createTeam(createTeamDtoApi: CreateTeamDtoApi): Observable<Team> {
    return this.teamApi.createTeam({ createTeamDtoApi }).pipe(
      map((r) => Team.fromDto(r.data as TeamDtoApi)),
    );
  }

  updateTeam(patchTeamRequestParams: PatchTeamRequestParams): Observable<Team> {
    return this.teamApi.patchTeam(patchTeamRequestParams).pipe(
      map((r) => Team.fromDto(r.data as TeamDtoApi)),
    );
  }

  deleteTeam(id: string): Observable<DeleteResponseApi> {
    return this.teamApi.deleteTeam({ id });
  }
}
