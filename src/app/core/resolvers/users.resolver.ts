import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import * as FromRoot from './../../core/store/store.reducer';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { User } from 'src/app/models/user.model';

export const usersResolver: ResolveFn<Map<string, User>> = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  return store.select(FromRoot.selectUsers).pipe(map(({ data: users }) => users));
};
