import { TeamDtoApi, TeamStatsDtoApi } from '@usealto/sdk-ts-angular';
import { BaseStats, IBaseStats } from './stats.model';
import { compareAsc } from 'date-fns';
import { TagStatsLight } from './tags.model';
import { ProgramStatsLight } from './programs.model';
import { ScoreDuration } from '../modules/shared/models/score.model';


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
  teamId: string;
  questionsPushedCount: number;
  commentsCount: number;
  questionsSubmittedCount: number;
  validGuessesCount: number;
  tagStats: TagStatsLight[];
  programStats: ProgramStatsLight[];
  scoreDuration: ScoreDuration;
  isPrev: boolean;
}

export class TeamStats extends BaseStats {
  teamId: string;
  questionsPushedCount: number;
  commentsCount: number;
  questionsSubmittedCount: number;
  validGuessesCount: number;
  tagStats: TagStatsLight[];
  programStats: ProgramStatsLight[];
  scoreDuration: ScoreDuration;
  isPrev: boolean;

  constructor(data: ITeamStats) {
    super(data);
    this.teamId = data.teamId;
    this.questionsPushedCount = data.questionsPushedCount;
    this.commentsCount = data.commentsCount;
    this.questionsSubmittedCount = data.questionsSubmittedCount;
    this.validGuessesCount = data.validGuessesCount;
    this.tagStats = data.tagStats || [];
    this.programStats = data.programStats || [];
    this.scoreDuration = data.scoreDuration;
    this.isPrev = data.isPrev;
  }

  static fromDto(data: TeamStatsDtoApi, from: Date, to: Date, duration: ScoreDuration, isPrev: boolean): TeamStats {
    return new TeamStats({
      teamId: data.team.id,
      from: from,
      to: to,
      questionsPushedCount: data.questionsPushedCount || 0,
      commentsCount: data.commentsCount || 0,
      questionsSubmittedCount: data.questionsSubmittedCount || 0,
      validGuessesCount: data.validGuessesCount || 0,
      score: data.score || 0,
      totalGuessesCount: data.totalGuessesCount || 0,
      tagStats: data.tags?.map((tag) => TagStatsLight.fromDto(tag)) || [],
      programStats: data.programs?.map((program) => ProgramStatsLight.fromDto(program)) || [],
      scoreDuration: duration,
      isPrev: isPrev,
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

  static getStatsForPeriod(
    teamsStatsMap: Map<string, TeamStats[]>,
    duration: ScoreDuration,
    isPrev = false,
  ): TeamStats[] {
    const statsForPeriod: TeamStats[] = [];
    teamsStatsMap.forEach((statsList) => {
      const filteredStat = TeamStats.filterStatsByDurationAndPeriod(statsList, duration, isPrev);

      if (filteredStat) {
        statsForPeriod.push(filteredStat);
      }
    });

    return statsForPeriod;
  }

  static filterStatsByDurationAndPeriod(
    statsList: TeamStats[],
    duration: ScoreDuration,
    isPrev: boolean,
  ): TeamStats | undefined {
    const filteredStats = statsList.filter((stat) => stat.scoreDuration === duration && stat.isPrev === isPrev);
    return filteredStats.length > 0 ? filteredStats[0] : undefined;
  }
}
