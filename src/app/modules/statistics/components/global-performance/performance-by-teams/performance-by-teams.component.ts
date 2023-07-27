import { Component, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  ScoreDtoApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  TeamStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import Chart, { ChartData } from 'chart.js/auto';
import { combineLatest, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from '../../../services/statistics.service';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';

@Component({
  selector: 'alto-performance-by-teams',
  templateUrl: './performance-by-teams.component.html',
  styleUrls: ['./performance-by-teams.component.scss'],
})
export class PerformanceByTeamsComponent implements OnChanges {
  I18ns = I18ns;
  teams: ScoreDtoApi[] = [];
  selectedTeams: ScoreDtoApi[] = [];
  scoredTeams: { label: string; score: number | null; progression: number | null }[] = [];
  scoreEvolutionChart?: Chart;
  @Input() duration: ScoreDuration = ScoreDuration.Year;
  @Output() selecedDuration = this.duration;

  constructor(
    public readonly teamStore: TeamStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresServices: ScoresService,
    private readonly statisticsServices: StatisticsService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['duration']) {
      const params = {
        timeframe: ScoreTimeframeEnumApi.Day,
        duration: this.duration,
        type: ScoreTypeEnumApi.Team,
      } as ChartFilters;

      combineLatest([
        this.scoresRestService.getScores(params),
        this.scoresRestService.getTeamsStats(this.duration),
        this.scoresRestService.getTeamsStats(this.duration, true),
      ])
        .pipe(
          tap(([scores, current, previous]) => {
            this.teams = scores.scores;
            this.selectedTeams = scores.scores.slice(0, 3);
            this.createScoreEvolutionChart(
              this.selectedTeams.length
                ? scores.scores.filter((score) => this.selectedTeams.some((team) => team.id === score.id))
                : scores.scores,
              this.duration,
            );

            this.getTeamsScores(current, previous);
          }),
        )
        .subscribe();
    }
  }

  getTeamsScores(current: TeamStatsDtoApi[], previous: TeamStatsDtoApi[]) {
    this.scoredTeams = current
      .map((team) => {
        const progression = previous.find((t) => t.id === team.id)?.score ?? null;
        return { label: team.label, score: team.score ?? 0, progression: progression };
      })
      .sort((a, b) => (a.score && b.score ? b.score - a.score : 0));
  }

  createScoreEvolutionChart(scores: ScoreDtoApi[], duration: ScoreDuration) {
    scores = this.scoresServices.reduceChartData(scores);
    const aggregateData = this.statisticsServices.aggregateDataForScores(scores[0], duration);
    const labels = this.statisticsServices.formatLabel(
      aggregateData.map((d) => d.x),
      duration,
    );
    const data: ChartData = {
      labels: labels,
      datasets: scores.map((s) => {
        const d = this.statisticsServices.aggregateDataForScores(s, duration);
        return {
          label: s.label,
          data: d.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
          fill: false,
          tension: 0.2,
          spanGaps: true,
        };
      }),
    };
    if (this.scoreEvolutionChart) {
      this.scoreEvolutionChart.destroy();
    }

    const customChartOptions = {
      ...chartDefaultOptions,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (tooltipItem: any) {
              const labelType = 'équipe';
              return `${labelType} ${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}%`;
            },
          },
        },
        legend: {
          display: false,
        },
      },
    };
    this.scoreEvolutionChart = new Chart('teamScoreEvolution', {
      type: 'line',
      data: data,
      options: customChartOptions,
    });
  }

  filterTeams(event: ScoreDtoApi[]) {
    this.selectedTeams = event;
    this.createScoreEvolutionChart(
      this.selectedTeams.length
        ? this.teams.filter((score) => this.selectedTeams.some((team) => team.id === score.id))
        : this.teams,
      this.duration,
    );
  }
}
