import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
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
  isAccelerated: boolean;
}

export const editProgramResolver: ResolveFn<IEditProgramData> = (activatedRoute) => {
  const router = inject(Router);
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const programId = activatedRoute.paramMap.get('id');
  const tab = activatedRoute.queryParamMap.get('tab')
    ? (activatedRoute.queryParamMap.get('tab') as ETab)
    : ETab.Informations;

  return store.select(FromRoot.selectCompany).pipe(
    map(({ data: company }) => {
      const program = programId ? company.programById.get(programId) : undefined;
      const isAccelerated =
        program?.isAccelerated ?? activatedRoute.queryParamMap.get('isAccelerated') === 'true';

      if (programId !== 'new' && !program) {
        router.navigate(['/', AltoRoutes.lead, AltoRoutes.programs]);
      }
      return { program, tab: program ? tab : ETab.Informations, isAccelerated };
    }),
  );
};
