import { createSelector } from '@ngrx/store';
import { RootState } from './root.reducer';

const getRootState = (state: RootState) => state;

export const selectUserMe = createSelector(getRootState, (state) => state.me);
export const selectTeams = createSelector(getRootState, (state) => state.teams);
export const selectUsers = createSelector(getRootState, (state) => state.users);
export const selectCompany = createSelector(getRootState, (state) => state.company);
