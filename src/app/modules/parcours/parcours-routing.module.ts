import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParcoursComponent } from './components/parcours/parcours.component';
import { AltoRoutes } from '../shared/constants/routes';
import { EditParcoursComponent } from './components/edit-parcours/edit-parcours.component';

const routes: Routes = [
  {
    path: '',
    component: ParcoursComponent,
  },
  {
    path: AltoRoutes.parcoursEdit + '/:id',
    component: EditParcoursComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParcoursRoutingModule {}
