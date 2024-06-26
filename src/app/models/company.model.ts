import {
  CompanyDtoApi,
  CompanyDtoApiConnectorDaysEnumApi,
  CompanyDtoApiConnectorEnumApi,
  CompanyDtoApiConnectorTimesEnumApi,
} from '@usealto/sdk-ts-angular';
import { BaseStats, IBaseStats, IRanking, Ranking } from './stats.model';
import { compareAsc } from 'date-fns';
import { ITeam, Team, TeamStats } from './team.model';
import { BaseModel, IBaseModel } from './base.model';
import { IProgram, Program } from './program.model';
import { EScoreDuration } from './score.model';
import { Coach, ICoach } from './coach.model';

export interface ICompany extends IBaseModel {
  name: string;
  connector?: CompanyDtoApiConnectorEnumApi;
  isConnectorActive?: boolean;
  isIntegrationEnabled?: boolean;
  connectorDays?: Array<CompanyDtoApiConnectorDaysEnumApi>;
  connectorQuestionsPerQuiz?: number;
  connectorTimes?: Array<CompanyDtoApiConnectorTimesEnumApi>;
  adminIds: string[];
  theOfficeId: string;
  usersHaveWebAccess: boolean;
  stats: ICompanyStats[];
  licenseCount: number;
  teams: ITeam[];
  programs: IProgram[];
  coachs: ICoach[];
}

export class Company extends BaseModel implements ICompany {
  name: string;
  connector?: CompanyDtoApiConnectorEnumApi;
  theOfficeId: string;
  isConnectorActive: boolean;
  isIntegrationEnabled: boolean;
  connectorDays?: Array<CompanyDtoApiConnectorDaysEnumApi>;
  connectorQuestionsPerQuiz?: number;
  connectorTimes?: Array<CompanyDtoApiConnectorTimesEnumApi>;
  adminIds: string[];
  usersHaveWebAccess: boolean;
  stats: CompanyStats[];
  licenseCount: number;
  teams: Team[];
  programs: Program[];
  coachs: Coach[];
  teamById: Map<string, Team>;
  programById: Map<string, Program>;
  coachById: Map<string, Coach>;

  constructor(data: ICompany) {
    super(data);
    this.name = data.name ?? '';
    this.connector = data.connector ?? CompanyDtoApiConnectorEnumApi.Unknown;
    this.isConnectorActive = data.isConnectorActive ?? false;
    this.isIntegrationEnabled = data.isIntegrationEnabled ?? false;
    this.connectorDays = data.connectorDays ?? [];
    this.connectorQuestionsPerQuiz = data.connectorQuestionsPerQuiz ?? 0;
    this.connectorTimes = data.connectorTimes ?? [];
    this.adminIds = data.adminIds ?? [];
    this.usersHaveWebAccess = data.usersHaveWebAccess ?? false;
    this.theOfficeId = data.theOfficeId ?? '';
    this.stats = [];
    this.licenseCount = data.licenseCount ?? 0;
    this.teams = data.teams ? data.teams.map((team) => new Team(team)) : [];
    this.programs = data.programs ? data.programs.map((program) => new Program(program)) : [];
    this.coachs = data.coachs ? data.coachs.map((coach) => new Coach(coach)) : [];
    this.teamById = new Map(this.teams.map((team) => [team.id, team]));
    this.programById = new Map(this.programs.map((program) => [program.id, program]));
    this.coachById = new Map(this.coachs.map((coach) => [coach.id, coach]));
  }

  static fromDto(data: CompanyDtoApi): Company {
    return new Company({
      id: data.id,
      name: data.name,
      connector: data.connector,
      isConnectorActive: data.isConnectorActive,
      isIntegrationEnabled: data.isIntegrationEnabled,
      connectorDays: data.connectorDays,
      connectorQuestionsPerQuiz: data.connectorQuestionsPerQuiz,
      connectorTimes: data.connectorTimes,
      adminIds: data.admins ? data.admins.map(({ id }) => id) : [],
      usersHaveWebAccess: data.usersHaveWebAccess,
      theOfficeId: data.theOfficeId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      stats: [],
      licenseCount: data.licenseCount,
      teams: [],
      programs: [],
      coachs: [],
    });
  }

  addStats(stats: CompanyStats): void {
    if (
      !this.stats.every(({ from, to, scoreById }) => {
        return (
          compareAsc(stats.from, from) !== 0 ||
          compareAsc(stats.to, to) !== 0 ||
          stats.scoreById !== scoreById
        );
      })
    ) {
      this.stats = [...this.stats, stats];
    }
  }

  getStatsByScoreById(id: string): CompanyStats[] {
    return this.stats.filter(({ scoreById }) => scoreById === id);
  }

  getStatsByPeriod(duration: EScoreDuration, isPrev: boolean): TeamStats[] {
    return this.teams
      .map((team) => team.getStatByPeriod(duration, isPrev))
      .filter((stat) => stat !== undefined) as TeamStats[];
  }

  getTeamStatsByPeriod(duration: EScoreDuration, isPrev: boolean): TeamStats[] {
    return this.teams.map((team) => {
      const stats = team.getStatByPeriod(duration, isPrev);

      return {
        programStats: stats?.programStats,
        teamId: team.id,
        questionsPushedCount: stats?.questionsPushedCount ?? 0,
        commentsCount: stats?.commentsCount ?? 0,
        questionsSubmittedCount: stats?.questionsSubmittedCount ?? 0,
        validGuessesCount: stats?.validGuessesCount ?? 0,
        tagStats: stats?.tagStats,
        scoreDuration: stats?.scoreDuration,
        isPrev: stats?.isPrev,
        from: stats?.from,
        to: stats?.to,
        score: stats?.score ?? 0,
        totalGuessesCount: stats?.totalGuessesCount ?? 0,
        scoreById: stats?.scoreById ?? '',
      } as TeamStats;
    });
  }

  getTeamPrograms(teamId: string): Program[] {
    return this.programs.filter((program) => program.teamIds.includes(teamId));
  }

  getProgramTeams(programId: string): Team[] {
    return this.teams.filter((team) => team.programIds.includes(programId));
  }

  override get rawData(): ICompany {
    return {
      ...super.rawData,
      name: this.name,
      connector: this.connector,
      isConnectorActive: this.isConnectorActive,
      isIntegrationEnabled: this.isIntegrationEnabled,
      connectorDays: this.connectorDays,
      connectorQuestionsPerQuiz: this.connectorQuestionsPerQuiz,
      connectorTimes: this.connectorTimes,
      adminIds: this.adminIds,
      usersHaveWebAccess: this.usersHaveWebAccess,
      theOfficeId: this.theOfficeId,
      stats: this.stats.map((s) => s.rawData),
      licenseCount: this.licenseCount,
      teams: this.teams.map((team) => team.rawData),
      programs: this.programs.map((program) => program.rawData),
      coachs: this.coachs.map((coach) => coach.rawData),
    };
  }
}

export interface ICompanyStats extends IBaseStats {
  commentsCreatedCount: number;
  questionsSubmittedCount: number;
  score?: number;
  rankedTags: IRanking[];
  rankedUsers: IRanking[];
  rankedTeams: IRanking[];
}

export class CompanyStats extends BaseStats {
  commentsCreatedCount: number;
  questionsSubmittedCount: number;
  // TODO: to implement when storing data in store
  rankedTags: Ranking[];
  rankedUsers: Ranking[];
  rankedTeams: Ranking[];

  constructor(data: ICompanyStats) {
    super(data);
    this.commentsCreatedCount = data.commentsCreatedCount;
    this.questionsSubmittedCount = data.questionsSubmittedCount;
    this.rankedTags = data.rankedTags.map((r) => new Ranking(r));
    this.rankedUsers = data.rankedUsers.map((r) => new Ranking(r));
    this.rankedTeams = data.rankedTeams.map((r) => new Ranking(r));
  }

  override get rawData(): ICompanyStats {
    return {
      ...super.rawData,
      commentsCreatedCount: this.commentsCreatedCount,
      questionsSubmittedCount: this.questionsSubmittedCount,
      rankedTags: this.rankedTags.map((r) => r.rawData),
      rankedUsers: this.rankedUsers.map((r) => r.rawData),
      rankedTeams: this.rankedTeams.map((r) => r.rawData),
    };
  }
}
