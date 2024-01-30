import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { EScoreDuration } from '../../../../models/score.model';

export type TimePickerOption = EScoreDuration.Year | EScoreDuration.Trimester | EScoreDuration.Month;

@Component({
  selector: 'alto-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
})
export class TimePickerComponent {
  I18ns = I18ns;
  ScoreDuration = EScoreDuration;
  @Input() durationControl: FormControl<EScoreDuration> = new FormControl<EScoreDuration>(
    EScoreDuration.Year,
    {
      nonNullable: true,
    },
  );

  changeDuration(duration: EScoreDuration): void {
    this.durationControl.patchValue(duration);
  }
}
