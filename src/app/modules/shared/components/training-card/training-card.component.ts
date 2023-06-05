import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { memoize } from 'src/app/core/utils/memoize/memoize';

@Component({
  selector: 'alto-training-card',
  templateUrl: './training-card.component.html',
  styleUrls: ['./training-card.component.scss'],
})
export class TrainingCardComponent implements OnInit {
  @Input() score?: number;
  @Input() duration?: number = 5;
  @Input() title?: string;
  @Input() isProgress = true;
  // @Input() users = true;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
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
