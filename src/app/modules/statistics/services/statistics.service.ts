import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { format, parseISO, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { EScoreDuration, Score } from 'src/app/models/score.model';
import { ScoresService } from '../../shared/services/scores.service';

export interface Point {
  x: Date;
  y: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  constructor(@Inject(LOCALE_ID) public locale: string, private readonly scoresService: ScoresService) {}

  formatLabel(dates: Date[], duration: EScoreDuration): string[] {
    switch (duration) {
      case EScoreDuration.Year:
        return dates.map((date) => date.toLocaleDateString(this.locale, { month: 'short' }));
      default:
        return dates.map((date) =>
          date.toLocaleDateString(this.locale, { month: '2-digit', day: '2-digit' }),
        );
    }
  }

  aggregateDataForScores(score: Score | undefined, duration: EScoreDuration): Point[] {
    const data: Point[] = [];
    const groupedData: { [key: string]: (number | null)[] } = {};
    if (score == undefined) {
      return [];
    }
    score.dates.forEach((date, index) => {
      const dateKey = format(
        duration === EScoreDuration.Year
          ? startOfMonth(date)
          : duration === EScoreDuration.Trimester
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

  transformDataToPoint(score: Score) {
    const res: Point[] = [];
    score?.dates.forEach((date, index) => {
      res.push({ x: date, y: score.averages[index] });
    });
    return res;
  }

  transformDataToPointByCounts(score: Score) {
    const res: Point[] = [];
    score?.dates.forEach((date, index) => {
      res.push({ x: date, y: score.counts[index] });
    });
    return res;
  }
}
