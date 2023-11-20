import { Resolve } from '@angular/router';

import { EmojiMap, emojiData } from '../utils/emoji/data';
import { Injectable } from '@angular/core';
import { RootState } from '../store/root/root.reducer';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map, tap } from 'rxjs';

import * as FromRoot from '../store/root';

@Injectable()
export class AppResolver implements Resolve<Observable<Promise<void>>> {
  constructor(private readonly store: Store<RootState>) {}

  resolve(): Observable<Promise<void>> {
    emojiData.forEach((emoji) => {
      EmojiMap.set(emoji.id, emoji);
    });

    return combineLatest([
      this.store.select(FromRoot.selectUserMe),
      this.store.select(FromRoot.selectUsers),
    ]).pipe(
      tap(([me, users]) => {
        console.log('me : ', me);
        console.log('users : ', users);
      }),
      map(() => Promise.resolve()),
    );
  }
}
