import { User } from 'src/app/models/user.model';
import { createAction, props } from '@ngrx/store';
import { Team } from 'src/app/models/team.model';
import { Company } from '../../../models/company.model';

// Timestamp
export const setTimestamp = createAction('[Timestamp] Set new timestamp', props<{ date: Date }>());

// User
export const setUserMe = createAction('[User] Set me', props<{ user: User }>());
export const addUser = createAction('[User] Add User', props<{ user: User }>());
export const patchUser = createAction('[User] Patch User', props<{ user: User }>());
export const removeUser = createAction('[User] Remove User', props<{ user: User }>());
export const setUsers = createAction('[User] Set Users', props<{ users: User[] }>());

// Team
export const setTeams = createAction('[User] Set Teams', props<{ teams: Team[] }>());

// Company
export const setCompany = createAction('[Company] Set Company', props<{ company: Company }>());
export const updateCompany = createAction('[Company] Update Company', props<{ company: Company }>());
