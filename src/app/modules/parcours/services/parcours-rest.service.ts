import { Injectable } from '@angular/core';
import { TeamDtoApi, TeamsApiService, UpdateParcourRequestParams } from '@usealto/sdk-ts-angular';
import { Observable, map } from 'rxjs';
import { Team } from '../../../models/team.model';

@Injectable({
  providedIn: 'root',
})
export class ParcoursRestService {
  constructor(private readonly teamsApi: TeamsApiService) {}

  updateParcour(teamId: string, parcour: string[]): Observable<Team> {
    const updateParcourReq: UpdateParcourRequestParams = {
      id: teamId,
      updateParcourDtoApi: {
          parcour,
        },
      }

    return this.teamsApi
      .updateParcour(updateParcourReq)
      .pipe(map(({ data }) => Team.fromDto(data as TeamDtoApi)));
  }
}
