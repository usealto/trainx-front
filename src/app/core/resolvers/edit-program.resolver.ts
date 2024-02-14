import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, of } from 'rxjs';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { Program } from '../../models/program.model';
import * as FromRoot from '../store/store.reducer';

export interface IEditProgramData {
  program?: Program;
}

export const editProgramResolver: ResolveFn<IEditProgramData> = (activatedRoute) => {
  const router = inject(Router);
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const programId = activatedRoute.paramMap.get('id');

  if (!programId || programId === 'new') {
    return of({ program: undefined });
  } else {
    return store.select(FromRoot.selectCompany).pipe(
      map(({ data: company }) => {
        const program = company.programs.find((program) => program.id === programId);
        if (program) {
          return { program: program };
        } else {
          router.navigate(['/', AltoRoutes.lead, AltoRoutes.programs]);
          //Toast?
          return { program: undefined };
        }
      }),
    );
  }
};
