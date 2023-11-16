import { User } from "@auth0/auth0-angular";
import { Action, createAction, props } from "@ngrx/store";

export const addUser = createAction('[User] Add User', props<{ user: User }>());
