import { ScoreTimeframe } from './scores.model';

export interface AverageCompletionRequestDto {
  timeframe: ScoreTimeframe;
  ids?: string[];
  sortBy?: string[];
  isFinished?: boolean;
  isValid?: boolean;
}
