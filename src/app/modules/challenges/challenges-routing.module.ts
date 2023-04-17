import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChallengesComponent } from './components/challenges/challenges.component';
import { AltoRoutes } from '../shared/constants/routes';
import { ChallengeFormComponent } from './components/challenge-form/challenge-form.component';

const routes: Routes = [
  {
    path: '',
    component: ChallengesComponent,
  },
  {
    path: AltoRoutes.challengeEdit + '/:id',
    component: ChallengeFormComponent,
  },
  {
    path: AltoRoutes.challengeEdit + '/:id/:type',
    component: ChallengeFormComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChallengesRoutingModule {}
