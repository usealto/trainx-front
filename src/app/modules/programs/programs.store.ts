import { Injectable } from '@angular/core';
import { Store } from 'src/app/core/utils/store/store';
import { CommentApi, TagApi } from 'src/app/sdk';

@Injectable({ providedIn: 'root' })
export class ProgramsStore {
  unreadComments: Store<CommentApi[]> = new Store<CommentApi[]>([]);
  tags: Store<TagApi[]> = new Store<TagApi[]>([]);
}
