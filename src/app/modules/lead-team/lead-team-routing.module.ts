import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadTeamComponent } from './components/lead-team/lead-team.component';

const routes: Routes = [
  {
    path: '',
    component: LeadTeamComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadTeamRoutingModule {}
