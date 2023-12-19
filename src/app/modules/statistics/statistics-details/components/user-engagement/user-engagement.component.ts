import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ScoreByTypeEnumApi,
  ScoreDtoApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
} from '@usealto/sdk-ts-angular';
import { combineLatest } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ITeam, Team } from 'src/app/models/team.model';
import { IUser, User } from 'src/app/models/user.model';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { IAppData } from '../../../../../core/resolvers';
import { StatisticsService } from '../../../services/statistics.service';
import { Score } from 'src/app/models/score.model';

@Component({
  selector: 'alto-user-engagement',
  templateUrl: './user-engagement.component.html',
  styleUrls: ['./user-engagement.component.scss'],
})
export class UserEngagementComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;

  user!: User;
  userTeam!: Team;
  duration: ScoreDuration = ScoreDuration.Trimester;

  answersChartOptions!: any;
  answersChartStatus: PlaceholderDataStatus = 'loading';

  contributionChartOptions!: any;
  contributionChartStatus: PlaceholderDataStatus = 'loading';

  constructor(
    private readonly router: Router,
    private readonly scoreRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly statisticsService: StatisticsService,
    private readonly titleCasePipe: TitleCasePipe,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    const usersById = (data[EResolvers.AppResolver] as IAppData).userById;
    const teamsById = (data[EResolvers.AppResolver] as IAppData).teamById;
    const userId = this.router.url.split('/').pop() || '';
    this.user = usersById.get(userId) || new User({} as IUser);
    this.userTeam = teamsById.get(this.user.teamId || '') || new Team({} as ITeam);

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
      this.contributionChartStatus = answers.length || comments.length ? 'good' : 'empty';
      if (answers.length || comments.length) {
        this.createContributionChart(comments, answers, duration);
      }
    });
  }

  createContributionChart(comments: Score[], submitedQuestions: Score[], duration: ScoreDuration): void {
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

  getAnswersChart(duration: ScoreDuration): void {
    this.answersChartStatus = 'loading';
    this.scoreRestService.getScores(this.getScoreparams('answers', duration)).subscribe((scores) => {
      this.answersChartStatus = scores.length ? 'good' : 'empty';
      if (scores.length) {
        this.createAnswersChart(scores[0], duration);
      }
    });
  }

  createAnswersChart(scores: Score, duration: ScoreDuration): void {
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
