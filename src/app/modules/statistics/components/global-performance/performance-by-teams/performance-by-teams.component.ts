import { Component, Input, OnChanges, Output } from '@angular/core';
import Chart, { ChartData } from 'chart.js/auto';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { ScoreDtoApi, ScoreTimeframeEnumApi, ScoreTypeEnumApi } from 'src/app/sdk';
import { StatisticsService } from '../../../services/statistics.service';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';

@Component({
  selector: 'alto-performance-by-teams',
  templateUrl: './performance-by-teams.component.html',
  styleUrls: ['./performance-by-teams.component.scss'],
})
export class PerformanceByTeamsComponent implements OnChanges {
  I18ns = I18ns;
  teams: ScoreDtoApi[] = [];
  selectedTeams: ScoreDtoApi[] = [];
  scoredTeams: { label: string; score: number | null }[] = [];
  scoreEvolutionChart?: Chart;
  @Input() duration: ScoreDuration = ScoreDuration.Year;
  @Output() selecedDuration = this.duration;

  constructor(
    public readonly teamStore: TeamStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresServices: ScoresService,
    private readonly statisticsServices: StatisticsService,
  ) {}

  ngOnChanges(): void {
    this.scoresRestService
      .getScores({
        timeframe: ScoreTimeframeEnumApi.Day,
        duration: this.duration ?? ScoreDuration.Year,
        type: ScoreTypeEnumApi.Team,
      } as ChartFilters)
      .pipe(
        tap((res) => {
          this.teams = res.scores;
          if (!this.selectedTeams.length) {
            this.selectedTeams = res.scores.slice(0, 5);
          }
        }),
        tap((res) => {
          this.getTeamsScores(res.scores);
        }),
      )
      .subscribe();
  }

  getTeamsScores(scores: ScoreDtoApi[]) {
    this.createScoreEvolutionChart(
      this.selectedTeams.length
        ? scores.filter((score) => this.selectedTeams.some((team) => team.id === score.id))
        : scores,
      this.duration ?? ScoreDuration.Year,
    ),
      (this.scoredTeams = scores
        .map((score) => {
          const average = this.scoresServices.reduceWithoutNull(score.averages);
          return { label: score.label, score: average };
        })
        .sort((a, b) => (a.score && b.score ? b.score - a.score : 0)));
  }

  createScoreEvolutionChart(scores: ScoreDtoApi[], duration: ScoreDuration) {
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
          data: d.map((d) => (d.y ? Math.round(d.y * 10000) / 100 : d.y)),
          fill: false,
          tension: 0.2,
          spanGaps: true,
        };
      }),
    };
    if (this.scoreEvolutionChart) {
      this.scoreEvolutionChart.destroy();
    }

    this.scoreEvolutionChart = new Chart('teamScoreEvolution', {
      type: 'line',
      data: data,
      options: chartDefaultOptions,
    });
  }

  filterTeams(event: ScoreDtoApi[]) {
    this.selectedTeams = event;
    this.getTeamsScores(this.teams);
  }
}
