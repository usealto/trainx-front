import { createReducer, on } from '@ngrx/store';
import { addUser, setTeams, setUserMe, setUsers, setCompany, setTimestamp } from '../root/root.action';
import { User, IUser } from '../../../models/user.model';
import { Team } from '../../../models/team.model';
import { Company, ICompany } from '../../../models/company.model';

export class TimestampedEntity<T> {
  data: T;
  timestamp: Date | null;

  constructor(data: T, timestamp?: Date | null) {
    this.data = data;
    this.timestamp = timestamp ?? new Date();
  }

  needsUpdate(): boolean {
    return this.timestamp === null || Date.now() - this.timestamp.getTime() > 30000;
  }
}

export interface RootState {
  me: TimestampedEntity<User>;
  company: TimestampedEntity<Company>;
  users: TimestampedEntity<User[]>;
  teams: TimestampedEntity<Team[]>;
  statsTimestamp?: Date;
}

export const initialState: RootState = {
  me: new TimestampedEntity<User>(new User({} as IUser), null),
  company: new TimestampedEntity<Company>(new Company({} as ICompany), null),
  users: new TimestampedEntity<User[]>([], null),
  teams: new TimestampedEntity<Team[]>([], null),
};

export const rootReducer = createReducer(
  initialState,
  on(
    setTimestamp,
    (state, { date }): RootState => ({
      ...state,
      statsTimestamp: date,
    }),
  ),
  on(
    setUserMe,
    (state, { user }): RootState => ({
      ...state,
      me: new TimestampedEntity<User>(user),
    }),
  ),
  on(
    setUsers,
    (state, { users }): RootState => ({
      ...state,
      users: new TimestampedEntity<User[]>(users),
    }),
  ),
  on(addUser, (state, { user }) => ({
    ...state,
    users: new TimestampedEntity<User[]>(
      !state.users.data.find((u) => u.id === user.id) ? [...state.users.data, user] : [...state.users.data],
    ),
  })),
  on(
    setTeams,
    (state, { teams }): RootState => ({
      ...state,
      teams: new TimestampedEntity(teams),
    }),
  ),
  on(
    setCompany,
    (state, { company }): RootState => ({
      ...state,
      company: new TimestampedEntity(company),
    }),
  ),
);
