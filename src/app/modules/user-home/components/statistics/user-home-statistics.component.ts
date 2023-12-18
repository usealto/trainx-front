import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScoreDtoApi, ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import { combineLatest, map, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { User } from 'src/app/models/user.model';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from 'src/app/modules/statistics/services/statistics.service';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';
import { IAppData } from '../../../../core/resolvers';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { Team } from 'src/app/models/team.model';
import { EChartsOption, SeriesOption } from 'echarts';

@Component({
  selector: 'alto-user-home-statistics',
  templateUrl: './user-home-statistics.component.html',
  styleUrls: ['./user-home-statistics.component.scss'],
})
export class UserHomeStatisticsComponent implements OnInit {
  I18ns = I18ns;
  // could be replaced by duration bellow
  statisticsDuration = ScoreDuration.Trimester;

  user!: User;
  userTeam!: Team;
  //Statistics data
  userScore = 0;
  userScoreProgression = 0;
  guessCount = 0;
  guessCountProgression = 0;

  programsCount = 0;
  finishedProgramsCount = 0;
  averageFinishedPrograms = 0;
  finishedProgramsCountProgression = 0;

  EmojiName = EmojiName;
  userChartStatus: PlaceholderDataStatus = 'loading';
  userChartOptions!: EChartsOption;

  constructor(
    private readonly guessesRestService: GuessesRestService,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly programsRestService: ProgramsRestService,
    private readonly programRunsRestService: ProgramRunsRestService,
    private readonly statisticsService: StatisticsService,
    private readonly resolversService: ResolversService,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.user = (data[EResolvers.AppResolver] as IAppData).me;
    const teamsById = (data[EResolvers.AppResolver] as IAppData).teamById;
    this.userTeam = teamsById.get(this.user.teamId as string) as Team;
    this.getScore();
    this.getUserChartScores(this.statisticsDuration);
    this.getFinishedPrograms();
    this.getGuessesCount();
  }

  getScore() {
    combineLatest([
      this.scoresRestService.getUsersStats(this.statisticsDuration, false),
      this.scoresRestService.getUsersStats(this.statisticsDuration, true),
    ])
      .pipe(
        map(([curr, prev]) => [
          curr.filter((u) => u.id === this.user.id),
          prev.filter((u) => u.id === this.user.id),
        ]),
        tap(([curr, prev]) => {
          this.userScore = curr[0]?.score ?? 0;
          const previousScore = prev[0]?.score ?? 0;
          this.userScoreProgression = previousScore && this.userScore ? this.userScore - previousScore : 0;
        }),
      )
      .subscribe();
  }

  getUserChartScores(duration: ScoreDuration): void {
    this.userChartStatus = 'loading';

    const timeframe = (duration: ScoreDuration) =>
      duration === ScoreDuration.Year
        ? ScoreTimeframeEnumApi.Month
        : duration === ScoreDuration.Trimester
        ? ScoreTimeframeEnumApi.Week
        : ScoreTimeframeEnumApi.Day;

    combineLatest([
      this.scoresRestService.getScores({
        type: ScoreTypeEnumApi.User,
        duration: this.statisticsDuration,
        ids: [this.user.id],
        timeframe: timeframe(this.statisticsDuration),
      }),
      this.scoresRestService.getScores({
        type: ScoreTypeEnumApi.Team,
        duration: this.statisticsDuration,
        ids: [this.userTeam.id],
        timeframe: timeframe(this.statisticsDuration),
      }),
    ])
      .pipe(
        tap(([userScores, teamScores]) => {
          this.userChartStatus = userScores.scores.length > 0 ? 'good' : 'empty';
          if (userScores.scores.length > 0) {
            this.createUserChart(userScores.scores[0], teamScores.scores[0], duration);
          }
        }),
      )
      .subscribe();
  }

  getFinishedPrograms() {
    combineLatest([
      this.programsRestService.getProgramsPaginated({ teamIds: this.user.teamId }, this.statisticsDuration),
      this.programsRestService.getProgramsPaginated(
        { teamIds: this.user.teamId },
        this.statisticsDuration,
        true,
      ),
      this.programRunsRestService.getMyProgramRuns(this.user.id),
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
        { createdBy: this.user.id, itemsPerPage: 1 },
        this.statisticsDuration,
      ),
      this.guessesRestService.getGuesses(
        { createdBy: this.user.id, itemsPerPage: 1 },
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

  createUserChart(userScores: ScoreDtoApi, teamScores: ScoreDtoApi, duration: ScoreDuration): void {
    const reducedTeamScores = this.scoresService.reduceLineChartData([teamScores])[0];
    const teamPoints = this.statisticsService.transformDataToPoint(reducedTeamScores);

    const labels = this.statisticsService.formatLabel(
      teamPoints.map((d) => d.x),
      duration,
    );

    const dataSets = [userScores, teamScores].map((scores, i) => {
      const d = this.statisticsService.transformDataToPoint(scores);
      return {
        label:
          i === 0
            ? I18ns.userHome.statistics.progression.you
            : I18ns.userHome.statistics.progression.yourTeam + ` (${scores.label}) `,
        data: d.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
      };
    });

    const series = dataSets.map((d, i) => {
      return {
        name: d.label,
        data: d.data,
        type: 'line',
        showSymbol: false,
        tooltip: {
          valueFormatter: (value: any) => {
            return (value as number) + '%';
          },
        },
        lineStyle: i === 0 ? {} : { type: 'dashed' },
      };
    });

    this.userChartOptions = {
      xAxis: [{ ...xAxisDatesOptions, data: labels }],
      yAxis: [{ ...yAxisScoreOptions, axisLabel: { show: false } }],
      series: series as SeriesOption[],
      legend: { ...legendOptions, top: 5 },
    };
  }

  updateTimePicker(duration: any) {
    this.statisticsDuration = duration;
    this.getScore();
    this.getUserChartScores(duration);
    this.getFinishedPrograms();
    this.getGuessesCount();
  }
}
