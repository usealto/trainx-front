import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ScoreByTypeEnumApi,
  ScoreDtoApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  UserDtoApi,
} from '@usealto/sdk-ts-angular';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from '../../../services/statistics.service';
import { TitleCasePipe } from '@angular/common';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'alto-user-engagement',
  templateUrl: './user-engagement.component.html',
  styleUrls: ['./user-engagement.component.scss'],
})
export class UserEngagementComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;

  user!: UserDtoApi;
  duration: ScoreDuration = ScoreDuration.Trimester;

  answersChartOptions!: any;
  answersChartStatus: PlaceholderDataStatus = 'loading';

  contributionChartOptions!: any;
  contributionChartStatus: PlaceholderDataStatus = 'loading';

  constructor(
    private readonly router: Router,
    private readonly profileStore: ProfileStore,
    private readonly scoreRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly statisticsService: StatisticsService,
    private readonly titleCasePipe: TitleCasePipe,
  ) {}

  ngOnInit(): void {
    const userI = this.router.url.split('/').pop() || '';
    this.user = this.profileStore.users.value.find((u) => u.id === userI) || ({} as UserDtoApi);

    this.loadPage();
  }

  loadPage(): void {
    this.getAnswersChart(this.duration);
    this.getContributionChart(this.duration);
  }

  getContributionChart(duration: ScoreDuration): void {
    this.contributionChartStatus = 'loading';
    combineLatest([
      this.scoreRestService.getScores(this.getScoreparams('submitedQuestions', duration)),
      this.scoreRestService.getScores(this.getScoreparams('comments', duration)),
    ]).subscribe(([answers, comments]) => {
      this.createContributionChart(comments.scores, answers.scores, duration);
      this.contributionChartStatus = answers.scores.length || comments.scores.length ? 'good' : 'empty';
    });
  }

  createContributionChart(
    comments: ScoreDtoApi[],
    submitedQuestions: ScoreDtoApi[],
    duration: ScoreDuration,
  ): void {
    const reducedComments = this.scoresService.reduceLineChartData(comments);
    const reducedQuestionsSubmitted = this.scoresService.reduceLineChartData(submitedQuestions);
    const aggregatedComments = this.statisticsService.transformDataToPointByCounts(reducedComments[0]);
    const aggregatedQuestionsSubmitted = this.statisticsService.transformDataToPointByCounts(
      reducedQuestionsSubmitted[0],
    );
    const labels = this.statisticsService
      .formatLabel(
        reducedComments.length > 0
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

  getAnswersChart(duration: ScoreDuration): void {
    this.answersChartStatus = 'loading';
    this.scoreRestService.getScores(this.getScoreparams('answers', duration)).subscribe((res) => {
      this.createAnswersChart(res.scores[0], duration);
      this.answersChartStatus = res.scores.length ? 'good' : 'empty';
    });
  }

  createAnswersChart(scores: ScoreDtoApi, duration: ScoreDuration): void {
    const reducedScores = this.scoresService.reduceLineChartData([scores]);
    const points = this.statisticsService.transformDataToPointByCounts(reducedScores[0]);
    const labels = this.statisticsService
      .formatLabel(
        points.map((p) => p.x),
        duration,
      )
      .map((l) => this.titleCasePipe.transform(l));

    const dataset = reducedScores.map((s) => {
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

  updateTimePicker(event: any): void {
    this.duration = event;
    this.loadPage();
  }

  getScoreparams(type: 'answers' | 'comments' | 'submitedQuestions', duration: ScoreDuration): ChartFilters {
    return {
      duration: duration,
      type:
        type === 'answers'
          ? ScoreTypeEnumApi.Guess
          : type === 'comments'
          ? ScoreTypeEnumApi.Comment
          : ScoreTypeEnumApi.QuestionSubmitted,
      scoredBy: ScoreByTypeEnumApi.User,
      scoredById: this.user.id,
      timeframe:
        duration === ScoreDuration.Year
          ? ScoreTimeframeEnumApi.Month
          : duration === ScoreDuration.Trimester
          ? ScoreTimeframeEnumApi.Week
          : ScoreTimeframeEnumApi.Day,
    };
  }
}
