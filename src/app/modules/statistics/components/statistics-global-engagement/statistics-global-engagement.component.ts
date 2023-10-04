import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, filter, map, switchMap, tap } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ScoreTimeframeEnumApi, ScoreTypeEnumApi, TeamStatsDtoApi } from '@usealto/sdk-ts-angular';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from '../../services/statistics.service';
import { TitleCasePipe } from '@angular/common';

import { xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';

@UntilDestroy()
@Component({
  selector: 'alto-statistics-global-engagement',
  templateUrl: './statistics-global-engagement.component.html',
  styleUrls: ['./statistics-global-engagement.component.scss'],
})
export class StatisticsGlobalEngagementComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;
  duration: ScoreDuration = ScoreDuration.Trimester;

  leaderboard: { name: string; score: number; progression: number }[] = [];

  guessChartOptions: any = {};
  guessesDataStatus: PlaceholderDataStatus = 'good';

  collaborationChartOptions: any = {};
  collaborationDataStatus: PlaceholderDataStatus = 'good';

  constructor(
    private readonly titleCasePipe: TitleCasePipe,
    public readonly teamStore: TeamStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly statisticsServices: StatisticsService,
  ) {}

  ngOnInit(): void {
    this.getAllData();
  }

  private getAllData(): void {
    combineLatest([this.getActivityData(), this.getTeamEngagementData()])
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  private getActivityData(): Observable<[TeamStatsDtoApi[], TeamStatsDtoApi[]]> {
    return this.scoresRestService
      .getScores({
        duration: this.duration,
        type: ScoreTypeEnumApi.Guess,
        timeframe:
          this.duration === ScoreDuration.Year
            ? ScoreTimeframeEnumApi.Month
            : this.duration === ScoreDuration.Trimester
            ? ScoreTimeframeEnumApi.Week
            : ScoreTimeframeEnumApi.Day,
      })
      .pipe(
        tap(({ scores }) => (this.guessesDataStatus = scores.length === 0 ? 'noData' : 'good')),
        filter(({ scores }) => scores.length > 0),
        tap(({ scores }) => {
          const reducedScores = this.scoresService.reduceLineChartData(scores);
          const aggregatedData = this.statisticsServices.transformDataToPoint(reducedScores[0]);
          const labels = this.statisticsServices
            .formatLabel(
              aggregatedData.map((d) => d.x),
              this.duration,
            )
            .map((s) => this.titleCasePipe.transform(s));
          const dataset = reducedScores.map((s) => {
            const d = this.statisticsServices.transformDataToPoint(s);
            return {
              label: s.label,
              data: d.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
            };
          });

          const series = dataset.map((d) => {
            return {
              name: I18ns.charts.answeredQuestions,
              data: d.data,
              type: 'line',
              showSymbol: false,
            };
          });

          this.guessChartOptions = {
            xAxis: [
              {
                ...xAxisDatesOptions,
                data: labels,
              },
            ],
            yAxis: [
              {
                ...yAxisScoreOptions,
                name: I18ns.charts.answerCountLabel,
              },
            ],
            series: series,
            legend: { show: false },
          };
        }),
        switchMap(() => {
          return combineLatest([
            this.scoresRestService.getTeamsStats(this.duration, false, 'totalGuessesCount:desc'),
            this.scoresRestService.getTeamsStats(this.duration, true, 'totalGuessesCount:desc'),
          ]);
        }),
        tap(([currentStats, previousStats]) => {
          currentStats = currentStats.filter((t) => t.score && t.score >= 0);
          previousStats = previousStats.filter((t) => t.score && t.score >= 0);
          this.leaderboard = currentStats.map((t) => {
            const previousScore = previousStats.find((p) => p.team.id === t.team.id)?.score;
            const progression = this.scoresService.getProgression(t.score, previousScore);
            return {
              name: t.team.name,
              score: t.totalGuessesCount ? t.totalGuessesCount / 100 : 0,
              progression: progression ? progression : 0,
            };
          });
        }),
      );
  }

  private getTeamEngagementData() {
    return combineLatest([
      this.scoresRestService.getScores({
        duration: this.duration,
        type: ScoreTypeEnumApi.Comment,
        timeframe:
          this.duration === ScoreDuration.Year
            ? ScoreTimeframeEnumApi.Month
            : this.duration === ScoreDuration.Trimester
            ? ScoreTimeframeEnumApi.Week
            : ScoreTimeframeEnumApi.Day,
      }),
      this.scoresRestService.getScores({
        duration: this.duration,
        type: ScoreTypeEnumApi.QuestionSubmitted,
        timeframe:
          this.duration === ScoreDuration.Year
            ? ScoreTimeframeEnumApi.Month
            : this.duration === ScoreDuration.Trimester
            ? ScoreTimeframeEnumApi.Week
            : ScoreTimeframeEnumApi.Day,
      }),
    ]).pipe(
      map(([comments, questionsSubmitted]) => {
        return [comments.scores, questionsSubmitted.scores];
      }),
      tap(([comments, questionsSubmitted]) => {
        this.collaborationDataStatus =
          comments.length === 0 && questionsSubmitted.length === 0 ? 'noData' : 'good';
      }),
      filter(([comments, questionsSubmitted]) => comments.length > 0 || questionsSubmitted.length > 0),
      tap(([comments, questionsSubmitted]) => {
        const reducedComments = this.scoresService.reduceLineChartData(comments);
        const reducedQuestionsSubmitted = this.scoresService.reduceLineChartData(questionsSubmitted);
        const aggregatedComments = this.statisticsServices.transformDataToPointByCounts(reducedComments[0]);
        const aggregatedQuestionsSubmitted = this.statisticsServices.transformDataToPointByCounts(
          reducedQuestionsSubmitted[0],
        );
        const labels = this.statisticsServices
          .formatLabel(
            aggregatedComments.map((d) => d.x),
            this.duration,
          )
          .map((s) => this.titleCasePipe.transform(s));

        const dataset = [
          {
            label: I18ns.statistics.globalEngagement.engagement.comments,
            data: aggregatedComments.map((d) => d.y),
          },
          {
            label: I18ns.statistics.globalEngagement.engagement.suggQuestions,
            data: aggregatedQuestionsSubmitted.map((d) => d.y),
          },
        ];

        const series = dataset.map((d) => {
          return {
            name: d.label,
            data: d.data,
            type: 'line',
            showSymbol: false,
          };
        });
        console.log(series);

        this.collaborationChartOptions = {
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
          legend: { show: false },
        };
      }),
    );
  }

  updateTimePicker(event: any): void {
    this.duration = event;
    this.getAllData();
  }
}
