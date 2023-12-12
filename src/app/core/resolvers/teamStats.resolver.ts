import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { TeamStats } from 'src/app/models/team.model';
import * as FromRoot from './../../core/store/store.reducer';
import { Store } from '@ngrx/store';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { addTeamStats } from '../store/root/root.action';
import { ScoresRestService } from '../../modules/shared/services/scores-rest.service';
import { ScoreDuration } from '../../modules/shared/models/score.model';

export const teamStatsResolver: ResolveFn<Map<string, TeamStats[]>> = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const scoresRest = inject(ScoresRestService);

  return store.select(FromRoot.selectTeamStats).pipe(
    switchMap((timestampedTeamStats) => {
      if (timestampedTeamStats.needsUpdate()) {
        // Fetching all stats
        const teamStatsMonth = scoresRest.getTeamsStatsObj(ScoreDuration.Month, false);
        const teamStatsMonthProg = scoresRest.getTeamsStatsObj(ScoreDuration.Month, true);
        const teamStatsTrimester = scoresRest.getTeamsStatsObj(ScoreDuration.Trimester, false);
        const teamStatsTrimesterProg = scoresRest.getTeamsStatsObj(ScoreDuration.Trimester, true);
        const teamStatsYear = scoresRest.getTeamsStatsObj(ScoreDuration.Year, false);
        const teamStatsYearProg = scoresRest.getTeamsStatsObj(ScoreDuration.Year, true);

        return combineLatest([
          teamStatsMonth,
          teamStatsMonthProg,
          teamStatsTrimester,
          teamStatsTrimesterProg,
          teamStatsYear,
          teamStatsYearProg,
        ]).pipe(
          switchMap(([month, monthProg, trimester, trimesterProg, year, yearProg]) => {
            // Combine all stats
            const allStats = [...month, ...monthProg, ...trimester, ...trimesterProg, ...year, ...yearProg];
            store.dispatch(addTeamStats({ teamStats: allStats }));

            return store.select(FromRoot.selectTeamStats);
          }),
          map(({ data }) => data),
        );
      } else {
        return of(timestampedTeamStats.data);
      }
    }),
  );
};
