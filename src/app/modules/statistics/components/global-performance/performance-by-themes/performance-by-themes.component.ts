import { Component, Input, OnChanges } from '@angular/core';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoreDuration } from 'src/app/modules/programs/models/score.model';
import { ScoreDtoApi, ScoreTimeframeEnumApi, ScoreTypeEnumApi, TeamStatsDtoApi } from 'src/app/sdk';
import Chart, { ChartData } from 'chart.js/auto';
import { ScoresRestService } from 'src/app/modules/programs/services/scores-rest.service';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { StatisticsService } from '../../../services/statistics.service';
import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';
import { ScoresService } from 'src/app/modules/programs/services/scores.service';

@Component({
  selector: 'alto-performance-by-themes',
  templateUrl: './performance-by-themes.component.html',
  styleUrls: ['./performance-by-themes.component.scss'],
})
export class PerformanceByThemesComponent implements OnChanges {
  I18ns = I18ns;
  activeTab = 1;
  teams: { label: string; id: string }[] = [];
  selectedTeams: { label: string; id: string }[] = [];
  teamsStats: TeamStatsDtoApi[] = [];
  @Input() duration: ScoreDuration = ScoreDuration.Year;
  items: ScoreDtoApi[] = [];
  scoredItems: { label: string; score: number | null }[] = [];
  selectedItems: ScoreDtoApi[] = [];
  scoreEvolutionChart?: Chart;
  performanceChart?: Chart;

  constructor(
    private readonly scoresRestService: ScoresRestService,
    private readonly statisticsServices: StatisticsService,
    private readonly scoresServices: ScoresService,
  ) {}

  ngOnChanges(): void {
    this.getScores();
    this.scoresRestService
      .getTeamsStats(this.duration)
      .pipe(
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
      )
      .subscribe();
  }

  getScores() {
    this.scoresRestService
      .getScores({
        timeframe: ScoreTimeframeEnumApi.Day,
        duration: this.duration ?? ScoreDuration.Year,
        type: this.activeTab === 1 ? ScoreTypeEnumApi.Tag : ScoreTypeEnumApi.Program,
      } as ChartFilters)
      .pipe(
        tap((res) => {
          this.items = res.scores;
          let filteredItems: ScoreDtoApi[] = res.scores;
          if (this.selectedItems.length) {
            filteredItems = res.scores.filter((s) => this.selectedItems.some((si) => si.id === s.id));
          }
          this.getScoredItems(this.items);
          this.createScoreEvolutionChart(filteredItems, this.duration);
        }),
      )
      .subscribe();
  }

  getScoredItems(scores: ScoreDtoApi[]) {
    this.scoredItems = scores
      .map((score) => {
        const average = this.scoresServices.reduceWithoutNull(score.averages);
        return { label: score.label, score: average };
      })
      .sort((a, b) => (a.score && b.score ? b.score - a.score : 0));
  }

  getThemesLabel(stats: TeamStatsDtoApi[]): string[] {
    const labels: string[] = [];
    const type = this.activeTab === 1 ? 'tags' : 'programs';

    stats.forEach((s) => {
      s[type]?.forEach((t) => {
        if (!labels.includes(t.label)) {
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
      s[type]?.forEach((item) => res.data.push(item.score || NaN));
      return res;
    });

    const data: ChartData = {
      labels: labels,
      datasets: dataset,
    };

    if (this.performanceChart) {
      this.performanceChart.destroy();
    }
    this.performanceChart = new Chart('themePerformance', {
      type: 'radar',
      data: data,
      options: { ...chartDefaultOptions, scales: undefined },
    });
  }

  createScoreEvolutionChart(scores: ScoreDtoApi[], duration: ScoreDuration) {
    const aggregatedData = this.statisticsServices.aggregateDataForScores(scores[0], duration);
    const labels = this.statisticsServices.formatLabel(
      aggregatedData.map((d) => d.x),
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
            element[0].y = element[0].y + (point.y || 0);
          }
          element[0].z += point.y ? 1 : 0;
        } else {
          res.push({ ...point, z: 0 });
        }
      });
    });

    res.forEach((pt) => {
      if (pt.y && pt.z > 0) {
        pt.y = pt.y / pt.z;
      }
    });

    const dataSet = scores
      .map((s) => {
        const d = this.statisticsServices.aggregateDataForScores(s, duration);
        return {
          label: s.label,
          data: d.map((d) => (d.y ? Math.round(d.y * 10000) / 100 : d.y)),
          fill: false,
          tension: 0.2,
          borderDash: [0],
          spanGaps: true,
        };
      })
      .splice(0, 5);
    dataSet.push({
      label: 'Global',
      data: res.map((d) => (d.y ? Math.round(d.y * 10000) / 100 : d.y)),
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

    this.scoreEvolutionChart = new Chart('themeScoreEvolution', {
      type: 'line',
      data: data,
      options: chartDefaultOptions,
    });
  }

  changeTabs() {
    this.activeTab = this.activeTab === 1 ? 2 : 1;
    this.getScores();
    this.createPerformanceChart(this.selectedTeams);
  }

  filterTeams(teams: { label: string; id: string }[]) {
    this.selectedTeams = teams;
    this.createPerformanceChart(this.selectedTeams);
    return;
  }

  filterTagsAndPrograms(items: ScoreDtoApi[]) {
    this.selectedItems = items;
    this.getScores();
  }
}
