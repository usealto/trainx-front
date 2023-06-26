import { Component, EventEmitter, Output } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoreFilter } from '../../models/score.model';

@Component({
  selector: 'alto-progression-filter',
  templateUrl: './progression-filter.component.html',
  styleUrls: ['./progression-filter.component.css'],
})
export class ProgressionFilterComponent {
  I18ns = I18ns;
  scoreFilters = Object.values(ScoreFilter).map((c) => ({ name: c }));

  @Output() selectChange = new EventEmitter<string>();
}
