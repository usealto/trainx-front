import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AltoRoutes } from '../shared/constants/routes';
import { CreateProgramsComponent } from './components/create-programs/create-programs.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { EditProgramGuard } from '../../core/guards/edit-program.guard';

const routes: Routes = [
  {
    path: '',
    component: ProgramsComponent,
  },
  {
    path: AltoRoutes.programsCreate,
    component: CreateProgramsComponent,
  },
  {
    path: AltoRoutes.programsEdit + '/:id',
    canActivate: [EditProgramGuard], // if false: redirect to programs
    // resolve: {
    //   editProgramResolver: ProgramsResolver, // find program to edit in company
    // },
    component: CreateProgramsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProgramsRoutingModule {}
