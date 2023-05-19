import { ScoreTimeframeEnumApi, ScoreTypeEnumApi } from 'src/app/sdk';

export interface ScoreFilters {
  team?: string;
  duration?: ScoreDuration | string;
  type?: ScoreTypeEnumApi;
  timeframe?: ScoreTimeframeEnumApi;
  // limit?: number;
  sortBy?: string;
}

export enum ScoreDuration {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Trimester = 'trimester',
  Year = 'year',
}
