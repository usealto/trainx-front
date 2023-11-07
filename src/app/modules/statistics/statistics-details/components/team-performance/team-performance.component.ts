import { Component, OnInit } from '@angular/core';
import {
  ScoreByTypeEnumApi,
  ScoreDtoApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  ScoresResponseDtoApi,
  TagDtoApi,
  TeamDtoApi,
  UserDtoApi,
} from '@usealto/sdk-ts-angular';
import { Observable, combineLatest, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from '../../../services/statistics.service';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { xAxisDatesOptions, yAxisScoreOptions, legendOptions } from 'src/app/modules/shared/constants/config';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { TagsRestService } from 'src/app/modules/programs/services/tags-rest.service';

@Component({
  selector: 'alto-team-performance',
  templateUrl: './team-performance.component.html',
  styleUrls: ['./team-performance.component.scss'],
})
export class TeamPerformanceComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;

  teamId!: string;
  team!: TeamDtoApi;
  members: UserDtoApi[] = [];
  tags: TagDtoApi[] = [];

  duration: ScoreDuration = ScoreDuration.Trimester;

  selectedMembers: UserDtoApi[] = [];
  teamChartOption: any = {};
  membersLeaderboard: { name: string; score: number }[] = [];

  selectedTags: TagDtoApi[] = [];
  tagsChartOption: any = {};
  tagsLeaderboard: { name: string; score: number }[] = [];

  constructor(
    private readonly profileStore: ProfileStore,
    private readonly teamsStore: TeamStore,
    private titleCasePipe: TitleCasePipe,
    private readonly router: Router,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly statisticService: StatisticsService,
    private readonly tagsRestService: TagsRestService,
  ) {}

  ngOnInit(): void {
    this.tagsRestService
      .getTags()
      .pipe(
        tap((r) => {
          this.tags = r;
          this.selectedTags = r.slice(0, 3);
        }),
      )
      .subscribe();
    this.teamId = this.router.url.split('/').pop() || '';
    this.team = this.teamsStore.teams.value.find((t) => t.id === this.teamId) || ({} as TeamDtoApi);
    this.members = this.profileStore.users.value.filter((u) => u.teamId === this.teamId);

    this.selectedMembers = this.members.slice(0, 3);
    this.loadPage();
  }

  loadPage(): void {
    this.getTeamChartScores(this.duration);
    this.getTeamLeaderboard(this.duration);
    this.getTagsChartScores(this.duration);
    this.getTagsLeaderboard(this.duration);
  }

  getTagsChartScores(duration: ScoreDuration): void {
    this.scoresRestService
      .getScores(this.getScoreParams('tags', duration, false))
      .pipe(
        tap((res) => {
          let filteredTags: ScoreDtoApi[] = res.scores;
          if (this.selectedTags.length > 0) {
            filteredTags = res.scores.filter((s) => this.selectedTags.find((m) => m.id === s.id));
          }
          this.createTagsChart(filteredTags, duration);
        }),
      )
      .subscribe();
  }

  createTagsChart(scores: ScoreDtoApi[], duration: ScoreDuration): void {
    const aggregatedData = this.statisticService.transformDataToPoint(scores[0]);

    const labels = this.statisticService
      .formatLabel(
        aggregatedData.map((d) => d.x),
        duration,
      )
      .map((s) => this.titleCasePipe.transform(s));

    const dataSet = scores.map((s) => {
      const d = this.statisticService.transformDataToPoint(s);
      return { label: s.label, data: d.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)) };
    });

    const series = dataSet.map((d) => {
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

    this.tagsChartOption = {
      xAxis: [{ ...xAxisDatesOptions, data: labels }],
      yAxis: [{ ...yAxisScoreOptions }],
      series: series,
      legend: legendOptions,
    };
  }

  getTagsLeaderboard(duration: ScoreDuration): void {
    this.scoresRestService
      .getTagsStats(duration, false, this.teamId)
      .pipe(
        tap((res) => {
          this.tagsLeaderboard = res.map((r) => ({
            name: r.tag.name,
            score: r.score ?? 0,
          }));
        }),
      )
      .subscribe();
  }

  getTeamLeaderboard(duration: ScoreDuration): void {
    this.scoresRestService
      .getUsersStats(duration, false, undefined, undefined, this.teamId)
      .pipe(
        tap((res) => {
          this.membersLeaderboard = res.map((r) => ({
            name: r.user.firstname + ' ' + r.user.lastname,
            score: r.score ?? 0,
          }));
        }),
      )
      .subscribe();
  }

  getTeamChartScores(duration: ScoreDuration): void {
    combineLatest([
      this.scoresRestService.getScores(this.getScoreParams('members', duration, false)),
      this.scoresRestService.getScores(this.getScoreParams('members', duration, true)),
    ])
      .pipe(
        tap(([r, global]) => {
          let filteredMembers: ScoreDtoApi[] = r.scores;
          if (this.selectedMembers.length > 0) {
            filteredMembers = r.scores.filter((s) => this.selectedMembers.find((m) => m.id === s.id));
          }
          this.createTeamChart(filteredMembers, global, duration);
        }),
      )
      .subscribe();
  }

  createTeamChart(scores: ScoreDtoApi[], global: ScoresResponseDtoApi, duration: ScoreDuration): void {
    const reducedScores = this.scoresService.reduceLineChartData(scores);

    const aggregatedData = this.statisticService.transformDataToPoint(scores[0]);
    const globalPoints = this.statisticService
      .transformDataToPoint(global.scores[0])
      .slice(-reducedScores[0]?.averages?.length);

    const labels = this.statisticService
      .formatLabel(
        aggregatedData.map((d) => d.x),
        duration,
      )
      .map((s) => this.titleCasePipe.transform(s));

    const dataSet = scores.map((s) => {
      const d = this.statisticService.transformDataToPoint(s);
      return { label: s.label, data: d.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)) };
    });

    const series = dataSet.map((d) => {
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

    series.push({
      name: I18ns.shared.global,
      data: globalPoints.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)),
      type: 'line',
      showSymbol: false,
      tooltip: {
        valueFormatter: (value: any) => {
          return (value as number) + ' %';
        },
      },
      lineStyle: {
        type: 'dashed',
      },
    });

    this.teamChartOption = {
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

  filterMembers(event: any): void {
    this.selectedMembers = event;
    this.loadPage();
  }

  filterTags(event: any): void {
    this.selectedTags = event;
    this.loadPage();
  }

  @memoize()
  getScoreParams(type: 'members' | 'tags', duration: ScoreDuration, global: boolean): ChartFilters {
    return {
      duration: duration,
      type:
        type === 'members' ? (global ? ScoreTypeEnumApi.Team : ScoreTypeEnumApi.User) : ScoreTypeEnumApi.Tag,
      ids: type === 'members' ? (global ? [this.teamId] : this.members.map((m) => m.id)) : undefined,
      scoredBy: type === 'tags' ? ScoreByTypeEnumApi.Team : undefined,
      scoredById: type === 'tags' ? this.teamId : undefined,
      timeframe:
        duration === ScoreDuration.Year
          ? ScoreTimeframeEnumApi.Month
          : duration === ScoreDuration.Trimester
          ? ScoreTimeframeEnumApi.Week
          : ScoreTimeframeEnumApi.Day,
    };
  }
}