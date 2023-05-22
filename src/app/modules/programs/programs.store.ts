import { Injectable } from '@angular/core';
import { Store } from 'src/app/core/utils/store/store';
import { CommentDtoApi, ProgramDtoApi, TagDtoApi } from '@usealto/sdk-ts-angular';

@Injectable({ providedIn: 'root' })
export class ProgramsStore {
  programs: Store<ProgramDtoApi[]> = new Store<ProgramDtoApi[]>([]);
  unreadComments: Store<CommentDtoApi[]> = new Store<CommentDtoApi[]>([]);
  tags: Store<TagDtoApi[]> = new Store<TagDtoApi[]>([]);
}
