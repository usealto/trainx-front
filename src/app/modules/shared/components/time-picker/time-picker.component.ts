import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';

@Component({
  selector: 'alto-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
})
export class TimePickerComponent implements OnInit, OnChanges {
  I18ns = I18ns;
  @Input() duration: ScoreDuration = ScoreDuration.Month;
  @Output() durationSelected = new EventEmitter<string>();
  ID = '';

  ngOnInit(): void {
    this.ID = 'timePicker' + Math.round(Math.random() * 1000);
  }

  ngOnChanges(simpleChanges: SimpleChanges): void {
    if (simpleChanges['duration']) {
      console.log(this.ID);
    }
  }

  updateTimePicker(event: any) {
    this.duration = event.target.value;
    this.durationSelected.emit(this.duration);
  }
}
