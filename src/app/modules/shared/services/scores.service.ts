import { Injectable } from '@angular/core';
import { ScoreDtoApi, ScoreTimeframeEnumApi } from '@usealto/sdk-ts-angular';
import { addDays, addHours, startOfDay } from 'date-fns';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { EScoreDuration, EScoreFilter, Score } from '../../../models/score.model';
import { TopFlopDisplay } from '../models/score.model';

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
  filterByScore<T extends { score?: number }>(data: T[], score: EScoreFilter, isDecimal: boolean): T[] {
    let scoreCap = 0;
    let isUnder = false;
    switch (score) {
      case EScoreFilter.Under25:
        isUnder = true;
        scoreCap = 25;
        break;
      case EScoreFilter.Under50:
        isUnder = true;
        scoreCap = 50;
        break;
      case EScoreFilter.Under75:
        isUnder = true;
        scoreCap = 75;
        break;
      case EScoreFilter.Over25:
        scoreCap = 25;
        break;
      case EScoreFilter.Over50:
        scoreCap = 50;
        break;
      case EScoreFilter.Over75:
        scoreCap = 75;
        break;
    }
    return data.filter((d) => {
      if (
        (score === EScoreFilter.Under25 ||
          score === EScoreFilter.Under50 ||
          score === EScoreFilter.Under75) &&
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
  getStartDate(duration: EScoreDuration): Date {
    let date = new Date();
    const gmtDataOffset = -date.getTimezoneOffset() / 60;

    switch (duration) {
      case EScoreDuration.Week:
        date = addDays(date, -7);
        break;
      case EScoreDuration.Month:
        date = addDays(date, -30);
        break;
      case EScoreDuration.Trimester:
        date = addDays(date, -90);
        break;
      case EScoreDuration.Year:
        date = addDays(date, -365);
        break;
      case EScoreDuration.All:
        date = new Date(2022, 0, 1);
        break;
    }
    date = addHours(date, gmtDataOffset + 1);
    return date;
  }

  getDefaultDuration(timeframe: ScoreTimeframeEnumApi): EScoreDuration {
    switch (timeframe) {
      case ScoreTimeframeEnumApi.Day:
        return EScoreDuration.Week;
      case ScoreTimeframeEnumApi.Week:
        return EScoreDuration.Month;
      case ScoreTimeframeEnumApi.Month:
        return EScoreDuration.Year;
      default:
        return EScoreDuration.Year;
    }
  }

  getDefaultTimeFrame(duration: EScoreDuration): ScoreTimeframeEnumApi {
    switch (duration) {
      case EScoreDuration.Week:
        return ScoreTimeframeEnumApi.Day;
      case EScoreDuration.Month:
        return ScoreTimeframeEnumApi.Week;
      case EScoreDuration.Year:
        return ScoreTimeframeEnumApi.Month;
      default:
        return ScoreTimeframeEnumApi.Week;
    }
  }

  reduceLineChartData(scores: ScoreDtoApi[]): ScoreDtoApi[] {
    if (scores.length === 0 || scores[0] === undefined) {
      return [];
    }

    let firstIndex = scores[0].dates.length;
    scores.forEach((s) => {
      s.counts.forEach((a, i) => {
        if (a && i < firstIndex) {
          firstIndex = i;
        }
      });
    });

    scores.forEach((s) => {
      s.averages = s.averages.slice(firstIndex, s.averages.length);
      s.counts = s.counts.slice(firstIndex, s.counts.length);
      s.dates = s.dates.slice(firstIndex, s.dates.length);
      s.valids = s.valids.slice(firstIndex, s.valids.length);
    });

    // Adds a zero instead of null before the first value
    for (let j = 0; j < scores.length; j++) {
      const s = scores[j];
      if (s.averages[0] !== null) {
        continue;
      }

      for (let k = 0; k < s.averages.length; k++) {
        const a = s.averages[k];
        if (a && !s.averages[k - 1]) {
          s.averages[k - 1] = 0;
          break;
        }
      }
    }

    return scores;
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
  durationToTimeFrame(duration: EScoreDuration): ScoreTimeframeEnumApi {
    switch (duration) {
      case EScoreDuration.Day:
        return ScoreTimeframeEnumApi.Day;
      case EScoreDuration.Week:
        return ScoreTimeframeEnumApi.Week;
      case EScoreDuration.Month:
        return ScoreTimeframeEnumApi.Month;
      case EScoreDuration.Year:
        return ScoreTimeframeEnumApi.Year;
      default:
        return ScoreTimeframeEnumApi.Week;
    }
  }

  getPreviousPeriod(duration: string | EScoreDuration | undefined): Date[] {
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
    return [date, this.getStartDate(duration as EScoreDuration)];
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
    if (scores.length === 0 || scores[0] === undefined) {
      return [];
    }

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
