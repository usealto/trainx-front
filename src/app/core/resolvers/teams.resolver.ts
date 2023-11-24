import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Team } from 'src/app/models/team.model';
import * as FromRoot from './../../core/store/store.reducer';
import { Store } from '@ngrx/store';
import { map, of, switchMap } from 'rxjs';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { setTeams } from '../store/root/root.action';

export const teamsResolver: ResolveFn<Map<string, Team>> = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const teamsRestService = inject(TeamsRestService);

  return store.select(FromRoot.selectTeams).pipe(
    switchMap((timestampedTeams) => {
      return timestampedTeams.needsUpdate()
        ? teamsRestService.getTeams().pipe(
            switchMap((teams) => {
              store.dispatch(setTeams({ teams }));
              return store.select(FromRoot.selectTeams);
            }),
            map(({ data }) => data),
          )
        : of(timestampedTeams.data);
    }),
  );
};
