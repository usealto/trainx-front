import { Component, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  ScoreDtoApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  ScoresResponseDtoApi,
  TeamStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import { Observable, combineLatest, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from '../../../services/statistics.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'alto-performance-by-teams',
  templateUrl: './performance-by-teams.component.html',
  styleUrls: ['./performance-by-teams.component.scss'],
})
export class PerformanceByTeamsComponent implements OnChanges {
  @Input() duration: ScoreDuration = ScoreDuration.Year;
  @Output() selecedDuration = this.duration;

  Emoji = EmojiName;
  I18ns = I18ns;
  init = true;
  teams: ScoreDtoApi[] = [];
  selectedTeams: ScoreDtoApi[] = [];
  scoredTeams: { label: string; score: number | null; progression: number | null }[] = [];
  scoreCount = 0;

  teamsLeaderboard: { name: string; score: number }[] = [];
  teamsLeaderboardCount = 0;
  chartOption: any = {};

  constructor(
    private titleCasePipe: TitleCasePipe,
    public readonly teamStore: TeamStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresServices: ScoresService,
    private readonly statisticsServices: StatisticsService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['duration']) {
      combineLatest([
        this.getScores(),
        this.scoresRestService.getTeamsStats(this.duration),
        this.scoresRestService.getTeamsStats(this.duration, true),
      ])
        .pipe(
          tap(([, teams]) => {
            teams = teams.filter((t) => t.score && t.score >= 0);
            this.teamsLeaderboard = teams.map((t) => ({ name: t.team.name, score: t.score ?? 0 }));
            this.teamsLeaderboardCount = this.teamsLeaderboard.length;
          }),
          tap(([, current, previous]) => {
            this.getTeamsScores(current, previous);
          }),
        )
        .subscribe();
    }
  }

  getScores(): Observable<[ScoresResponseDtoApi, ScoresResponseDtoApi]> {
    return combineLatest([
      this.scoresRestService.getScores(this.getScoreParams(this.duration, false)),
      this.scoresRestService.getScores(this.getScoreParams(this.duration, true)),
    ]).pipe(
      tap(([res, global]) => {
        this.teams = res.scores;
        let filteredTeams: ScoreDtoApi[] = res.scores;
        if (this.init) {
          this.selectedTeams = this.teams.slice(0, 3);
        }
        if (this.selectedTeams.length) {
          filteredTeams = res.scores.filter((score) =>
            this.selectedTeams.some((team) => team.id === score.id),
          );
        }
        this.createScoreEvolutionChart(filteredTeams, global.scores[0], this.duration);
      }),
      tap(() => (this.init = false)),
    );
  }

  getTeamsScores(current: TeamStatsDtoApi[], previous: TeamStatsDtoApi[]) {
    this.scoredTeams = current
      .map((team) => {
        const progression = previous.find((t) => t.id === team.id)?.score ?? null;
        return { label: team.label, score: team.score ?? 0, progression: progression };
      })
      .sort((a, b) => (a.score && b.score ? b.score - a.score : 0));
  }

  createScoreEvolutionChart(scores: ScoreDtoApi[], globalScore: ScoreDtoApi, duration: ScoreDuration) {
    scores = this.scoresServices.reduceLineChartData(scores);
    this.scoreCount = scores.length;

    // Aligns Global with Score's Length so thay start on the same month
    const globalPoints = this.statisticsServices
      .transformDataToPoint(globalScore)
      .slice(-scores[0]?.averages?.length);

    const aggregatedData = this.statisticsServices.transformDataToPoint(scores[0]);
    const labels = this.statisticsServices
      .formatLabel(
        aggregatedData.map((d) => d.x),
        duration,
      )
      .map((s) => this.titleCasePipe.transform(s));
    const dataSet = scores.map((s) => {
      const d = this.statisticsServices.transformDataToPoint(s);
      return {
        label: s.label,
        data: d.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
      };
    });

    const series = dataSet.map((d) => {
      return {
        name: d.label,
        data: d.data,
        type: 'line',
        tooltip: {
          valueFormatter: (value: any) => {
            return (value as number) + '%';
          },
        },
        lineStyle: {},
      };
    });

    series.push({
      name: I18ns.shared.global,
      data: globalPoints.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
      type: 'line',
      tooltip: {
        valueFormatter: (value: any) => {
          return (value as number) + ' %';
        },
      },
      lineStyle: {
        type: 'dashed',
      },
    });

    this.chartOption = {
      xAxis: [{ ...xAxisDatesOptions, data: labels }],
      yAxis: [{ ...yAxisScoreOptions }],
      series: series,
    };
  }

  filterTeams(event: ScoreDtoApi[]) {
    this.selectedTeams = event;
    this.getScores().subscribe();
  }

  @memoize()
  getScoreParams(duration: ScoreDuration, global: boolean): ChartFilters {
    return {
      duration: duration ?? ScoreDuration.Year,
      type: global ? ScoreTypeEnumApi.Guess : ScoreTypeEnumApi.Team,
      timeframe:
        duration === ScoreDuration.Year
          ? ScoreTimeframeEnumApi.Month
          : duration === ScoreDuration.Trimester
          ? ScoreTimeframeEnumApi.Week
          : ScoreTimeframeEnumApi.Day,
    } as ChartFilters;
  }
}
