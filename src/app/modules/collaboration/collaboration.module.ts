import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CollaborationRoutingModule } from './collaboration-routing.module';
import { LeadCollaborationComponent } from './components/lead-collaboration/lead-collaboration.component';
import { SharedModule } from '../shared/shared.module';
import { SuggQuestionCardComponent } from './components/sugg-question-card/sugg-question-card.component';
import { TopContributorsComponent } from './components/lead-collaboration/top-contributors/top-contributors.component';
import { ArchiveModalComponent } from './components/archive-modal/archive-modal.component';
import { SeeQuestionComponent } from './components/see-question/see-question.component';
import { CommentCardComponent } from './components/comment-card/comment-card.component';
import { CollaborationModalComponent } from './components/collaboration-modal/collaboration-modal.component';

@NgModule({
  declarations: [
    LeadCollaborationComponent,
    SuggQuestionCardComponent,
    TopContributorsComponent,
    CommentCardComponent,
    CollaborationModalComponent,
    SeeQuestionComponent,
    ArchiveModalComponent,
  ],
  imports: [CommonModule, CollaborationRoutingModule, SharedModule],
})
export class CollaborationModule {}
