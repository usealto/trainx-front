import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AltoRoutes } from '../shared/constants/routes';
import { ProgramsComponent } from './components/programs/programs.component';
import { editProgramResolver } from '../../core/resolvers/edit-program.resolver';
import { EditProgramsComponent } from './components/edit-program/edit-program.component';
import { EResolvers } from '../../core/resolvers/resolvers.service';

const routes: Routes = [
  {
    path: '',
    component: ProgramsComponent,
  },
  {
    path: AltoRoutes.programsEdit + '/:id',
    resolve: {
      [EResolvers.EditProgramResolver]: editProgramResolver,
    },
    component: EditProgramsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProgramsRoutingModule {}
