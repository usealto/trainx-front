import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ScoreByTypeEnumApi,
  ScoreDtoApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  ScoresResponseDtoApi,
  TagDtoApi,
  TagStatsDtoApi,
  TeamDtoApi,
} from '@usealto/sdk-ts-angular';
import { Observable, switchMap, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { ChartsService, ITooltipParams } from 'src/app/modules/charts/charts.service';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from '../../../services/statistics.service';
import { TitleCasePipe } from '@angular/common';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';

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

  items: ScoreDtoApi[] = [];
  selectedItems: ScoreDtoApi[] = [];
  tagsLeaderboard: { name: string; score: number }[] = [];
  tagsDataStatus: PlaceholderDataStatus = 'loading';

  scoreCount = 0;
  scoreDataStatus: PlaceholderDataStatus = 'loading';

  ScoreEvolutionChartOption: any = {};

  selectedTeamsKnowledgeTag?: TagDtoApi;
  selectedTeamsKnowledgeScores: TeamDtoApi[] = [];
  teamsKnowledgeFilteredScores: ScoreDtoApi[] = [];
  teamsKnowledgeChartOption: any = {};
  series: any[] = [];
  seriesDataStatus: PlaceholderDataStatus = 'loading';

  constructor(
    private titleCasePipe: TitleCasePipe,
    public readonly programsStore: ProgramsStore,
    public readonly teamsStore: TeamStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly statisticsServices: StatisticsService,
    private readonly scoresServices: ScoresService,
    private readonly teamRestService: TeamsRestService,
    private readonly chartService: ChartsService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['duration']) {
      this.getScores()
        .pipe(
          switchMap(() => this.teamRestService.getTeams()),
          tap((res) => {
            this.teams = res
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((t) => ({
                label: t.name,
                id: t.id,
              }));
            this.selectedTeams = this.teams.splice(0, 5);
          }),
          switchMap(() => this.scoresRestService.getTagsStats(this.duration)),
          tap((res) => {
            const output = res.filter((t) => t.score && t.score >= 0);
            this.tagsLeaderboard = output.map((t) => ({ name: t.tag.name, score: t.score ?? 0 }));
            this.tagsDataStatus = this.tagsLeaderboard.length === 0 ? 'noData' : 'good';
          }),
          tap(() => {
            this.getTeamsKnowledgeScores();
          }),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  filterTeamsKnowledgeTags(tags: TagDtoApi) {
    this.selectedTeamsKnowledgeTag = tags;
    this.getTeamsKnowledgeScores(this.selectedTeamsKnowledgeScores);
  }

  getTeamsKnowledgeScores(teamsScores: TeamDtoApi[] = []) {
    if (teamsScores) {
      this.selectedTeamsKnowledgeScores = teamsScores;
    }
    this.scoresRestService
      .getScores({
        timeframe:
          this.duration === ScoreDuration.Year
            ? ScoreTimeframeEnumApi.Month
            : this.duration === ScoreDuration.Trimester
            ? ScoreTimeframeEnumApi.Week
            : ScoreTimeframeEnumApi.Day,
        duration: this.duration ?? ScoreDuration.Year,
        type: ScoreTypeEnumApi.Team,
        scoredBy: this.selectedTeamsKnowledgeTag ? ScoreByTypeEnumApi.Tag : undefined,
        scoredById: this.selectedTeamsKnowledgeTag ? this.selectedTeamsKnowledgeTag.id : undefined,
        ids: this.selectedTeamsKnowledgeScores.map((t) => t.id),
      })
      .pipe(
        tap((res) => {
          this.createTeamsKnowledgeChart(res.scores);
        }),
      )
      .subscribe();
  }

  createTeamsKnowledgeChart(rawScores: ScoreDtoApi[]) {
    const scores = rawScores.map((s) => {
      return {
        label: s.label,
        score: this.scoresServices.reduceWithoutNull(s.averages) || 0,
      };
    });

    // Adds Teams without scores but seleected in the filter
    this.selectedTeamsKnowledgeScores
      .filter((t) => rawScores.every((te) => te.id !== t.id))
      .forEach((s) => {
        scores.push({
          label: s.name,
          score: 0,
        });
      });

    this.series = scores.map((s, index) => {
      return {
        name: s.label,
        value: Math.round((s.score * 10000) / 100),
        itemStyle: {
          color: this.chartService.getDefaultThemeColors(index),
        },
      };
    });
    this.seriesDataStatus = this.series.length === 0 ? 'noData' : 'good';

    this.teamsKnowledgeChartOption = {
      xAxis: [{ type: 'category', show: false }],
      yAxis: [{ max: 100, name: I18ns.charts.scoreLabel, nameLocation: 'middle', nameGap: 50 }],
      series: [
        {
          type: 'bar',
          barWidth: 24,
          data: this.series,
        },
      ],
      grid: {
        left: '6%',
        top: '30',
        right: '1%',
        bottom: '4%',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        padding: 0,
        borderColor: '#EAECF0',
        formatter: (params: ITooltipParams[]) => {
          const { name, color, data } = params[0];
          return `
            <div style="box-shadow: 0px 2px 4px -2px rgba(16, 24, 40, 0.06), 0px 4px 8px -2px rgba(16, 24, 40, 0.10); border-radius: 4px;">
              <div style="color: #667085; background-color: #F9FAFB; padding : 8px 10px 4px 10px;">
                ${name}
              </div>
              <div style="padding : 4px 10px 8px 10px; display: flex; align-items: center; gap: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="11" viewBox="0 0 10 11" fill="none">
                  <circle cx="5" cy="5.5" r="5" fill="${color}"/>
                </svg>
                <p>${I18ns.shared.score} : <b style="color: ${color}">${(data as any).value} %<b></p>
              </div>
            </div>
          `;
        },
      },
    };
  }

  getScores(): Observable<ScoresResponseDtoApi> {
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
        tap((res) => {
          this.items = res.scores.sort((a, b) => a.label.localeCompare(b.label));
          let filteredItems: ScoreDtoApi[] = res.scores;
          if (this.init) {
            this.selectedItems = this.items.slice(0, 3);
          }
          if (this.selectedItems.length) {
            filteredItems = res.scores.filter((s) => this.selectedItems.some((si) => si.id === s.id));
          }
          this.createScoreEvolutionChart(filteredItems, this.duration);
        }),
        tap(() => (this.init = false)),
      );
  }

  getThemesLabel(stats: TagStatsDtoApi[]): string[] {
    return (stats as TagStatsDtoApi[]).map((s) => s.tag.name);
  }

  createScoreEvolutionChart(scores: ScoreDtoApi[], duration: ScoreDuration) {
    scores = this.scoresServices.reduceLineChartData(scores);
    this.scoreCount = scores.length;
    this.scoreDataStatus = scores.length === 0 ? 'noData' : 'good';
    const aggregateData = this.statisticsServices.transformDataToPoint(scores[0]);
    const labels = this.statisticsServices
      .formatLabel(
        aggregateData.map((d) => d.x),
        duration,
      )
      .map((s) => this.titleCasePipe.transform(s));

    const dataSet = scores.map((s) => {
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

  filterTagsAndPrograms(items: ScoreDtoApi[]) {
    this.selectedItems = items;
    this.getScores().subscribe();
  }
}
