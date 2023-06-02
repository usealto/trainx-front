import { Component, Input } from '@angular/core';

@Component({
  selector: 'alto-training-card',
  templateUrl: './training-card.component.html',
  styleUrls: ['./training-card.component.scss'],
})
export class TrainingCardComponent {
  @Input() score?: number;
  @Input() duration?: number = 5;
  @Input() title?: string;
}
