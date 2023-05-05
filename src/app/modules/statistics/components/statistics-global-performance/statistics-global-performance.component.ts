import { Component, OnInit } from '@angular/core';
import { Chart, ChartData } from 'chart.js';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ScoreDuration } from 'src/app/modules/programs/models/score.model';
import { ScoresRestService } from 'src/app/modules/programs/services/scores-rest.service';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';
import {
  GetScoresRequestParams,
  ScoreDtoApi,
  ScoreFillValuesEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  TeamDtoApi,
} from 'src/app/sdk';
import * as moment from 'moment';

@Component({
  selector: 'alto-statistics-global-performance',
  templateUrl: './statistics-global-performance.component.html',
  styleUrls: ['./statistics-global-performance.component.scss'],
})
export class StatisticsGlobalPerformanceComponent implements OnInit {
  I18ns = I18ns;
  teams: TeamDtoApi[] = [];
  scoredTeams: { label: string; score: number }[] = [];
  ScoreEvolutionChart?: Chart;

  constructor(
    public readonly teamStore: TeamStore,
    private readonly teamsRestService: TeamsRestService,
    private readonly scoresRestService: ScoresRestService,
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
              const filledScore = score.averages.filter((average) => average !== null);
              const average = filledScore.reduce((acc, val) => acc + val, 0) / filledScore.length;
              return { label: score.label, score: average };
            })
            .sort((a, b) => b.score - a.score);
        }),
      )
      .subscribe();
  }

  createScoreEvolutionChart(scores: ScoreDtoApi[], duration: ScoreDuration) {
    console.log(scores);
    console.log(this.aggregateDate(scores[0].dates, duration));
    const labels = scores[0].dates.map((d) => d.toLocaleDateString());
    const data: ChartData = {
      labels: labels,
      datasets: scores.map((s) => ({
        label: s.label,
        data: s.averages.map((u) => (u ? Math.round(u * 10000) / 100 : u)),
        fill: false,
        tension: 0.2,
        spanGaps: true,
      })),
    };

    this.ScoreEvolutionChart = new Chart('teamScoreEvolution', {
      type: 'line',
      data: data,
      options: chartDefaultOptions,
    });
  }

  aggregateDate(dates: Date[], duration: ScoreDuration) {
    const aggregateData = [];
    const groupedData: { [key: string]: Date[] } = {};

    dates.forEach((date) => {
      const dateKey = moment(date)
        .startOf(duration === ScoreDuration.Month ? 'day' : 'month')
        .format();
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = [];
      }
      groupedData[dateKey].push(date);

      for (const dateKey in groupedData) {
        // const sum = groupedData[dateKey].reduce((a, b) => a + b, 0);
        console.log(groupedData[dateKey]);
      }
    });
  }

  updateTimePicker(event: any): void {
    this.getTeamsScores(event.target.id);
  }
}
