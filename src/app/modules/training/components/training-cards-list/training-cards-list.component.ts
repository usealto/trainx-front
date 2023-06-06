import { Component, Input } from '@angular/core';
import { TrainingCardData } from '../../models/training.model';

@Component({
  selector: 'alto-training-cards-list',
  templateUrl: './training-cards-list.component.html',
  styleUrls: ['./training-cards-list.component.scss'],
})
export class TrainingCardsListComponent {
  @Input() data: TrainingCardData[] = [];

  filter(e: any) {
    // TODO
  }
}
