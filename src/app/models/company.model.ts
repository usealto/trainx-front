import {
  CompanyDtoApi,
  CompanyDtoApiConnectorDaysEnumApi,
  CompanyDtoApiConnectorEnumApi,
  CompanyDtoApiConnectorTimesEnumApi,
} from '@usealto/sdk-ts-angular';
import { BaseStats, IBaseStats, IRanking, Ranking } from './stats.model';
import { compareAsc } from 'date-fns';

export interface ICompany {
  id: string;
  name: string;
  connector?: CompanyDtoApiConnectorEnumApi;
  isConnectorActive?: boolean;
  connectorDays?: Array<CompanyDtoApiConnectorDaysEnumApi>;
  connectorQuestionsPerQuiz?: number;
  connectorTimes?: Array<CompanyDtoApiConnectorTimesEnumApi>;
  adminIds: string[];
  usersHaveWebAccess: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  stats: ICompanyStats[];
}

export class Company implements ICompany {
  id: string;
  name: string;
  connector?: CompanyDtoApiConnectorEnumApi;
  isConnectorActive?: boolean;
  connectorDays?: Array<CompanyDtoApiConnectorDaysEnumApi>;
  connectorQuestionsPerQuiz?: number;
  connectorTimes?: Array<CompanyDtoApiConnectorTimesEnumApi>;
  adminIds: string[];
  usersHaveWebAccess: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  stats: CompanyStats[];

  constructor(data: ICompany) {
    this.id = data.id;
    this.name = data.name;
    this.connector = data.connector;
    this.isConnectorActive = data.isConnectorActive;
    this.connectorDays = data.connectorDays;
    this.connectorQuestionsPerQuiz = data.connectorQuestionsPerQuiz;
    this.connectorTimes = data.connectorTimes;
    this.adminIds = data.adminIds;
    this.usersHaveWebAccess = data.usersHaveWebAccess;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.stats = [];
  }

  static fromDto(data: CompanyDtoApi): Company {
    return new Company({
      id: data.id,
      name: data.name,
      connector: data.connector,
      isConnectorActive: data.isConnectorActive,
      connectorDays: data.connectorDays,
      connectorQuestionsPerQuiz: data.connectorQuestionsPerQuiz,
      connectorTimes: data.connectorTimes,
      adminIds: data.admins ? data.admins.map(({ id }) => id) : [],
      usersHaveWebAccess: data.usersHaveWebAccess,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      stats: [],
    });
  }

  addStats(stats: CompanyStats): void {
    if (
      !this.stats.every(({from, to, scoreById}) => {
        return (compareAsc(stats.from, from) !== 0) ||
          (compareAsc(stats.to, to) !== 0) ||
          (stats.scoreById !== scoreById);
      })
    ) {
      this.stats = [...this.stats, stats];
    }
  }

  getStatsByScoreById(id: string): CompanyStats[] {
    return this.stats.filter(({scoreById}) => scoreById === id);
  }

  get rawData(): ICompany {
    return {
      id: this.id,
      name: this.name,
      connector: this.connector,
      isConnectorActive: this.isConnectorActive,
      connectorDays: this.connectorDays,
      connectorQuestionsPerQuiz: this.connectorQuestionsPerQuiz,
      connectorTimes: this.connectorTimes,
      adminIds: this.adminIds,
      usersHaveWebAccess: this.usersHaveWebAccess,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      stats: this.stats.map((s) => s.rawData)
    };
  }
}

export interface ICompanyStats extends IBaseStats {
  commentsCreatedCount: number,
  questionsSubmittedCount: number,
  score: number,
  rankedTags: IRanking[],
  rankedUsers: IRanking[],
  rankedTeams: IRanking[]
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
      rankedTeams: this.rankedTeams.map((r) => r.rawData)
    };
  }
}
