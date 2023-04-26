import { Injectable } from '@angular/core';
import { addDays, addHours, startOfDay } from 'date-fns';
import { Observable, filter, map } from 'rxjs';
import {
  GetProgramRunsRequestParams,
  GetScoresRequestParams,
  ProgramRunApi,
  ProgramRunsApiService,
  ScoreFillValuesEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  ScoresApiService,
  ScoresResponseDtoApi,
} from 'src/app/sdk';
import { ScoreDuration } from '../models/score.model';

@Injectable({
  providedIn: 'root',
})
export class ScoresRestService {
  constructor(
    private readonly scoresApi: ScoresApiService,
    private readonly programsApi: ProgramRunsApiService,
  ) {}

  getScores(
    duration: ScoreDuration,
    type: ScoreTypeEnumApi,
    timeframe?: ScoreTimeframeEnumApi,
  ): Observable<ScoresResponseDtoApi> {
    const par: GetScoresRequestParams = {
      type: type ?? ScoreTypeEnumApi.Guess,
      timeframe: timeframe ?? this.getDefaultTimeFrame(duration),
      dateAfter: this.getStartDate(duration),
      dateBefore: new Date(),
      fillValues: ScoreFillValuesEnumApi.Null,
    };

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
    par.dateAfter = this.getStartDate(this.getDefaultDuration(par.timeframe));

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
    par.dateAfter = this.getStartDate(this.getDefaultDuration(par.timeframe));

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
    par.dateAfter = this.getStartDate(this.getDefaultDuration(par.timeframe));

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
      createdBefore: this.getYesterday(),
    };
    par.createdAfter = this.getStartDate(this.getDefaultDuration(timeframe));

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
    par.createdBefore = this.getStartDate(this.getDefaultDuration(timeframe));

    return this.programsApi.getProgramRuns(par).pipe(map((r) => r.data || ({} as ProgramRunApi[])));
  }

  getYesterday() {
    const date = new Date();
    const gmtDataOffset = -date.getTimezoneOffset() / 60;
    return addHours(startOfDay(date), gmtDataOffset);
  }

  getStartDate(duration: ScoreDuration): Date {
    let date = new Date();
    const gmtDataOffset = -date.getTimezoneOffset() / 60;

    switch (duration) {
      case ScoreDuration.Week:
        date = addDays(date, -7);
        break;
      case ScoreDuration.Month:
        date = addDays(date, -30);
        break;
      case ScoreDuration.Year:
        date = addDays(date, -365);
        break;
    }
    date = addHours(date, gmtDataOffset);
    return date;
  }

  getDefaultDuration(timeframe: ScoreTimeframeEnumApi): ScoreDuration {
    switch (timeframe) {
      case ScoreTimeframeEnumApi.Day:
        return ScoreDuration.Week;
      case ScoreTimeframeEnumApi.Week:
        return ScoreDuration.Month;
      case ScoreTimeframeEnumApi.Month:
        return ScoreDuration.Year;
      default:
        return ScoreDuration.Year;
    }
  }

  getDefaultTimeFrame(duration: ScoreDuration): ScoreTimeframeEnumApi {
    switch (duration) {
      case ScoreDuration.Week:
        return ScoreTimeframeEnumApi.Day;
      case ScoreDuration.Month:
        return ScoreTimeframeEnumApi.Week;
      case ScoreDuration.Year:
        return ScoreTimeframeEnumApi.Month;
      default:
        return ScoreTimeframeEnumApi.Week;
    }
  }
}
