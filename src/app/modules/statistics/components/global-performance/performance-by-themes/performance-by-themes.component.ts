import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TagDtoApi, TagStatsDtoApi } from '@usealto/sdk-ts-angular';
import { Subscription, filter, map, startWith, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { EScoreDuration } from '../../../../../models/score.model';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';
import { SelectOption } from '../../../../shared/models/select-option.model';
import { AltoRoutes } from '../../../../shared/constants/routes';

@Component({
  selector: 'alto-performance-by-themes',
  templateUrl: './performance-by-themes.component.html',
  styleUrls: ['./performance-by-themes.component.scss'],
})
export class PerformanceByThemesComponent implements OnInit, OnDestroy {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  EPlaceholderStatus = EPlaceholderStatus;

  @Input() tags: TagDtoApi[] = [];
  selectedTags: TagDtoApi[] = [];
  tagsControl: FormControl<FormControl<SelectOption>[]> = new FormControl([], {
    nonNullable: true,
  });
  tagsOptions: SelectOption[] = [];
  spiderChartDataStatus = EPlaceholderStatus.LOADING;
  spiderChartFilterStatus = EPlaceholderStatus.GOOD;
  spiderChartOptions: any = {};

  tagsLeaderboard: { name: string; score: number }[] = [];
  tagsDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  tagStatsSubscription: Subscription = new Subscription();

  constructor(private readonly scoresRestService: ScoresRestService) {}

  ngOnInit(): void {
    this.tagsOptions = this.tags.map((tag) => new SelectOption({ value: tag.id, label: tag.name }));
    this.tagsControl = new FormControl(
      this.tagsOptions.slice(0, 6).map((tagOption) => new FormControl(tagOption, { nonNullable: true })),
      { nonNullable: true },
    );

    this.tagStatsSubscription.add(
      this.tagsControl.valueChanges
        .pipe(
          filter(() => {
            return this.tagsOptions.length > 0;
          }),
          startWith(this.tagsControl.value),
          map((tagsControls) => tagsControls.map((t) => t.value)),
          tap((selectedTags) => {
            this.spiderChartFilterStatus =
              selectedTags.length < 3 || selectedTags.length > 6
                ? EPlaceholderStatus.NO_DATA
                : EPlaceholderStatus.GOOD;
          }),
          switchMap((selectedTags) => {
            return this.scoresRestService.getPaginatedTagsStats(EScoreDuration.Year, false, {
              ids: selectedTags.map((t) => t.value).join(','),
            });
          }),
          map(({ data: tagStats = [] }) => {
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
