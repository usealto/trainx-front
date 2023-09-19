import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadCollaborationComponent } from './components/lead-collaboration/lead-collaboration.component';
import { TopContributorsComponent } from './components/lead-collaboration/top-contributors/top-contributors.component';

const routes: Routes = [
  {
    path: '',
    component: LeadCollaborationComponent,
  },
  {
    path: 'top-contributors',
    component: TopContributorsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CollaborationRoutingModule {}
