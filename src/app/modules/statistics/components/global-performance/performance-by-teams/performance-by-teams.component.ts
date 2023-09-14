import { Component, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  ScoreDtoApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  ScoresResponseDtoApi,
  TeamStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import Chart, { ChartData } from 'chart.js/auto';
import { Observable, combineLatest, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from '../../../services/statistics.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';

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
  scoreEvolutionChart?: Chart;
  scoreCount = 0;

  teamsLeaderboard: { name: string; score: number }[] = [];
  teamsLeaderboardCount = 0;

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
          tap(([, teams]) => {
            teams = teams.filter((t) => t.score && t.score >= 0);
            this.teamsLeaderboard = teams.map((t) => ({ name: t.team.name, score: t.score ?? 0 }));
            this.teamsLeaderboardCount = this.teamsLeaderboard.length;
          }),
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

  getScores(): Observable<ScoresResponseDtoApi> {
    return this.scoresRestService
      .getScores({
        timeframe: ScoreTimeframeEnumApi.Day,
        duration: this.duration ?? ScoreDuration.Year,
        type: ScoreTypeEnumApi.Team,
      } as ChartFilters)
      .pipe(
        tap((res) => {
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
          this.createScoreEvolutionChart(filteredTeams, this.duration);
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

  createScoreEvolutionChart(scores: ScoreDtoApi[], duration: ScoreDuration) {
    scores = this.scoresServices.reduceChartData(scores);
    this.scoreCount = scores.length;
    const aggregateData = this.statisticsServices.aggregateDataForScores(scores[0], duration);
    const labels = this.statisticsServices.formatLabel(
      aggregateData.map((d) => d.x),
      duration,
    );

    if (this.scoreEvolutionChart) {
      this.scoreEvolutionChart.destroy();
    }

    const dataSet = scores.map((s) => {
      const d = this.statisticsServices.aggregateDataForScores(s, duration);
      return {
        label: s.label,
        data: d.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
        fill: false,
        tension: 0.2,
        spanGaps: true,
      };
    });

    const data: ChartData = {
      labels: labels,
      datasets: dataSet,
    };

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
    this.getScores().subscribe();
  }
}
