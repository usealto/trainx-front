import { createReducer, on } from '@ngrx/store/src';
import { setTimestamp, addUser, setTeams, setUserMe, setUsers, setCompany } from '../root/root.action';
import { User, IUser } from '../../../models/user.model';
import { Team } from '../../../models/team.model';
import { Company, ICompany } from '../../../models/company.model';

export interface RootState {
  timestamp?: Date;
  me: User;
  company: Company;
  users: User[];
  teams: Team[];
}

export const initialState: RootState = {
  timestamp: undefined,
  me: new User({} as IUser),
  company: new Company({} as ICompany),
  users: [],
  teams: [],
};

export const rootReducer = createReducer(
  initialState,
  on(setTimestamp, (state, timestamp) => ({
    ...state,
    timestamp,
  })),
  on(setUserMe, (state, { user }) => ({
    ...state,
    me: user,
  })),
  on(setUsers, (state, { users }) => ({
    ...state,
    users: users,
  })),
  on(addUser, (state, { user }) => ({
    ...state,
    users: !state.users.find((u) => u.id === user.id) ? [...state.users, user] : [...state.users],
  })),
  on(setTeams, (state, { teams }) => ({
    ...state,
    teams: teams,
  })),
  on(setCompany, (state, { company }) => ({
    ...state,
    company: company,
  })),
);
