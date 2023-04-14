import { Injectable } from '@angular/core';
import { Store } from 'src/app/core/utils/store/store';
import { CommentApi, ProgramApi, TagApi } from 'src/app/sdk';

@Injectable({ providedIn: 'root' })
export class ProgramsStore {
  programs: Store<ProgramApi[]> = new Store<ProgramApi[]>([]);
  unreadComments: Store<CommentApi[]> = new Store<CommentApi[]>([]);
  tags: Store<TagApi[]> = new Store<TagApi[]>([]);
}
