import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { TagDtoApi } from '@usealto/sdk-ts-angular';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { Company } from '../../models/company.model';
import { EScoreDuration } from '../../models/score.model';
import { TagsRestService } from '../../modules/programs/services/tags-rest.service';
import { ScoresRestService } from '../../modules/shared/services/scores-rest.service';
import { setTags, setTeamsStats } from '../store/root/root.action';
import * as FromRoot from '../store/store.reducer';

export interface ILeadData {
  company: Company;
  tags: TagDtoApi[];
}

export const leadResolver: ResolveFn<ILeadData> = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const scoresRestService = inject(ScoresRestService);
  const tagsRestService = inject(TagsRestService);

  return combineLatest([
    store.select(FromRoot.selectTeamsStatsTimestamp),
    store.select(FromRoot.selectTags),
  ]).pipe(
    switchMap(([timestamp, tags]) => {
      return combineLatest([
        timestamp === null || timestamp === undefined || Date.now() - timestamp.getTime() > 120000
          ? combineLatest([
              scoresRestService.getPaginatedTeamsStats(EScoreDuration.Month),
              scoresRestService.getPaginatedTeamsStats(EScoreDuration.Month, true),
              scoresRestService.getPaginatedTeamsStats(EScoreDuration.Trimester),
              scoresRestService.getPaginatedTeamsStats(EScoreDuration.Trimester, true),
              scoresRestService.getPaginatedTeamsStats(EScoreDuration.Year),
              scoresRestService.getPaginatedTeamsStats(EScoreDuration.Year, true),
            ]).pipe(
              switchMap(([month, monthProg, trimester, trimesterProg, year, yearProg]) => {
                // Combine all stats
                const allStats = [
                  ...month,
                  ...monthProg,
                  ...trimester,
                  ...trimesterProg,
                  ...year,
                  ...yearProg,
                ];
                store.dispatch(setTeamsStats({ teamStats: allStats }));
                return store.select(FromRoot.selectCompany);
              }),
            )
          : store.select(FromRoot.selectCompany),
        tags.needsUpdate()
          ? tagsRestService.getAllTags().pipe(
              tap((tags) => store.dispatch(setTags({ tags }))),
              switchMap(() => store.select(FromRoot.selectTags)),
            )
          : store.select(FromRoot.selectTags),
      ]);
    }),
    map(([{ data: company }, { data: tags }]) => {
      return { company, tags };
    }),
  );
};
