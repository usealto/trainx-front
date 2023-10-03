import { formatPercent } from '@angular/common';
import { Component, Inject, Input, LOCALE_ID } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';

@Component({
  selector: 'alto-progression-badge',
  templateUrl: './progression-badge.component.html',
  styleUrls: ['./progression-badge.component.scss'],
})
export class ProgressionBadgeComponent {
  I18ns = I18ns;
  @Input() score?: number | null;
  @Input() arrow = true;

  constructor(@Inject(LOCALE_ID) private readonly locale: string) {}

  @memoize()
  scoreDisplay(score: number | null | undefined) {
    return score ? (score > 9.99 ? '>999%' : formatPercent(Math.abs(score), this.locale)) : score;
  }
}
