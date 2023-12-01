import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import * as FromRoot from './../../core/store/store.reducer';
import { ResolveFn } from '@angular/router';
import { Company } from 'src/app/models/company.model';
import { map } from 'rxjs';

export const companyResolver: ResolveFn<Company> = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  return store.select(FromRoot.selectCompany).pipe(map(({ data: company }) => company));
};
