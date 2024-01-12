import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Subscription, combineLatest, map, of, startWith, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { FormControl } from '@angular/forms';
import { TagDtoApi, TagStatsDtoApi } from '@usealto/sdk-ts-angular';
import { TagsRestService } from '../../../../programs/services/tags-rest.service';
import { ChartsService } from '../../../../charts/charts.service';

@UntilDestroy()
@Component({
  selector: 'alto-performance-by-themes',
  templateUrl: './performance-by-themes.component.html',
  styleUrls: ['./performance-by-themes.component.scss'],
})
export class PerformanceByThemesComponent implements OnInit, OnDestroy {
  Emoji = EmojiName;
  I18ns = I18ns;

  tags: TagDtoApi[] = [];
  selectedTags: TagDtoApi[] = [];
  tagsControl: FormControl<TagDtoApi[]> = new FormControl<TagDtoApi[]>([], { nonNullable: true });
  spiderChartDataStatus: PlaceholderDataStatus = 'loading';
  spiderChartOptions: any = {};

  tagsLeaderboard: { name: string; score: number }[] = [];
  tagsDataStatus: PlaceholderDataStatus = 'loading';

  tagStatsSubscription: Subscription = new Subscription();

  constructor(
    private readonly tagsRestService: TagsRestService,
    public readonly programsStore: ProgramsStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly chartService: ChartsService,
  ) {}

  ngOnInit(): void {
    this.tagStatsSubscription.add(
      this.tagsControl.valueChanges
        .pipe(startWith(this.tagsControl.value))
        .pipe(
          tap(() => (this.spiderChartDataStatus = 'loading')),
          switchMap((selectedTags) => {
            return combineLatest([
              this.tagsRestService.getTags(),
              this.scoresRestService.getTagsStats(ScoreDuration.Year),
              of(selectedTags),
            ]);
          }),
          map(([tags, tagStats, selectedTags]) => {
            this.tags = tags;
            this.selectedTags = selectedTags;
            tagStats.filter((t) => t.score && t.score >= 0);
            this.spiderChartDataStatus = tagStats.length === 0 ? 'noData' : 'good';
            this.tagsLeaderboard = tagStats.map((t) => ({ name: t.tag.name, score: t.score ?? 0 }));
            this.tagsDataStatus = this.tagsLeaderboard.length === 0 ? 'noData' : 'good';
            return (
              tagStats
                // .filter((tag) => selectedTags.includes(tag.tag))
                .splice(0, 6)
                .sort((a, b) => a.tag.name.localeCompare(b.tag.name))
            );
          }),
        )
        .subscribe((tagStats) => {
          this.createSpiderChart(tagStats);
        }),
    );
  }

  ngOnDestroy(): void {
    this.tagStatsSubscription.unsubscribe();
  }

  createSpiderChart(tagStats: TagStatsDtoApi[]) {
    this.spiderChartOptions = {
      color: ['#475467'],
      radar: {
        indicator: tagStats.map((t) => {
          return { name: t.tag.name, max: 100 };
        }),
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
    };
  }
}
