import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ProgramDtoApi, ProgramStatsDtoApi, UserDtoApi } from '@usealto/sdk-ts-angular';
import { combineLatest, map, tap } from 'rxjs';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';

export interface ILeadResolverData {
  users: UserDtoApi[];
  programs: ProgramDtoApi[];
  stats: ProgramStatsDtoApi[];
}

export const leadResolver: ResolveFn<ILeadResolverData> = () => {
  const progStore = inject(ProgramsStore);

  return combineLatest([
    inject(UsersRestService).getUsers(),
    inject(ProgramsRestService).getPrograms(),
    inject(ScoresRestService)
      .getProgramsStats(ScoreDuration.All, false, {
        sortBy: 'updatedAt:desc',
      })
      .pipe(tap((stats) => (progStore.programsInitCardList.value = stats))),
  ]).pipe(map(([users, programs, stats]) => ({ users, programs, stats })));
};
