import { Injectable } from '@angular/core';
import { addHours, startOfDay, addDays, add } from 'date-fns';
import { ScoreTimeframeEnumApi } from 'src/app/sdk';
import { ScoreDuration } from '../models/score.model';

@Injectable({
  providedIn: 'root',
})
export class ScoresService {
  getYesterday() {
    const date = new Date();
    const gmtDataOffset = -date.getTimezoneOffset() / 60;
    return addHours(startOfDay(date), gmtDataOffset);
  }

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
