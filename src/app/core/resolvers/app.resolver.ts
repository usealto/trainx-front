import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map, of, switchMap } from 'rxjs';

import { Company } from '../../models/company.model';
import { User } from '../../models/user.model';
import { UsersRestService } from '../../modules/profile/services/users-rest.service';
import { setUsers } from '../store/root/root.action';
import { EmojiMap, emojiData } from '../utils/emoji/data';
import * as FromRoot from './../../core/store/store.reducer';

export interface IAppData {
  me: User;
  userById: Map<string, User>;
  company: Company;
}

export const appResolver: ResolveFn<Observable<IAppData>> = () => {
  emojiData.forEach((emoji) => {
    EmojiMap.set(emoji.id, emoji);
  });

  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const usersRestService = inject<UsersRestService>(UsersRestService);

  return combineLatest([
    store.select(FromRoot.selectUserMe),
    store.select(FromRoot.selectUsers),
    store.select(FromRoot.selectCompany),
  ]).pipe(
    switchMap(([timestampedUser, timestampedUserById, timestampedCompany]) => {
      return combineLatest([
        of(timestampedUser),
        timestampedUserById.needsUpdate()
          ? usersRestService.getUsers().pipe(
              switchMap((users) => {
                store.dispatch(setUsers({ users }));
                return store.select(FromRoot.selectUsers);
              }),
            )
          : of(timestampedUserById),
        of(timestampedCompany),
      ]);
    }),
    map(([{ data: me }, { data: userById }, { data: company }]) => {
      return {
        me,
        userById,
        company,
      };
    }),
  );
};
