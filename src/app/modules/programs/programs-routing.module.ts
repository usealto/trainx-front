import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AltoRoutes } from '../shared/constants/routes';
import { CreateProgramsComponent } from './components/create-programs/create-programs.component';
import { ProgramsComponent } from './components/programs/programs.component';

const routes: Routes = [
  {
    path: '',
    component: ProgramsComponent,
  },
  {
    path: AltoRoutes.programsEdit + '/:id',
    component: CreateProgramsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProgramsRoutingModule {}
