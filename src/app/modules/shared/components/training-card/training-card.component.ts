import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { UserDtoApi } from '@usealto/sdk-ts-angular';
import { intervalToDuration } from 'date-fns';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TrainingCardData } from 'src/app/modules/training/models/training.model';
import { AltoRoutes } from '../../constants/routes';

@Component({
  selector: 'alto-training-card',
  templateUrl: './training-card.component.html',
  styleUrls: ['./training-card.component.scss'],
})
export class TrainingCardComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  @Input() data?: TrainingCardData;
  score?: number;
  /**
   * In Seconds
   */
  duration?: number = 0;
  title?: string;
  isProgress = true;
  users: UserDtoApi[] = [];

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.duration = this.data?.duration;
    this.title = this.data?.title;
    this.isProgress = this.data?.isProgress ?? true;
    this.users = this.data?.users ?? [];

    // For display reasons, we keep only integers
    if (this.data?.score) {
      this.score = Math.round(this.data?.score);
    }
    this.elementRef.nativeElement.style.setProperty('--progress-value-dynamic', this.score);
  }

  @memoize()
  getScoreClass(score: number | undefined): string {
    if (score === undefined) {
      return 'no-score';
    }
    if (score > 65) {
      return 'score-good';
    } else if (score > 30) {
      return 'score-warning';
    } else {
      return 'score-bad';
    }
  }

  @memoize()
  getFormatedDuration(num: number): string {
    const { minutes, seconds } = intervalToDuration({ start: 0, end: num * 1000 });

    const m = minutes && minutes > 0 ? `${minutes} ${I18ns.shared.minutes} ` : '';
    const s = seconds && seconds > 0 ? `${seconds} ${I18ns.shared.seconds} ` : '';
    return m + s;
  }
}
