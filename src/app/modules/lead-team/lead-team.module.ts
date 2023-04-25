import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeadTeamRoutingModule } from './lead-team-routing.module';
import { LeadTeamComponent } from './components/lead-team/lead-team.component';
import { SharedModule } from '../shared/shared.module';
import { TeamFormComponent } from './components/team-form/team-form.component';
import { UserEditFormComponent } from './components/user-edit-form/user-edit-form.component';

@NgModule({
  declarations: [LeadTeamComponent, TeamFormComponent, UserEditFormComponent],
  imports: [CommonModule, LeadTeamRoutingModule, SharedModule],
})
export class LeadTeamModule {}
