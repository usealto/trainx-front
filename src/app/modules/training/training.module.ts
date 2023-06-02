import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrainingRoutingModule } from './training-routing.module';
import { TrainingComponent } from './components/training/training.component';
import { AnswerCardComponent } from './components/answer-card/answer-card.component';
import { ExplanationComponent } from './components/explanation/explanation.component';
import { TrainingHomeComponent } from './components/training-home/training-home.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [TrainingComponent, AnswerCardComponent, ExplanationComponent, TrainingHomeComponent],
  imports: [CommonModule, TrainingRoutingModule, SharedModule],
})
export class TrainingModule {}
