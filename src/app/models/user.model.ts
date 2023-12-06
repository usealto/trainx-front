import { StreakDtoApi, UserDtoApi, UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';
import { BaseStats, IBaseStats } from './stats.model';
import { compareAsc } from 'date-fns';

export interface IUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  roles: Array<UserDtoApiRolesEnumApi>;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isConnectorActive?: boolean;
  stats: IUserStats[];
  companyId: string;
  longestStreak: StreakDtoApi;
  currentStreak: StreakDtoApi;
  hasLicense: boolean;
}

export class User implements IUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  roles: Array<UserDtoApiRolesEnumApi>;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isConnectorActive?: boolean;
  stats: UserStats[];
  companyId: string;
  longestStreak: StreakDtoApi;
  currentStreak: StreakDtoApi;
  hasLicense: boolean;

  constructor(data: IUser) {
    this.id = data.id ?? '';
    this.firstname = data.firstname ?? '';
    this.lastname = data.lastname ?? '';
    this.email = data.email ?? '';
    this.roles = data.roles ?? [];
    this.teamId = data.teamId ?? '';
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
    this.stats = data.stats?.map((s) => new UserStats(s)) ?? [];
    this.companyId = data.companyId ?? '';
    this.longestStreak = data.longestStreak ?? ({} as StreakDtoApi);
    this.currentStreak = data.currentStreak ?? ({} as StreakDtoApi);
    this.hasLicense = data.hasLicense ?? false;
  }

  static fromDto(data: UserDtoApi): User {
    return new User({
      id: data.id,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      roles: data.roles,
      teamId: data.teamId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      stats: [],
      companyId: data.companyId,
      longestStreak: data.longestStreak,
      currentStreak: data.currentStreak,
      hasLicense: data.hasLicense,
    });
  }

  get fullname(): string {
    return `${this.firstname} ${this.lastname}`;
  }

  get rawData(): IUser {
    return {
      id: this.id,
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
      roles: this.roles,
      teamId: this.teamId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      isConnectorActive: this.isConnectorActive,
      stats: this.stats.map((s) => s.rawData),
      companyId: this.companyId,
      longestStreak: this.longestStreak,
      currentStreak: this.currentStreak,
      hasLicense: this.hasLicense,
    };
  }

  addStats(stats: UserStats): void {
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

  getStatsByScoreById(id: string): UserStats[] {
    return this.stats.filter(({ scoreById }) => scoreById === id);
  }

  isAltoAdmin(): boolean {
    return this.roles.includes(UserDtoApiRolesEnumApi.AltoAdmin);
  }

  isCompanyAdmin(): boolean {
    return this.roles.includes(UserDtoApiRolesEnumApi.CompanyAdmin);
  }

  isCompanyUser(): boolean {
    return this.roles.includes(UserDtoApiRolesEnumApi.CompanyUser);
  }

  hasNoAccess(): boolean {
    return !this.isAltoAdmin() && !this.isCompanyAdmin() && !this.isCompanyUser();
  }
}

export interface IUserStats extends IBaseStats {
  nbDays: number;
  respondsRegularity: number;
  commentsCount: number;
  questionsSubmittedCount: number;
  contributionsCount: number;
  totalGuessesCountPerDay: number;
  questionsPushedCount?: number;
  validGuesssesCount?: number;
}

export class UserStats extends BaseStats {
  nbDays: number;
  respondsRegularity: number;
  commentsCount: number;
  questionsSubmittedCount: number;
  contributionsCount: number;
  totalGuessesCountPerDay: number;
  questionsPushedCount?: number;
  validGuesssesCount?: number;

  constructor(data: IUserStats) {
    super(data);
    this.nbDays = data.nbDays;
    this.respondsRegularity = data.respondsRegularity;
    this.commentsCount = data.commentsCount;
    this.questionsSubmittedCount = data.questionsSubmittedCount;
    this.contributionsCount = data.contributionsCount;
    this.totalGuessesCountPerDay = data.totalGuessesCountPerDay;
    this.questionsPushedCount = data.questionsPushedCount;
    this.validGuesssesCount = data.validGuesssesCount;
  }

  override get rawData(): IUserStats {
    return {
      ...super.rawData,
      from: this.from,
      to: this.to,
      score: this.score,
      totalGuessesCount: this.totalGuessesCount,
      nbDays: this.nbDays,
      respondsRegularity: this.respondsRegularity,
      commentsCount: this.commentsCount,
      questionsSubmittedCount: this.questionsSubmittedCount,
      contributionsCount: this.contributionsCount,
      totalGuessesCountPerDay: this.totalGuessesCountPerDay,
      questionsPushedCount: this.questionsPushedCount,
      validGuesssesCount: this.validGuesssesCount,
    };
  }
}
