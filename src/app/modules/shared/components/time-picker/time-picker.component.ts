import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';

export type TimePickerOption = ScoreDuration.Year | ScoreDuration.Trimester | ScoreDuration.Month;

@Component({
  selector: 'alto-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
})
export class TimePickerComponent {
  I18ns = I18ns;
  ScoreDuration = ScoreDuration;
  @Input() durationControl: FormControl<ScoreDuration> = new FormControl<ScoreDuration>(ScoreDuration.Year, {
    nonNullable: true,
  });
}
