import { Component } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';

@Component({
  selector: 'alto-statistics-global-performance',
  templateUrl: './statistics-global-performance.component.html',
  styleUrls: ['./statistics-global-performance.component.scss'],
})
export class StatisticsGlobalPerformanceComponent {
  I18ns = I18ns;
  duration: ScoreDuration = ScoreDuration.Month;

  updateTimePicker(event: any): void {
    this.duration = event;
  }
}
