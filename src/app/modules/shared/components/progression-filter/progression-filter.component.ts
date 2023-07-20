import { Component, EventEmitter, Input, Output } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoreFilter } from '../../models/score.model';

@Component({
  selector: 'alto-progression-filter',
  templateUrl: './progression-filter.component.html',
  styleUrls: ['./progression-filter.component.scss'],
})
export class ProgressionFilterComponent {
  I18ns = I18ns;

  progressionFilters = Object.values(ScoreFilter).map((c) => ({ name: c }));

  @Input() selectedItems: any[] = [];
  @Output() selectChange = new EventEmitter<string>();
}
