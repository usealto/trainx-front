import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ChallengeDtoApi,
  ChallengeDtoApiTypeEnumApi,
  QuestionSubmittedStatusEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  UserDtoApi,
} from '@usealto/sdk-ts-angular';
import { EChartsOption } from 'echarts';
import { Observable, combineLatest, map, of, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { ChallengesRestService } from 'src/app/modules/challenges/services/challenges-rest.service';
import { ETypeValue } from 'src/app/modules/collaboration/components/lead-collaboration/lead-collaboration.component';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';
import { xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ScoreDuration, ScoreFilters } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from 'src/app/modules/statistics/services/statistics.service';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';

@UntilDestroy()
@Component({
  selector: 'alto-lead-home',
  templateUrl: './lead-home.component.html',
  styleUrls: ['./lead-home.component.scss'],
})
export class LeadHomeComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  ScoreDuration = ScoreDuration;
  ScoreTypeEnum = ScoreTypeEnumApi;
  ETypeValue = ETypeValue;

  userName = '';

  globalFilters: ScoreFilters = {
    duration: ScoreDuration.Trimester,
    type: ScoreTypeEnumApi.Team,
    teams: [],
  };

  scoreCount = 0;

  averageScore = 0;
  averageScoreProgression = 0;

  programsCount = 0;
  startedProgramsCount = 0;
  finishedProgramsCount = 0;
  averageFinishedPrograms = 0;
  averageFinishedProgramsProgression = 0;

  guessCount = 0;
  expectedGuessCount = 0;
  guessCountProgression = 0;

  commentsCount = 0;
  questionsCount = 0;
  statisticTimeRange: ScoreTimeframeEnumApi = ScoreTimeframeEnumApi.Week;
  //
  challengesByTeam: ChallengeDtoApi[] = [];
  challengesByUser: ChallengeDtoApi[] = [];
  //
  teamsLeaderboard: { name: string; score: number }[] = [];
  teamsLeaderboardCount = 0;
  usersLeaderboard: { name: string; score: number }[] = [];
  usersLeaderboardCount = 0;
  topflopLoaded = false;
  chartOption: EChartsOption = {};

  constructor(
    private readonly titleCasePipe: TitleCasePipe,
    private readonly commentsRestService: CommentsRestService,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
    private readonly challengesRestService: ChallengesRestService,
    private readonly userService: UsersRestService,
    private readonly statisticsServices: StatisticsService,
    public readonly teamStore: TeamStore,
    public readonly profileStore: ProfileStore,
    public readonly programsStore: ProgramsStore,
    public readonly programsRestService: ProgramsRestService,
    public readonly guessesRestService: GuessesRestService,
    public readonly companiesRestService: CompaniesRestService,
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.commentsRestService.getUnreadComments(),
      this.questionsSubmittedRestService.getQuestionsCount({
        status: QuestionSubmittedStatusEnumApi.Submitted,
      }),
      this.challengesRestService.getChallenges({ itemsPerPage: 40, sortBy: 'endDate:desc' }),
    ])
      .pipe(
        tap(([comments, submittedQuestionsCount, challenges]) => {
          this.commentsCount = comments.length;
          this.questionsCount = submittedQuestionsCount;
          this.challengesByTeam = challenges
            .filter((c) => c.type === ChallengeDtoApiTypeEnumApi.ByTeam)
            .slice(0, 5);
          this.challengesByUser = challenges
            .filter((c) => c.type === ChallengeDtoApiTypeEnumApi.ByUser)
            .slice(0, 5);
        }),
        tap(() => this.getAverageScore(this.globalFilters.duration as ScoreDuration)),
        tap(() => this.getProgramsStats(this.globalFilters)),
        tap(() => this.getGuessesCount(this.globalFilters.duration as ScoreDuration)),
        switchMap(() => this.getTopFlop(this.globalFilters.duration as ScoreDuration)),
        untilDestroyed(this),
      )
      .subscribe();
    this.createChart(this.globalFilters.duration as ScoreDuration);
  }

  createChart(duration: ScoreDuration) {
    const params = {
      duration: duration,
      type: ScoreTypeEnumApi.Guess,
      timeframe:
        duration === ScoreDuration.Year
          ? ScoreTimeframeEnumApi.Month
          : duration === ScoreDuration.Trimester
          ? ScoreTimeframeEnumApi.Week
          : ScoreTimeframeEnumApi.Day,
    };

    this.scoresRestService
      .getScores(params)
      .pipe(
        tap((res) => {
          this.scoreCount = res.scores.length;
          const scores = this.scoreService.reduceLineChartData(res.scores);
          const points = this.statisticsServices.transformDataToPoint(scores[0]);
          const labels = this.statisticsServices
            .formatLabel(
              points.map((p) => p.x),
              duration,
            )
            .map((s) => this.titleCasePipe.transform(s));

          this.chartOption = {
            xAxis: [{ ...xAxisDatesOptions, data: labels }],
            yAxis: [{ ...yAxisScoreOptions }],
            series: [
              {
                name: I18ns.shared.global,
                color: '#09479e',
                data: points.map((p) => (p.y ? Math.round((p.y * 10000) / 100) : (p.y as number))),
                type: 'line',
                showSymbol: false,
                tooltip: {
                  trigger: 'item',
                  valueFormatter: (value: any) => {
                    return value ? (value as number) + '%' : '';
                  },
                },
              },
            ],
          };
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  getTopFlop(duration: ScoreDuration) {
    return combineLatest([
      this.scoresRestService.getTeamsStats(duration),
      this.scoresRestService.getUsersStats(duration),
    ]).pipe(
      tap(([teams, users]) => {
        teams = teams.filter((t) => t.score && t.score >= 0);
        users = users.filter((u) => u.score && u.score >= 0);
        this.teamsLeaderboard = teams.map((t) => ({ name: t.team.name, score: t.score ?? 0 }));
        this.usersLeaderboard = users.map((u) => ({
          name: u.user.firstname + ' ' + u.user.lastname,
          score: u.score ?? 0,
        }));
        this.teamsLeaderboardCount = this.teamsLeaderboard.length;
        this.usersLeaderboardCount = this.usersLeaderboard.length;
        this.topflopLoaded = true;
      }),
    );
  }

  updateStatisticsDuration(duration: string) {
    this.globalFilters.duration = duration as ScoreDuration;
    this.getAverageScore(duration as ScoreDuration);
    this.getProgramsStats(this.globalFilters);
    this.getGuessesCount(duration as ScoreDuration);
    this.createChart(duration as ScoreDuration);
  }

  getAverageScore(duration: ScoreDuration) {
    return combineLatest([
      this.scoresRestService.getTeamsStats(duration),
      this.scoresRestService.getTeamsStats(duration, true),
    ])
      .pipe(
        tap(([current, previous]) => {
          current = current.filter((t) => t.score);
          previous = previous.filter((t) => t.score);
          const previousScore = previous.reduce((acc, team) => acc + (team.score ?? 0), 0) / previous.length;
          this.averageScore =
            current.filter((t) => t.score).reduce((acc, team) => acc + (team.score ?? 0), 0) / current.length;
          this.averageScoreProgression = previousScore
            ? (this.averageScore - previousScore) / previousScore
            : 0;
        }),
      )
      .subscribe();
  }

  getProgramsStats(filters: ScoreFilters) {
    combineLatest([
      this.scoresRestService.getProgramsStats(filters.duration as ScoreDuration),
      this.scoresRestService.getProgramsStats(filters.duration as ScoreDuration, true),
    ])
      .pipe(
        tap(([programsStats, lastProgramsStats]) => {
          this.programsCount = programsStats.length;
          this.finishedProgramsCount = programsStats.filter((p) => p.participation === 1).length;
          this.averageFinishedPrograms =
            this.finishedProgramsCount && this.programsCount
              ? this.finishedProgramsCount / this.programsCount
              : 0;
          const lastProgramsCount = lastProgramsStats.length;
          const lastFinishedProgramsCount = lastProgramsStats.filter((p) => p.participation === 1).length;
          const lastAverageFinishedPrograms =
            lastFinishedProgramsCount && lastProgramsCount
              ? lastFinishedProgramsCount / lastProgramsCount
              : 0;
          this.averageFinishedProgramsProgression =
            this.averageFinishedPrograms - lastAverageFinishedPrograms;
        }),
      )
      .subscribe();
  }

  getGuessesCount(duration: ScoreDuration) {
    combineLatest([
      this.guessesRestService.getGuesses({ itemsPerPage: 1 }, duration),
      this.guessesRestService.getGuesses({ itemsPerPage: 1 }, duration, true),
      this.scoresRestService.getTeamsStats(duration),
    ])
      .pipe(
        tap(([guesses, previousGuesses, teamsStats]) => {
          this.guessCount = guesses.meta.totalItems;
          this.guessCountProgression =
            previousGuesses.meta.totalItems && guesses.meta.totalItems
              ? (guesses.meta.totalItems - previousGuesses.meta.totalItems) / previousGuesses.meta.totalItems
              : 0;
          this.expectedGuessCount = teamsStats.reduce(
            (acc, team) => acc + (team.questionsPushedCount ?? 0),
            0,
          );
        }),
      )
      .subscribe();
  }

  @memoize()
  getUser(id: string): Observable<UserDtoApi | undefined> {
    if (!id) {
      return of(undefined);
    }
    return this.userService.getUsersFiltered({ ids: id }).pipe(map((u) => u.shift()));
  }
}
