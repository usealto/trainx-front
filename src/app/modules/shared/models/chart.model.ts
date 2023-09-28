import { ScoreByTypeEnumApi, ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import { ScoreDuration } from './score.model';

export interface ChartFilters {
  team?: string;
  user?: string;
  duration?: ScoreDuration | string;
  type?: ScoreTypeEnumApi;
  timeframe?: ScoreTimeframeEnumApi;
  // limit?: number;
  sortBy?: string;
  ids?: string[];
  tags?: string[];
  scoredBy?: ScoreByTypeEnumApi;
  scoredById?: string;
}
