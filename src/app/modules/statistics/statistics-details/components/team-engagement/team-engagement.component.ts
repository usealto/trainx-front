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
import { Subscription, combineLatest, of, startWith, switchMap, tap } from 'rxjs';
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
  users: User[] = [];

  durationControl: FormControl<EScoreDuration> = new FormControl<EScoreDuration>(EScoreDuration.Trimester, {
    nonNullable: true,
  });

  answersChart: any;
  answersChartStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  membersLeaderboard: { name: string; score: number; progression: number }[] = [];
  membersLeaderboardStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  contributionChart: any;
  contributionChartStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  membersTable: DataForTable[] = [];
  membersTableSearchControl = new FormControl<string | null>(null);
  paginatedMembersTable: DataForTable[] = [];
  membersTablePageSize = 5;
  membersTableStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  hasConnector = false;

  pageControl: FormControl<number> = new FormControl(1, { nonNullable: true });
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
    this.users = Array.from((data[EResolvers.AppResolver] as IAppData).userById.values());

    this.teamEngagementComponentSubscription.add(
      combineLatest([
        this.durationControl.valueChanges.pipe(startWith(this.durationControl.value)),
        this.membersTableSearchControl.valueChanges.pipe(startWith(this.membersTableSearchControl.value)),
      ])
        .pipe(
          tap(() => {
            this.answersChartStatus = EPlaceholderStatus.LOADING;
            this.membersLeaderboardStatus = EPlaceholderStatus.LOADING;
            this.contributionChartStatus = EPlaceholderStatus.LOADING;
          }),
          switchMap(([duration, search]) => {
            return combineLatest([
              of(duration),
              of(search),
              this.scoreRestService.getScores(this.getScoreParams('answers', duration)),
              this.scoreRestService.getPaginatedUsersStats(duration, false, { teamIds: this.team.id }),
              this.scoreRestService.getPaginatedUsersStats(duration, true, { teamIds: this.team.id }),
              this.scoreRestService.getScores(this.getScoreParams('comments', duration)),
              this.scoreRestService.getScores(this.getScoreParams('submitedQuestions', duration)),
            ]);
          }),
        )
        .subscribe(
          ([
            duration,
            search,
            answersScores,
            { data: usersStats = [] },
            { data: prevUsersStats = [] },
            commentsScores,
            submitedCommentsScores,
          ]) => {
            this.createAnswersChart(answersScores, duration);
            this.getMembersTable(usersStats, prevUsersStats, this.company, search);
            this.getMembersLeaderboard(usersStats, prevUsersStats);
            this.createContributionsChart(commentsScores, submitedCommentsScores, duration);
          },
        ),
    );

    this.teamEngagementComponentSubscription.add(
      this.pageControl.valueChanges.subscribe((page) => {
        this.changeMembersTablePage(page);
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
      .map((s) => this.titleCasePipe.transform(s));

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
    this.contributionChartStatus =
      comments.length > 0 || submitedQuestions.length > 0
        ? EPlaceholderStatus.GOOD
        : EPlaceholderStatus.NO_DATA;
  }

  getMembersTable(
    users: UserStatsDtoApi[],
    previousUsers: UserStatsDtoApi[],
    company: CompanyDtoApi,
    search: string | null,
  ): void {
    this.hasConnector = company.isConnectorActive ?? false;
    let temp = users;
    if (search) {
      const regex = new RegExp(search, 'i');
      temp = temp.filter((u) => {
        return regex.test(u.user.firstname) || regex.test(u.user.lastname) || regex.test(u.user.email);
      });
    }
    this.membersTable = this.users.map((user) => {
      const userStats = temp.find((u) => u.user.id === user.id) ?? ({} as UserStatsDtoApi);
      const prevUser = previousUsers.find((u) => u.user.id === user.id) ?? ({} as UserStatsDtoApi);
      return this.dataFormUserTableMapper(user, userStats, prevUser);
    });
    this.membersTableStatus =
      this.membersTable.length > 0 ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_DATA;
    this.changeMembersTablePage(1);
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

  private changeMembersTablePage(page: number): void {
    this.paginatedMembersTable = this.membersTable.slice(
      (page - 1) * this.membersTablePageSize,
      page * this.membersTablePageSize,
    );
  }

  getMembersLeaderboard(current: UserStatsDtoApi[], previous: UserStatsDtoApi[]) {
    current = current.filter((t) => t.score && t.score >= 0);
    previous = previous.filter((t) => t.score && t.score >= 0);
    this.membersLeaderboard = current
      .map((c) => {
        const previousScore = previous.find((p) => p.user.id === c.user.id)?.score;
        const progression = this.scoreService.getProgression(c.score, previousScore);
        return {
          name: c.user.firstname + ' ' + c.user.lastname,
          score: c.totalGuessesCount ?? 0,
          progression: progression ?? 0,
        };
      })
      .sort((a, b) => b.score - a.score);
    this.membersLeaderboardStatus =
      this.membersLeaderboard.length > 0 ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_DATA;
  }

  createAnswersChart(scores: Score[], duration: EScoreDuration): void {
    const formatedScores = this.scoreService.formatScores(scores);
    const aggregatedData = this.statisticsService.transformDataToPointByCounts(formatedScores[0]);
    const labels = this.statisticsService
      .formatLabel(
        aggregatedData.map((d) => d.x),
        duration,
      )
      .map((s) => this.titleCasePipe.transform(s));

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
    this.answersChartStatus = scores.length > 0 ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_DATA;
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
