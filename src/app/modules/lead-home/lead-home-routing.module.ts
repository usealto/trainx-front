import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadHomeComponent } from './components/lead-home/lead-home.component';

const routes: Routes = [
  {
    path: '',
    component: LeadHomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadHomeRoutingModule {}
