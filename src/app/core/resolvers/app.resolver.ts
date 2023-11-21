import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { EmojiMap, emojiData } from '../utils/emoji/data';
import * as FromRoot from './../../core/store/store.reducer';

export const appResolver: ResolveFn<User> = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);

  emojiData.forEach((emoji) => {
    EmojiMap.set(emoji.id, emoji);
  });

  return store.select(FromRoot.selectUserMe).pipe(map(({ data: user }) => user));
};
