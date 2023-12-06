import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Team } from 'src/app/models/team.model';
import * as FromRoot from './../../core/store/store.reducer';
import { Store } from '@ngrx/store';
import { map, of, switchMap } from 'rxjs';
import { setTeams } from '../store/root/root.action';
import { StatsApiService } from '@usealto/sdk-ts-angular';

export const teamStatsResolver: ResolveFn<Map<string, Team>> = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const statsApi = inject(StatsApiService);
};
