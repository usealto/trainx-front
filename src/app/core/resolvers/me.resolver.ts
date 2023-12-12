import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { User } from 'src/app/models/user.model';
import * as FromRoot from './../../core/store/store.reducer';
import { map } from 'rxjs';

export const meResolver: ResolveFn<User> = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  return store.select(FromRoot.selectUserMe).pipe(map(({ data: user }) => user));
};
