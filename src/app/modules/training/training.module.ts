import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AnswerCardComponent } from './components/answer-card/answer-card.component';
import { ContinuingTrainingComponent } from './components/continuing-training/continuing-training.component';
import { ExplanationComponent } from './components/explanation/explanation.component';
import { TrainingCardsListComponent } from './components/training-cards-list/training-cards-list.component';
import { TrainingHomeComponent } from './components/training-home/training-home.component';
import { TrainingComponent } from './components/training/training.component';
import { TrainingRoutingModule } from './training-routing.module';

@NgModule({
  declarations: [
    TrainingComponent,
    AnswerCardComponent,
    ExplanationComponent,
    TrainingHomeComponent,
    ContinuingTrainingComponent,
    TrainingCardsListComponent,
  ],
  imports: [CommonModule, TrainingRoutingModule, SharedModule],
})
export class TrainingModule {}
