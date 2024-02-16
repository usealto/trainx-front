import {
  ProgramStatsLightDtoApi,
  TagStatsLightDtoApi,
  TeamDtoApi,
  TeamStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import { BaseStats, IBaseStats } from './stats.model';
import { compareAsc } from 'date-fns';
import { BaseModel, IBaseModel } from './base.model';
import { EScoreDuration } from './score.model';

export interface ITeam extends IBaseModel {
  name: string;
  programIds: string[];
  stats: ITeamStats[];
}

export class Team extends BaseModel implements ITeam {
  name: string;
  programIds: string[];
  stats: TeamStats[];

  constructor(data: ITeam) {
    super(data);
    this.name = data.name;
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

  override get rawData(): ITeam {
    return {
      ...super.rawData,
      name: this.name,
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

  getStatByPeriod(duration: EScoreDuration, isPrev = false): TeamStats | undefined {
    const filteredStats = this.stats.filter(
      (stat) => stat.scoreDuration === duration && stat.isPrev === isPrev,
    );
    return filteredStats.length > 0 ? filteredStats[0] : undefined;
  }
}

export interface ITeamStats extends IBaseStats {
  programStats: ITeamProgramStats[];
  teamId: string;
  questionsPushedCount: number;
  commentsCount: number;
  questionsSubmittedCount: number;
  validGuessesCount: number;
  tagStats: ITeamTagStats[];
  scoreDuration: EScoreDuration;
  isPrev: boolean;
}

export class TeamStats extends BaseStats implements ITeamStats {
  programStats: TeamProgramStats[];
  teamId: string;
  questionsPushedCount: number;
  commentsCount: number;
  questionsSubmittedCount: number;
  validGuessesCount: number;
  tagStats: TeamTagStats[];
  scoreDuration: EScoreDuration;
  isPrev: boolean;

  constructor(data: ITeamStats) {
    super(data);
    this.teamId = data.teamId;
    this.questionsPushedCount = data.questionsPushedCount;
    this.commentsCount = data.commentsCount;
    this.questionsSubmittedCount = data.questionsSubmittedCount;
    this.validGuessesCount = data.validGuessesCount;
    this.tagStats = data.tagStats.map((s) => new TeamTagStats(s));
    this.programStats = data.programStats.map((s) => new TeamProgramStats(s));
    this.scoreDuration = data.scoreDuration;
    this.isPrev = data.isPrev;
  }

  static fromDto(
    data: TeamStatsDtoApi,
    from: Date,
    to: Date,
    duration: EScoreDuration,
    isPrev: boolean,
  ): TeamStats {
    return new TeamStats({
      teamId: data.team.id,
      from,
      to,
      questionsPushedCount: data.questionsPushedCount || 0,
      commentsCount: data.commentsCount || 0,
      questionsSubmittedCount: data.questionsSubmittedCount || 0,
      validGuessesCount: data.validGuessesCount || 0,
      score: data.score || 0,
      totalGuessesCount: data.totalGuessesCount || 0,
      tagStats: data.tags?.map((tag) => TeamTagStats.fromDto(tag)) || [],
      programStats: data.programs?.map((program) => TeamProgramStats.fromDto(program)) || [],
      scoreDuration: duration,
      isPrev,
    });
  }

  override get rawData(): ITeamStats {
    return {
      ...super.rawData,
      teamId: this.teamId,
      questionsPushedCount: this.questionsPushedCount,
      commentsCount: this.commentsCount,
      questionsSubmittedCount: this.questionsSubmittedCount,
      validGuessesCount: this.validGuessesCount,
      tagStats: this.tagStats,
      programStats: this.programStats,
      scoreDuration: this.scoreDuration,
      isPrev: this.isPrev,
    };
  }
}

export interface ITeamProgramStats {
  programId: string;
  totalGuessesCount: number;
  validGuessesCount: number;
  score: number;
}

export class TeamProgramStats implements ITeamProgramStats {
  programId: string;
  totalGuessesCount: number;
  validGuessesCount: number;
  score: number;

  constructor(data: ITeamProgramStats) {
    this.programId = data.programId;
    this.totalGuessesCount = data.totalGuessesCount;
    this.validGuessesCount = data.validGuessesCount;
    this.score = data.score;
  }

  static fromDto(data: ProgramStatsLightDtoApi): TeamProgramStats {
    return new TeamProgramStats({
      programId: data.program.id,
      totalGuessesCount: data.totalGuessesCount || 0,
      validGuessesCount: data.validGuessesCount || 0,
      score: data.score || 0,
    });
  }

  get rawData(): ITeamProgramStats {
    return {
      programId: this.programId,
      totalGuessesCount: this.totalGuessesCount,
      validGuessesCount: this.validGuessesCount,
      score: this.score,
    };
  }
}

export interface ITeamTagStats {
  tagId: string;
  name: string;
  totalGuessesCount: number;
  validGuessesCount: number;
  score: number;
}

export class TeamTagStats implements ITeamTagStats {
  tagId: string;
  name: string;
  totalGuessesCount: number;
  validGuessesCount: number;
  score: number;

  constructor(data: ITeamTagStats) {
    this.tagId = data.tagId;
    this.name = data.name;
    this.totalGuessesCount = data.totalGuessesCount;
    this.validGuessesCount = data.validGuessesCount;
    this.score = data.score;
  }

  static fromDto(data: TagStatsLightDtoApi): TeamTagStats {
    return new TeamTagStats({
      tagId: data.tag.id,
      name: data.tag.name,
      totalGuessesCount: data.totalGuessesCount || 0,
      validGuessesCount: data.validGuessesCount || 0,
      score: data.score || 0,
    });
  }

  get rawData(): ITeamTagStats {
    return {
      tagId: this.tagId,
      name: this.name,
      totalGuessesCount: this.totalGuessesCount,
      validGuessesCount: this.validGuessesCount,
      score: this.score,
    };
  }
}
