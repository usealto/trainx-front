import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import {
  CommentDtoApi,
  QuestionSubmittedStatusEnumApi,
  TeamStatsDtoApi
} from '@usealto/sdk-ts-angular';
import { combineLatest, map } from 'rxjs';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';

export interface IHomeData {
  comments: CommentDtoApi[];
  questionsCount: number;
  teamsStats: TeamStatsDtoApi[];
  previousTeamsStats: TeamStatsDtoApi[];
}

export const homeResolver: ResolveFn<IHomeData> = () => {
  return combineLatest([
    inject(CommentsRestService).getUnreadComments(),
    inject(QuestionsSubmittedRestService).getQuestionsCount({
      status: QuestionSubmittedStatusEnumApi.Submitted,
    }),
    inject(ScoresRestService).getTeamsStats(ScoreDuration.Year),
    inject(ScoresRestService).getTeamsStats(ScoreDuration.Year, true),
  ]).pipe(
    map(([comments, questionsCount, teamsStats, previousTeamsStats]) => ({
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
