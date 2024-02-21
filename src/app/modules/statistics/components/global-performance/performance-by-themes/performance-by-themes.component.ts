import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TagDtoApi, TagStatsDtoApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, filter, map, of, startWith, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ILeaderboardData } from '../../../../shared/components/leaderboard/leaderboard.component';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';
import { AltoRoutes } from '../../../../shared/constants/routes';
import { SelectOption } from '../../../../shared/models/select-option.model';

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
  tagsControl: FormControl<FormControl<SelectOption>[]> = new FormControl([], {
    nonNullable: true,
  });
  tagsOptions: SelectOption[] = [];
  spiderChartDataStatus = EPlaceholderStatus.LOADING;
  spiderChartOptions: any = {};

  tagsLeaderboard: ILeaderboardData[] = [];
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
      this.scoresRestService
        .getAllTagsStats()
        .pipe(
          filter((tagStats) => {
            if (tagStats.length === 0) {
              this.tagsDataStatus = EPlaceholderStatus.NO_DATA;
              this.spiderChartDataStatus = EPlaceholderStatus.NO_DATA;
              return false;
            }
            return true;
          }),
          tap((tagStats) => {
            this.tagsLeaderboard = tagStats
              .filter(({ score }) => typeof score === 'number')
              .map((t) => ({ name: t.tag.name, score: t.score as number }));
            this.tagsDataStatus = EPlaceholderStatus.GOOD;
          }),
          switchMap((tagStats) =>
            combineLatest([
              of(tagStats),
              this.tagsControl.valueChanges.pipe(
                startWith(this.tagsControl.value),
                map((tagsControls) => tagsControls.map((t) => t.value)),
              ),
            ]),
          ),
          filter(([, selectedTags]) => {
            if (selectedTags.length < 3 || selectedTags.length > 6) {
              this.spiderChartDataStatus = EPlaceholderStatus.NO_DATA;
              return false;
            }
            return true;
          }),
        )
        .subscribe({
          next: ([tagStats, selectedTags]) => {
            this.setSpiderChartOptions(
              tagStats
                .filter(({ score }) => typeof score === 'number')
                .filter((t) => selectedTags.some(({ value }) => value === t.tag.id)),
            );
            this.spiderChartDataStatus = EPlaceholderStatus.GOOD;
          },
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
