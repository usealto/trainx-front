import { TitleCasePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import { Observable, combineLatest, tap } from 'rxjs';
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
import { StatisticsService } from '../../../services/statistics.service';
import { FormControl } from '@angular/forms';
import { SelectOption } from '../../../../shared/models/select-option.model';

@Component({
  selector: 'alto-performance-by-teams',
  templateUrl: './performance-by-teams.component.html',
  styleUrls: ['./performance-by-teams.component.scss'],
})
export class PerformanceByTeamsComponent implements OnInit, OnChanges {
  @Input() duration: ScoreDuration = ScoreDuration.Year;
  @Input() company!: Company;
  @Output() selecedDuration = this.duration;

  Emoji = EmojiName;
  I18ns = I18ns;
  init = true;
  teamsScore: Score[] = [];
  selectedTeams: Score[] = [];
  scoredTeams: { label: string; score: number | null; progression: number | null }[] = [];
  scoreDataStatus: PlaceholderDataStatus = 'loading';

  teamsLeaderboard: { name: string; score: number }[] = [];
  teamsLeaderboardCount = 0;
  teamsLeaderboardDataStatus: PlaceholderDataStatus = 'loading';
  chartOption: any = {};

  selectedTeamsControl = new FormControl([] as FormControl<SelectOption>[], { nonNullable: true });
  teamsOptions: SelectOption[] = [];

  constructor(
    private titleCasePipe: TitleCasePipe,
    public readonly teamStore: TeamStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresServices: ScoresService,
    private readonly statisticsServices: StatisticsService,
  ) {}

  ngOnInit(): void {
    this.teamsOptions = this.company.teams.map(
      (team) => new SelectOption({ label: team.name, value: team.id }),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['duration'] || changes['company']) && this.company?.teams) {
      this.getScores().subscribe();

      const teams = this.company.teams;

      const teamStats = this.company.getStatsByPeriod(this.duration, false);
      const previousTeamStats = this.company.getStatsByPeriod(this.duration, true);

      this.teamsLeaderboard = teamStats
        .filter((t) => t.score && t.score >= 0)
        .map((t) => ({
          name: teams.filter((team) => t.teamId === team.id)[0].name,
          score: t.score ?? 0,
        }));
      this.teamsLeaderboardDataStatus = this.teamsLeaderboard.length === 0 ? 'noData' : 'good';

      this.getTeamsScores(teamStats, previousTeamStats);
    }
  }

  getScores(): Observable<[Score[], Score[]]> {
    return combineLatest([
      this.scoresRestService.getScores(this.getScoreParams(this.duration, false)),
      this.scoresRestService.getScores(this.getScoreParams(this.duration, true)),
    ]).pipe(
      tap(([scores, scoresPrev]) => {
        this.teamsScore = scores;
        let filteredTeams: Score[] = scores;
        if (this.init) {
          this.selectedTeams = this.teamsScore.slice(0, 1);
        }
        if (this.selectedTeams.length) {
          filteredTeams = scores.filter((score) => this.selectedTeams.some((team) => team.id === score.id));
        }
        this.createScoreEvolutionChart(filteredTeams, scoresPrev[0], this.duration);
      }),
      tap(() => (this.init = false)),
    );
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

  filterTeams(event: Score[]) {
    this.selectedTeams = event;
    this.getScores().subscribe();
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
