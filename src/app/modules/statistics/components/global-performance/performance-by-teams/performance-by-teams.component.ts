import { TitleCasePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, of, startWith, switchMap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { Company } from '../../../../../models/company.model';
import { Score } from '../../../../../models/score.model';
import { TeamStats } from '../../../../../models/team.model';
import { SelectOption } from '../../../../shared/models/select-option.model';
import { StatisticsService } from '../../../services/statistics.service';

@Component({
  selector: 'alto-performance-by-teams',
  templateUrl: './performance-by-teams.component.html',
  styleUrls: ['./performance-by-teams.component.scss'],
})
export class PerformanceByTeamsComponent implements OnInit, OnDestroy {
  @Input() durationControl: FormControl<ScoreDuration> = new FormControl(ScoreDuration.Year, {
    nonNullable: true,
  });
  @Input() company!: Company;

  Emoji = EmojiName;
  I18ns = I18ns;
  init = true;

  teamsScore: Score[] = [];
  selectedTeamsScores: Score[] = [];
  scoredTeams: { label: string; score: number | null; progression: number | null }[] = [];
  scoreDataStatus: PlaceholderDataStatus = 'loading';

  teamsLeaderboard: { name: string; score: number }[] = [];
  teamsLeaderboardCount = 0;
  teamsLeaderboardDataStatus: PlaceholderDataStatus = 'loading';
  chartOption: any = {};

  selectedScoresControl = new FormControl([] as FormControl<SelectOption>[], { nonNullable: true });
  scoresOptions: SelectOption[] = [];

  private performanceByTeamsComponentSubscription = new Subscription();

  constructor(
    private titleCasePipe: TitleCasePipe,
    public readonly teamStore: TeamStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresServices: ScoresService,
    private readonly statisticsServices: StatisticsService,
  ) {}

  ngOnInit(): void {
    this.performanceByTeamsComponentSubscription.add(
      combineLatest([
        this.durationControl.valueChanges.pipe(startWith(this.durationControl.value)),
        this.selectedScoresControl.valueChanges.pipe(startWith(this.selectedScoresControl.value)),
      ])
        .pipe(
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

          const teams = this.company.teams;

          const teamStats = this.company.getStatsByPeriod(this.durationControl.value, false);
          const previousTeamStats = this.company.getStatsByPeriod(this.durationControl.value, true);

          this.teamsLeaderboard = teamStats
            .filter((t) => t.score && t.score >= 0)
            .map((t) => ({
              name: teams.filter((team) => t.teamId === team.id)[0].name,
              score: t.score ?? 0,
            }));

          this.teamsLeaderboardDataStatus = this.teamsLeaderboard.length === 0 ? 'noData' : 'good';

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

  createScoreEvolutionChart(scores: Score[], globalScore: Score, duration: ScoreDuration) {
    const allFormattedScores = this.scoresServices.formatScores([...scores, globalScore]);

    // pop global score
    const formattedScores = [...allFormattedScores];
    const formattedGlobalScore = formattedScores.pop() as Score;

    this.scoreDataStatus = formattedScores.length === 0 ? 'noData' : 'good';
    // Aligns Global with Score's Length so thay start on the same month
    const globalPoints = this.statisticsServices
      .transformDataToPoint(formattedGlobalScore)
      .slice(-formattedScores[0]?.averages?.length);

    const aggregatedData = this.statisticsServices.transformDataToPoint(formattedScores[0]);
    const labels = this.statisticsServices
      .formatLabel(
        aggregatedData.map((d) => d.x),
        duration,
      )
      .map((s) => this.titleCasePipe.transform(s));
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
  getScoreParams(duration: ScoreDuration, global: boolean): ChartFilters {
    return {
      duration: duration ?? ScoreDuration.Year,
      type: global ? ScoreTypeEnumApi.Guess : ScoreTypeEnumApi.Team,
      timeframe:
        duration === ScoreDuration.Year
          ? ScoreTimeframeEnumApi.Month
          : duration === ScoreDuration.Trimester
          ? ScoreTimeframeEnumApi.Week
          : ScoreTimeframeEnumApi.Day,
    } as ChartFilters;
  }
}
