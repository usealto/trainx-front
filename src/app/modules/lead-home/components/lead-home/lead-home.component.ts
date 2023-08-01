import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ChallengeDtoApi,
  ChallengeDtoApiTypeEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  UserDtoApi,
} from '@usealto/sdk-ts-angular';
import Chart, { ChartData } from 'chart.js/auto';
import { Observable, combineLatest, filter, map, of, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { ChallengesRestService } from 'src/app/modules/challenges/services/challenges-rest.service';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';
import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import {
  ScoreDuration,
  ScoreFilters,
  TopFlop,
  TopFlopDisplay,
} from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from 'src/app/modules/statistics/services/statistics.service';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';

@UntilDestroy()
@Component({
  selector: 'alto-lead-home',
  templateUrl: './lead-home.component.html',
  styleUrls: ['./lead-home.component.scss'],
})
export class LeadHomeComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  ScoreDuration = ScoreDuration;
  ScoreTypeEnum = ScoreTypeEnumApi;

  userName = '';

  globalFilters: ScoreFilters = {
    duration: ScoreDuration.Trimester,
    type: ScoreTypeEnumApi.Team,
    teams: [],
  };
  chartFilters: ChartFilters = {
    duration: ScoreDuration.Trimester,
    type: ScoreTypeEnumApi.Tag,
    team: '',
    tags: [],
  };

  scoreCount = 0;

  averageScore = 0;
  averageScoreProgression = 0;

  programsCount = 0;
  finishedProgramsCount = 0;
  averageFinishedPrograms = 0;
  averageFinishedProgramsProgression = 0;

  guessCount = 0;
  totalGuessCount = 0;
  guessCountProgression = 0;

  commentsCount = 0;
  questionsCount = 0;
  statisticTimeRange: ScoreTimeframeEnumApi = ScoreTimeframeEnumApi.Week;
  evolutionChart?: Chart;
  //
  challengesByTeam: ChallengeDtoApi[] = [];
  challengesByUser: ChallengeDtoApi[] = [];

  topFlopData: {
    programs: TopFlop;
    teams: TopFlop;
  } = { programs: { top: [], flop: [] }, teams: { top: [], flop: [] } };

  topFlopProgramTab: ScoreTypeEnumApi = ScoreTypeEnumApi.Program;
  topFlopTeamTab: ScoreTypeEnumApi = ScoreTypeEnumApi.Team;

  constructor(
    private readonly commentsRestService: CommentsRestService,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
    private readonly challengesRestService: ChallengesRestService,
    private readonly userService: UsersRestService,
    private readonly statisticsServices: StatisticsService,
    public readonly teamStore: TeamStore,
    public readonly profileStore: ProfileStore,
    public readonly programsStore: ProgramsStore,
    public readonly programsRestService: ProgramsRestService,
    public readonly guessesRestService: GuessesRestService,
    public readonly companiesRestService: CompaniesRestService,
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.commentsRestService.getComments(),
      this.questionsSubmittedRestService.getQuestions(),
      this.challengesRestService.getChallenges({ itemsPerPage: 40, sortBy: 'endDate:desc' }),
    ])
      .pipe(
        tap(([comments, questions, challenges]) => {
          this.commentsCount = comments.length;
          this.questionsCount = questions.length;
          this.challengesByTeam = challenges
            .filter((c) => c.type === ChallengeDtoApiTypeEnumApi.ByTeam)
            .slice(0, 5);
          this.challengesByUser = challenges
            .filter((c) => c.type === ChallengeDtoApiTypeEnumApi.ByUser)
            .slice(0, 5);
        }),
        tap(() => this.getAverageScore(this.globalFilters.duration as ScoreDuration)),
        tap(() => this.getProgramsStats(this.globalFilters)),
        tap(() => this.getGuessesCount(this.globalFilters.duration as ScoreDuration)),
        untilDestroyed(this),
      )
      .subscribe();
    this.chartFilters.tags = this.programsStore.tags.value.slice(0, 3).map((tag) => tag.id);
    this.createCharts(this.chartFilters);
  }

  createCharts({
    duration = this.chartFilters.duration,
    type = this.chartFilters.type ?? ScoreTypeEnumApi.Program,
    team = this.chartFilters.team,
    tags = this.chartFilters.tags,
  }: ChartFilters) {
    this.chartFilters.duration = duration;
    this.chartFilters.type = type;
    this.chartFilters.team = team;
    this.chartFilters.tags = tags;
    this.topFlop(this.topFlopProgramTab);
    this.topFlop(this.topFlopTeamTab);

    if (this.evolutionChart) {
      this.evolutionChart.destroy();
    }
    this.scoresRestService
      .getScores(this.chartFilters)
      .pipe(
        tap(({ scores }) => (this.scoreCount = scores.length)),
        filter(() => !!this.scoreCount),
        tap(({ scores }) => {
          //temp: manual filter chart by tags until backend updates
          if (tags && tags.length > 0) {
            scores = scores.filter((s) => tags.some((t) => s.id.includes(t)));
          }

          scores = this.scoreService.reduceChartData(scores);
          const aggregateData = this.statisticsServices.aggregateDataForScores(
            scores[0],
            duration as ScoreDuration,
          );

          const labels = this.statisticsServices.formatLabel(
            aggregateData.map((d) => d.x),
            duration as ScoreDuration,
          );

          const data: ChartData = {
            labels: labels,
            datasets: scores.map((s) => {
              const d = this.statisticsServices.aggregateDataForScores(s, duration as ScoreDuration);

              return {
                label: s.label,
                data: d.map((u) => (u.y ? Math.round((u.y * 10000) / 100) : u.y)),
                fill: false,
                tension: 0.2,
                spanGaps: true,
              };
            }),
          };

          const customChartOptions = {
            ...chartDefaultOptions,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (tooltipItem: any) {
                    let labelType = 'tag';
                    if (type === 'program') {
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

          this.evolutionChart = new Chart('programScoreEvol', {
            type: 'line',
            data: data,
            options: customChartOptions,
          });
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  topFlop(val: ScoreTypeEnumApi) {
    this.scoresRestService
      .getScores({
        ...this.chartFilters,
        timeframe: ScoreTimeframeEnumApi.Day,
        type: val,
        sortBy: 'lastAverage:desc',
      })
      .pipe(
        tap(({ scores }) => {
          const output: TopFlopDisplay[] = scores
            .map((s) => ({
              label: s.label,
              avg: this.scoreService.reduceWithoutNull(s.averages) ?? 0,
            }))
            .filter((x) => !!x.avg);
          if (val === ScoreTypeEnumApi.Program || val === ScoreTypeEnumApi.Tag) {
            this.topFlopProgramTab = val;
            this.topFlopData.programs = {
              top: this.scoreService.getTop(output),
              flop: this.scoreService.getFlop(output),
            };
          }
          if (val === ScoreTypeEnumApi.Team || val === ScoreTypeEnumApi.User) {
            this.topFlopTeamTab = val;
            this.topFlopData.teams = {
              top: this.scoreService.getTop(output),
              flop: this.scoreService.getFlop(output),
            };
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  updateStatisticsDuration(duration: string) {
    this.globalFilters.duration = duration as ScoreDuration;
    this.getAverageScore(duration as ScoreDuration);
    this.getProgramsStats(this.globalFilters);
    this.getGuessesCount(duration as ScoreDuration);
  }

  getAverageScore(duration: ScoreDuration) {
    return combineLatest([
      this.scoresRestService.getTeamsStats(duration),
      this.scoresRestService.getTeamsStats(duration, true),
    ])
      .pipe(
        tap(([current, previous]) => {
          const previousScore = previous.reduce((acc, team) => acc + (team.score ?? 0), 0) / previous.length;
          this.averageScore = current.reduce((acc, team) => acc + (team.score ?? 0), 0) / current.length;
          this.averageScoreProgression = previousScore
            ? (this.averageScore - previousScore) / previousScore
            : 0;
        }),
      )
      .subscribe();
  }

  getProgramsStats(filters: ScoreFilters) {
    combineLatest([
      this.scoresRestService.getCompletion(filters, false),
      this.scoresRestService.getCompletion(filters, true),
      this.scoresRestService.getProgramsStats(filters.duration as ScoreDuration),
    ])
      .pipe(
        tap(([currentCompletion, lastCompletion, programsStats]) => {
          this.finishedProgramsCount = currentCompletion.filter((p) => p.finishedAt).length;
          this.programsCount = currentCompletion.length;
          this.averageFinishedPrograms = this.finishedProgramsCount / this.programsCount;
          const lastFinishedProgramsCount = lastCompletion.filter((p) => p.finishedAt).length;
          const lastProgramsCount = lastCompletion.length;
          const lastAverageFinishedPrograms = lastFinishedProgramsCount / lastProgramsCount;
          this.averageFinishedProgramsProgression =
            this.averageFinishedPrograms - lastAverageFinishedPrograms;

          this.programsCount = programsStats.length;
          this.finishedProgramsCount = programsStats.filter((p) => p.participation === 1).length;
          this.averageFinishedPrograms = this.finishedProgramsCount / this.programsCount;
        }),
      )
      .subscribe();
  }

  getGuessesCount(duration: ScoreDuration) {
    combineLatest([
      this.guessesRestService.getGuesses({ itemsPerPage: 1 }, duration),
      this.guessesRestService.getGuesses({ itemsPerPage: 1 }, duration, true),
      this.companiesRestService.getMyCompany(),
    ])
      .pipe(
        tap(([guesses, previousGuesses, company]) => {
          this.guessCount = guesses.meta.totalItems;
          this.guessCountProgression =
            previousGuesses.meta.totalItems && guesses.meta.totalItems
              ? (guesses.meta.totalItems - previousGuesses.meta.totalItems) / previousGuesses.meta.totalItems
              : 0;
          // console.log(company);
        }),
      )
      .subscribe();
  }

  @memoize()
  getUser(id: string): Observable<UserDtoApi | undefined> {
    if (!id) {
      return of(undefined);
    }
    return this.userService.getUsersFiltered({ ids: id }).pipe(map((u) => u.shift()));
  }
}
