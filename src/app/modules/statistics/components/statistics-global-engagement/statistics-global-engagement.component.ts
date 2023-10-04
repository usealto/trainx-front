import { Component, OnInit } from '@angular/core';
import { combineLatest, filter, switchMap, tap } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
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

  constructor(
    private readonly titleCasePipe: TitleCasePipe,
    public readonly teamStore: TeamStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly statisticsServices: StatisticsService,
  ) {}

  ngOnInit(): void {
    this.getEngagementData();
  }

  private getEngagementData(): void {
    this.scoresRestService
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
        untilDestroyed(this),
      )
      .subscribe();
  }

  updateTimePicker(event: any): void {
    this.duration = event;
    this.getEngagementData();
  }
}
