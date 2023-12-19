import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { Company } from '../../models/company.model';
import { Store } from '@ngrx/store';
import * as FromRoot from './../../core/store/store.reducer';
import { setPrograms, setProgramsTimestamp } from '../store/root/root.action';
import { map, switchMap } from 'rxjs';


export interface IProgramsData {
  company: Company;
}

export const programsResolver: ResolveFn<IProgramsData> = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const programsRest = inject(ProgramsRestService);

  return store.select(FromRoot.selectProgramsTimestamp).pipe(
    switchMap((timestamp) => {
      if (timestamp === null || timestamp === undefined || Date.now() - timestamp.getTime() > 60000) {
        return programsRest.getProgramsObj().pipe(
          switchMap((programs) => {
            console.log('programsResolver', programs);
            store.dispatch(setPrograms({ programs }));
            store.dispatch(setProgramsTimestamp({ date: new Date() }));
            return store.select(FromRoot.selectCompany);
          }),
        );
      } else {
        return store.select(FromRoot.selectCompany);
      }
    }),
    map(({ data: company }) => {
      return { company };
    }),
  );
};
