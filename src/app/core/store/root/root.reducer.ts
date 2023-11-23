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
    this.timestamp = timestamp === null ? null : timestamp ?? new Date();
  }

  needsUpdate(): boolean {
    return this.timestamp === null || Date.now() - this.timestamp.getTime() > 30000;
  }
}

export interface RootState {
  me: TimestampedEntity<User>;
  company: TimestampedEntity<Company>;
  usersById: TimestampedEntity<Map<string, User>>;
  teamsById: TimestampedEntity<Map<string, Team>>;
  statsTimestamp?: Date;
}

export const initialState: RootState = {
  me: new TimestampedEntity<User>(new User({} as IUser), null),
  company: new TimestampedEntity<Company>(new Company({} as ICompany), null),
  usersById: new TimestampedEntity<Map<string, User>>(new Map(), null),
  teamsById: new TimestampedEntity<Map<string, Team>>(new Map(), null),
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
      usersById: new TimestampedEntity(new Map<string, User>(users.map(user => [user.id, user])))
    }),
  ),
  on(
    addUser, (state, {user}): RootState => ({
      ...state,
      usersById: new TimestampedEntity(new Map<string, User>([...state.usersById.data.entries(), [user.id, user]]))
    })
  ),
  on(
    setTeams,
    (state, { teams }): RootState => ({
      ...state,
      teamsById: new TimestampedEntity(new Map<string, Team>(teams.map(team => [team.id, team]))),
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
