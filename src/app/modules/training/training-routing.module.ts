import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrainingHomeComponent } from './components/training-home/training-home.component';
import { AltoRoutes } from '../shared/constants/routes';
import { TrainingComponent } from './components/training/training.component';

const routes: Routes = [
  {
    path: '',
    component: TrainingHomeComponent,
  },
  {
    path: AltoRoutes.trainingSession,
    component: TrainingComponent,
  },
  {
    path: AltoRoutes.trainingSession + '/:programId',
    component: TrainingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainingRoutingModule {}
