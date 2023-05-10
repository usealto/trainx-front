import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { combineLatest, take } from 'rxjs';
import { TeamsRestService } from './modules/lead-team/services/teams-rest.service';
import { UsersRestService } from './modules/profile/services/users-rest.service';
import { ProgramsRestService } from './modules/programs/services/programs-rest.service';
import { TagsRestService } from './modules/programs/services/tags-rest.service';

export const appResolver: ResolveFn<any> = () => {
  return combineLatest([
    inject(TagsRestService).getTags(),
    inject(TeamsRestService).getTeams(),
    inject(UsersRestService).getMe(),
  ]).pipe(take(1));
};

export const programResolver: ResolveFn<any> = () => {
  return combineLatest([
    inject(UsersRestService).getAllUsers(),
    inject(ProgramsRestService).getPrograms(),
  ]).pipe(take(1));
};
