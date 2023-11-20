import { ActionReducerMap } from '@ngrx/store';
import * as FromRoot from './root/root.reducer';

export interface IAppState {
  root: FromRoot.RootState;
}

export const reducers: ActionReducerMap<IAppState> = {
  root: FromRoot.rootReducer,
};
