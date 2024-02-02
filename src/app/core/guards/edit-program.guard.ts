import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import * as FromRoot from '../store/store.reducer';

export const EditProgramGuard: CanActivateFn = (activatedRoute) => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const router = inject(Router);

  const programId = activatedRoute.paramMap.get('id');

  return store.select(FromRoot.selectCompany).pipe(
    map(({ data: company }) => {
      const programExists = company.programs.some((program) => program.id === programId);

      if (!programExists) {
        router.navigate(['/', AltoRoutes.lead, AltoRoutes.programs]);
        return false;
      }

      return true;
    }),
  );
};
