import { formatPercent } from '@angular/common';
import { Component, Inject, Input, LOCALE_ID, OnChanges, SimpleChanges } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { EPlaceholderStatus } from '../placeholder-manager/placeholder-manager.component';

@Component({
  selector: 'alto-progression-badge',
  templateUrl: './progression-badge.component.html',
  styleUrls: ['./progression-badge.component.scss'],
})
export class ProgressionBadgeComponent implements OnChanges {
  I18ns = I18ns;
  @Input() score?: number | null;
  @Input() arrow = true;

  status: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  constructor(@Inject(LOCALE_ID) private readonly locale: string) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['score'] && this.score !== undefined) {
      this.status = EPlaceholderStatus.GOOD;
    }
  }
  @memoize()
  scoreDisplay(score: number | null | undefined) {
    return score !== null && score !== undefined
      ? score > 9.99
        ? '>999%'
        : formatPercent(Math.abs(score), this.locale)
      : score;
  }
}
