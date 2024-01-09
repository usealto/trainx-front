import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { combineLatest, map } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { FormControl } from '@angular/forms';
import { TagDtoApi, TagStatsDtoApi } from '@usealto/sdk-ts-angular';
import { TagsRestService } from '../../../../programs/services/tags-rest.service';

@UntilDestroy()
@Component({
  selector: 'alto-performance-by-themes',
  templateUrl: './performance-by-themes.component.html',
  styleUrls: ['./performance-by-themes.component.scss'],
})
export class PerformanceByThemesComponent implements OnChanges, OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;

  @Input() duration: ScoreDuration = ScoreDuration.Year;
  tags: TagDtoApi[] = [];
  tagsControl: FormControl<TagDtoApi[]> = new FormControl<TagDtoApi[]>([], { nonNullable: true });
  spiderChartDataStatus: PlaceholderDataStatus = 'loading';
  spiderChartOptions: any = {};

  tagsLeaderboard: { name: string; score: number }[] = [];
  tagsDataStatus: PlaceholderDataStatus = 'loading';

  constructor(
    private readonly tagsRestService: TagsRestService,
    public readonly programsStore: ProgramsStore,
    private readonly scoresRestService: ScoresRestService,
  ) {}

  ngOnInit(): void {
    combineLatest([this.tagsRestService.getTags(), this.scoresRestService.getTagsStats(this.duration)])
      .pipe(
        map(([tags, tagStats]) => {
          this.tags = tags;
          return tagStats;
        }),
        map((res) => res.filter((t) => t.score && t.score >= 0)),
      )
      .subscribe((tagStats) => {
        this.tagsLeaderboard = tagStats.map((t) => ({ name: t.tag.name, score: t.score ?? 0 }));
        this.tagsDataStatus = this.tagsLeaderboard.length === 0 ? 'noData' : 'good';
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['duration']) {
      this.getSpiderChartData(this.duration);
    }
  }

  getSpiderChartData(duration: ScoreDuration): void {
    this.spiderChartDataStatus = 'loading';

    this.scoresRestService
      .getTagsStats(
        duration,
        false,
        undefined,
        this.tagsControl.value.map((tag) => tag.id),
      )
      .pipe(map((tagStats) => tagStats.sort((a, b) => a.tag.name.localeCompare(b.tag.name))))
      .subscribe((tagStats) => {
        this.spiderChartDataStatus = tagStats.length === 0 ? 'noData' : 'good';
        this.createSpiderChart(tagStats);
      });
  }

  createSpiderChart(tagStats: TagStatsDtoApi[]) {
    this.spiderChartOptions = {
      color: ['#475467'],
      radar: {
        indicator: tagStats.map((t) => t.tag.name),
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: tagStats.map((t) => t.score ?? 0),
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
