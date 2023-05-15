import { Component, Input, OnChanges } from '@angular/core';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ScoreDuration } from 'src/app/modules/programs/models/score.model';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import {
  ProgramDtoApi,
  ScoreDtoApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  TagDtoApi,
  TeamDtoApi,
  TeamStatsDtoApi,
} from 'src/app/sdk';
import Chart, { ChartData } from 'chart.js/auto';
import { ScoresRestService } from 'src/app/modules/programs/services/scores-rest.service';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { StatisticsService, Point } from '../../../services/statistics.service';
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
  teams: TeamDtoApi[] = [];
  @Input() duration: ScoreDuration = ScoreDuration.Year;
  items: ScoreDtoApi[] = [];
  scoredItems: { label: string; score: number | null }[] = [];
  selectedItems: ScoreDtoApi[] = [];
  scoreEvolutionChart?: Chart;
  performanceChart?: Chart;

  constructor(
    private readonly teamRestService: TeamsRestService,
    private readonly scoresRestService: ScoresRestService,
    private readonly statisticsServices: StatisticsService,
    private readonly scoresServices: ScoresService,
  ) {}

  ngOnChanges(): void {
    this.teamRestService
      .getTeams()
      .pipe(tap((res) => (this.teams = res)))
      .subscribe();
    this.getScores();
    this.getPerformanceStats();
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

  getPerformanceStats() {
    this.scoresRestService
      .getTeamsStats(this.duration)
      .pipe(
        tap((res) => {
          this.createPerformanceChart(res);
        }),
      )
      .subscribe();
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

  createPerformanceChart(stats: TeamStatsDtoApi[]) {
    const type = this.activeTab === 1 ? 'tags' : 'programs';
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

    const options = {
      ...chartDefaultOptions,
    };
    if (dataSet.length > 10) {
      options.plugins = {
        legend: {
          display: false,
        },
      };
    }

    if (this.scoreEvolutionChart) {
      this.scoreEvolutionChart.destroy();
    }

    this.scoreEvolutionChart = new Chart('themeScoreEvolution', {
      type: 'line',
      data: data,
      options: options,
    });
  }

  changeTabs() {
    this.activeTab = this.activeTab === 1 ? 2 : 1;
    this.getScores();
    this.getPerformanceStats();
  }

  filterTeams(teams: TeamDtoApi[]) {
    return;
  }

  filterTagsAndPrograms(items: ScoreDtoApi[]) {
    this.selectedItems = items;
    this.getScores();
  }
}
