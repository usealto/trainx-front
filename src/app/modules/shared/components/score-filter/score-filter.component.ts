import { Component, EventEmitter, Input, Output } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoreFilter } from '../../models/score.model';

@Component({
  selector: 'alto-score-filter',
  templateUrl: './score-filter.component.html',
  styleUrls: ['./score-filter.component.scss'],
})
export class ScoreFilterComponent {
  I18ns = I18ns;
  scoreFilters = Object.values(ScoreFilter).map((c) => ({ name: c }));

  @Input() selectedItems: any[] = [];
  @Input() disabled: boolean | any;

  @Output() selectChange = new EventEmitter<string>();
}
