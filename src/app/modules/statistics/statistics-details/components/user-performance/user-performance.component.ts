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
import { EScoreDuration, Score } from 'src/app/models/score.model';
import { Team } from 'src/app/models/team.model';
import { IUser, User } from 'src/app/models/user.model';
import { TagsRestService } from 'src/app/modules/programs/services/tags-rest.service';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { IAppData } from '../../../../../core/resolvers';
import { ToastService } from '../../../../../core/toast/toast.service';
import { StatisticsService } from '../../../services/statistics.service';
import { FormControl } from '@angular/forms';

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
  durationControl: FormControl<EScoreDuration> = new FormControl<EScoreDuration>(EScoreDuration.Year, {
    nonNullable: true,
  });
  tags: TagDtoApi[] = [];

  userChartOptions!: any;
  userChartStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  tagsChartOptions!: any;
  tagsChartStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  selectedTags: TagDtoApi[] = [];

  spiderChartOptions!: any;
  spiderChartStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  spiderChartStatusReason: '<3 tags' | '>6 tags' | undefined = undefined;
  spiderChartSectionStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
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
    const teamsById = (data[EResolvers.AppResolver] as IAppData).company.teams;
    const userId = this.router.url.split('/').pop() || '';
    this.user = usersById.get(userId) || new User({} as IUser);
    if (
      !this.user.teamId ||
      this.user.teamId === '' ||
      teamsById.find((t) => t.id === this.user.teamId) === undefined
    ) {
      this.location.back();
      this.toastService.show({ type: 'danger', text: I18ns.statistics.user.toasts.noTeam });
    } else {
      this.userTeam = teamsById.find((t) => t.id === this.user.teamId) as Team;
    }

    this.tagsRestService
      .getTags()
      .pipe(
        tap((r) => {
          this.tags = r;
          this.selectedTags = r.slice(0, 1);
          this.selectedSpiderTags = r.slice(0, 6);
        }),
      )
      .subscribe({
        next: () => {
          this.getSpiderChartScores();
          this.getUserChartScores(this.durationControl.value);
          this.getTagsChartScores(this.durationControl.value);
        },
      });

    this.durationControl.valueChanges.subscribe((duration) => {
      this.getUserChartScores(duration);
      this.getTagsChartScores(duration);
    });
  }

  getSpiderChartScores(): void {
    this.spiderChartSectionStatus = this.tags.length ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_DATA;
    this.spiderChartStatus = EPlaceholderStatus.LOADING;
    combineLatest([
      this.scoresRestService.getPaginatedTagsStats(
        EScoreDuration.Year,
        false,
        this.user.teamId,
        this.selectedSpiderTags.map((t) => t.id),
      ),
      this.scoresRestService.getScores(this.getScoreParams('tagStats', EScoreDuration.Year)),
    ]).subscribe(([paginatedTeamStats, userStats]) => {
      const teamStats = paginatedTeamStats.data ?? [];

      this.createSpiderChart(
        teamStats.sort((a, b) => a.tag.name.localeCompare(b.tag.name)),
        userStats.sort((a, b) => a.label.localeCompare(b.label)),
      );
      this.spiderChartStatus = EPlaceholderStatus.GOOD;
    });
  }

  createSpiderChart(teamScores: TagStatsDtoApi[], userScores: Score[]): void {
    this.spiderChartOptions = {
      color: ['#475467', '#FF917C'],
      radar: {
        indicator: teamScores.map((s) => {
          return { name: s.tag.name, max: 100 };
        }),
      },
      series: [
        {
          type: 'radar',
          // silent: true,
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
    };
  }

  getTagsChartScores(duration: EScoreDuration): void {
    this.tagsChartStatus = EPlaceholderStatus.LOADING;
    this.scoresRestService
      .getScores(this.getScoreParams('tags', duration))
      .pipe(
        tap((scores) => {
          this.tagsChartStatus = scores.length > 0 ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_DATA;
          if (scores.length > 0) {
            this.createTagsChart(scores, duration);
          }
        }),
      )
      .subscribe();
  }

  createTagsChart(scores: Score[], duration: EScoreDuration): void {
    const formatedScores = this.scoresService.formatScores(scores);
    const points = formatedScores.map((d) => this.statisticsService.transformDataToPoint(d));

    const dataSets = formatedScores.map((s) => {
      const d = this.statisticsService.transformDataToPoint(s);
      return { label: s.label, data: d.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)) };
    });

    const labels = this.statisticsService
      .formatLabel(
        points[0].map((d) => d.x),
        duration,
      )
      .map((s) => this.titleCasePipe.transform(s));

    const series = dataSets.map((d) => {
      return {
        name: d.label,
        data: d.data,
        type: 'line',
        showSybmol: false,
        tooltip: {
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

  getUserChartScores(duration: EScoreDuration): void {
    this.userChartStatus = EPlaceholderStatus.LOADING;
    combineLatest([
      this.scoresRestService.getScores(this.getScoreParams('user', duration)),
      this.scoresRestService.getScores(this.getScoreParams('team', duration)),
    ])
      .pipe(
        tap(([userScores, teamScores]) => {
          this.userChartStatus = userScores.length > 0 ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_DATA;
          if (userScores.length > 0) {
            this.createUserChart(userScores[0], teamScores[0], duration);
          }
        }),
      )
      .subscribe();
  }

  createUserChart(userScores: Score, teamScores: Score, duration: EScoreDuration): void {
    const [formattedUserScores, formattedTeamScores] = this.scoresService.formatScores([
      userScores,
      teamScores,
    ]);

    const teamPoints = this.statisticsService.transformDataToPoint(formattedTeamScores);

    let labels: string[] = [];

    if (teamPoints.length === 0) {
      labels = [];
    } else {
      labels = this.statisticsService.formatLabel(
        teamPoints.map((d) => d.x),
        duration,
      );
    }

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

  filterTags(event: any): void {
    this.selectedTags = event;
    this.getTagsChartScores(this.durationControl.value);
  }

  filterSpiderTags(event: any): void {
    this.selectedSpiderTags = event;
    if (this.selectedSpiderTags.length < 3) {
      this.spiderChartStatusReason = '<3 tags';
      this.spiderChartStatus = EPlaceholderStatus.NO_DATA;
    } else if (this.selectedSpiderTags.length > 6) {
      this.spiderChartStatusReason = '>6 tags';
      this.spiderChartStatus = EPlaceholderStatus.NO_DATA;
    } else {
      this.getSpiderChartScores();
    }
  }

  getScoreParams(type: 'user' | 'team' | 'tags' | 'tagStats', duration: EScoreDuration): any {
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
          : duration === EScoreDuration.Year
          ? ScoreTimeframeEnumApi.Month
          : duration === EScoreDuration.Trimester
          ? ScoreTimeframeEnumApi.Week
          : ScoreTimeframeEnumApi.Day,
      scoredBy: type === 'tags' || type === 'tagStats' ? ScoreByTypeEnumApi.User : undefined,
      scoredById: type === 'tags' || type === 'tagStats' ? this.user.id : undefined,
    } as ChartFilters;
  }
}
