import { Component, Input, OnInit, } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { TagDtoApi, TagStatsDtoApi } from '@usealto/sdk-ts-angular';
import { map } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { TagsRestService } from '../../../../programs/services/tags-rest.service';
import { AltoRoutes } from '../../../../shared/constants/routes';

@UntilDestroy()
@Component({
  selector: 'alto-performance-by-themes',
  templateUrl: './performance-by-themes.component.html',
  styleUrls: ['./performance-by-themes.component.scss'],
})
export class PerformanceByThemesComponent implements OnInit {
  @Input() duration: ScoreDuration = ScoreDuration.Year;
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  tags: TagDtoApi[] = [];
  selectedItems: TagDtoApi[] = [];
  tagsLeaderboard: { name: string; score: number }[] = [];
  tagsDataStatus: PlaceholderDataStatus = 'loading';


  spiderChartDataStatus: PlaceholderDataStatus = 'loading';
  spiderChartOptions: any = {};

  constructor(
    private readonly tagsRestService: TagsRestService,
    public readonly programsStore: ProgramsStore,
    private readonly scoresRestService: ScoresRestService,
  ) {}

  ngOnInit(): void {
    this.tagsRestService.getTags().subscribe((tags) => {
      this.tags = tags;
      this.selectedItems = tags.slice(0, 6);
      this.getData();
    })
  }

  getData(): void {
    this.scoresRestService.getTagsStats(ScoreDuration.Year).pipe(
      map((tagStats) => tagStats.filter((t) => t.score && t.score >= 0)),
    ).subscribe((tagStats) => {
      this.tagsLeaderboard = tagStats.map((t) => ({ name: t.tag.name, score: t.score ?? 0 }));
      this.tagsDataStatus = this.tagsLeaderboard.length === 0 ? 'noData' : 'good';
      if (this.selectedItems.length) {
        tagStats = tagStats.filter((tagStats) => this.selectedItems.some((si) => si.id === tagStats.tag.id));
      }
      this.createSpiderChart(tagStats);
      // this.spiderChartDataStatus = this.tags.length < 3 ? 'empty' : tagStats.length === 0 ? 'noData' : 'good';
      this.spiderChartDataStatus = 'empty';
    });
  }

  createSpiderChart(tagStats: TagStatsDtoApi[]) {
    this.spiderChartOptions = {
      color: ['#475467'],
      radar: {
        indicator: tagStats.map((t) => {
          return { name: t.tag.name, max: 100 };
        }),
        radius: '70%',
        axisName: {
          color: '#667085',
          padding: [3, 10],
        },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: tagStats.map((t) => (t.score ? Math.round((t.score * 10000) / 100) : 0)),
              name: I18ns.statistics.globalPerformance.perThemePerformance.spiderChart.global,
              Symbol: 'rect',
              SymbolSize: 12,
              lineStyle: {
                type: 'dashed',
              },
              label: {
                show: true,
                formatter: function (params: any) {
                  return (params.value as string) + ' %';
                },
              },
            },
          ],
        },
      ],
      legend: {
        bottom: 0,
        icon: 'circle',
        itemWidth: 8,
        textStyle: { color: '#667085' },
      },
    };
  }

  filterTags(items: TagDtoApi[]) {
    this.selectedItems = items;
    this.getData();
  }
}
