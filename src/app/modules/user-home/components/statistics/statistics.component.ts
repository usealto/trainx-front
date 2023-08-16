import { Component, OnInit } from '@angular/core';
import { ScoreDtoApi, ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import Chart, { ChartData } from 'chart.js/auto';
import { combineLatest, map, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from 'src/app/modules/statistics/services/statistics.service';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';

@Component({
  selector: 'alto-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  I18ns = I18ns;
  statisticsDuration = ScoreDuration.Trimester;

  //Statistics data
  userScore = 0;
  userScoreProgression = 0;
  guessCount = 0;
  guessCountProgression = 0;

  programsCount = 0;
  finishedProgramsCount = 0;
  averageFinishedPrograms = 0;
  finishedProgramsCountProgression = 0;

  userProgressionChart?: Chart;
  hasData = true;

  constructor(
    private readonly profileStore: ProfileStore,
    private readonly guessesRestService: GuessesRestService,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly programsRestService: ProgramsRestService,
    private readonly programRunsRestService: ProgramRunsRestService,
    private readonly statisticsService: StatisticsService,
  ) {}

  ngOnInit(): void {
    this.getScore();
    this.getFinishedPrograms();
    this.getGuessesCount();
    this.createUserProgressionChart();
  }

  getScore() {
    combineLatest([
      this.scoresRestService.getUsersStats(this.statisticsDuration, false),
      this.scoresRestService.getUsersStats(this.statisticsDuration, true),
    ])
      .pipe(
        map(([curr, prev]) => [
          curr.filter((u) => u.id === this.profileStore.user.value.id),
          prev.filter((u) => u.id === this.profileStore.user.value.id),
        ]),
        tap(([curr, prev]) => {
          this.userScore = curr[0]?.score ?? 0;
          const previousScore = prev[0]?.score ?? 0;
          this.userScoreProgression =
            previousScore && this.userScore ? this.userScore - previousScore : 0;
        }),
      )
      .subscribe();
  }

  getFinishedPrograms() {
    combineLatest([
      this.programsRestService.getProgramsPaginated(
        { teamIds: this.profileStore.user.value.teamId },
        this.statisticsDuration,
      ),
      this.programsRestService.getProgramsPaginated(
        { teamIds: this.profileStore.user.value.teamId },
        this.statisticsDuration,
        true,
      ),
      this.programRunsRestService.getMyProgramRuns(),
    ])
      .pipe(
        tap(([currentPrograms, previousPrograms, currentProgramRuns]) => {
          //TODO: refacto when backend will bring latest program run with programs
          this.programsCount = currentPrograms.data?.length ?? 0;

          const finishedPrograms =
            currentPrograms.data?.filter((p) =>
              currentProgramRuns.some((pr) => pr.programId === p.id && !!pr.finishedAt),
            ) ?? [];

          const previousFinishedPrograms =
            previousPrograms.data?.filter((p) =>
              currentProgramRuns.some((pr) => pr.programId === p.id && !!pr.finishedAt),
            ) ?? [];

          this.finishedProgramsCount = finishedPrograms.length;

          this.averageFinishedPrograms =
            finishedPrograms.length > 0 ? finishedPrograms.length / (currentPrograms.data?.length ?? 1) : 0;

          const avgPreviousFinishedPrograms =
            previousFinishedPrograms.length > 0
              ? previousFinishedPrograms.length / (previousPrograms.data?.length ?? 1)
              : 0;

          this.finishedProgramsCountProgression = this.averageFinishedPrograms - avgPreviousFinishedPrograms;
        }),
      )
      .subscribe();
  }

  getGuessesCount() {
    combineLatest([
      this.guessesRestService.getGuesses(
        { createdBy: this.profileStore.user.value.id, itemsPerPage: 1 },
        this.statisticsDuration,
      ),
      this.guessesRestService.getGuesses(
        { createdBy: this.profileStore.user.value.id, itemsPerPage: 1 },
        this.statisticsDuration,
        true,
      ),
    ])
      .pipe(
        tap(([guesses, previousGuesses]) => {
          this.guessCount = guesses.meta.totalItems;
          this.guessCountProgression =
            previousGuesses.meta.totalItems && guesses.meta.totalItems
              ? (guesses.meta.totalItems - previousGuesses.meta.totalItems) / previousGuesses.meta.totalItems
              : 0;
        }),
      )
      .subscribe();
  }
  createUserProgressionChart() {
    const params = {
      timeframe: ScoreTimeframeEnumApi.Day,
      duration: this.statisticsDuration,
    } as ChartFilters;

    combineLatest([
      this.scoresRestService.getScores({ ...params, type: ScoreTypeEnumApi.User }),
      this.scoresRestService.getScores({ ...params, type: ScoreTypeEnumApi.Team }),
    ])
      .pipe(
        tap(([usersScores, teamsScores]) => {
          //USER SCORES: reduce scores to remove all first values without data
          const rawUserScores = usersScores.scores.find((u) => u.id === this.profileStore.user.value.id);
          if (!rawUserScores) {
            this.hasData = false;
            return;
          }
          const reducedUserScores = this.scoresService.reduceChartData([
            rawUserScores ?? ({} as ScoreDtoApi),
          ]);

          const userScores = this.statisticsService.aggregateDataForScores(
            reducedUserScores[0],
            this.statisticsDuration,
          );

          //TEAM SCORES: reduce scores to remove all first values without data
          const rawTeamScores = teamsScores.scores.find((t) => t.id === this.profileStore.user.value.teamId);
          const reducedTeamScores = this.scoresService.reduceChartData([
            rawTeamScores ?? ({} as ScoreDtoApi),
          ]);

          const teamScores = this.statisticsService.aggregateDataForScores(
            reducedTeamScores[0],
            this.statisticsDuration,
          );

          const labels = this.statisticsService.formatLabel(
            userScores.map((d) => d.x),
            this.statisticsDuration,
          );
          const data: ChartData = {
            labels: labels,
            datasets: [
              {
                label: I18ns.userHome.statistics.progression.you,
                data: userScores.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
                fill: false,
                tension: 0.2,
                spanGaps: true,
              },
              {
                label: I18ns.userHome.statistics.progression.yourTeam,
                data: teamScores.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
                fill: false,
                tension: 0.2,
                borderDash: [4],
                spanGaps: true,
              },
            ],
          };

          if (this.userProgressionChart) {
            this.userProgressionChart.destroy();
          }
          const customChartOptions = {
            ...chartDefaultOptions,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (tooltipItem: any) {
                    return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}%`;
                  },
                },
              },
              legend: {
                display: true,
                labels: { usePointStyle: true, boxWidth: 5, boxHeight: 5, pointStyle: 'circle' },
              },
            },
          };
          this.userProgressionChart = new Chart('userProgressionChart', {
            type: 'line',
            data: data,
            options: customChartOptions,
          });
        }),
      )
      .subscribe();
  }

  updateTimePicker(duration: any) {
    this.statisticsDuration = duration;
    this.getScore();
    this.getFinishedPrograms();
    this.getGuessesCount();
    this.createUserProgressionChart();
  }
}
