import { ScoreByTypeEnumApi, ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import { EScoreDuration } from '../../../models/score.model';

export interface ChartFilters {
  team?: string;
  user?: string;
  duration?: EScoreDuration | string;
  type?: ScoreTypeEnumApi;
  timeframe?: ScoreTimeframeEnumApi;
  // limit?: number;
  sortBy?: string;
  ids?: string[];
  tags?: string[];
  scoredBy?: ScoreByTypeEnumApi;
  scoredById?: string;
}
