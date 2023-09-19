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
} from '@usealto/sdk-ts-angular';
import { Observable, switchMap, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
// import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from '../../../services/statistics.service';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { isUndefined } from 'cypress/types/lodash';

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

  scoreCount = 0;

  ScoreEvolutionChartOption: any = {};

  selectedTeamsKnowledgeTag?: TagDtoApi;
  selectedTeamsKnowledgeScores: ScoreDtoApi[] = [];
  teamsKnowledgeFilteredScores: ScoreDtoApi[] = [];
  teamsKnowledgeChartOption: any = {};

  constructor(
    public readonly programsStore: ProgramsStore,
    public readonly teamsStore: TeamStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly statisticsServices: StatisticsService,
    private readonly scoresServices: ScoresService,
    private readonly teamRestService: TeamsRestService,
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

  getTeamsKnowledgeScores(teamsScores: ScoreDtoApi[] = []) {
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
    const scores = this.scoresServices.reduceChartData(rawScores);

    const series = scores.map((s) => {
      const points = this.statisticsServices.transformDataToPoint(s);
      const point = points.reduce((acc, curr) => acc + (curr.y ?? 0), 0) / points.length;
      return {
        name: s.label,
        type: 'bar',
        data: [Math.round((point * 10000) / 100)],
        barWidth: 24,
        barGap: '10',
        tooltip: {
          valueFormatter: (value: any) => {
            return (value as number) + '%';
          },
        },
      };
    });

    this.teamsKnowledgeChartOption = {
      xAxis: [{ ...xAxisDatesOptions, data: [I18ns.shared.score], show: false }],
      yAxis: [{ ...yAxisScoreOptions }],
      series: series,
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
    scores = this.scoresServices.reduceChartData(scores);
    this.scoreCount = scores.length;
    const aggregateData = this.statisticsServices.transformDataToPoint(scores[0]);
    const labels = this.statisticsServices.formatLabel(
      aggregateData.map((d) => d.x),
      duration,
    );

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
        // color: '#09479e',
        data: d.data,
        type: 'line',
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
