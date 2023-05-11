import { Component, EventEmitter, Output } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoreDuration } from 'src/app/modules/programs/models/score.model';

@Component({
  selector: 'alto-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
})
export class TimePickerComponent {
  I18ns = I18ns;
  duration: ScoreDuration = ScoreDuration.Year;
  @Output() durationSelected = new EventEmitter<string>();

  updateTimePicker(event: any) {
    this.duration = event.target.id;
    this.durationSelected.emit(this.duration);
  }
}
