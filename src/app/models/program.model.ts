import { ProgramDtoApi, ProgramDtoApiPriorityEnumApi } from '@usealto/sdk-ts-angular';
import { compareAsc } from 'date-fns';
import { BaseModel, IBaseModel } from './base.model';
import { BaseStats, IBaseStats } from './stats.model';

export interface IProgram extends IBaseModel {
  name: string;
  isActive: boolean;
  description?: string;
  expectation: number;
  priority: ProgramDtoApiPriorityEnumApi;
  showTimer: boolean;
  teamIds: string[];
  questionsCount: number;
  stats: IProgramStats[];
  isAccelerated: boolean;
}

export class Program extends BaseModel implements IProgram {
  name: string;
  isActive: boolean;
  description?: string;
  expectation: number;
  priority: ProgramDtoApiPriorityEnumApi;
  showTimer: boolean;
  teamIds: string[];
  questionsCount: number;
  stats: ProgramStats[];
  isAccelerated: boolean;

  constructor(data: IProgram) {
    super(data);
    this.name = data.name;
    this.id = data.id;
    this.isActive = data.isActive;
    this.description = data.description;
    this.expectation = data.expectation;
    this.priority = data.priority;
    this.showTimer = data.showTimer;
    this.teamIds = data.teamIds;
    this.questionsCount = data.questionsCount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
    this.stats = data.stats.map((s) => new ProgramStats(s));
    this.isAccelerated = data.isAccelerated;
  }

  static fromDto(data: ProgramDtoApi): Program {
    return new Program({
      name: data.name,
      id: data.id,
      isActive: data.isActive,
      description: data.description,
      expectation: data.expectation,
      priority: data.priority,
      showTimer: data.showTimer,
      teamIds: data.teams?.map(({ id }) => id) ?? [],
      questionsCount: data.questionsCount,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
      stats: [],
      isAccelerated: data.isAccelerated,
    });
  }

  addStats(stats: ProgramStats): void {
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

  override get rawData(): IProgram {
    return {
      ...super.rawData,
      name: this.name,
      isActive: this.isActive,
      description: this.description,
      expectation: this.expectation,
      priority: this.priority,
      showTimer: this.showTimer,
      teamIds: this.teamIds,
      questionsCount: this.questionsCount,
      stats: this.stats.map((s) => s.rawData),
      isAccelerated: this.isAccelerated,
    };
  }

  getStatsByScoreById(id: string): ProgramStats[] {
    return this.stats.filter(({ scoreById }) => scoreById === id);
  }
}

export interface IProgramStats extends IBaseStats {
  participation: number;
  progress: number;
  totalUsersCount: number;
  userParticipationCount: number;
  userCompletedProgramCount: number;
  userValidatedProgramCount: number;
}

export class ProgramStats extends BaseStats {
  participation: number;
  progress: number;
  totalUsersCount: number;
  userParticipationCount: number;
  userCompletedProgramCount: number;
  userValidatedProgramCount: number;

  constructor(data: IProgramStats) {
    super(data);
    this.participation = data.participation;
    this.progress = data.progress;
    this.totalUsersCount = data.totalUsersCount;
    this.userParticipationCount = data.userParticipationCount;
    this.userCompletedProgramCount = data.userCompletedProgramCount;
    this.userValidatedProgramCount = data.userValidatedProgramCount;
  }

  override get rawData(): IProgramStats {
    return {
      ...super.rawData,
      from: this.from,
      to: this.to,
      score: this.score,
      totalGuessesCount: this.totalGuessesCount,
      participation: this.participation,
      progress: this.progress,
      totalUsersCount: this.totalUsersCount,
      userParticipationCount: this.userParticipationCount,
      userCompletedProgramCount: this.userCompletedProgramCount,
      userValidatedProgramCount: this.userValidatedProgramCount,
    };
  }
}
