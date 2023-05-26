import { Injectable } from '@angular/core';
import { addDays, addHours, startOfDay } from 'date-fns';
import { ScoreTimeframeEnumApi } from '@usealto/sdk-ts-angular';
import { ScoreDuration, ScoreFilter } from '../models/score.model';
import { memoize } from 'src/app/core/utils/memoize/memoize';

@Injectable({
  providedIn: 'root',
})
export class ScoresService {
  reduceWithoutNull(data: number[]): number | null {
    if (data.length === 0) return null;

    const output = data.filter((x) => !!x);
    if (output.length === 0) return null;

    return output.reduce((prev, curr) => prev + curr, 0) / output.length;
  }

  /**
   * @param isDecimal Indications for the score format : true => 0.86 ; false => 86
   */
  filterByScore<T extends { score?: number }>(data: T[], score: ScoreFilter, isDecimal: boolean): T[] {
    let scoreCap = 0;
    let isUnder = false;
    switch (score) {
      case ScoreFilter.Under25:
        isUnder = true;
        scoreCap = 25;
        break;
      case ScoreFilter.Under50:
        isUnder = true;
        scoreCap = 50;
        break;
      case ScoreFilter.Under75:
        isUnder = true;
        scoreCap = 75;
        break;
      case ScoreFilter.Over25:
        scoreCap = 25;
        break;
      case ScoreFilter.Over50:
        scoreCap = 50;
        break;
      case ScoreFilter.Over75:
        scoreCap = 75;
        break;
    }
    return data.filter((d) => {
      if (!d.score) return false;
      const sc = isDecimal ? d.score * 100 : d.score;
      return isUnder ? sc < scoreCap : sc > scoreCap;
    });
  }

  getYesterday() {
    const date = new Date();
    const gmtDataOffset = -date.getTimezoneOffset() / 60;
    return addHours(startOfDay(date), gmtDataOffset);
  }

  @memoize()
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
      case ScoreDuration.Trimester:
        date = addDays(date, -90);
        break;
      case ScoreDuration.Year:
        date = addDays(date, -365);
        break;
    }
    date = addHours(date, gmtDataOffset + 1);
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

  /**
   * ! DEPRECATED
   * @deprecated The method should not be used
   */
  durationToTimeFrame(duration: ScoreDuration): ScoreTimeframeEnumApi {
    switch (duration) {
      case ScoreDuration.Day:
        return ScoreTimeframeEnumApi.Day;
      case ScoreDuration.Week:
        return ScoreTimeframeEnumApi.Week;
      case ScoreDuration.Month:
        return ScoreTimeframeEnumApi.Month;
      case ScoreDuration.Year:
        return ScoreTimeframeEnumApi.Year;
      default:
        return ScoreTimeframeEnumApi.Week;
    }
  }
}
