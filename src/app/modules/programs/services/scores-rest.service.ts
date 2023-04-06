import { Injectable } from '@angular/core';
import { addDays, addHours, startOfDay } from 'date-fns';
import { filter, map, Observable, tap } from 'rxjs';
import {
  GetProgramRunsRequestParams,
  GetScoresRequestParams,
  ProgramRunApi,
  ProgramRunsApiService,
  ScoresApiService,
  ScoresResponseDtoApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
} from 'src/app/sdk';
import { ScoreTimeframe } from '../models/scores.model';

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

  getStartDate(timeframe: ScoreTimeframe): Date {
    let date = new Date();
    const gmtDataOffset = -date.getTimezoneOffset() / 60;

    switch (timeframe) {
      case 'week':
        date = addDays(date, -7);
        break;
      case 'month':
        date = addDays(date, -30);
        break;
      case 'year':
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
      timeframe: req?.timeframe ?? 'week',
      dateAfter: this.getStartDate(req?.timeframe ?? 'week').toISOString(),
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
      timeframe: req?.timeframe ?? 'week',
      dateAfter: this.getStartDate(req?.timeframe ?? 'week').toISOString(),
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
      timeframe: req?.timeframe ?? 'year',
      dateAfter: this.getStartDate('year').toISOString(),
      dateBefore: new Date().toISOString(),
    };

    return this.scoresApi.getScores(par).pipe(
      map((r) => r.data || ({} as ScoresResponseDtoApi)),
      filter((x) => !!x),
    );
  }

  getAverageCompletion(
    timeframe: ScoreTimeframe,
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
    timeframe: ScoreTimeframe,
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
