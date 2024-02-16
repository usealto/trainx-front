import { ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';

// export interface ScoreFilters {
//   teams?: string[];
//   duration?: ScoreDuration | string;
//   type?: ScoreTypeEnumApi;
//   timeframe?: ScoreTimeframeEnumApi;
//   sortBy?: string;
// }

// export enum EScoreDuration {
//   Day = 'day',
//   Week = 'week',
//   Month = 'month',
//   Trimester = 'trimester',
//   Year = 'year',
//   All = 'all',
// }

// export enum EScoreFilter {
//   Under25 = '< 25%',
//   Under50 = '< 50%',
//   Under75 = '< 75%',
//   Over25 = '> 25%',
//   Over50 = '> 50%',
//   Over75 = '> 75%',
// }

export interface TopFlop {
  top: TopFlopDisplay[];
  flop: TopFlopDisplay[];
}

export interface TopFlopDisplay {
  label: string;
  avg: number;
}
