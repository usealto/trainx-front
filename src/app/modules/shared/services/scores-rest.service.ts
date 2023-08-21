import { Injectable } from '@angular/core';
import {
  GetProgramRunsRequestParams,
  GetProgramsStatsRequestParams,
  GetQuestionsStatsRequestParams,
  GetScoresRequestParams,
  GetTeamsStatsRequestParams,
  GetUsersStatsRequestParams,
  ProgramRunApi,
  ProgramRunsApiService,
  QuestionStatsDtoApi,
  ScoreByTypeEnumApi,
  ScoreFillValuesEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  ScoresApiService,
  ScoresResponseDtoApi,
  StatsApiService,
  TeamStatsDtoApi,
  UserStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import { Observable, filter, map } from 'rxjs';
import { ChartFilters } from '../../shared/models/chart.model';
import { ScoreDuration, ScoreFilters } from '../models/score.model';
import { ScoresService } from './scores.service';
import { addDays } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class ScoresRestService {
  constructor(
    private readonly scoresApi: ScoresApiService,
    private readonly service: ScoresService,
    private readonly programsApi: ProgramRunsApiService,
    private readonly statsApi: StatsApiService,
  ) {}

  getUsersStats(
    duration: ScoreDuration,
    isProgression?: boolean,
    id?: string,
  ): Observable<UserStatsDtoApi[]> {
    let dateAfter: Date;
    let dateBefore: Date;

    if (isProgression) {
      const [start, end] = this.service.getPreviousPeriod(duration);

      dateAfter = start;
      dateBefore = end;
    } else {
      dateAfter = this.service.getStartDate(duration);
      dateBefore = new Date();
      dateBefore = addDays(dateBefore, 1); //! TEMPORARY FIX to get data from actual day
    }

    return this.statsApi
      .getUsersStats({
        from: dateAfter,
        to: dateBefore,
        respondsRegularlyThreshold: 0.42,
        userId: id,
      } as GetUsersStatsRequestParams)
      .pipe(map((r) => r.data || []));
  }

  getQuestionsStats(
    duration: ScoreDuration,
    isProgression?: boolean,
    id?: string,
  ): Observable<QuestionStatsDtoApi[]> {
    let dateAfter: Date;
    let dateBefore: Date;

    if (isProgression) {
      const [start, end] = this.service.getPreviousPeriod(duration);

      dateAfter = start;
      dateBefore = end;
    } else {
      dateAfter = this.service.getStartDate(duration);
      dateBefore = new Date();
      dateBefore = addDays(dateBefore, 1); //! TEMPORARY FIX to get data from actual day
    }

    return this.statsApi
      .getQuestionsStats({
        page: 1,
        itemsPerPage: 400,
        from: dateAfter,
        to: dateBefore,
        respondsRegularlyThreshold: 0.42,
        userId: id,
      } as GetQuestionsStatsRequestParams)
      .pipe(map((r) => r.data || []));
  }

  getTeamsStats(duration: ScoreDuration, isProgression = false): Observable<TeamStatsDtoApi[]> {
    let dateAfter: Date;
    let dateBefore: Date;

    if (isProgression) {
      const [start, end] = this.service.getPreviousPeriod(duration);

      dateAfter = start;
      dateBefore = end;
    } else {
      dateAfter = this.service.getStartDate(duration);
      dateBefore = new Date();
      dateBefore = addDays(dateBefore, 1); //! TEMPORARY FIX to get data from actual day
    }

    return this.statsApi
      .getTeamsStats({
        page: 1,
        itemsPerPage: 400,
        from: dateAfter,
        to: dateBefore,
      } as GetTeamsStatsRequestParams)
      .pipe(map((r) => r.data || []));
  }

  getProgramsStats(
    duration: ScoreDuration,
    isProgression = false,
    reqParams: GetProgramsStatsRequestParams = {},
  ) {
    let dateAfter: Date;
    let dateBefore: Date;

    if (isProgression) {
      const [start, end] = this.service.getPreviousPeriod(duration);

      dateAfter = start;
      dateBefore = end;
    } else {
      dateAfter = this.service.getStartDate(duration);
      dateBefore = new Date();
      dateBefore = addDays(dateBefore, 1); //! TEMPORARY FIX to get data from actual day
    }

    return this.statsApi
      .getProgramsStats({ ...reqParams, itemsPerPage: 400, from: dateAfter, to: dateBefore })
      .pipe(map((r) => r.data || []));
  }

  getTagsStats(duration: ScoreDuration, isProgression = false) {
    let dateAfter: Date;
    let dateBefore: Date;

    if (isProgression) {
      const [start, end] = this.service.getPreviousPeriod(duration);

      dateAfter = start;
      dateBefore = end;
    } else {
      dateAfter = this.service.getStartDate(duration);
      dateBefore = new Date();
      dateBefore = addDays(dateBefore, 1); //! TEMPORARY FIX to get data from actual day
    }

    return this.statsApi
      .getTagsStats({ itemsPerPage: 400, from: dateAfter, to: dateBefore })
      .pipe(map((r) => r.data || []));
  }

  getScores(
    { duration, type, team, timeframe, sortBy, user, ids }: ChartFilters,
    isProgression = false,
  ): Observable<ScoresResponseDtoApi> {
    const par: GetScoresRequestParams = {
      type: type ?? ScoreTypeEnumApi.Guess,
      timeframe: timeframe ?? ScoreTimeframeEnumApi.Day,
      dateAfter: this.service.getStartDate(duration as ScoreDuration),
      dateBefore: addDays(new Date(), 1), //! TEMPORARY FIX to get data from actual day
      fillValues: ScoreFillValuesEnumApi.Null,
      sortBy,
    };

    if (isProgression) {
      const [start, end] = this.service.getPreviousPeriod(duration);

      par.dateAfter = start;
      par.dateBefore = end;
    }

    if (team) {
      par.scoredBy = ScoreByTypeEnumApi.Team;
      par.scoredById = team;
    } else if (user) {
      par.scoredBy = ScoreByTypeEnumApi.User;
      par.scoredById = user;
    }
    if (ids) {
      par.ids = ids.join(',');
    }

    return this.scoresApi.getScores(par).pipe(
      map((r) => r.data || ({} as ScoresResponseDtoApi)),
      filter((x) => !!x),
    );
  }

  getCompletion(filt: ScoreFilters, isProgression: boolean): Observable<ProgramRunApi[]> {
    const par = {
      page: 1,
      itemPerPage: 300,
    } as GetProgramRunsRequestParams;

    if (filt.teams) {
      par.teamIds = filt.teams.join(',');
    }

    if (isProgression) {
      const [start, end] = this.service.getPreviousPeriod(filt.duration);

      par.createdAfter = start;
      par.createdBefore = end;
    } else {
      par.createdAfter = this.service.getStartDate(filt.duration as ScoreDuration);
      par.createdBefore = this.service.getYesterday();
    }

    return this.programsApi.getProgramRuns(par).pipe(map((r) => r.data || ({} as ProgramRunApi[])));
  }
}
