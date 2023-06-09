import { Component, Input } from '@angular/core';
import { TrainingCardData } from '../../models/training.model';

@Component({
  selector: 'alto-training-cards-list',
  templateUrl: './training-cards-list.component.html',
  styleUrls: ['./training-cards-list.component.scss'],
})
export class TrainingCardsListComponent {
  @Input() data?: TrainingCardData[];
  @Input() pageSize = 1;
  page = 1;

  filter(e: any) {
    // TODO
  }
}
