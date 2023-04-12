import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeadTeamRoutingModule } from './lead-team-routing.module';
import { LeadTeamComponent } from './components/lead-team/lead-team.component';
import { SharedModule } from "../shared/shared.module";

@NgModule({
    declarations: [LeadTeamComponent],
    imports: [CommonModule, LeadTeamRoutingModule, SharedModule]
})
export class LeadTeamModule {}
