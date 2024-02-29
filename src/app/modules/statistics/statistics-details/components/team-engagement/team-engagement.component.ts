import { TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CompanyDtoApi,
  ScoreByTypeEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  UserStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, concat, debounceTime, of, startWith, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { Company } from 'src/app/models/company.model';
import { EScoreDuration, Score } from 'src/app/models/score.model';
import { Team } from 'src/app/models/team.model';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { IAppData } from '../../../../../core/resolvers';
import { User } from '../../../../../models/user.model';
import { DataForTable } from '../../../models/statistics.model';
import { StatisticsService } from '../../../services/statistics.service';
import { ILeaderboardData } from '../../../../shared/components/leaderboard/leaderboard.component';

@Component({
  selector: 'alto-team-engagement',
  templateUrl: './team-engagement.component.html',
  styleUrls: ['./team-engagement.component.scss'],
})
export class TeamEngagementComponent implements OnInit, OnDestroy {
  I18ns = I18ns;
  EmojiName = EmojiName;
  AltoRoutes = AltoRoutes;
  EPlaceholderStatus = EPlaceholderStatus;

  team!: Team;
  company!: Company;
  usersById: Map<string, User> = new Map();

  durationControl: FormControl<EScoreDuration> = new FormControl<EScoreDuration>(EScoreDuration.Trimester, {
    nonNullable: true,
  });

  answersChart: any;
  answersChartStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  membersLeaderboard: ILeaderboardData[] = [];
  membersLeaderboardStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  contributionChart: any;
  contributionChartStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  membersTable: DataForTable[] = [];
  membersTableSearchControl = new FormControl<string | null>(null);
  membersTablePageSize = 5;
  membersTableStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  membersTablePageControl: FormControl<number> = new FormControl(1, { nonNullable: true });
  membersTableItemsCount = 0;

  private teamEngagementComponentSubscription = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly scoreRestService: ScoresRestService,
    private readonly statisticsService: StatisticsService,
    private readonly titleCasePipe: TitleCasePipe,
    private readonly scoreService: ScoresService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    const teamId = this.router.url.split('/').pop() || '';
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.company = (data[EResolvers.AppResolver] as IAppData).company;
    this.team = this.company.teams.find((u) => u.id === teamId) as Team;
    this.usersById = (data[EResolvers.AppResolver] as IAppData).userById;

    this.teamEngagementComponentSubscription.add(
      this.durationControl.valueChanges
        .pipe(startWith(this.durationControl.value))
        .pipe(
          switchMap((duration) => {
            return combineLatest([
              of(duration),
              this.scoreRestService.getAllUsersStats(duration, false, {teamIds: this.team.id}),
              this.scoreRestService.getAllUsersStats(duration, true, {teamIds: this.team.id}),
              this.scoreRestService.getScores(this.getScoreParams('answers', duration)),
              this.scoreRestService.getScores(this.getScoreParams('comments', duration)),
              this.scoreRestService.getScores(this.getScoreParams('submitedQuestions', duration)),
            ]);
          }),
        )
        .subscribe({
          next: ([
            duration,
            usersStats,
            prevUsersStats,
            anwsersScores,
            commentsScores,
            submittedQuestionsScores,
          ]) => {
            this.createAnswersChart(anwsersScores, duration);
            this.createContributionsChart(commentsScores, submittedQuestionsScores, duration);

            this.membersLeaderboard = usersStats
              .map((userStats) => {
                const previousGuessesCount = prevUsersStats.find((u) => u.user.id === userStats.user.id)?.totalGuessesCount;
                const progression = this.scoreService.getProgression(userStats.totalGuessesCount, previousGuessesCount);

                return {
                  name: this.usersById.get(userStats.user.id)?.fullname ?? '',
                  score: userStats.totalGuessesCount ?? 0,
                  progression: progression ?? 0,
                }
              }
              )

            this.membersLeaderboardStatus =
              this.membersLeaderboard.length > 0 ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_DATA;

            this.answersChartStatus =
              anwsersScores.length > 0 ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_DATA;

            this.contributionChartStatus =
              commentsScores.length > 0 || submittedQuestionsScores.length > 0
                ? EPlaceholderStatus.GOOD
                : EPlaceholderStatus.NO_DATA;
          },
        }),
    );

    this.teamEngagementComponentSubscription.add(
      combineLatest([
        this.membersTablePageControl.valueChanges.pipe(startWith(this.membersTablePageControl.value)),
        combineLatest([
          concat(
            of(this.membersTableSearchControl.value),
            this.membersTableSearchControl.valueChanges.pipe(debounceTime(300)),
          ),
          this.durationControl.valueChanges.pipe(startWith(this.durationControl.value)),
        ]).pipe(tap(() => this.membersTablePageControl.setValue(1))),
      ])
        .pipe(
          switchMap(([page, [search, duration]]) => {
            return this.scoreRestService
              .getPaginatedUsersStats(duration, false, {
                teamIds: this.team.id,
                itemsPerPage: this.membersTablePageSize,
                page: page,
                search: search || undefined,
              })
              .pipe(
                switchMap((paginatedUsersStats) => {
                  this.membersTableItemsCount = paginatedUsersStats.meta.totalItems;
                  return combineLatest([
                    of(paginatedUsersStats),
                    this.scoreRestService.getPaginatedUsersStats(duration, true, {
                      teamIds: this.team.id,
                      ids: paginatedUsersStats.data?.map((u) => u.user.id).join(',') ?? undefined,
                      itemsPerPage: this.membersTablePageSize,
                    }),
                  ]);
                }),
              );
          }),
        )
        .subscribe(([{ data: usersStats = [] }, { data: prevUsersStats = [] }]) => {
          this.getMembersTable(usersStats, prevUsersStats);

          this.membersTableStatus =
            usersStats.length > 0 ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_DATA;
        }),
    );
  }

  ngOnDestroy(): void {
    this.teamEngagementComponentSubscription.unsubscribe();
  }

  createContributionsChart(comments: Score[], submitedQuestions: Score[], duration: EScoreDuration): void {
    const formattedComments = this.scoreService.formatScores(comments);
    const formattedSubmitedQuestions = this.scoreService.formatScores(submitedQuestions);

    const [aggregatedFormattedCommentsScores, aggregatedFormattedSubmittedQuestionsScores] =
      this.scoreService.formatScores([formattedComments[0], formattedSubmitedQuestions[0]]);

    const aggregatedComments = this.statisticsService.transformDataToPointByCounts(
      aggregatedFormattedCommentsScores,
    );
    const aggregatedQuestionsSubmitted = this.statisticsService.transformDataToPointByCounts(
      aggregatedFormattedSubmittedQuestionsScores,
    );
    const labels = this.statisticsService
      .formatLabel(
        aggregatedComments.map((d) => d.x),
        duration,
      )

    const dataset = [
      {
        label: I18ns.statistics.globalEngagement.engagement.comments,
        data: aggregatedComments.map((d) => d.y),
        color: '#53b1fd',
      },
      {
        label: I18ns.statistics.globalEngagement.engagement.suggQuestions,
        data: aggregatedQuestionsSubmitted.map((d) => d.y),
        color: '#9b8afb',
      },
    ];
    const series = dataset.map((d) => {
      return {
        name: d.label,
        data: d.data,
        type: 'line',
        showSymbol: false,
        color: d.color,
      };
    });

    this.contributionChart = {
      xAxis: [
        {
          ...xAxisDatesOptions,
          data: labels,
        },
      ],
      yAxis: [
        {
          ...yAxisScoreOptions,
          max: undefined,
          interval: undefined,
          name: I18ns.charts.collaborationCountLabel,
        },
      ],
      series: series,
      legend: legendOptions,
    };
  }

  getMembersTable(usersStats: UserStatsDtoApi[], prevUsersStats: UserStatsDtoApi[]): void {
    this.membersTable = usersStats.map((userStat) => {
      const user = this.usersById.get(userStat.user.id) ?? ({} as User);
      const prevUser = prevUsersStats.find((u) => u.user.id === userStat.user.id) ?? ({} as UserStatsDtoApi);
      return this.dataFormUserTableMapper(user, userStat, prevUser);
    });
  }

  private dataFormUserTableMapper(
    user: User,
    userStat: UserStatsDtoApi,
    prevUser: UserStatsDtoApi,
  ): DataForTable {
    const totalGuessCount = userStat.totalGuessesCount
      ? userStat.totalGuessesCount > (userStat.questionsPushedCount ?? 0)
        ? userStat.questionsPushedCount
        : userStat.totalGuessesCount
      : 0;
    return {
      owner: user,
      globalScore: 0,
      answeredQuestionsCount: totalGuessCount ?? 0,
      answeredQuestionsProgression:
        totalGuessCount && userStat.questionsPushedCount
          ? Math.round((totalGuessCount / userStat.questionsPushedCount) * 100)
          : 0,
      questionsPushedCount: userStat.questionsPushedCount ?? 0,
      commentsCount: userStat.commentsCount ?? 0,
      commentsProgression:
        this.scoreService.getProgression(userStat.commentsCount, prevUser?.commentsCount) ?? 0,
      submittedQuestionsCount: userStat.questionsSubmittedCount,
      submittedQuestionsProgression:
        this.scoreService.getProgression(
          userStat.questionsSubmittedCount,
          prevUser?.questionsSubmittedCount,
        ) ?? 0,
      leastMasteredTags: [''],
    } as DataForTable;
  }

  createAnswersChart(scores: Score[], duration: EScoreDuration): void {
    const formatedScores = this.scoreService.formatScores(scores);
    const aggregatedData = this.statisticsService.transformDataToPointByCounts(formatedScores[0]);
    const labels = this.statisticsService
      .formatLabel(
        aggregatedData.map((d) => d.x),
        duration,
      )

    const dataset = formatedScores.map((s) => {
      const d = this.statisticsService.transformDataToPointByCounts(s);
      return {
        label: s.label,
        data: d.map((d) => d.y),
      };
    });

    const series = dataset.map((d) => {
      return {
        name: I18ns.charts.answeredQuestions,
        data: d.data,
        type: 'line',
        showSymbol: false,
        color: '#FD853A',
      };
    });

    this.answersChart = {
      xAxis: [
        {
          ...xAxisDatesOptions,
          data: labels,
        },
      ],
      yAxis: [
        {
          ...yAxisScoreOptions,
          max: undefined,
          interval: undefined,
          name: I18ns.charts.answerCountLabel,
        },
      ],
      series: series,
      legend: legendOptions,
    };
  }

  getScoreParams(type: 'answers' | 'comments' | 'submitedQuestions', duration: EScoreDuration): ChartFilters {
    return {
      duration: duration,
      type:
        type === 'answers'
          ? ScoreTypeEnumApi.Guess
          : type === 'comments'
          ? ScoreTypeEnumApi.Comment
          : ScoreTypeEnumApi.QuestionSubmitted,
      scoredBy: ScoreByTypeEnumApi.Team,
      scoredById: this.team.id,
      timeframe:
        duration === EScoreDuration.Year
          ? ScoreTimeframeEnumApi.Month
          : duration === EScoreDuration.Trimester
          ? ScoreTimeframeEnumApi.Week
          : ScoreTimeframeEnumApi.Day,
    };
  }
}
