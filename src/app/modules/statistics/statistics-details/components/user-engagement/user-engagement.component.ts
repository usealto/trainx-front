import { TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ScoreByTypeEnumApi, ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, startWith, switchMap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { EScoreDuration, Score } from 'src/app/models/score.model';
import { ITeam, Team } from 'src/app/models/team.model';
import { IUser, User } from 'src/app/models/user.model';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { IAppData } from '../../../../../core/resolvers';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';
import { StatisticsService } from '../../../services/statistics.service';

@Component({
  selector: 'alto-user-engagement',
  templateUrl: './user-engagement.component.html',
  styleUrls: ['./user-engagement.component.scss'],
})
export class UserEngagementComponent implements OnInit, OnDestroy {
  I18ns = I18ns;
  EmojiName = EmojiName;

  user!: User;
  userTeam!: Team;

  durationOptions = Score.getTimepickerOptions();
  durationControl = new FormControl<EScoreDuration>(EScoreDuration.Trimester, {
    nonNullable: true,
  });

  answersChartOptions!: any;
  answersChartStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  contributionChartOptions!: any;
  contributionChartStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  private readonly userEngagementComponentSubscription = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly statisticsService: StatisticsService,
    private readonly titleCasePipe: TitleCasePipe,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    const usersById = (data[EResolvers.AppResolver] as IAppData).userById;
    const teamsById = (data[EResolvers.AppResolver] as IAppData).company.teams;

    // TODO : move logic into guard or resolver
    const userId = this.router.url.split('/').pop() || '';
    this.user = usersById.get(userId) || new User({} as IUser);
    this.userTeam = teamsById.find((t) => t.id === this.user.teamId) || new Team({} as ITeam);

    this.userEngagementComponentSubscription.add(
      this.durationControl.valueChanges
        .pipe(
          startWith(this.durationControl.value),
          switchMap((duration) => {
            let timeframe: ScoreTimeframeEnumApi;

            switch (duration) {
              case EScoreDuration.Year:
                timeframe = ScoreTimeframeEnumApi.Month;
                break;
              case EScoreDuration.Trimester:
                timeframe = ScoreTimeframeEnumApi.Week;
                break;
              default:
                timeframe = ScoreTimeframeEnumApi.Day;
                break;
            }

            return combineLatest([
              this.scoresRestService.getScores({
                duration,
                timeframe,
                type: ScoreTypeEnumApi.Guess,
                scoredBy: ScoreByTypeEnumApi.User,
                scoredById: this.user.id,
              }),
              this.scoresRestService.getScores({
                duration,
                timeframe,
                type: ScoreTypeEnumApi.Comment,
                scoredBy: ScoreByTypeEnumApi.User,
                scoredById: this.user.id,
              }),
              this.scoresRestService.getScores({
                duration,
                timeframe,
                type: ScoreTypeEnumApi.QuestionSubmitted,
                scoredBy: ScoreByTypeEnumApi.User,
                scoredById: this.user.id,
              }),
            ]);
          }),
        )
        .subscribe({
          next: ([answersScores, commentsScores, questionsSubmittedScores]) => {
            this.answersChartStatus = answersScores.length
              ? EPlaceholderStatus.GOOD
              : EPlaceholderStatus.NO_DATA;
            this.contributionChartStatus =
              commentsScores.length || questionsSubmittedScores.length
                ? EPlaceholderStatus.GOOD
                : EPlaceholderStatus.NO_DATA;

            if (answersScores.length) {
              this.createAnswersChart(answersScores[0], this.durationControl.value);
            }

            if (commentsScores.length || questionsSubmittedScores.length) {
              this.createContributionChart(
                commentsScores,
                questionsSubmittedScores,
                this.durationControl.value,
              );
            }
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.userEngagementComponentSubscription.unsubscribe();
  }

  createContributionChart(comments: Score[], submitedQuestions: Score[], duration: EScoreDuration): void {
    const formatedComments = this.scoresService.formatScores(comments);
    const formatedQuestionsSubmitted = this.scoresService.formatScores(submitedQuestions);
    const aggregatedComments = this.statisticsService.transformDataToPointByCounts(formatedComments[0]);
    const aggregatedQuestionsSubmitted = this.statisticsService.transformDataToPointByCounts(
      formatedQuestionsSubmitted[0],
    );
    const labels = this.statisticsService
      .formatLabel(
        formatedComments.length > 0
          ? aggregatedComments.map((d) => d.x)
          : aggregatedQuestionsSubmitted.map((d) => d.x),
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

    this.contributionChartOptions = {
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

  createAnswersChart(scores: Score, duration: EScoreDuration): void {
    const formatedScores = this.scoresService.formatScores([scores]);
    const points = this.statisticsService.transformDataToPointByCounts(formatedScores[0]);
    const labels = this.statisticsService
      .formatLabel(
        points.map((p) => p.x),
        duration,
      )
      .map((l) => this.titleCasePipe.transform(l));

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

    this.answersChartOptions = {
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
}
