import { Injectable, inject } from '@angular/core';
import { Resolve, ResolveFn } from '@angular/router';
import { CommentDtoApi, QuestionDtoApi, QuestionSubmittedStatusEnumApi } from '@usealto/sdk-ts-angular';
import { combineLatest, take } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import * as FromRoot from '../store/root/root.reducer';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { Store } from '@ngrx/store';

export interface IHomeData {
  users: User[];
  teams: Team[];
  comments: CommentDtoApi[];
  questions: QuestionDtoApi[];
}

export const homeResolver: ResolveFn<any> = () => {
  return combineLatest([
    inject(UsersRestService).getUsers(),
    inject(CommentsRestService).getUnreadComments(),
    inject(QuestionsSubmittedRestService).getQuestionsCount({
      status: QuestionSubmittedStatusEnumApi.Submitted,
    }),
    inject(ScoresRestService).getTeamsStats(ScoreDuration.Trimester),
    inject(ScoresRestService).getTeamsStats(ScoreDuration.Trimester, true),
  ]).pipe(take(1));
};

// @Injectable()
// export class HomeResolver implements Resolve<IHomeData> {
//   constructor(private readonly store: Store<FromRoot.LeadState>) {}

//   resolve(): Observable<IHomeData> {

//   }
// }
