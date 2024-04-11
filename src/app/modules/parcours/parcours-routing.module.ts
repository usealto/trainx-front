import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParcoursComponent } from './components/parcours/parcours.component';

const routes: Routes = [
  {
    path: '',
    component: ParcoursComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParcoursRoutingModule {}
