import { Injectable } from '@angular/core';
import { addDays } from 'date-fns';
import { Observable, filter, map } from 'rxjs';
import {
  GetProgramRunsRequestParams,
  GetScoresRequestParams,
  ProgramRunApi,
  ProgramRunsApiService,
  ScoreByTypeEnumApi,
  ScoreFillValuesEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  ScoresApiService,
  ScoresResponseDtoApi,
} from 'src/app/sdk';
import { ChartFilters } from '../../shared/models/chart.model';
import { ScoreDuration } from '../models/score.model';
import { ScoresService } from './scores.service';

@Injectable({
  providedIn: 'root',
})
export class ScoresRestService {
  constructor(
    private readonly scoresApi: ScoresApiService,
    private readonly service: ScoresService,
    private readonly programsApi: ProgramRunsApiService,
  ) {}

  getScores({ duration, type, team, timeframe, sortBy }: ChartFilters): Observable<ScoresResponseDtoApi> {
    const par: GetScoresRequestParams = {
      type: type ?? ScoreTypeEnumApi.Guess,
      timeframe: timeframe ?? this.service.getDefaultTimeFrame(duration as ScoreDuration),
      dateAfter: this.service.getStartDate(duration as ScoreDuration),
      dateBefore: new Date(),
      fillValues: ScoreFillValuesEnumApi.Null,
      sortBy,
    };

    if (team) {
      par.scoredBy = ScoreByTypeEnumApi.Team;
      par.scoredById = team;
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
      timeframe: req?.timeframe ?? ScoreTimeframeEnumApi.Week,
      dateBefore: new Date(),
    };
    par.dateAfter = this.service.getStartDate(this.service.getDefaultDuration(par.timeframe));

    return this.scoresApi.getScores(par).pipe(
      map((r) => r.data || ({} as ScoresResponseDtoApi)),
      filter((x) => !!x),
    );
  }

  getQuestionScore(req: GetScoresRequestParams): Observable<ScoresResponseDtoApi> {
    const par = {
      ...req,
      type: ScoreTypeEnumApi.Question,
      timeframe: req?.timeframe ?? ScoreTimeframeEnumApi.Year,
      dateBefore: new Date(),
    };
    par.dateAfter = this.service.getStartDate(this.service.getDefaultDuration(par.timeframe));

    return this.scoresApi.getScores(par).pipe(
      map((r) => r.data || ({} as ScoresResponseDtoApi)),
      filter((x) => !!x),
    );
  }

  getAverageCompletion(
    timeframe: ScoreTimeframeEnumApi,
    req?: GetProgramRunsRequestParams,
  ): Observable<ProgramRunApi[]> {
    const par = {
      ...req,
      page: 1,
      itemPerPage: 300,
      createdBefore: this.service.getYesterday(),
    };
    par.createdAfter = this.service.getStartDate(this.service.getDefaultDuration(timeframe));

    return this.programsApi.getProgramRuns(par).pipe(map((r) => r.data || ({} as ProgramRunApi[])));
  }

  getCompletionProgression(
    timeframe: ScoreTimeframeEnumApi,
    req?: GetProgramRunsRequestParams,
  ): Observable<ProgramRunApi[]> {
    let date = new Date();
    switch (timeframe) {
      case 'week':
        date = addDays(date, -14);
        break;
      case 'month':
        date = addDays(date, -60);
        break;
      case 'year':
        date = addDays(date, -730);
        break;
    }

    const par = {
      ...req,
      page: 1,
      itemPerPage: 300,
      createdAfter: date,
    } as GetProgramRunsRequestParams;
    par.createdBefore = this.service.getStartDate(this.service.getDefaultDuration(timeframe));

    return this.programsApi.getProgramRuns(par).pipe(map((r) => r.data || ({} as ProgramRunApi[])));
  }
}
