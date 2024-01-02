import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CompanyDtoApi,
  ScoreByTypeEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  UserStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import { combineLatest, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { Company, ICompany } from 'src/app/models/company.model';
import { Score } from 'src/app/models/score.model';
import { Team } from 'src/app/models/team.model';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { IAppData } from '../../../../../core/resolvers';
import { DataForTable } from '../../../models/statistics.model';
import { StatisticsService } from '../../../services/statistics.service';
import { User } from '../../../../../models/user.model';
import { Store } from '@ngrx/store';
import * as FromRoot from '../../../../../core/store/store.reducer';


@Component({
  selector: 'alto-team-engagement',
  templateUrl: './team-engagement.component.html',
  styleUrls: ['./team-engagement.component.scss'],
})
export class TeamEngagementComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;
  AltoRoutes = AltoRoutes;

  team!: Team;
  company!: Company;
  users: User[] = [];

  duration: ScoreDuration = ScoreDuration.Trimester;

  answersChart: any;
  answersChartStatus: PlaceholderDataStatus = 'loading';

  membersLeaderboard: { name: string; score: number; progression: number }[] = [];
  membersLeaderboardStatus: PlaceholderDataStatus = 'loading';

  contributionChart: any;
  contributionChartStatus: PlaceholderDataStatus = 'loading';

  membersTable: DataForTable[] = [];
  membersTableSearch = '';
  paginatedMembersTable: DataForTable[] = [];
  membersTablePage = 1;
  membersTablePageSize = 5;
  membersTableStatus: PlaceholderDataStatus = 'loading';
  hasConnector = false;

  constructor(
    private readonly router: Router,
    private readonly scoreRestService: ScoresRestService,
    private readonly statisticsService: StatisticsService,
    private readonly titleCasePipe: TitleCasePipe,
    private readonly scoreService: ScoresService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    private readonly store: Store<FromRoot.AppState>,
  ) {}

  ngOnInit(): void {
    const teamId = this.router.url.split('/').pop() || '';

    this.store
      .select(FromRoot.selectCompanyAndUsers)
      .pipe(
        tap(({ company, users }) => {
          this.company = company.data;
          this.team = this.company.teams.find((u) => u.id === teamId) as Team;

          this.users = Array.from(users.data.values());

          this.loadPage();
        }),
      )
      .subscribe();
  }

  loadPage(): void {
    this.getAnswersChart(this.duration);
    this.getMembersLeaderboard(this.duration);
    this.getContributionsChart(this.duration);
  }

  getContributionsChart(duration: ScoreDuration): void {
    this.contributionChartStatus = 'loading';
    combineLatest([
      this.scoreRestService.getScores(this.getScoreParams('comments', duration)),
      this.scoreRestService.getScores(this.getScoreParams('submitedQuestions', duration)),
    ])
      .pipe(
        tap(([comments, submitedQuestions]) => {
          this.contributionChartStatus =
            comments.length > 0 || submitedQuestions.length > 0 ? 'good' : 'noData';
          this.createContributionsChart(comments, submitedQuestions, duration);
        }),
      )
      .subscribe();
  }

  createContributionsChart(comments: Score[], submitedQuestions: Score[], duration: ScoreDuration): void {
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
  }

  filterMembersTable({ search = this.membersTableSearch }): void {
    this.membersTableSearch = search;

    this.getMembersLeaderboard(this.duration);
  }

  getMembersTable(users: UserStatsDtoApi[], previousUsers: UserStatsDtoApi[], company: CompanyDtoApi): void {
    this.hasConnector = company.isConnectorActive ?? false;
    let temp = users;
    if (this.membersTableSearch && this.membersTableSearch !== '') {
      temp = temp.filter((u) => {
        const s = this.membersTableSearch.toLowerCase();
        return u.user.firstname.toLowerCase().includes(s) || u.user.lastname.toLowerCase().includes(s);
      });
    }
    this.membersTable = this.users.map((user) => {
      const userStats = temp.find((u) => u.user.id === user.id) ?? ({} as UserStatsDtoApi);
      const prevUser = previousUsers.find((u) => u.user.id === user.id) ?? ({} as UserStatsDtoApi);
      return this.dataFormUserTableMapper(user, userStats, prevUser);
    });
    this.membersTableStatus = this.membersTable.length > 0 ? 'good' : 'noData';
    this.changeMembersTablePage(1);
  }

  private dataFormUserTableMapper(user: User, userStat: UserStatsDtoApi, prevUser: UserStatsDtoApi): DataForTable {
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

  changeMembersTablePage(page: number): void {
    this.membersTablePage = page;
    this.paginatedMembersTable = this.membersTable.slice(
      (page - 1) * this.membersTablePageSize,
      page * this.membersTablePageSize,
    );
  }

  getMembersLeaderboard(duration: ScoreDuration): void {
    this.membersTableStatus = 'loading';
    this.membersLeaderboardStatus = 'loading';
    combineLatest([
      this.scoreRestService.getUsersStats(duration, false, undefined, undefined, this.team.id),
      this.scoreRestService.getUsersStats(duration, true, undefined, undefined, this.team.id),
    ])
      .pipe(
        tap(([current, previous]) => {
          this.getMembersTable(current, previous, this.company);
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
          this.membersLeaderboardStatus = this.membersLeaderboard.length > 0 ? 'good' : 'noData';
        }),
      )
      .subscribe();
  }

  getAnswersChart(duration: ScoreDuration): void {
    this.answersChartStatus = 'loading';
    this.scoreRestService
      .getScores(this.getScoreParams('answers', duration))
      .pipe(
        tap((res) => {
          this.createAnswersChart(res, duration);
          this.answersChartStatus = res.length > 0 ? 'good' : 'noData';
        }),
      )
      .subscribe();
  }

  createAnswersChart(scores: Score[], duration: ScoreDuration): void {
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
  }

  updateTimePicker(event: any): void {
    this.duration = event;
    this.loadPage();
  }

  getScoreParams(type: 'answers' | 'comments' | 'submitedQuestions', duration: ScoreDuration): ChartFilters {
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
        duration === ScoreDuration.Year
          ? ScoreTimeframeEnumApi.Month
          : duration === ScoreDuration.Trimester
          ? ScoreTimeframeEnumApi.Week
          : ScoreTimeframeEnumApi.Day,
    };
  }
}
