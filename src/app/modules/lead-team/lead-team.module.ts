import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeadTeamRoutingModule } from './lead-team-routing.module';
import { LeadTeamComponent } from './components/lead-team/lead-team.component';

@NgModule({
  declarations: [LeadTeamComponent],
  imports: [CommonModule, LeadTeamRoutingModule],
})
export class LeadTeamModule {}
