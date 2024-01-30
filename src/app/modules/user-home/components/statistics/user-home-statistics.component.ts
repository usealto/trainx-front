import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import { combineLatest, map, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { User } from 'src/app/models/user.model';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from 'src/app/modules/statistics/services/statistics.service';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';
import { IAppData } from '../../../../core/resolvers';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { EPlaceholderStatus } from '../../../shared/components/placeholder-manager/placeholder-manager.component';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { Team } from 'src/app/models/team.model';
import { EChartsOption, SeriesOption } from 'echarts';
import { EScoreDuration, Score } from '../../../../models/score.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'alto-user-home-statistics',
  templateUrl: './user-home-statistics.component.html',
  styleUrls: ['./user-home-statistics.component.scss'],
})
export class UserHomeStatisticsComponent implements OnInit {
  I18ns = I18ns;

  durationControl: FormControl<EScoreDuration> = new FormControl<EScoreDuration>(EScoreDuration.Year, {
    nonNullable: true,
  });

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
  userChartStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
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
    const teamsById = (data[EResolvers.AppResolver] as IAppData).company.teams;
    this.userTeam = teamsById.find((t) => t.id === this.user.teamId) || new Team({} as any);

    this.durationControl.valueChanges.subscribe((duration) => {
      this.getScore(duration);
      this.getUserChartScores(duration);
      this.getFinishedPrograms(duration);
      this.getGuessesCount(duration);
    });
  }

  getScore(duration: EScoreDuration) {
    combineLatest([
      this.scoresRestService.getPaginatedUsersStats(duration),
      this.scoresRestService.getPaginatedUsersStats(duration, true),
    ])
      .pipe(
        map(([{ data: usersStats = [] }, { data: prevUsersStats = [] }]) => [
          usersStats.filter((u) => u.id === this.user.id) ?? [],
          prevUsersStats.filter((u) => u.id === this.user.id) ?? [],
        ]),
        tap(([curr, prev]) => {
          this.userScore = curr[0]?.score ?? 0;
          const previousScore = prev[0]?.score ?? 0;
          this.userScoreProgression = previousScore && this.userScore ? this.userScore - previousScore : 0;
        }),
      )
      .subscribe();
  }

  getUserChartScores(duration: EScoreDuration): void {
    this.userChartStatus = EPlaceholderStatus.LOADING;

    const timeframe = (duration: EScoreDuration) =>
      duration === EScoreDuration.Year
        ? ScoreTimeframeEnumApi.Month
        : duration === EScoreDuration.Trimester
        ? ScoreTimeframeEnumApi.Week
        : ScoreTimeframeEnumApi.Day;

    combineLatest([
      this.scoresRestService.getScores({
        type: ScoreTypeEnumApi.User,
        duration: duration,
        ids: [this.user.id],
        timeframe: timeframe(duration),
      }),
      this.scoresRestService.getScores({
        type: ScoreTypeEnumApi.Team,
        duration: duration,
        ids: [this.userTeam.id],
        timeframe: timeframe(duration),
      }),
    ])
      .pipe(
        tap(([userScores, teamScores]) => {
          this.userChartStatus =
            userScores.length > 0 ? EPlaceholderStatus.LOADING : EPlaceholderStatus.NO_RESULT;
          if (userScores.length > 0) {
            this.createUserChart(userScores[0], teamScores[0], duration);
          }
        }),
      )
      .subscribe();
  }

  getFinishedPrograms(duration: EScoreDuration) {
    combineLatest([
      this.programsRestService.getProgramsPaginated({ teamIds: this.user.teamId }, duration),
      this.programsRestService.getProgramsPaginated({ teamIds: this.user.teamId }, duration, true),
      this.programRunsRestService.getUserProgramRuns(this.user.id),
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

  getGuessesCount(duration: EScoreDuration) {
    combineLatest([
      this.guessesRestService.getGuesses({ createdBy: this.user.id, itemsPerPage: 1 }, duration),
      this.guessesRestService.getGuesses({ createdBy: this.user.id, itemsPerPage: 1 }, duration, true),
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

  createUserChart(userScores: Score, teamScores: Score, duration: EScoreDuration): void {
    const [formattedUserScores, formattedTeamScores] = this.scoresService.formatScores([
      userScores,
      teamScores,
    ]);

    const teamPoints = this.statisticsService.transformDataToPoint(formattedTeamScores);
    const labels = this.statisticsService.formatLabel(
      teamPoints.map((d) => d.x),
      duration,
    );

    const dataSets = [formattedUserScores, formattedTeamScores].map((scores, i) => {
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
}
