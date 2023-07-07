import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ScoreDtoApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  ScoresResponseDtoApi,
  TeamStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import Chart, { ChartData } from 'chart.js/auto';
import { Observable, switchMap, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { ScoreDuration, TopFlop } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from '../../../services/statistics.service';
@UntilDestroy()
@Component({
  selector: 'alto-performance-by-themes',
  templateUrl: './performance-by-themes.component.html',
  styleUrls: ['./performance-by-themes.component.scss'],
})
export class PerformanceByThemesComponent implements OnChanges {
  @Input() duration: ScoreDuration = ScoreDuration.Year;
  I18ns = I18ns;
  activeTab = 1;
  init = true;

  teams: { label: string; id: string }[] = [];
  selectedTeams: { label: string; id: string }[] = [];
  teamsStats: TeamStatsDtoApi[] = [];

  // Tags or Programs
  items: ScoreDtoApi[] = [];
  scoredItems: TopFlop = { top: [], flop: [] };
  selectedItems: ScoreDtoApi[] = [];

  scoreEvolutionChart?: Chart;
  performanceChart?: Chart;

  constructor(
    private readonly scoresRestService: ScoresRestService,
    private readonly statisticsServices: StatisticsService,
    private readonly scoresServices: ScoresService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['duration']) {
      this.getScores()
        .pipe(
          switchMap(() => this.scoresRestService.getTeamsStats(this.duration)),
          tap((res) => {
            this.teamsStats = res;
            this.teams = res
              .sort((a, b) => a.label.localeCompare(b.label))
              .map((t) => ({
                label: t.label,
                id: t.id,
              }));
            this.selectedTeams = this.teams.splice(0, 5);
          }),
          tap(() => {
            this.createPerformanceChart(this.selectedTeams);
          }),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  getScores(): Observable<ScoresResponseDtoApi> {
    return this.scoresRestService
      .getScores({
        timeframe: ScoreTimeframeEnumApi.Day,
        duration: this.duration ?? ScoreDuration.Year,
        type: this.activeTab === 1 ? ScoreTypeEnumApi.Tag : ScoreTypeEnumApi.Program,
      } as ChartFilters)
      .pipe(
        tap((res) => {
          this.items = res.scores.sort((a, b) => a.label.localeCompare(b.label));
          let filteredItems: ScoreDtoApi[] = res.scores;
          if (this.init) {
            this.selectedItems = this.items.slice(0, 5);
          }
          if (this.selectedItems.length) {
            filteredItems = res.scores.filter((s) => this.selectedItems.some((si) => si.id === s.id));
          }
          this.getScoredItems(this.items);
          this.createScoreEvolutionChart(filteredItems, this.duration);
          this.createPerformanceChart(this.selectedTeams);
        }),
        tap(() => (this.init = false)),
      );
  }

  getScoredItems(scores: ScoreDtoApi[]) {
    const scoredItems = scores
      .map((score) => {
        const average = this.scoresServices.reduceWithoutNull(score.averages);
        return { label: score.label, avg: average ?? 0 };
      })
      .sort((a, b) => b.avg - a.avg);
    this.scoredItems.top = this.scoresServices.getTop(scoredItems).slice(0, 3);
    this.scoredItems.flop = this.scoresServices.getFlop(scoredItems).slice(0, 3);
  }

  getThemesLabel(stats: TeamStatsDtoApi[]): string[] {
    const labels: string[] = [];
    const type = this.activeTab === 1 ? 'tags' : 'programs';

    stats.forEach((s) => {
      s[type]?.forEach((t) => {
        if (
          (!this.selectedItems.length || this.selectedItems.some((item) => item.id === t.id)) &&
          !labels.includes(t.label)
        ) {
          labels.push(t.label);
        }
      });
    });

    return labels;
  }

  createPerformanceChart(selectedTeams: { label: string; id: string }[]) {
    const type = this.activeTab === 1 ? 'tags' : 'programs';
    const stats = selectedTeams.length
      ? this.teamsStats.filter((t) => selectedTeams.some((st) => st.id === t.id))
      : this.teamsStats;
    const labels = this.getThemesLabel(stats);
    const dataset = stats.map((s) => {
      const res = { label: s.label, data: [] as number[], fill: true };
      s[type]?.forEach((item) => {
        if (!this.selectedItems.length || this.selectedItems.some((i) => i.id === item.id)) {
          res.data.push(item.score ? Math.round(item.score) : NaN);
        }
      });
      return res;
    });

    const data: ChartData = {
      labels: labels,
      datasets: dataset,
    };

    if (this.performanceChart) {
      this.performanceChart.destroy();
    }
    const customChartOptions = {
      ...chartDefaultOptions,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (tooltipItem: any) {
              let labelType = 'tag';
              if (type === 'programs') {
                labelType = 'programme';
              }
              return `${labelType} ${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}%`;
            },
          },
        },
        legend: {
          display: false,
        },
      },
    };
    this.performanceChart = new Chart('themePerformance', {
      type: 'radar',
      data: data,
      options: { ...customChartOptions, scales: undefined },
    });
  }

  createScoreEvolutionChart(scores: ScoreDtoApi[], duration: ScoreDuration) {
    const type = this.activeTab === 1 ? 'tags' : 'programs';
    scores = this.scoresServices.reduceChartData(scores);
    const labels = this.statisticsServices.formatLabel(
      this.statisticsServices.aggregateDataForScores(scores[0], duration).map((d) => d.x),
      duration,
    );

    if (this.scoreEvolutionChart) {
      this.scoreEvolutionChart.destroy();
    }

    // Global
    const total = scores.map((s) => this.statisticsServices.aggregateDataForScores(s, duration));
    const res: { x: Date; y: number | null; z: number }[] = [];

    total.forEach((teamData) => {
      teamData.forEach((point) => {
        const element = res.filter((pt) => pt.x.getTime() === point.x.getTime());
        if (element.length === 1) {
          if (!element[0].y) {
            element[0].y = point.y;
          } else {
            element[0].y += point.y || 0;
          }
          element[0].z += point.y ? 1 : 0;
        } else {
          res.push({ ...point, z: point.y ? 1 : 0 });
        }
      });
    });

    res.forEach((pt) => {
      if (pt.y && pt.z > 0) {
        pt.y = pt.y / pt.z;
      }
    });

    const dataSet = scores.map((s) => {
      const d = this.statisticsServices.aggregateDataForScores(s, duration);
      return {
        label: s.label,
        data: d.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
        fill: false,
        tension: 0.2,
        borderDash: [0],
        spanGaps: true,
      };
    });
    dataSet.push({
      label: 'Global',
      data: res.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
      fill: false,
      tension: 0.2,
      borderDash: [4],
      spanGaps: true,
    });

    const data: ChartData = {
      labels: labels,
      datasets: dataSet,
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
              let labelType = 'tag';
              if (type === 'programs') {
                labelType = 'programme';
              }
              return `${labelType} ${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}%`;
            },
          },
        },
        legend: {
          display: false,
        },
      },
    };
    this.scoreEvolutionChart = new Chart('themeScoreEvolution', {
      type: 'line',
      data: data,
      options: {
        ...customChartOptions,
        scales: {
          ...customChartOptions.scales,
          x: { ...customChartOptions.scales?.['x'], grid: { display: true } },
          y: { ...customChartOptions.scales?.['y'], grid: { display: false } },
        },
      },
    });
  }

  changeTabs() {
    this.activeTab = this.activeTab === 1 ? 2 : 1;
    this.init = true;
    this.getScores().subscribe();
  }

  filterTeams(teams: { label: string; id: string }[]) {
    this.selectedTeams = teams;
    this.createPerformanceChart(this.selectedTeams);
    return;
  }

  filterTagsAndPrograms(items: ScoreDtoApi[]) {
    this.selectedItems = items;
    this.getScores().subscribe();
  }
}
