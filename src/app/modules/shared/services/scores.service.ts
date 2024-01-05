import { Injectable } from '@angular/core';
import { ScoreTimeframeEnumApi } from '@usealto/sdk-ts-angular';
import { addDays, addHours, startOfDay } from 'date-fns';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { Score } from '../../../models/score.model';
import { ScoreDuration, ScoreFilter, TopFlopDisplay } from '../models/score.model';

@Injectable({
  providedIn: 'root',
})
export class ScoresService {
  reduceWithoutNull(data: (number | null)[] = []): number | null {
    if (data.length === 0) return null;

    const output = data.filter((x) => x !== null && x !== undefined) as number[];
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
      if (
        (score === ScoreFilter.Under25 || score === ScoreFilter.Under50 || score === ScoreFilter.Under75) &&
        d.score === 0
      )
        return true;

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
      case ScoreDuration.All:
        date = new Date(2022, 0, 1);
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

  getTop(data: TopFlopDisplay[]) {
    return data.filter(({ avg }) => !!avg && avg >= 0.5).sort((a, b) => (a.avg < b.avg ? 1 : -1));
  }

  getFlop(data: TopFlopDisplay[]) {
    return data.filter(({ avg }) => !!avg && avg < 0.5).sort((a, b) => (a.avg > b.avg ? 1 : -1));
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

  getPreviousPeriod(duration: string | ScoreDuration | undefined): Date[] {
    let date = new Date();
    date = addDays(date, 1); //! TEMPORARY FIX to get data from actual day
    switch (duration) {
      case 'week':
        date = addDays(date, -14);
        break;
      case 'month':
        date = addDays(date, -60);
        break;
      case 'trimester':
        date = addDays(date, -180);
        break;
      case 'year':
        date = addDays(date, -730);
        break;
      default:
        date = addDays(date, -60);
        break;
    }
    return [date, this.getStartDate(duration as ScoreDuration)];
  }

  /**
   * Calculate progression between NUMBERS not PERCENTAGES
   */
  getProgression(value?: number, previousValue?: number) {
    if (!value || !previousValue) {
      return null;
    }
    return (value - previousValue) / previousValue;
  }

  private filterTimeSeries(scores: Score): Score {
    const firstIndex = scores.counts.findIndex((c) => c !== null);

    if (firstIndex !== 0) {
      scores.dates = scores.dates.slice(firstIndex - 1);
      scores.averages = scores.averages.slice(firstIndex);
      scores.counts = scores.counts.slice(firstIndex);
      scores.valids = scores.valids.slice(firstIndex);
      scores.averages.unshift(0);
      scores.counts.unshift(0);
      scores.valids.unshift(0);
    }
    return scores;
  }

  formatScores(scores: Score[]): Score[] {
    const filteredScores = scores.map((ts) => this.filterTimeSeries(ts));

    const longestDates = filteredScores.reduce((dates, score) => {
      if (score.dates.length > dates.length) {
        return score.dates;
      }
      return dates;
    }, scores[0].dates);

    filteredScores.forEach((score) => {
      if (score.dates.length < longestDates.length) {
        score.dates = [...longestDates];
        while (score.averages.length !== score.dates.length) {
          score.averages.unshift(null);
          score.counts.unshift(null);
          score.valids.unshift(null);
        }
      }
    });

    return filteredScores;
  }
}
