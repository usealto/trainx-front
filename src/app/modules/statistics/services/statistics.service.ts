import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { ScoreDuration } from '../../programs/models/score.model';
import { startOfDay, startOfMonth, startOfWeek, format, parseISO } from 'date-fns';
import { ScoreDtoApi } from 'src/app/sdk';
import { ScoresService } from '../../programs/services/scores.service';
export interface Point {
  x: Date;
  y: number;
}
@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  constructor(@Inject(LOCALE_ID) public locale: string, private readonly scoresService: ScoresService) {}

  formatLabel(dates: Date[], duration: ScoreDuration): string[] {
    switch (duration) {
      case ScoreDuration.Year:
        return dates.map((date) => date.toLocaleDateString(this.locale, { month: 'long' }));
      default:
        return dates.map((date) => date.toLocaleDateString());
    }
  }

  aggregateDataForScores(score: ScoreDtoApi, duration: ScoreDuration) {
    const data: Point[] = [];
    const groupedData: { [key: string]: number[] } = {};

    score.dates.forEach((date, index) => {
      const dateKey = format(
        duration === ScoreDuration.Year
          ? startOfMonth(date)
          : duration === ScoreDuration.Trimester
          ? startOfWeek(date)
          : startOfDay(date),
        "yyyy-MM-dd'T'HH:mm:ss'Z'",
      );
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = [];
      }
      groupedData[dateKey].push(score.averages[index]);
    });

    for (const dateKey in groupedData) {
      const avg = this.scoresService.reduceWithoutNull(groupedData[dateKey]);
      data.push({ x: parseISO(dateKey), y: avg });
    }
    return data.sort((a, b) => a.x.getTime() - b.x.getTime());
  }
}
