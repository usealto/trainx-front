import { TeamDtoApi } from '@usealto/sdk-ts-angular';
import { BaseStats, IBaseStats } from './stats.model';
import { compareAsc } from 'date-fns';

export interface ITeam {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  programIds: string[];
  stats: ITeamStats[];
}

export class Team implements ITeam {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  programIds: string[];
  stats: TeamStats[];

  constructor(data: ITeam) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.programIds = data.programIds;
    this.stats = data.stats.map((s) => new TeamStats(s));
  }

  static fromDto(data: TeamDtoApi): Team {
    return new Team({
      id: data.id,
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
      programIds: data.programs.map(({ id }) => id),
      stats: [],
    });
  }

  get rawData(): ITeam {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      programIds: this.programIds,
      stats: this.stats.map((s) => s.rawData),
    };
  }

  addStats(stats: TeamStats): void {
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

  getStatsByScoreById(id: string): TeamStats[] {
    return this.stats.filter(({ scoreById }) => scoreById === id);
  }
}

export interface ITeamStats extends IBaseStats {
  questionsPushedCount: number;
  commentsCount: number;
  questionsSubmittedCount: number;
  validGuessesCount: number;
}

export class TeamStats extends BaseStats {
  questionsPushedCount: number;
  commentsCount: number;
  questionsSubmittedCount: number;
  validGuessesCount: number;

  constructor(data: ITeamStats) {
    super(data);
    this.questionsPushedCount = data.questionsPushedCount;
    this.commentsCount = data.commentsCount;
    this.questionsSubmittedCount = data.questionsSubmittedCount;
    this.validGuessesCount = data.validGuessesCount;
  }

  override get rawData(): ITeamStats {
    return {
      ...super.rawData,
      questionsPushedCount: this.questionsPushedCount,
      commentsCount: this.commentsCount,
      questionsSubmittedCount: this.questionsSubmittedCount,
      validGuessesCount: this.validGuessesCount,
    };
  }
}
