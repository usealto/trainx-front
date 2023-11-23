import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Team } from 'src/app/models/team.model';
import * as FromRoot from './../../core/store/store.reducer';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

export const teamsResolver: ResolveFn<Map<string, Team>> = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  return store.select(FromRoot.selectTeams).pipe(map(({ data: teams }) => teams));
};
