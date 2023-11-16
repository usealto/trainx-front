import { createReducer, on } from "@ngrx/store/src";
import { addUser } from "./lead.action";
import { User } from "@auth0/auth0-angular";

export interface State {
  users: User[]
}

export const initialState: State = {
  users: []
};

export const leadReducer = createReducer(initialState,
  on(addUser, (state, { user }) => ({
    ...state,
    users: [...state.users, user]
  }))
);
