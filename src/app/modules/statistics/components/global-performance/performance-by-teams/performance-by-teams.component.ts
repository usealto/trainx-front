import { TitleCasePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, of, startWith, switchMap, tap } from 'rxjs';
import { IAppData } from 'src/app/core/resolvers';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { Company } from '../../../../../models/company.model';
import { EScoreDuration, Score } from '../../../../../models/score.model';
import { TeamStats } from '../../../../../models/team.model';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';
import { AltoRoutes } from '../../../../shared/constants/routes';
import { SelectOption } from '../../../../shared/models/select-option.model';
import { StatisticsService } from '../../../services/statistics.service';
import { ChartsService } from '../../../../charts/charts.service';

@Component({
  selector: 'alto-performance-by-teams',
  templateUrl: './performance-by-teams.component.html',
  styleUrls: ['./performance-by-teams.component.scss'],
})
export class PerformanceByTeamsComponent implements OnInit, OnDestroy {
  @Input() durationControl: FormControl<EScoreDuration> = new FormControl(EScoreDuration.Trimester, {
    nonNullable: true,
  });
  @Input() company!: Company;

  AltoRoutes = AltoRoutes;
  Emoji = EmojiName;
  I18ns = I18ns;
  init = true;
  EPlaceholderStatus = EPlaceholderStatus;
  EScoreDuration = EScoreDuration;

  programsCount = 0;

  // TODO : clean chartsService
  tooltipTitleFormatter = (title: string) => title;

  teamsScore: Score[] = [];
  selectedTeamsScores: Score[] = [];
  scoredTeams: { label: string; score: number | null; progression: number | null }[] = [];
  scoreDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  teamsLeaderboard: { name: string; score: number }[] = [];
  teamsLeaderboardCount = 0;
  teamsLeaderboardDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  chartOption: any = {};

  selectedScoresControl = new FormControl([] as FormControl<SelectOption>[], { nonNullable: true });
  scoresOptions: SelectOption[] = [];

  private performanceByTeamsComponentSubscription = new Subscription();

  constructor(
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresServices: ScoresService,
    private readonly statisticsServices: StatisticsService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    private readonly chartsService: ChartsService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.programsCount = (data[EResolvers.AppResolver] as IAppData).company.programs.length;

    this.performanceByTeamsComponentSubscription.add(
      combineLatest([
        this.durationControl.valueChanges.pipe(startWith(this.durationControl.value)),
        this.selectedScoresControl.valueChanges.pipe(startWith(this.selectedScoresControl.value)),
      ])
        .pipe(
          tap(([duration]) => {
            this.tooltipTitleFormatter = this.chartsService.tooltipDurationTitleFormatter(duration);
          }),
          switchMap(([duration, selectedTeamsControls]) => {
            return combineLatest([
              this.scoresRestService.getScores(this.getScoreParams(duration, false)),
              this.scoresRestService.getScores(this.getScoreParams(duration, true)),
              of(selectedTeamsControls.map(({ value }) => value.value)),
            ]);
          }),
        )
        .subscribe(([scores, scoresPrev, selectedScores]) => {
          this.teamsScore = scores;

          this.scoresOptions = this.teamsScore.map(
            (score) => new SelectOption({ label: score.label, value: score.id }),
          );

          let filteredScores: Score[] = scores;

          if (this.init) {
            this.selectedTeamsScores = this.teamsScore.slice(0, 1);
            this.selectedScoresControl.patchValue(
              this.scoresOptions
                .slice(0, 1)
                .map((option) => new FormControl(option, { nonNullable: true }), { emitEvent: false }),
            );

            filteredScores = scores.filter((score) => score.id === this.selectedTeamsScores[0].id);
          } else {
            filteredScores = scores.filter(
              (score) => selectedScores.length === 0 || selectedScores.some((s) => s === score.id),
            );
          }

          this.createScoreEvolutionChart(filteredScores, scoresPrev[0], this.durationControl.value);
          this.init = false;

          const teamStats = this.company.getStatsByPeriod(this.durationControl.value, false);
          const previousTeamStats = this.company.getStatsByPeriod(this.durationControl.value, true);
          this.teamsLeaderboard = teamStats
            .filter(({ score }) => typeof score === 'number')
            .map((t) => ({
              name: this.company.teamById.get(t.teamId)?.name ?? '',
              score: t.score as number,
            }));

          this.teamsLeaderboardDataStatus =
            this.teamsLeaderboard.length === 0
              ? this.programsCount > 0
                ? EPlaceholderStatus.NO_RESULT
                : EPlaceholderStatus.NO_DATA
              : EPlaceholderStatus.GOOD;

          this.getTeamsScores(teamStats, previousTeamStats);
        }),
    );
  }

  ngOnDestroy(): void {
    this.performanceByTeamsComponentSubscription.unsubscribe();
  }

  getTeamsScores(current: TeamStats[], previous: TeamStats[]) {
    this.scoredTeams = current
      .map((team) => {
        const teamName = this.company?.teams.filter((t) => t.id === team.teamId)[0].name ?? '';
        const progression = previous.find((t) => t.teamId === team.teamId)?.score ?? null;
        return { label: teamName, score: team.score ?? 0, progression: progression };
      })
      .sort((a, b) => (a.score && b.score ? b.score - a.score : 0));
  }

  createScoreEvolutionChart(scores: Score[], globalScore: Score, duration: EScoreDuration) {
    const allFormattedScores = this.scoresServices.formatScores([...scores, globalScore]);

    // pop global score
    const formattedScores = [...allFormattedScores];
    const formattedGlobalScore = formattedScores.pop() as Score;

    this.scoreDataStatus =
      formattedScores.length === 0
        ? this.programsCount > 0
          ? EPlaceholderStatus.NO_RESULT
          : EPlaceholderStatus.NO_DATA
        : EPlaceholderStatus.GOOD;
    // Aligns Global with Score's Length so they start on the same month
    const globalPoints = this.statisticsServices
      .transformDataToPoint(formattedGlobalScore)
      .slice(-formattedScores[0]?.averages?.length);

    const aggregatedData = this.statisticsServices.transformDataToPoint(formattedScores[0]);
    const labels = this.statisticsServices.formatLabel(
      aggregatedData.map((d) => d.x),
      duration,
    );
    const dataSet = formattedScores.map((s) => {
      const d = this.statisticsServices.transformDataToPoint(s);
      return {
        label: s.label,
        data: d.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
      };
    });

    const series = dataSet.map((d) => {
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
        lineStyle: {},
      };
    });
    series.push({
      name: I18ns.shared.global,
      data: globalPoints.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
      type: 'line',
      showSymbol: false,
      tooltip: {
        valueFormatter: (value: any) => {
          return (value as number) + ' %';
        },
      },
      lineStyle: {},
    });
    this.chartOption = {
      xAxis: [{ ...xAxisDatesOptions, data: labels }],
      yAxis: [{ ...yAxisScoreOptions }],
      series: series,
      legend: legendOptions,
    };
  }

  @memoize()
  getScoreParams(duration: EScoreDuration, global: boolean): ChartFilters {
    return {
      duration: duration ?? EScoreDuration.Year,
      type: global ? ScoreTypeEnumApi.Guess : ScoreTypeEnumApi.Team,
      timeframe:
        duration === EScoreDuration.Year
          ? ScoreTimeframeEnumApi.Month
          : duration === EScoreDuration.Trimester
          ? ScoreTimeframeEnumApi.Week
          : ScoreTimeframeEnumApi.Day,
    } as ChartFilters;
  }
}
