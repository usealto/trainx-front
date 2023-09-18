import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CollaborationRoutingModule } from './collaboration-routing.module';
import { LeadCollaborationComponent } from './components/lead-collaboration/lead-collaboration.component';
import { SharedModule } from '../shared/shared.module';
import { QuestionSuggCardComponent } from './components/question-sugg-card/question-sugg-card.component';
import { SeeQuestionComponent } from './components/see-question/see-question.component';

@NgModule({
  declarations: [LeadCollaborationComponent, QuestionSuggCardComponent, SeeQuestionComponent],
  imports: [CommonModule, CollaborationRoutingModule, SharedModule],
})
export class CollaborationModule {}
