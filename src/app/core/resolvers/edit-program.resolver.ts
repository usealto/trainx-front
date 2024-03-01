import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, of } from 'rxjs';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { Program } from '../../models/program.model';
import * as FromRoot from '../store/store.reducer';

export enum ETab {
  Informations = 'informations',
  Questions = 'questions',
  Summary = 'summary',
}

export interface IEditProgramData {
  program?: Program;
  tab: ETab;
}

export const editProgramResolver: ResolveFn<IEditProgramData> = (activatedRoute) => {
  const router = inject(Router);
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const programId = activatedRoute.paramMap.get('id');
  const tab = activatedRoute.queryParamMap.get('tab')
    ? (activatedRoute.queryParamMap.get('tab') as ETab)
    : ETab.Informations;

  if (!programId || programId === 'new') {
    return of({ program: undefined, tab: tab });
  } else {
    return store.select(FromRoot.selectCompany).pipe(
      map(({ data: company }) => {
        const program = company.programs.find((program) => program.id === programId);
        if (program) {
          return { program: program, tab: tab };
        } else {
          router.navigate(['/', AltoRoutes.lead, AltoRoutes.programs]);
          return { program: undefined, tab: tab };
        }
      }),
    );
  }
};
