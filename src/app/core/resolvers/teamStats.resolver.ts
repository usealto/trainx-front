import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { TeamStats } from 'src/app/models/team.model';
import * as FromRoot from './../../core/store/store.reducer';
import { Store } from '@ngrx/store';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { setTeamsStats } from '../store/root/root.action';
import { ScoresRestService } from '../../modules/shared/services/scores-rest.service';
import { ScoreDuration } from '../../modules/shared/models/score.model';
import { Company } from '../../models/company.model';

export interface ITeamStatsData {
  company: Company;
}

export const teamStatsResolver: ResolveFn<ITeamStatsData> = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const scoresRest = inject(ScoresRestService);
  console.log('teamStatsResolver');

  return store.select(FromRoot.selectTeamsStatsTimestamp).pipe(
    switchMap((timestamp) => {
      if (timestamp === null || timestamp === undefined || Date.now() - timestamp.getTime() > 60000) {
        return combineLatest([
          scoresRest.getTeamsStatsObj(ScoreDuration.Month, false),
          scoresRest.getTeamsStatsObj(ScoreDuration.Month, true),
          scoresRest.getTeamsStatsObj(ScoreDuration.Trimester, false),
          scoresRest.getTeamsStatsObj(ScoreDuration.Trimester, true),
          scoresRest.getTeamsStatsObj(ScoreDuration.Year, false),
          scoresRest.getTeamsStatsObj(ScoreDuration.Year, true),
        ]).pipe(
          switchMap(([month, monthProg, trimester, trimesterProg, year, yearProg]) => {
            // Combine all stats
            console.log('teamStatsResolver', month, monthProg, trimester, trimesterProg, year, yearProg);
            const allStats = [...month, ...monthProg, ...trimester, ...trimesterProg, ...year, ...yearProg];
            store.dispatch(setTeamsStats({ teamStats: allStats }));
            return store.select(FromRoot.selectCompany);
          })
        );
      }

      return store.select(FromRoot.selectCompany);
    }),
    map(({data: company}) => {
      return {company};
    })
  );
};
