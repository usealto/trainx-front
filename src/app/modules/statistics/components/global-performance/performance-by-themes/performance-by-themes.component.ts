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
} from 'src/app/sdk';
import Chart, { ChartData } from 'chart.js/auto';
import { ScoresRestService } from 'src/app/modules/programs/services/scores-rest.service';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { StatisticsService, Point } from '../../../services/statistics.service';
import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';

@Component({
  selector: 'alto-performance-by-themes',
  templateUrl: './performance-by-themes.component.html',
  styleUrls: ['./performance-by-themes.component.scss'],
})
export class PerformanceByThemesComponent implements OnChanges {
  I18ns = I18ns;
  activeTab = 1;
  @Input() duration: ScoreDuration = ScoreDuration.Year;
  teams = this.teamStore.teams.value;
  programs = this.programsStore.programs.value;
  tags = this.programsStore.tags.value;
  scoreEvolutionChart?: Chart;
  performanceChart?: Chart;

  constructor(
    private readonly teamsRestService: TeamsRestService,
    private readonly programsRestService: ProgramsRestService,
    private readonly scoresRestService: ScoresRestService,
    private readonly teamStore: TeamStore,
    private readonly programsStore: ProgramsStore,
    private readonly statisticsServices: StatisticsService,
  ) {}

  ngOnChanges(): void {
    this.teamsRestService.getTeams().subscribe();
    this.programsRestService
      .getPrograms()
      .pipe(tap((programs) => (this.programs = programs)))
      .subscribe();
    this.getScores(this.duration);
  }

  getScores(duration: ScoreDuration) {
    this.scoresRestService
      .getScores({
        timeframe: ScoreTimeframeEnumApi.Day,
        duration: duration ?? ScoreDuration.Year,
        type: this.activeTab === 1 ? ScoreTypeEnumApi.Tag : ScoreTypeEnumApi.Program,
      } as ChartFilters)
      .pipe(
        tap((res) => {
          this.createScoreEvolutionChart(res.scores, duration);
        }),
      )
      .subscribe();
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
    const res: { x: Date; y: number; z: number }[] = [];

    total.forEach((teamData) => {
      teamData.forEach((point) => {
        const element = res.filter((pt) => pt.x.getTime() === point.x.getTime());
        if (element.length === 1) {
          if (isNaN(element[0].y)) {
            element[0].y = isNaN(point.y) ? 0 : point.y;
          } else {
            element[0].y = isNaN(point.y) ? element[0].y : element[0].y + point.y;
          }
          element[0].z += isNaN(point.y) ? 0 : 1;
        } else {
          res.push({ ...point, z: 0 });
        }
      });
    });

    res.forEach((pt) => {
      pt.y = pt.y / pt.z;
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

    this.scoreEvolutionChart = new Chart('themeScoreEvolution', {
      type: 'line',
      data: data,
      options: chartDefaultOptions,
    });
  }

  changeTabs() {
    this.activeTab = this.activeTab === 1 ? 2 : 1;
    this.getScores(this.duration);
  }

  filterTeams(teams: TeamDtoApi[]) {
    return;
  }
  filterTags(tags: TagDtoApi[]) {
    return;
  }
  filterPrograms(teams: ProgramDtoApi[]) {
    return;
  }
}
