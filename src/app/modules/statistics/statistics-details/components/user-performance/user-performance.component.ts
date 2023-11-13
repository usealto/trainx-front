import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ScoreDtoApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  TagDtoApi,
  UserDtoApi,
} from '@usealto/sdk-ts-angular';
import { combineLatest, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from '../../../services/statistics.service';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { TagsRestService } from 'src/app/modules/programs/services/tags-rest.service';

@Component({
  selector: 'alto-user-performance',
  templateUrl: './user-performance.component.html',
  styleUrls: ['./user-performance.component.scss'],
})
export class UserPerformanceComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;

  user!: UserDtoApi;
  duration: ScoreDuration = ScoreDuration.Trimester;
  tags: TagDtoApi[] = [];

  userChartOptions!: any;
  userChartStatus: PlaceholderDataStatus = 'loading';

  tagsChartOptions!: any;
  tagsChartStatus: PlaceholderDataStatus = 'good';
  selectedTags: TagDtoApi[] = [];

  constructor(
    private readonly router: Router,
    private readonly profileStore: ProfileStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly statisticsService: StatisticsService,
    private readonly tagsRestService: TagsRestService,
  ) {}

  ngOnInit(): void {
    const userI = this.router.url.split('/').pop() || '';
    this.user = this.profileStore.users.value.find((u) => u.id === userI) || ({} as UserDtoApi);

    this.tagsRestService
      .getTags()
      .pipe(
        tap((r) => {
          this.tags = r;
          this.selectedTags = r.slice(0, 3);
        }),
      )
      .subscribe();

    this.loadPage();
  }

  loadPage(): void {
    this.getUserChartScores(this.duration);
  }



  getUserChartScores(duration: ScoreDuration): void {
    this.userChartStatus = 'loading';
    combineLatest([
      this.scoresRestService.getScores(this.getScoreParams('user', duration)),
      this.scoresRestService.getScores(this.getScoreParams('team', duration)),
    ])
      .pipe(
        tap(([userScores, teamScores]) => {
          console.log(userScores, teamScores);
          this.createUserChart(userScores.scores[0], teamScores.scores[0], duration);
        }),
      )
      .subscribe();
  }

  createUserChart(userScores: ScoreDtoApi, teamScores: ScoreDtoApi, duration: ScoreDuration): void {
    const reducedTeamScores = this.scoresService.reduceLineChartData([teamScores])[0];
    const teamPoints = this.statisticsService.transformDataToPoint(reducedTeamScores);

    const labels = this.statisticsService.formatLabel(
      teamPoints.map((d) => d.x),
      duration,
    );

    const dataSets = [userScores, teamScores].map((scores) => {
      const d = this.statisticsService.transformDataToPoint(scores);
      return {
        label: scores.label,
        data: d.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
      };
    });

    const series = dataSets.map((d) => {
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

    this.userChartOptions = {
      xAxis: [{ ...xAxisDatesOptions, data: labels }],
      yAxis: [{ ...yAxisScoreOptions }],
      series: series,
      legend: legendOptions,
    };
    this.userChartStatus = 'good';
  }

  updateTimePicker(event: any): void {
    this.duration = event;
    this.loadPage();
  }

  filterTags(event: any): void {
    this.selectedTags = event;
    this.loadPage();
  }

  @memoize()
  getScoreParams(type: 'user' | 'team', duration: ScoreDuration): any {
    return {
      duration,
      type: type === 'user' ? ScoreTypeEnumApi.User : ScoreTypeEnumApi.Team,
      ids: [type === 'user' ? this.user.id : this.user.team?.id],
      timeframe:
        duration === ScoreDuration.Year
          ? ScoreTimeframeEnumApi.Month
          : duration === ScoreDuration.Trimester
          ? ScoreTimeframeEnumApi.Week
          : ScoreTimeframeEnumApi.Day,
    } as ChartFilters;
  }
}
