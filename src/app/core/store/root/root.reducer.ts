import { createReducer, on } from '@ngrx/store';
import { Company, ICompany } from '../../../models/company.model';
import { Program } from '../../../models/program.model';
import { Team } from '../../../models/team.model';
import { IUser, User } from '../../../models/user.model';
import {
  addUser,
  patchUser,
  removeUser,
  setCompany,
  setPrograms,
  setTags,
  setTeams,
  setTeamsStats,
  setUserMe,
  setUsers,
  updateCompany,
  updatePrograms,
} from '../root/root.action';
import { TagDtoApi } from '@usealto/sdk-ts-angular';

export class TimestampedEntity<T> {
  data: T;
  timestamp: Date | null;

  constructor(data: T, timestamp?: Date | null) {
    this.data = data;
    this.timestamp = timestamp === null ? null : timestamp ?? new Date();
  }

  needsUpdate(): boolean {
    return this.timestamp === null || Date.now() - this.timestamp.getTime() > 120000;
  }
}

export interface RootState {
  me: TimestampedEntity<User>;
  company: TimestampedEntity<Company>;
  usersById: TimestampedEntity<Map<string, User>>;
  teamsStatsTimestamp?: Date;
  tags: TimestampedEntity<TagDtoApi[]>; // TODO : create Tag model in our domain
}

export const initialState: RootState = {
  me: new TimestampedEntity<User>(new User({} as IUser), null),
  company: new TimestampedEntity<Company>(new Company({} as ICompany), null),
  usersById: new TimestampedEntity<Map<string, User>>(new Map(), null),
  tags: new TimestampedEntity<TagDtoApi[]>([], null),
};

export const rootReducer = createReducer(
  initialState,
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
    const company = new Company({ ...state.company.data.rawData, teams: teams.map((team) => team.rawData) });

    return {
      ...state,
      company: new TimestampedEntity(company),
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
      company: new TimestampedEntity(company),
    }),
  ),
  on(setTeamsStats, (state, { teamStats }): RootState => {
    const teams = state.company.data.teams.map((team) => {
      const stats = teamStats.filter((stat) => stat.teamId === team.id);
      return new Team({ ...team.rawData, stats });
    });

    const company = new Company({ ...state.company.data.rawData, teams });

    return {
      ...state,
      teamsStatsTimestamp: new Date(),
      company: new TimestampedEntity(company),
    };
  }),
  on(setPrograms, (state, { programs }): RootState => {
    const company = new Company({
      ...state.company.data,
      programs: programs.map((program) => program.rawData),
    });

    return {
      ...state,
      company: new TimestampedEntity(company),
    };
  }),
  on(updatePrograms, (state, { programs }): RootState => {
    const programsById: Map<string, Program> = new Map(
      state.company.data.programs.map((program) => [program.id, program]),
    );
    programs.forEach((program) => programsById.set(program.id, program));
    const company = new Company({ ...state.company.data, programs: [...programsById.values()] });

    return {
      ...state,
      company: new TimestampedEntity(company),
    };
  }),
  on(
    setTags,
    (state, { tags }): RootState => ({
      ...state,
      tags: new TimestampedEntity(tags),
    }),
  ),
);
