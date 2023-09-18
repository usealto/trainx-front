import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadCollaborationComponent } from './components/lead-collaboration/lead-collaboration.component';
import { AltoRoutes } from '../shared/constants/routes';
import { SeeQuestionComponent } from './components/see-question/see-question.component';

const routes: Routes = [
  {
    path: '',
    component: LeadCollaborationComponent,
  },
  {
    path: AltoRoutes.collaborationSeeQuestion + '/:id',
    component: SeeQuestionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CollaborationRoutingModule {}
