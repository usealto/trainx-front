import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TagDtoApi, TagStatsDtoApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { EScoreDuration } from '../../../../../models/score.model';
import { TagsRestService } from '../../../../programs/services/tags-rest.service';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';

@Component({
  selector: 'alto-performance-by-themes',
  templateUrl: './performance-by-themes.component.html',
  styleUrls: ['./performance-by-themes.component.scss'],
})
export class PerformanceByThemesComponent implements OnInit, OnDestroy {
  Emoji = EmojiName;
  I18ns = I18ns;
  EPlaceholderStatus = EPlaceholderStatus;

  tags: TagDtoApi[] = [];
  selectedTags: TagDtoApi[] = [];
  tagsControl: FormControl<TagDtoApi[]> = new FormControl<TagDtoApi[]>([], { nonNullable: true });
  spiderChartDataStatus = EPlaceholderStatus.LOADING;
  spiderChartOptions: any = {};

  tagsLeaderboard: { name: string; score: number }[] = [];
  tagsDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  tagStatsSubscription: Subscription = new Subscription();

  constructor(
    private readonly tagsRestService: TagsRestService,
    private readonly scoresRestService: ScoresRestService,
  ) {}

  ngOnInit(): void {
    this.tagStatsSubscription.add(
      this.tagsControl.valueChanges
        .pipe(
          startWith(this.tagsControl.value),
          switchMap((selectedTags) => {
            return combineLatest([
              this.tagsRestService.getAllTags(),
              this.scoresRestService.getPaginatedTagsStats(EScoreDuration.Year),
              of(selectedTags),
            ]);
          }),
          map(([tags, paginatedTagsStats, selectedTags]) => {
            const tagStats = paginatedTagsStats.data ?? [];

            this.tags = tags;
            this.selectedTags = selectedTags;
            tagStats.filter((t) => t.score && t.score >= 0);
            this.spiderChartDataStatus =
              tagStats.length === 0 ? EPlaceholderStatus.NO_DATA : EPlaceholderStatus.GOOD;
            this.tagsLeaderboard = tagStats.map((t) => ({ name: t.tag.name, score: t.score ?? 0 }));
            this.tagsDataStatus =
              this.tagsLeaderboard.length === 0 ? EPlaceholderStatus.NO_DATA : EPlaceholderStatus.GOOD;
            return tagStats.splice(0, 6).sort((a, b) => a.tag.name.localeCompare(b.tag.name));
          }),
        )
        .subscribe((tagStats) => {
          this.setSpiderChartOptions(tagStats);
        }),
    );
  }

  ngOnDestroy(): void {
    this.tagStatsSubscription.unsubscribe();
  }

  setSpiderChartOptions(tagStats: TagStatsDtoApi[]) {
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
