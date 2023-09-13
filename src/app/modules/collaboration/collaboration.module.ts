import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CollaborationRoutingModule } from './collaboration-routing.module';
import { LeadCollaborationComponent } from './components/lead-collaboration/lead-collaboration.component';

@NgModule({
  declarations: [LeadCollaborationComponent],
  imports: [CommonModule, CollaborationRoutingModule],
})
export class CollaborationModule {}
