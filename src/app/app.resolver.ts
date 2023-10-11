import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { combineLatest, take, tap } from 'rxjs';
import { TeamsRestService } from './modules/lead-team/services/teams-rest.service';
import { UsersRestService } from './modules/profile/services/users-rest.service';
import { ProgramsRestService } from './modules/programs/services/programs-rest.service';
import { TagsRestService } from './modules/programs/services/tags-rest.service';
import { EmojiMap, emojiData } from './core/utils/emoji/data';
import { CommentsRestService } from './modules/programs/services/comments-rest.service';
import { QuestionsSubmittedRestService } from './modules/programs/services/questions-submitted-rest.service';
import { QuestionSubmittedStatusEnumApi } from '@usealto/sdk-ts-angular';
import { ScoresRestService } from './modules/shared/services/scores-rest.service';
import { ScoreDuration } from './modules/shared/models/score.model';
import { ProgramsStore } from './modules/programs/programs.store';
import { environment } from 'src/environments/environment';

export const appResolver: ResolveFn<any> = () => {
  emojiData.forEach((d) => EmojiMap.set(d.id, d));

  return combineLatest([
    inject(TagsRestService).getTags(),
    inject(TeamsRestService).getTeams(),
    inject(UsersRestService).getMe(),
  ]).pipe(take(1));
};

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

export const programResolver: ResolveFn<any> = () => {
  return combineLatest([inject(UsersRestService).getUsers()]).pipe(take(1));
};

export const trainingResolver: ResolveFn<any> = () => {
  return combineLatest([inject(UsersRestService).getUsers()]).pipe(take(1));
};

export const leadResolver: ResolveFn<any> = () => {
  const progStore = inject(ProgramsStore);

  return combineLatest([
    inject(UsersRestService).getUsers(),
    inject(ProgramsRestService).getPrograms(),
    inject(ScoresRestService)
      .getProgramsStats(ScoreDuration.All, false, {
        sortBy: 'updatedAt:desc',
      })
      .pipe(tap((stats) => (progStore.programsInitCardList.value = stats))),
  ]).pipe(take(1));
};

export const removeSplashScreenResolver: ResolveFn<any> = () => {
  setTimeout(
    () => {
      document.getElementsByClassName('first-loader').item(0)?.remove();
    },
    environment.production ? 1000 : 500,
  );
};

export const noSplashScreenResolver: ResolveFn<any> = () => {
  document.getElementsByClassName('first-loader').item(0)?.remove();
};
