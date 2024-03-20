import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import { EChartsOption, SeriesOption } from 'echarts';
import { Subscription, combineLatest, of, startWith, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from 'src/app/modules/statistics/services/statistics.service';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';
import { IAppData } from '../../../../core/resolvers';
import { EScoreDuration, Score } from '../../../../models/score.model';
import { EPlaceholderStatus } from '../../../shared/components/placeholder-manager/placeholder-manager.component';
import { ChartsService } from 'src/app/modules/charts/charts.service';

@Component({
  selector: 'alto-user-home-statistics',
  templateUrl: './user-home-statistics.component.html',
  styleUrls: ['./user-home-statistics.component.scss'],
})
export class UserHomeStatisticsComponent implements OnInit, OnDestroy {
  I18ns = I18ns;

  @Input() durationControl!: FormControl<EScoreDuration>;
  durationOptions = Score.getTimepickerOptions();

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

  // TODO : clean chartsService
  tooltipTitleFormatter = (title: string) => title;

  private readonly userHomeStatisticsComponentSubscription = new Subscription();

  constructor(
    private readonly guessesRestService: GuessesRestService,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly programsRestService: ProgramsRestService,
    private readonly programRunsRestService: ProgramRunsRestService,
    private readonly statisticsService: StatisticsService,
    private readonly resolversService: ResolversService,
    private readonly activatedRoute: ActivatedRoute,
    public chartsService: ChartsService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.user = (data[EResolvers.AppResolver] as IAppData).me;
    const teamsById = (data[EResolvers.AppResolver] as IAppData).company.teams;
    this.userTeam = teamsById.find((t) => t.id === this.user.teamId) || new Team({} as any);

    this.userHomeStatisticsComponentSubscription.add(
      this.durationControl.valueChanges
        .pipe(
          startWith(this.durationControl.value),
          tap((duration) => {
            this.tooltipTitleFormatter = this.chartsService.tooltipDurationTitleFormatter(duration);
          }),
          switchMap((duration) => {
            const timeframe =
              duration === EScoreDuration.Year
                ? ScoreTimeframeEnumApi.Month
                : duration === EScoreDuration.Trimester
                ? ScoreTimeframeEnumApi.Week
                : ScoreTimeframeEnumApi.Day;

            return combineLatest([
              of(duration),
              combineLatest([
                this.scoresRestService.getDurationUsersStats(duration, false, { ids: this.user.id }),
                this.scoresRestService.getDurationUsersStats(duration, true, { ids: this.user.id }),
              ]),
              combineLatest([
                this.scoresRestService.getScores({
                  type: ScoreTypeEnumApi.User,
                  duration,
                  ids: [this.user.id],
                  timeframe,
                }),
                this.scoresRestService.getScores({
                  type: ScoreTypeEnumApi.Team,
                  duration,
                  ids: [this.userTeam.id],
                  timeframe,
                }),
              ]),
              combineLatest([
                this.guessesRestService.getPaginatedGuesses(
                  { createdBy: this.user.id, itemsPerPage: 1 },
                  duration,
                ),
                this.guessesRestService.getPaginatedGuesses(
                  { createdBy: this.user.id, itemsPerPage: 1 },
                  duration,
                  true,
                ),
              ]),
              combineLatest([
                this.programsRestService.getAllDurationPrograms({ teamIds: this.user.teamId }, duration),
                this.programsRestService.getAllDurationPrograms(
                  { teamIds: this.user.teamId },
                  duration,
                  true,
                ),
                this.programRunsRestService.getAllProgramRuns({ createdBy: this.user.id }),
              ]),
            ]);
          }),
        )
        .subscribe({
          next: ([
            duration,
            [usersStats = [], prevUsersStats = []],
            [userScores = [], teamScores = []],
            [paginatedGuesses, previousPaginatedGuesses],
            [currentPrograms, previousPrograms, currentProgramRuns],
          ]) => {
            this.userScore = usersStats[0]?.score ?? 0;
            const previousScore = prevUsersStats[0]?.score ?? 0;
            this.userScoreProgression = previousScore && this.userScore ? this.userScore - previousScore : 0;

            this.userChartStatus =
              userScores.length > 0 ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_DATA;

            if (userScores.length > 0) {
              this.createUserChart(userScores[0], teamScores[0], duration);
            }

            this.guessCount = paginatedGuesses.meta.totalItems;
            this.guessCountProgression =
              previousPaginatedGuesses.meta.totalItems && paginatedGuesses.meta.totalItems
                ? (paginatedGuesses.meta.totalItems - previousPaginatedGuesses.meta.totalItems) /
                  previousPaginatedGuesses.meta.totalItems
                : 0;

            //TODO: refacto when backend will bring latest program run with programs
            this.programsCount = currentPrograms.length ?? 0;

            const finishedPrograms =
              currentPrograms.filter((p) =>
                currentProgramRuns.some((pr) => pr.programId === p.id && !!pr.finishedAt),
              ) ?? [];

            const previousFinishedPrograms =
              previousPrograms.filter((p) =>
                currentProgramRuns.some((pr) => pr.programId === p.id && !!pr.finishedAt),
              ) ?? [];

            this.finishedProgramsCount = finishedPrograms.length;

            this.averageFinishedPrograms =
              finishedPrograms.length > 0 ? finishedPrograms.length / (currentPrograms.length ?? 1) : 0;

            const avgPreviousFinishedPrograms =
              previousFinishedPrograms.length > 0
                ? previousFinishedPrograms.length / (previousPrograms.length ?? 1)
                : 0;

            this.finishedProgramsCountProgression =
              this.averageFinishedPrograms - avgPreviousFinishedPrograms;
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.userHomeStatisticsComponentSubscription.unsubscribe();
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
