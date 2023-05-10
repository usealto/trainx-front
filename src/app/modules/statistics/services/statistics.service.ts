import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { ScoreDuration } from '../../programs/models/score.model';
import { format } from 'date-fns';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  constructor(@Inject(LOCALE_ID) public locale: string) {}

  formatLabel(dates: Date[], duration: ScoreDuration): string[] {
    switch (duration) {
      case ScoreDuration.Year:
        return dates.map((date) => date.toLocaleDateString(this.locale, { month: 'long' }));
      default:
        return dates.map((date) => date.toLocaleDateString());
    }
  }
}
