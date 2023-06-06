import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TrainingCardData } from 'src/app/modules/training/models/training.model';

@Component({
  selector: 'alto-training-card',
  templateUrl: './training-card.component.html',
  styleUrls: ['./training-card.component.scss'],
})
export class TrainingCardComponent implements OnInit {
  @Input() data?: TrainingCardData;
  score?: number;
  duration?: number = 5;
  title?: string;
  isProgress = true;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.score = this.data?.score;
    this.duration = this.data?.duration;
    this.title = this.data?.title;
    this.isProgress = this.data?.isProgress ?? true;

    // For display reasons, we keep only integers
    if (!this.isProgress && this.score) {
      this.score = Math.round(this.score);
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
}
