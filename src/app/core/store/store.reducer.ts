import { ActionReducerMap, createSelector } from '@ngrx/store';
import * as FromRoot from './root/root.reducer';

export interface AppState {
  root: FromRoot.RootState;
}

export const reducers: ActionReducerMap<AppState> = {
  root: FromRoot.rootReducer,
};

export const selectRoot = (state: AppState) => state.root;

export const selectUserMe = createSelector(selectRoot, (state) => state.me);
export const selectTeams = createSelector(selectRoot, (state) => state.teams);
export const selectUsers = createSelector(selectRoot, (state) => state.users);
export const selectCompany = createSelector(selectRoot, (state) => state.company);
