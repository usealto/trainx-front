import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import {
  CommentDtoApi,
  QuestionSubmittedStatusEnumApi,
  TeamStatsDtoApi,
  UserDtoApi
} from '@usealto/sdk-ts-angular';
import { combineLatest, map } from 'rxjs';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';

export interface IHomeData {
  users: UserDtoApi[];
  comments: CommentDtoApi[];
  questionsCount: number;
  teamsStats: TeamStatsDtoApi[];
  previousTeamsStats: TeamStatsDtoApi[];
}

export const homeResolver: ResolveFn<IHomeData> = () => {
  return combineLatest([
    inject(UsersRestService).getUsers(),
    inject(CommentsRestService).getUnreadComments(),
    inject(QuestionsSubmittedRestService).getQuestionsCount({
      status: QuestionSubmittedStatusEnumApi.Submitted,
    }),
    inject(ScoresRestService).getTeamsStats(ScoreDuration.Trimester),
    inject(ScoresRestService).getTeamsStats(ScoreDuration.Trimester, true),
  ]).pipe(
    map(([users, comments, questionsCount, teamsStats, previousTeamsStats]) => ({
      users,
      comments,
      questionsCount,
      teamsStats,
      previousTeamsStats,
    })),
  );
};

// @Injectable()
// export class HomeResolver implements Resolve<IHomeData> {
//   constructor(private readonly store: Store<FromRoot.LeadState>) {}

//   resolve(): Observable<IHomeData> {

//   }
// }
