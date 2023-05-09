import { Component, OnInit } from '@angular/core';
import Chart, { ChartData } from 'chart.js/auto';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ScoreDuration } from 'src/app/modules/programs/models/score.model';
import { ScoresRestService } from 'src/app/modules/programs/services/scores-rest.service';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';
import { ScoreDtoApi, ScoreTimeframeEnumApi, ScoreTypeEnumApi, TeamDtoApi } from 'src/app/sdk';
import { startOfDay, startOfMonth, startOfWeek, format, toDate, parseISO } from 'date-fns';
import { ScoresService } from 'src/app/modules/programs/services/scores.service';
import { StatisticsService } from '../../services/statistics.service';

interface Point {
  x: Date;
  y: number;
}
@Component({
  selector: 'alto-statistics-global-performance',
  templateUrl: './statistics-global-performance.component.html',
  styleUrls: ['./statistics-global-performance.component.scss'],
})
export class StatisticsGlobalPerformanceComponent implements OnInit {
  I18ns = I18ns;
  teams: TeamDtoApi[] = [];
  scoredTeams: { label: string; score: number }[] = [];
  scoreEvolutionChart?: Chart;

  constructor(
    public readonly teamStore: TeamStore,
    private readonly teamsRestService: TeamsRestService,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresServices: ScoresService,
    private readonly statisticsServices: StatisticsService,
  ) {}

  ngOnInit(): void {
    this.teamsRestService.getTeams().subscribe();
    this.getTeamsScores();
  }

  getTeamsScores(duration?: ScoreDuration) {
    this.scoresRestService
      .getScores({
        timeframe: ScoreTimeframeEnumApi.Day,
        duration: duration ?? ScoreDuration.Year,
        type: ScoreTypeEnumApi.Team,
      } as ChartFilters)
      .pipe(
        tap((res) => this.createScoreEvolutionChart(res.scores, duration ?? ScoreDuration.Year)),
        tap((res) => {
          this.scoredTeams = res.scores
            .map((score) => {
              const average = this.scoresServices.reduceWithoutNull(score.averages);
              return { label: score.label, score: average };
            })
            .sort((a, b) => b.score - a.score);
        }),
      )
      .subscribe();
  }

  createScoreEvolutionChart(scores: ScoreDtoApi[], duration: ScoreDuration) {
    const aggregateData = this.aggregateData(scores[0], duration);
    const labels = this.statisticsServices.formatLabel(
      aggregateData.map((d) => d.x),
      duration,
    );
    const data: ChartData = {
      labels: labels,
      datasets: scores.map((s) => {
        const d = this.aggregateData(s, duration);
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

  aggregateData(score: ScoreDtoApi, duration: ScoreDuration) {
    const data: Point[] = [];
    const groupedData: { [key: string]: number[] } = {};

    score.dates.forEach((date, index) => {
      const dateKey = format(
        duration === ScoreDuration.Year
          ? startOfMonth(date)
          : duration === ScoreDuration.Trimester
          ? startOfWeek(date)
          : startOfDay(date),
        "yyyy-MM-dd'T'HH:mm:ss'Z'",
      );
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = [];
      }
      groupedData[dateKey].push(score.averages[index]);
    });

    for (const dateKey in groupedData) {
      const avg = this.scoresServices.reduceWithoutNull(groupedData[dateKey]);
      data.push({ x: parseISO(dateKey), y: avg });
    }
    return data.sort((a, b) => a.x.getTime() - b.x.getTime());
  }

  updateTimePicker(event: any): void {
    this.getTeamsScores(event.target.id);
  }
}
