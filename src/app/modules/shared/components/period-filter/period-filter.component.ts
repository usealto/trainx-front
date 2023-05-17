import { Component, EventEmitter, Output } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoreDuration } from 'src/app/modules/programs/models/score.model';

@Component({
  selector: 'alto-period-filter',
  templateUrl: './period-filter.component.html',
  styleUrls: ['./period-filter.component.scss'],
})
export class PeriodFilterComponent {
  I18ns = I18ns;
  @Output() selectChange = new EventEmitter<any>();
  data = [
    { value: ScoreDuration.Month, label: I18ns.shared.dateFilter.month },
    { value: ScoreDuration.Trimester, label: I18ns.shared.dateFilter.trimester },
    { value: ScoreDuration.Year, label: I18ns.shared.dateFilter.year },
  ];
  selectedItem?: any;
}
