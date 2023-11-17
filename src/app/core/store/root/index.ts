import { createSelector } from '@ngrx/store';
import { RootState } from './root.reducer';

const getTimestamp = (state: RootState) => state.timestamp;
const getMe = (state: RootState) => state.me;
const getTeams = (state: RootState) => state.teams;
const getUsers = (state: RootState) => state.users;
const getCompany = (state: RootState) => state.company;

export const selectTimestamp = createSelector(getTimestamp, (data) => data);
export const selectUserMe = createSelector(getMe, (data) => data);
export const selectTeams = createSelector(getTeams, (data) => data);
export const selectUsers = createSelector(getUsers, (data) => data);
export const selectCompany = createSelector(getCompany, (data) => data);
