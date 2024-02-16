import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ITrainingCardData } from '../../../shared/components/training-card/training-card.component';

@Component({
  selector: 'alto-training-cards-list',
  templateUrl: './training-cards-list.component.html',
  styleUrls: ['./training-cards-list.component.scss'],
})
export class TrainingCardsListComponent implements OnInit {
  @Input() data?: ITrainingCardData[];
  @Input() pageSize = 1;

  pageControl: FormControl<number> = new FormControl(1, { nonNullable: true });
  pageCount = 1;

  ngOnInit(): void {
    this.pageCount = Math.ceil(this.data?.length ?? 1 / this.pageSize ?? 1);
  }
}
