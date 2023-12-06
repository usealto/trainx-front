import { createReducer, on } from '@ngrx/store';
import { Company, ICompany } from '../../../models/company.model';
import { Team } from '../../../models/team.model';
import { IUser, User } from '../../../models/user.model';
import {
  addUser,
  removeUser,
  setCompany,
  updateCompany,
  setTeams,
  setTimestamp,
  setUserMe,
  setUsers,
  patchUser,
  addTeamStats,
} from '../root/root.action';

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
      usersById: new TimestampedEntity(new Map<string, User>(users.map((user) => [user.id, user]))),
    }),
  ),
  on(
    addUser,
    (state, { user }): RootState => ({
      ...state,
      usersById: new TimestampedEntity(
        new Map<string, User>([...state.usersById.data.entries(), [user.id, user]]),
      ),
    }),
  ),
  on(
    patchUser,
    (state, { user }): RootState => ({
      ...state,
      usersById: new TimestampedEntity(
        new Map<string, User>(
          [...state.usersById.data.entries()].map(([id, u]) => (id === user.id ? [id, user] : [id, u])),
        ),
      ),
    }),
  ),
  on(
    removeUser,
    (state, { user }): RootState => ({
      ...state,
      usersById: new TimestampedEntity(
        new Map<string, User>([...state.usersById.data.entries()].filter(([id]) => id !== user.id)),
      ),
    }),
  ),
  on(
    setTeams,
    (state, { teams }): RootState => ({
      ...state,
      teamsById: new TimestampedEntity(new Map<string, Team>(teams.map((team) => [team.id, team]))),
    }),
  ),
  on(
    setCompany,
    (state, { company }): RootState => ({
      ...state,
      company: new TimestampedEntity(company),
    }),
  ),
  on(
    updateCompany,
    (state, { company }): RootState => ({
      ...state,
      company: new TimestampedEntity(company), // Met à jour l'état de l'entreprise
    }),
  ),
  on(
    addTeamStats,
    (state, { teamStats }): RootState => ({
      ...state,
      teamsById: new TimestampedEntity(
        new Map<string, Team>(
          [...state.teamsById.data.entries()].map(([teamId, team]) => {
            const statsForThisTeam = teamStats.filter((ts) => ts.team.id === teamId);

            team.addStats(statsForThisTeam);

            // Utilisez la méthode de construction ou une méthode similaire pour créer une instance de Team
            const updatedTeam = new Team({ ...team, stats: updatedStats });

            // Retourner l'équipe avec les stats mises à jour
            return [teamId, updatedTeam];
          }),
        ),
        state.teamsById.timestamp,
      ),
    }),
  ),
);
