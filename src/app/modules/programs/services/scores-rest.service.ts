import { Injectable } from '@angular/core';
import { addDays, addHours, startOfDay } from 'date-fns';
import { Observable, filter, map } from 'rxjs';
import {
  GetProgramRunsRequestParams,
  GetScoresRequestParams,
  ProgramRunApi,
  ProgramRunsApiService,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  ScoresApiService,
  ScoresResponseDtoApi,
} from 'src/app/sdk';

@Injectable({
  providedIn: 'root',
})
export class ScoresRestService {
  constructor(
    private readonly scoresApi: ScoresApiService,
    private readonly programsApi: ProgramRunsApiService,
  ) {}

  getYesterday() {
    const date = new Date();
    const gmtDataOffset = -date.getTimezoneOffset() / 60;
    return addHours(startOfDay(date), gmtDataOffset);
  }

  getStartDate(timeframe: ScoreTimeframeEnumApi): Date {
    let date = new Date();
    const gmtDataOffset = -date.getTimezoneOffset() / 60;

    switch (timeframe) {
      case ScoreTimeframeEnumApi.Week:
        date = addDays(date, -7);
        break;
      case ScoreTimeframeEnumApi.Month:
        date = addDays(date, -30);
        break;
      case ScoreTimeframeEnumApi.Year:
        date = addDays(date, -365);
        break;
    }
    date = addHours(date, gmtDataOffset);
    return date;
  }

  getGeneralScores(req: GetScoresRequestParams): Observable<ScoresResponseDtoApi> {
    const par = {
      ...req,
      type: req?.type ?? ScoreTypeEnumApi.Guess,
      timeframe: req?.timeframe ?? ScoreTimeframeEnumApi.Week,
      dateAfter: this.getStartDate(req?.timeframe ?? ScoreTimeframeEnumApi.Week).toISOString(),
      dateBefore: new Date().toISOString(),
    };

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
      dateAfter: this.getStartDate(req?.timeframe ?? ScoreTimeframeEnumApi.Week).toISOString(),
      dateBefore: new Date().toISOString(),
    };

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
      dateAfter: this.getStartDate(ScoreTimeframeEnumApi.Year).toISOString(),
      dateBefore: new Date().toISOString(),
    };

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
      createdAfter: this.getStartDate(timeframe).toISOString(),
      createdBefore: this.getYesterday().toISOString(),
    };

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
      createdAfter: date.toISOString(),
      createdBefore: this.getStartDate(timeframe).toISOString(),
    } as GetProgramRunsRequestParams;

    return this.programsApi.getProgramRuns(par).pipe(map((r) => r.data || ({} as ProgramRunApi[])));
  }
}
