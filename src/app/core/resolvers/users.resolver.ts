import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import * as FromRoot from './../../core/store/store.reducer';
import { Store } from '@ngrx/store';
import { map, of, switchMap } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { setUsers } from '../store/root/root.action';

export const usersResolver: ResolveFn<Map<string, User>> = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const usersRestService = inject<UsersRestService>(UsersRestService);

  return store.select(FromRoot.selectUsers).pipe(
    switchMap((timestampedUsers) => {
      return timestampedUsers.needsUpdate()
        ? usersRestService.getUsers().pipe(
            switchMap((users) => {
              store.dispatch(setUsers({ users }));
              return store.select(FromRoot.selectUsers);
            }),
            map(({ data }) => data),
          )
        : of(timestampedUsers.data);
    }),
  );
};
