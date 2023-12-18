import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  TeamStatsDtoApi,
  UserDtoApi,
} from '@usealto/sdk-ts-angular';
import { EChartsOption } from 'echarts';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { IHomeData } from 'src/app/core/resolvers/home.resolver';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { IUser, User } from 'src/app/models/user.model';
import { ETypeValue } from 'src/app/modules/collaboration/components/lead-collaboration/lead-collaboration.component';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration, ScoreFilters } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from 'src/app/modules/statistics/services/statistics.service';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';
import { IAppData } from '../../../../core/resolvers';

@UntilDestroy()
@Component({
  selector: 'alto-lead-home',
  templateUrl: './lead-home.component.html',
  styleUrls: ['./lead-home.component.scss'],
})
export class LeadHomeComponent implements OnInit {
  me: User = new User({} as IUser);

  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  ScoreDuration = ScoreDuration;
  ScoreTypeEnum = ScoreTypeEnumApi;
  ETypeValue = ETypeValue;
  programDataStatus: PlaceholderDataStatus = 'loading';
  isData = false;
  chartDataStatus: PlaceholderDataStatus = 'loading';

  globalFilters: ScoreFilters = {
    duration: ScoreDuration.Year,
    type: ScoreTypeEnumApi.Team,
    teams: [],
  };

  scoreCount = 0;
  averageScore = 0;
  averageScoreProgression?: number;

  programsCount = 0;
  startedProgramsCount = 0;
  finishedProgramsCount = 0;
  averageFinishedPrograms = 0;
  averageFinishedProgramsProgression?: number;

  guessCount = 0;
  expectedGuessCount = 0;
  guessCountProgression?: number;

  commentsCount = 0;
  commentsDataStatus: PlaceholderDataStatus = 'loading';
  questionsCount = 0;
  questionsDataStatus: PlaceholderDataStatus = 'loading';
  statisticTimeRange: ScoreTimeframeEnumApi = ScoreTimeframeEnumApi.Week;
  //
  teamsLeaderboard: { name: string; score: number }[] = [];
  teamsLeaderboardCount = 0;
  teamsLeaderboardDataStatus: PlaceholderDataStatus = 'loading';
  usersLeaderboard: { name: string; score: number }[] = [];
  usersLeaderboardCount = 0;
  usersLeaderboardDataStatus: PlaceholderDataStatus = 'loading';
  topflopLoaded = false;
  chartOption: EChartsOption = {};

  constructor(
    private readonly titleCasePipe: TitleCasePipe,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
    private readonly userService: UsersRestService,
    private readonly statisticsServices: StatisticsService,
    public readonly teamStore: TeamStore,
    public readonly profileStore: ProfileStore,
    public readonly programsStore: ProgramsStore,
    public readonly programsRestService: ProgramsRestService,
    public readonly guessesRestService: GuessesRestService,
    public readonly companiesRestService: CompaniesRestService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.me = (data[EResolvers.AppResolver] as IAppData).me;
    this.commentsCount = (data[EResolvers.HomeResolver] as IHomeData).comments.length;
    this.commentsDataStatus = this.commentsCount === 0 ? 'noData' : 'good';
    this.questionsCount = (data[EResolvers.HomeResolver] as IHomeData).questionsCount;
    this.questionsDataStatus = this.questionsCount === 0 ? 'noData' : 'good';
    this.getAverageScore(this.globalFilters.duration as ScoreDuration, [
      (data[EResolvers.HomeResolver] as IHomeData).teamsStats,
      (data[EResolvers.HomeResolver] as IHomeData).previousTeamsStats,
    ]);

    this.createChart(this.globalFilters.duration as ScoreDuration);
    this.getProgramsStats(this.globalFilters);
    this.getGuessesCount(this.globalFilters.duration as ScoreDuration);
    this.getTopFlop(this.globalFilters.duration as ScoreDuration)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  getProgramDataStatus() {
    if (!(this.averageScore || (this.programsCount || this.expectedGuessCount || 0) > 0)) {
      this.programDataStatus = 'noData';
    } else {
      this.programDataStatus = 'good';
    }
  }

  createChart(duration: ScoreDuration) {
    const params = {
      duration: duration,
      type: ScoreTypeEnumApi.Guess,
      timeframe: ScoreTimeframeEnumApi.Month,
    };

    this.scoresRestService
      .getScores(params)
      .pipe(
        tap((res) => {
          this.scoreCount = res.scores.length;
          this.chartDataStatus = this.scoreCount === 0 ? 'noData' : 'good';
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
                color: '#fdb022',
                data: points.map((p) => (p.y ? Math.round((p.y * 10000) / 100) : (p.y as number))),
                type: 'line',
                showSymbol: false,
                tooltip: {
                  valueFormatter: (value: any) => {
                    return value ? (value as number) + '%' : '';
                  },
                },
              },
            ],
            legend: legendOptions,
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
        this.teamsLeaderboardDataStatus = this.teamsLeaderboardCount === 0 ? 'noData' : 'good';
        this.usersLeaderboardCount = this.usersLeaderboard.length;
        this.usersLeaderboardDataStatus = this.usersLeaderboardCount === 0 ? 'noData' : 'good';
        this.topflopLoaded = true;
      }),
    );
  }

  getAverageScore(duration: ScoreDuration, [current, previous]: TeamStatsDtoApi[][] = []) {
    if (current && previous) {
      this.setAverageScore(current, previous);
    } else {
      combineLatest([
        this.scoresRestService.getTeamsStats(duration),
        this.scoresRestService.getTeamsStats(duration, true),
      ])
        .pipe(
          tap(([current, previous]) => {
            this.setAverageScore(current, previous);
          }),
        )
        .subscribe();
    }
  }

  setAverageScore(current: TeamStatsDtoApi[], previous: TeamStatsDtoApi[]) {
    current = current.filter((t) => t.score);
    previous = previous.filter((t) => t.score);
    const previousScore = previous.reduce((acc, team) => acc + (team.score ?? 0), 0) / previous.length;
    this.averageScore =
      current.filter((t) => t.score).reduce((acc, team) => acc + (team.score ?? 0), 0) / current.length;
    this.averageScoreProgression = previousScore ? (this.averageScore - previousScore) / previousScore : 0;
    this.getProgramDataStatus();
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
  getUser(id?: string): Observable<UserDtoApi | undefined> {
    if (!id) {
      return of(undefined);
    }
    return this.userService.getUsersFiltered({ ids: id }).pipe(map((u) => u.shift()));
  }
}
