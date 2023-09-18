import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CollaborationRoutingModule } from './collaboration-routing.module';
import { LeadCollaborationComponent } from './components/lead-collaboration/lead-collaboration.component';
import { SharedModule } from '../shared/shared.module';
import { SuggQuestionCardComponent } from './components/sugg-question-card/sugg-question-card.component';
import { TopContributorsComponent } from './components/lead-collaboration/top-contributors/top-contributors.component';

@NgModule({
  declarations: [LeadCollaborationComponent, SuggQuestionCardComponent, TopContributorsComponent],
  imports: [CommonModule, CollaborationRoutingModule, SharedModule],
})
export class CollaborationModule {}
