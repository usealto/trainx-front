import { createAction, props } from '@ngrx/store';
import { TagDtoApi } from '@usealto/sdk-ts-angular';
import { Team, TeamStats } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { Company } from '../../../models/company.model';
import { Program } from '../../../models/program.model';

// User
export const setUserMe = createAction('[User] Set me', props<{ user: User }>());
export const addUser = createAction('[User] Add User', props<{ user: User }>());
export const patchUser = createAction('[User] Patch User', props<{ user: User }>());
export const removeUser = createAction('[User] Remove User', props<{ user: User }>());
export const setUsers = createAction('[User] Set Users', props<{ users: User[] }>());

// Team
export const setTeams = createAction('[Team] Set Teams', props<{ teams: Team[] }>());
export const setTeamsStats = createAction('[Team] Set Team Stats', props<{ teamStats: TeamStats[] }>());

// Program
export const setPrograms = createAction('[Program] Set Programs', props<{ programs: Program[] }>());
export const updatePrograms = createAction('[Program] Update Programs', props<{ programs: Program[] }>());
export const addProgram = createAction('[Program] Add Program', props<{ program: Program }>());
export const deleteProgram = createAction('[Program] Delete Program', props<{ programId: string }>());
export const launchAcceleratedProgram = createAction(
  '[Program] Launch Accelerated Program',
  props<{ programId: string }>(),
);

// Tag
export const setTags = createAction('[Tag] Set Tags', props<{ tags: TagDtoApi[] }>());

// Company
export const setCompany = createAction('[Company] Set Company', props<{ company: Company }>());
export const updateCompany = createAction('[Company] Update Company', props<{ company: Company }>());
