import { Injectable } from '@angular/core';
import { addDays } from 'date-fns';
import { Observable, filter, map } from 'rxjs';
import {
  GetProgramRunsRequestParams,
  GetScoresRequestParams,
  GetTeamsStatsRequestParams,
  ProgramRunApi,
  ProgramRunsApiService,
  ScoreByTypeEnumApi,
  ScoreFillValuesEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  ScoresApiService,
  ScoresResponseDtoApi,
  StatsApiService,
  TeamStatsDtoApi,
} from 'src/app/sdk';
import { ChartFilters } from '../../shared/models/chart.model';
import { ScoreDuration, ScoreFilters } from '../models/score.model';
import { ScoresService } from './scores.service';

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

  getTeamsStats(duration: ScoreDuration): Observable<TeamStatsDtoApi[]> {
    return this.statsApi
      .getTeamsStats({
        from: this.service.getStartDate(duration),
        to: new Date(),
      } as GetTeamsStatsRequestParams)
      .pipe(map((r) => r.data || []));
  }

  getScores({
    duration,
    type,
    team,
    timeframe,
    sortBy,
    user,
    ids,
  }: ChartFilters): Observable<ScoresResponseDtoApi> {
    const par: GetScoresRequestParams = {
      type: type ?? ScoreTypeEnumApi.Guess,
      timeframe: timeframe ?? ScoreTimeframeEnumApi.Day,
      dateAfter: this.service.getStartDate(duration as ScoreDuration),
      dateBefore: new Date(),
      fillValues: ScoreFillValuesEnumApi.Null,
      sortBy,
    };

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

  getGeneralScores(req: GetScoresRequestParams): Observable<ScoresResponseDtoApi> {
    const par = {
      ...req,
      type: req?.type ?? ScoreTypeEnumApi.Guess,
      timeframe: req?.timeframe ?? ScoreTimeframeEnumApi.Week,
      dateBefore: new Date(),
    };
    par.dateAfter = this.service.getStartDate(this.service.getDefaultDuration(par.timeframe));

    return this.scoresApi.getScores(par).pipe(
      map((r) => r.data || ({} as ScoresResponseDtoApi)),
      filter((x) => !!x),
    );
  }

  getProgramScore(req: GetScoresRequestParams): Observable<ScoresResponseDtoApi> {
    const par = {
      ...req,
      type: ScoreTypeEnumApi.Program,
      timeframe: req?.timeframe ?? ScoreTimeframeEnumApi.Day,
      dateBefore: new Date(),
    };
    par.dateAfter = this.service.getStartDate(this.service.getDefaultDuration(par.timeframe));

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

    if (filt.team) {
      par.teamIds = filt.team;
    }

    if (isProgression) {
      let date = new Date();
      switch (filt.duration) {
        case 'week':
          date = addDays(date, -14);
          break;
        case 'month':
          date = addDays(date, -60);
          break;
        case 'trimester':
          date = addDays(date, -180);
          break;
        case 'year':
          date = addDays(date, -730);
          break;
      }
      par.createdAfter = date;
      par.createdBefore = this.service.getStartDate(filt.duration as ScoreDuration);
    } else {
      par.createdAfter = this.service.getStartDate(filt.duration as ScoreDuration);
      par.createdBefore = this.service.getYesterday();
    }

    return this.programsApi.getProgramRuns(par).pipe(map((r) => r.data || ({} as ProgramRunApi[])));
  }
}
