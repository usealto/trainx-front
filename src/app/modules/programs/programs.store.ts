import { Injectable } from '@angular/core';
import { CommentDtoApi, ProgramStatsDtoApi, TagDtoApi } from '@usealto/sdk-ts-angular';
import { Store } from 'src/app/core/utils/store/store';
import { QuestionDisplay } from './models/question.model';

@Injectable({ providedIn: 'root' })
export class ProgramsStore {
  // programs: Store<ProgramDtoApi[]> = new Store<ProgramDtoApi[]>([]);
  unreadComments: Store<CommentDtoApi[]> = new Store<CommentDtoApi[]>([]);
  tags: Store<TagDtoApi[]> = new Store<TagDtoApi[]>([]);

  programsInitCardList: Store<ProgramStatsDtoApi[]> = new Store<ProgramStatsDtoApi[]>([]);
  questionsInitList: Store<QuestionDisplay[]> = new Store<QuestionDisplay[]>();
}
