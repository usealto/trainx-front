import {
  CompanyDtoApi,
  CompanyDtoApiConnectorDaysEnumApi,
  CompanyDtoApiConnectorEnumApi,
  CompanyDtoApiConnectorTimesEnumApi,
} from '@usealto/sdk-ts-angular';
import { BaseStats, IBaseStats, IRanking, Ranking } from './stats.model';
import { compareAsc } from 'date-fns';
import { ITeam, Team } from './team.model';

export interface ICompany {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  stats: ICompanyStats[];
  licenseCount: number;
  teams: ITeam[];
}

export class Company implements ICompany {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  stats: CompanyStats[];
  licenseCount: number;
  teams: Team[];

  constructor(data: ICompany) {
    this.id = data.id ?? '';
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
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
    this.stats = [];
    this.licenseCount = data.licenseCount ?? 0;
    this.teams = data.teams ? data.teams.map(team => new Team(team)) : [];
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

  get rawData(): ICompany {
    return {
      id: this.id,
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
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      stats: this.stats.map((s) => s.rawData),
      licenseCount: this.licenseCount,
      teams: this.teams.map(team => team.rawData),
    };
  }
}

export interface ICompanyStats extends IBaseStats {
  commentsCreatedCount: number;
  questionsSubmittedCount: number;
  score: number;
  rankedTags: IRanking[];
  rankedUsers: IRanking[];
  rankedTeams: IRanking[];
}

export class CompanyStats extends BaseStats {
  commentsCreatedCount: number;
  questionsSubmittedCount: number;
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
