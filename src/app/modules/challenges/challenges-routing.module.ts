import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChallengesComponent } from './components/challenges/challenges.component';

const routes: Routes = [
  {
    path: '',
    component: ChallengesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChallengesRoutingModule {}
