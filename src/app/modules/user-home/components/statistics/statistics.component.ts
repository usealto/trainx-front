import { Component, OnInit } from '@angular/core';
import { GuessDtoApi, ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import Chart, { ChartData } from 'chart.js/auto';
import { getDayOfYear } from 'date-fns';
import { combineLatest, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
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
  statisticsDuration = ScoreDuration.Month;

  //Statistics data
  userScore = 0;
  userScoreProgression = 0;
  guessCount = 0;
  guessCountProgression = 0;
  averageFinishedPrograms = 0;
  finishedProgramsCount = 0;
  programsCount = 0;
  finishedProgramsCountProgression = 0;
  userProgressionChart?: Chart;

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
    const params = {
      timeframe: ScoreTimeframeEnumApi.Day,
      duration: this.statisticsDuration,
      type: ScoreTypeEnumApi.User,
      ids: [this.profileStore.user.value.id],
    } as ChartFilters;
    combineLatest([this.scoresRestService.getScores(params), this.scoresRestService.getScores(params, true)])
      .pipe(
        tap(([curr, prev]) => {
          this.userScore = this.scoresService.reduceWithoutNull(curr.scores[0].averages) ?? 0;
          if (prev.scores.length) {
            this.userScoreProgression = this.scoresService.reduceWithoutNull(prev.scores[0].averages) ?? 0;
          }
        }),
      )
      .subscribe();
  }

  getFinishedPrograms() {
    combineLatest([
      this.programsRestService.getPrograms(this.statisticsDuration),
      this.programsRestService.getPrograms(this.statisticsDuration, true),
      this.programRunsRestService.getMyProgramRuns({}, this.statisticsDuration),
      this.programRunsRestService.getMyProgramRuns({}, this.statisticsDuration, true),
    ])
      .pipe(
        tap(([currentPrograms, previousPrograms, currentProgramRuns, previousProgramRuns]) => {
          this.programsCount = currentPrograms.length;
          const finishedPrograms = currentPrograms.filter((p) =>
            currentProgramRuns.some((pr) => pr.programId === p.id),
          );
          const previousFinishedPrograms = previousPrograms.filter((p) =>
            previousProgramRuns.some((pr) => pr.programId === p.id),
          );
          this.finishedProgramsCount = finishedPrograms.length;
          this.averageFinishedPrograms = finishedPrograms.length
            ? finishedPrograms.length / currentPrograms.length
            : 0;
          this.finishedProgramsCountProgression = previousFinishedPrograms.length
            ? previousFinishedPrograms.length / previousPrograms.length - this.averageFinishedPrograms
            : 0;
        }),
      )
      .subscribe();
  }

  getGuessesCount() {
    combineLatest([
      this.guessesRestService.getGuesses(
        { createdBy: this.profileStore.user.value.id, itemsPerPage: 1000 },
        this.statisticsDuration,
      ),
      this.guessesRestService.getGuesses(
        { createdBy: this.profileStore.user.value.id, itemsPerPage: 1000 },
        this.statisticsDuration,
        true,
      ),
    ])
      .pipe(
        tap(([guesses, previousGuesses]) => {
          this.guessCount = guesses.length;
          this.guessCountProgression =
            previousGuesses.length && guesses.length
              ? (guesses.length - previousGuesses.length) / previousGuesses.length
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
          const userScores = this.statisticsService.aggregateDataForScores(
            usersScores.scores.find((u) => u.id === this.profileStore.user.value.id)!,
            this.statisticsDuration,
          );
          const teamScores = this.statisticsService.aggregateDataForScores(
            teamsScores.scores.find((t) => t.id === this.profileStore.user.value.teamId)!,
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
                spanGaps: true,
              },
            ],
          };

          if (this.userProgressionChart) {
            this.userProgressionChart.destroy();
          }

          this.userProgressionChart = new Chart('userProgressionChart', {
            type: 'line',
            data: data,
            options: chartDefaultOptions,
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
