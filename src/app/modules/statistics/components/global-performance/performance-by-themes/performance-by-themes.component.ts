import { TitleCasePipe } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import { Observable, switchMap, tap } from 'rxjs';
import { IAppData } from 'src/app/core/resolvers';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { Score } from '../../../../../models/score.model';
import { StatisticsService } from '../../../services/statistics.service';

@UntilDestroy()
@Component({
  selector: 'alto-performance-by-themes',
  templateUrl: './performance-by-themes.component.html',
  styleUrls: ['./performance-by-themes.component.scss'],
})
export class PerformanceByThemesComponent implements OnChanges {
  @Input() duration: ScoreDuration = ScoreDuration.Year;
  Emoji = EmojiName;
  I18ns = I18ns;
  init = true;

  teams: { label: string; id: string }[] = [];
  selectedTeams: { label: string; id: string }[] = [];

  items: Score[] = [];
  selectedItems: Score[] = [];
  tagsLeaderboard: { name: string; score: number }[] = [];
  tagsDataStatus: PlaceholderDataStatus = 'loading';

  scoreCount = 0;
  scoreDataStatus: PlaceholderDataStatus = 'loading';

  ScoreEvolutionChartOption: any = {};

  constructor(
    private titleCasePipe: TitleCasePipe,
    public readonly programsStore: ProgramsStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly statisticsServices: StatisticsService,
    private readonly scoresServices: ScoresService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['duration']) {
      const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
      this.teams = Array.from((data[EResolvers.AppResolver] as IAppData).teamById.values()).map((t) => ({
        label: t.name,
        id: t.id,
      }));
      this.selectedTeams = this.teams.splice(0, 5);

      this.getScores()
        .pipe(
          switchMap(() => this.scoresRestService.getTagsStats(this.duration)),
          tap((res) => {
            const output = res.filter((t) => t.score && t.score >= 0);
            this.tagsLeaderboard = output.map((t) => ({ name: t.tag.name, score: t.score ?? 0 }));
            this.tagsDataStatus = this.tagsLeaderboard.length === 0 ? 'noData' : 'good';
          }),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  getScores(): Observable<Score[]> {
    return this.scoresRestService
      .getScores({
        timeframe:
          this.duration === ScoreDuration.Year
            ? ScoreTimeframeEnumApi.Month
            : this.duration === ScoreDuration.Trimester
            ? ScoreTimeframeEnumApi.Week
            : ScoreTimeframeEnumApi.Day,
        duration: this.duration ?? ScoreDuration.Year,
        type: ScoreTypeEnumApi.Tag,
      } as ChartFilters)
      .pipe(
        tap((scores) => {
          this.items = scores.sort((a, b) => a.label.localeCompare(b.label));
          let filteredItems: Score[] = scores;
          if (this.init) {
            this.selectedItems = this.items.slice(0, 1);
          }
          if (this.selectedItems.length) {
            filteredItems = scores.filter((s) => this.selectedItems.some((si) => si.id === s.id));
          }
          this.createScoreEvolutionChart(filteredItems, this.duration);
        }),
        tap(() => (this.init = false)),
      );
  }

  createScoreEvolutionChart(scores: Score[], duration: ScoreDuration) {
    const formattedScores = this.scoresServices.formatScores(scores);
    this.scoreCount = formattedScores.length;
    this.scoreDataStatus = formattedScores.length === 0 ? 'noData' : 'good';
    const aggregateData = this.statisticsServices.transformDataToPoint(formattedScores[0]);
    const labels = this.statisticsServices
      .formatLabel(
        aggregateData.map((d) => d.x),
        duration,
      )
      .map((s) => this.titleCasePipe.transform(s));

    const dataSet = formattedScores.map((s) => {
      const d = this.statisticsServices.aggregateDataForScores(s, duration);
      return {
        label: s.label,
        data: d.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
        fill: false,
        tension: 0.2,
        borderDash: [0],
        spanGaps: true,
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
      };
    });

    this.ScoreEvolutionChartOption = {
      xAxis: [{ ...xAxisDatesOptions, data: labels }],
      yAxis: [{ ...yAxisScoreOptions }],
      series: series,
      legend: legendOptions,
    };
  }

  filterTeams(teams: { label: string; id: string }[]) {
    this.selectedTeams = teams;
    return;
  }

  filterTagsAndPrograms(items: Score[]) {
    this.selectedItems = items;
    this.getScores().subscribe();
  }
}
