import { User } from 'src/app/models/user.model';
import { createAction, props } from '@ngrx/store';
import { Team, TeamStats } from 'src/app/models/team.model';
import { Company } from '../../../models/company.model';

// Timestamp
export const setTeamsStatsTimestamp = createAction('[Timestamp] Set new timestamp for teams stats', props<{ date: Date }>());
export const setTeamsTimestamp = createAction('[Timestamp] Set new timestamp for teams', props<{ date: Date }>());


// User
export const setUserMe = createAction('[User] Set me', props<{ user: User }>());
export const addUser = createAction('[User] Add User', props<{ user: User }>());
export const patchUser = createAction('[User] Patch User', props<{ user: User }>());
export const removeUser = createAction('[User] Remove User', props<{ user: User }>());
export const setUsers = createAction('[User] Set Users', props<{ users: User[] }>());

// Team
export const setTeams = createAction('[Team] Set Teams', props<{ teams: Team[] }>());
export const setTeamsStats = createAction('[Team] Set Team Stats', props<{ teamStats: TeamStats[] }>());

// Company
export const setCompany = createAction('[Company] Set Company', props<{ company: Company }>());
export const updateCompany = createAction('[Company] Update Company', props<{ company: Company }>());
