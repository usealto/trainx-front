import { createReducer, on } from '@ngrx/store';
import { Company, ICompany } from '../../../models/company.model';
import { Team, TeamStats } from '../../../models/team.model';
import { IUser, User } from '../../../models/user.model';
import {
  addUser,
  removeUser,
  setCompany,
  updateCompany,
  setTeams,
  setTeamsStatsTimestamp,
  setTeamsTimestamp,
  setProgramsTimestamp,
  setUserMe,
  setUsers,
  patchUser,
  setTeamsStats,
  setPrograms,
} from '../root/root.action';

export class TimestampedEntity<T> {
  data: T;
  timestamp: Date | null;

  constructor(data: T, timestamp?: Date | null) {
    this.data = data;
    this.timestamp = timestamp === null ? null : timestamp ?? new Date();
  }

  needsUpdate(): boolean {
    return this.timestamp === null || Date.now() - this.timestamp.getTime() > 60000;
  }
}

export interface RootState {
  me: TimestampedEntity<User>;
  company: TimestampedEntity<Company>;
  usersById: TimestampedEntity<Map<string, User>>;
  programsTimestamp?: Date;
  teamsStatsTimestamp?: Date;
  teamsTimestamp?: Date;
}


export const initialState: RootState = {
  me: new TimestampedEntity<User>(new User({} as IUser), null),
  company: new TimestampedEntity<Company>(new Company({} as ICompany), null),
  usersById: new TimestampedEntity<Map<string, User>>(new Map(), null),
};

export const rootReducer = createReducer(
  initialState,
  on(
    setTeamsStatsTimestamp,
    (state, { date }): RootState => ({
      ...state,
      teamsStatsTimestamp: date,
    }),
  ),
  on(
    setTeamsTimestamp,
    (state, { date }): RootState => ({
      ...state,
      teamsTimestamp: date,
    }),
  ),
  on(
    setProgramsTimestamp,
    (state, { date }): RootState => ({
      ...state,
      programsTimestamp: date,
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
  on(setTeams, (state, { teams }): RootState => {
    const company = new Company(state.company.data);
    company.teams = teams;

    return {
      ...state,
      company: new TimestampedEntity(company),
      teamsTimestamp: new Date(),
    };
  }),
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
  on(setTeamsStats, (state, { teamStats }): RootState => {
    console.log('company');
    const company = new Company(state.company.data);
    const newTeamsStatsByTeamId = new Map<string, TeamStats[]>();

    teamStats.forEach((stat) => {
      const currentStats = newTeamsStatsByTeamId.get(stat.teamId) || [];
      newTeamsStatsByTeamId.set(stat.teamId, [...currentStats, stat]);
    });

    company.teams.forEach((team) => {
      team.stats = newTeamsStatsByTeamId.get(team.id) || [];
    });

    console.log('company end of reducer stats', company);

    return {
      ...state,
      company: new TimestampedEntity(company),
    };
  }),
  on(setPrograms, (state, { programs }): RootState => {
    const company = new Company(state.company.data);
    company.programs = programs;
    return {
      ...state,
      company: new TimestampedEntity(company),
    };
  }),
);
