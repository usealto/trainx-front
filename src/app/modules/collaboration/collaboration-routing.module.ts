import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadCollaborationComponent } from './components/lead-collaboration/lead-collaboration.component';

const routes: Routes = [
  {
    path: '',
    component: LeadCollaborationComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CollaborationRoutingModule {}
