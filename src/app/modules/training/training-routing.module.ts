import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrainingComponent } from './components/training/training.component';
import { AltoRoutes } from '../shared/constants/routes';

const routes: Routes = [
  {
    path: '',
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
