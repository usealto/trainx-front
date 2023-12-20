import { Location, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ScoreByTypeEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  TagDtoApi,
  TagStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import { combineLatest, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { Score } from 'src/app/models/score.model';
import { Team } from 'src/app/models/team.model';
import { IUser, User } from 'src/app/models/user.model';
import { TagsRestService } from 'src/app/modules/programs/services/tags-rest.service';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { IAppData } from '../../../../../core/resolvers';
import { ToastService } from '../../../../../core/toast/toast.service';
import { StatisticsService } from '../../../services/statistics.service';

@Component({
  selector: 'alto-user-performance',
  templateUrl: './user-performance.component.html',
  styleUrls: ['./user-performance.component.scss'],
})
export class UserPerformanceComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;

  user!: User;
  userTeam!: Team;
  duration: ScoreDuration = ScoreDuration.Trimester;
  tags: TagDtoApi[] = [];

  userChartOptions!: any;
  userChartStatus: PlaceholderDataStatus = 'loading';

  tagsChartOptions!: any;
  tagsChartStatus: PlaceholderDataStatus = 'loading';
  selectedTags: TagDtoApi[] = [];

  spiderChartOptions!: any;
  spiderChartStatus: PlaceholderDataStatus = 'loading';
  spiderChartStatusReason: '<3 tags' | '>6 tags' | undefined = undefined;
  spiderChartSectionStatus: PlaceholderDataStatus = 'loading';
  selectedSpiderTags: TagDtoApi[] = [];

  constructor(
    private readonly router: Router,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly statisticsService: StatisticsService,
    private readonly tagsRestService: TagsRestService,
    readonly titleCasePipe: TitleCasePipe,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    private readonly location: Location,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    const usersById = (data[EResolvers.AppResolver] as IAppData).userById;
    const teamsById = (data[EResolvers.AppResolver] as IAppData).teamById;
    const userId = this.router.url.split('/').pop() || '';
    this.user = usersById.get(userId) || new User({} as IUser);
    if (!this.user.teamId || this.user.teamId === '' || teamsById.get(this.user.teamId) === undefined) {
      this.location.back();
      this.toastService.show({ type: 'danger', text: I18ns.statistics.user.toasts.noTeam });
    } else {
      this.userTeam = teamsById.get(this.user.teamId) as Team;
    }

    this.tagsRestService
      .getTags()
      .pipe(
        tap((r) => {
          this.tags = r;
          this.selectedTags = r.slice(0, 3);
          this.selectedSpiderTags = r.slice(0, 6);
        }),
      )
      .subscribe({
        next: () => {
          this.loadPage();
        },
      });
  }

  loadPage(): void {
    this.getUserChartScores(this.duration);
    this.getTagsChartScores(this.duration);
    this.getSpiderChartScores(this.duration);
  }

  getSpiderChartScores(duration: ScoreDuration): void {
    this.spiderChartSectionStatus = this.tags.length ? 'good' : 'empty';
    this.spiderChartStatus = 'loading';
    combineLatest([
      this.scoresRestService.getTagsStats(
        duration,
        false,
        this.user.teamId,
        this.selectedSpiderTags.map((t) => t.id),
      ),
      this.scoresRestService.getScores(this.getScoreParams('tagStats', duration)),
    ]).subscribe(([teamStats, userStats]) => {
      this.createSpiderChart(
        teamStats.sort((a, b) => a.tag.name.localeCompare(b.tag.name)),
        userStats.sort((a, b) => a.label.localeCompare(b.label)),
      );
      this.spiderChartStatus = 'good';
    });
  }

  createSpiderChart(teamScores: TagStatsDtoApi[], userScores: Score[]): void {
    this.spiderChartOptions = {
      color: ['#475467', '#FF917C'],
      radar: {
        indicator: teamScores.map((s) => {
          return { name: s.tag.name, max: 100 };
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
          silent: true,
          data: [
            {
              value: teamScores.map((s) => (s.score ? Math.round((s.score * 10000) / 100) : s.score)),
              name: "Score de l'équipe",
              symbol: 'rect',
              symbolSize: 12,
              lineStyle: {
                type: 'dashed',
              },
            },
          ],
        },
        {
          type: 'radar',
          data: [
            {
              value: userScores.map((u) =>
                u.averages[0] ? Math.round((u.averages[0] * 10000) / 100) : null,
              ),
              name: 'Score du collaborateur',
              areaStyle: {
                color: 'rgba(255, 145, 124, 0.6)',
                offset: 0,
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

  getTagsChartScores(duration: ScoreDuration): void {
    this.tagsChartStatus = 'loading';
    this.scoresRestService
      .getScores(this.getScoreParams('tags', duration))
      .pipe(
        tap((scores) => {
          this.tagsChartStatus = scores.length > 0 ? 'good' : 'empty';
          if (scores.length > 0) {
            this.createTagsChart(scores, duration);
          }
        }),
      )
      .subscribe();
  }

  createTagsChart(scores: Score[], duration: ScoreDuration): void {
    const formatedScores = this.scoresService.formatScores(scores);
    const points = formatedScores.map((d) => this.statisticsService.transformDataToPoint(d));

    const labels = this.statisticsService
      .formatLabel(
        points[0].map((d) => d.x),
        duration,
      )
      .map((s) => this.titleCasePipe.transform(s));

    const dataSets = formatedScores.map((s) => {
      const d = this.statisticsService.transformDataToPoint(s);
      return { label: s.label, data: d.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)) };
    });

    const series = dataSets.map((d) => {
      return {
        name: d.label,
        data: d.data,
        type: 'line',
        showSybmol: false,
        tootlip: {
          valueFormatter: (value: any) => {
            return (value as number) + '%';
          },
        },
        lineStyle: {},
      };
    });

    this.tagsChartOptions = {
      xAxis: [{ ...xAxisDatesOptions, data: labels }],
      yAxis: [{ ...yAxisScoreOptions }],
      series: series,
      legend: legendOptions,
    };
  }

  getUserChartScores(duration: ScoreDuration): void {
    this.userChartStatus = 'loading';
    combineLatest([
      this.scoresRestService.getScores(this.getScoreParams('user', duration)),
      this.scoresRestService.getScores(this.getScoreParams('team', duration)),
    ])
      .pipe(
        tap(([userScores, teamScores]) => {
          this.userChartStatus = userScores.length > 0 ? 'good' : 'empty';
          if (userScores.length > 0) {
            this.createUserChart(userScores[0], teamScores[0], duration);
          }
        }),
      )
      .subscribe();
  }

  createUserChart(userScores: Score, teamScores: Score, duration: ScoreDuration): void {
    const [formattedUserScores, formattedTeamScores] = this.scoresService.formatScores([
      userScores,
      teamScores,
    ]);

    const teamPoints = this.statisticsService.transformDataToPoint(formattedTeamScores);

    const labels = this.statisticsService.formatLabel(
      teamPoints.map((d) => d.x),
      duration,
    );

    const dataSets = [formattedUserScores, formattedTeamScores].map((scores) => {
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
  }

  updateTimePicker(event: any): void {
    this.duration = event;
    this.loadPage();
  }

  filterTags(event: any): void {
    this.selectedTags = event;
    this.getTagsChartScores(this.duration);
  }

  filterSpiderTags(event: any): void {
    this.selectedSpiderTags = event;
    if (this.selectedSpiderTags.length < 3) {
      this.spiderChartStatusReason = '<3 tags';
      this.spiderChartStatus = 'empty';
    } else if (this.selectedSpiderTags.length > 6) {
      this.spiderChartStatusReason = '>6 tags';
      this.spiderChartStatus = 'empty';
    } else {
      this.getSpiderChartScores(this.duration);
    }
  }

  getScoreParams(type: 'user' | 'team' | 'tags' | 'tagStats', duration: ScoreDuration): any {
    return {
      duration,
      type:
        type === 'user'
          ? ScoreTypeEnumApi.User
          : type === 'team'
          ? ScoreTypeEnumApi.Team
          : ScoreTypeEnumApi.Tag,
      ids: [
        type === 'user'
          ? this.user.id
          : type === 'team'
          ? this.userTeam.id
          : type === 'tags'
          ? this.selectedTags.map((t) => t.id)
          : this.selectedSpiderTags.map((t) => t.id),
      ],
      timeframe:
        type === 'tagStats'
          ? ScoreTimeframeEnumApi.Year
          : duration === ScoreDuration.Year
          ? ScoreTimeframeEnumApi.Month
          : duration === ScoreDuration.Trimester
          ? ScoreTimeframeEnumApi.Week
          : ScoreTimeframeEnumApi.Day,
      scoredBy: type === 'tags' || type === 'tagStats' ? ScoreByTypeEnumApi.User : undefined,
      scoredById: type === 'tags' || type === 'tagStats' ? this.user.id : undefined,
    } as ChartFilters;
  }
}
