import { Component, Input } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-progression-badge',
  templateUrl: './progression-badge.component.html',
  styleUrls: ['./progression-badge.component.scss'],
})
export class ProgressionBadgeComponent {
  I18ns = I18ns;
  @Input() score?: number | null;
  @Input() arrow = true;
}
