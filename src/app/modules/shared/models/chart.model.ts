import { ScoreTimeframeEnumApi, ScoreTypeEnumApi } from 'src/app/sdk';
import { ScoreDuration } from '../../programs/models/score.model';

export interface ChartFilters {
  team?: string;
  user?: string;
  duration?: ScoreDuration | string;
  type?: ScoreTypeEnumApi;
  timeframe?: ScoreTimeframeEnumApi;
  // limit?: number;
  sortBy?: string;
  ids?: string[];
}
