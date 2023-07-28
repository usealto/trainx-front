import { Injectable } from '@angular/core';
import { Store } from 'src/app/core/utils/store/store';
import { TeamDtoApi, TeamStatsDtoApi } from '@usealto/sdk-ts-angular';

@Injectable({ providedIn: 'root' })
export class TeamStore {
  teams: Store<TeamDtoApi[]> = new Store<TeamDtoApi[]>([]);
  teamsStats: Store<TeamStatsDtoApi[]> = new Store<TeamStatsDtoApi[]>([]);
}
