import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Team } from 'src/app/models/team.model';
import * as FromRoot from './../../core/store/store.reducer';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { setTeams } from '../store/root/root.action';

export const teamsResolver: ResolveFn<any> = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const teamsRestService = inject(TeamsRestService);

  return store.select(FromRoot.selectTeamsTimestamp).subscribe((timestamp) => {
    if (timestamp === null || timestamp === undefined || Date.now() - timestamp.getTime() > 60000) {
      teamsRestService.getTeams().pipe(
        tap((teams) => {
          store.dispatch(setTeams({ teams }));
        }),
      );
    }
  });
};
