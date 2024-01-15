import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  QuestionStatsDtoApi,
  ScoreByTypeEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  TagDtoApi,
  TagStatsDtoApi,
  UserStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import { combineLatest, map, of, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { TagsRestService } from 'src/app/modules/programs/services/tags-rest.service';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration, ScoreFilter } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { IAppData } from '../../../../../core/resolvers';
import { Point, StatisticsService } from '../../../services/statistics.service';
import { Score } from 'src/app/models/score.model';

@Component({
  selector: 'alto-team-performance',
  templateUrl: './team-performance.component.html',
  styleUrls: ['./team-performance.component.scss'],
})
export class TeamPerformanceComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;
  AltoRoutes = AltoRoutes;

  teamId!: string;
  team!: Team;
  members: User[] = [];
  tags: TagDtoApi[] = [];

  duration: ScoreDuration = ScoreDuration.Trimester;

  selectedMembers: User[] = [];
  teamChartOption: any = {};
  teamChartStatus: PlaceholderDataStatus = 'loading';
  membersLeaderboard: { name: string; score: number }[] = [];
  membersLeaderboardStatus: PlaceholderDataStatus = 'loading';

  selectedTags: TagDtoApi[] = [];
  spiderChartOptions: any = {};
  spiderChartDataStatus: PlaceholderDataStatus = 'loading';
  tagsLeaderboard: { name: string; score: number }[] = [];
  tagsLeaderboardStatus: PlaceholderDataStatus = 'loading';

  membersTable: UserStatsDtoApi[] = [];
  membersTablePage = 1;
  membersTablePageSize = 5;
  membersTableDataStatus: PlaceholderDataStatus = 'loading';
  displayMemberTables: UserStatsDtoApi[] = [];
  previousMembersStats: UserStatsDtoApi[] = [];

  questionsTableSearch = '';
  questionsTableScore = '';
  questionsTable: QuestionStatsDtoApi[] = [];
  questionsTablePage = 1;
  questionsTablePageSize = 5;
  questionsTableDataStatus: PlaceholderDataStatus = 'loading';
  displayQuestionsTables: QuestionStatsDtoApi[] = [];
  previousQuestionsStats: QuestionStatsDtoApi[] = [];

  constructor(
    private titleCasePipe: TitleCasePipe,
    private readonly router: Router,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly statisticService: StatisticsService,
    private readonly tagsRestService: TagsRestService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    this.teamId = this.router.url.split('/').pop() || '';
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.team = (data[EResolvers.AppResolver] as IAppData).teamById.get(this.teamId) as Team;
    this.members = Array.from((data[EResolvers.AppResolver] as IAppData).userById.values()).filter(
      (u) => u.teamId === this.teamId,
    );
    this.selectedMembers = this.members.slice(0, 1);

    combineLatest([
      this.tagsRestService.getTags(),
      this.scoresRestService.getTagsStats(ScoreDuration.Trimester, false, this.teamId),
    ])
    .subscribe(([tags, tagStats]) => {
      tagStats = tagStats.filter((t) => t.score && t.score >= 0);
      this.tags = tags.filter((t) => tagStats.some((ts) => ts.tag.id === t.id));
      this.selectedTags = this.tags.slice(0, 6);
      this.loadPage();
    });
  }

  loadPage(): void {
    this.getTeamChartScores(this.duration);
    this.getTeamLeaderboard(this.duration);
    this.getTagsData();
    this.getMembersTable(this.duration);
    this.getQuestionsTable(this.duration);
  }

  filterQuestionsTable({ search = this.questionsTableSearch, score = this.questionsTableScore }) {
    this.questionsTableSearch = search;
    this.questionsTableScore = score;

    this.getQuestionsTable(this.duration);
  }

  getQuestionsTable(duration: ScoreDuration): void {
    this.questionsTableDataStatus = 'loading';
    combineLatest([
      this.scoresRestService.getQuestionsStats(duration, false, undefined, this.teamId),
      this.scoresRestService.getQuestionsStats(duration, true, undefined, this.teamId),
    ])
      .pipe(
        tap(([res, previous]) => {
          let temp = res;
          if (this.questionsTableSearch && this.questionsTableSearch !== '') {
            temp = temp.filter((question) => {
              const s = this.questionsTableSearch.toLowerCase();
              const title = question.question.title.toLowerCase();
              return title.includes(s);
            });
          }
          if (this.questionsTableScore && this.questionsTableScore !== '') {
            temp = this.scoresService.filterByScore(temp, this.questionsTableScore as ScoreFilter, true);
          }
          this.questionsTable = temp;
          this.previousQuestionsStats = previous;
          this.changeQuestionsPage(1);
          this.questionsTableDataStatus = this.questionsTable.length > 0 ? 'good' : 'noData';
        }),
      )
      .subscribe();
  }

  @memoize()
  getQuestionProgression(question: QuestionStatsDtoApi): number {
    const previous = this.previousQuestionsStats.find((m) => m.question.id === question.question.id);
    return previous && previous.score && question.score ? question.score - previous.score : 0;
  }

  changeQuestionsPage(page: number) {
    this.questionsTablePage = page;
    this.displayQuestionsTables = this.questionsTable.slice(
      (page - 1) * this.questionsTablePageSize,
      page * this.questionsTablePageSize,
    );
  }

  getMembersTable(duration: ScoreDuration, search?: string): void {
    this.membersTableDataStatus = 'loading';
    combineLatest([
      this.scoresRestService.getUsersStats(duration, false, undefined, undefined, this.teamId),
      this.scoresRestService.getUsersStats(duration, true, undefined, undefined, this.teamId),
    ])
      .pipe(
        tap(([res, previous]) => {
          if (search && search !== '') {
            this.membersTable = res.filter((user) => {
              const s = search.toLowerCase();
              const firstname = user.user.firstname.toLowerCase();
              const lastname = user.user.lastname.toLowerCase();
              return firstname.includes(s) || lastname.includes(s);
            });
          } else {
            this.membersTable = res;
          }

          this.previousMembersStats = previous;
          this.changeMembersPage(1);
          this.membersTableDataStatus = this.membersTable.length > 0 ? 'good' : 'noData';
        }),
      )
      .subscribe();
  }

  @memoize()
  getMemberProgression(member: UserStatsDtoApi): number {
    const previous = this.previousMembersStats.find((m) => m.user.id === member.user.id);
    return previous && previous.score && member.score ? member.score - previous.score : 0;
  }

  changeMembersPage(page: number) {
    this.membersTablePage = page;
    this.displayMemberTables = this.membersTable.slice(
      (page - 1) * this.membersTablePageSize,
      page * this.membersTablePageSize,
    );
  }

  getTagsData(): void {
    this.tagsLeaderboardStatus = 'loading';
    combineLatest([
      this.scoresRestService
      .getTagsStats(ScoreDuration.Year, false, this.teamId),
      this.scoresRestService.getTagsStats(ScoreDuration.Year, true)
    ])
      .pipe(
        map(([teamTagStats, globalTagStats]) => {
          return [
            teamTagStats.filter((t) => ( t.score && t.score >= 0 )),
            globalTagStats.filter((t) => ( t.score && t.score >= 0 )),
          ];
        }),
        tap(([teamTagStats]) => {
          this.tagsLeaderboard = teamTagStats.map((r) => ({
            name: r.tag.name,
            score: r.score ?? 0,
          }));
          this.tagsLeaderboardStatus = this.tagsLeaderboard.length > 0 ? 'good' : 'noData';
        }),
      )
      .subscribe(([teamTagStats, globalTagStats]) => {
        if (this.selectedTags.length) {
          teamTagStats = teamTagStats.filter((tagStat) => this.selectedTags.some((si) => si.id === tagStat.tag.id));
          globalTagStats = globalTagStats.filter((tagStat) => this.selectedTags.some((si) => si.id === tagStat.tag.id));
        }
        this.createSpiderChart(teamTagStats, globalTagStats);
        this.spiderChartDataStatus = this.tagsLeaderboard.length > 0 ? 'good' : 'noData';
      });
  }

  createSpiderChart(teamTagStats: TagStatsDtoApi[], globalTagStats: TagStatsDtoApi[]) {
    this.spiderChartOptions = {
      color: ['#475467', '#FF917C'],
      radar: {
        indicator: teamTagStats.map((t) => {
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
              value: globalTagStats.map((t) => (t.score ? Math.round((t.score * 10000) / 100) : 0)),
              name: I18ns.statistics.team.perThemes.globalScore,
              Symbol: 'rect',
              SymbolSize: 12,
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
              value: teamTagStats.map((t) => (t.score ? Math.round((t.score * 10000) / 100) : 0)),
              name: I18ns.statistics.team.perThemes.teamScore,
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

  getTeamLeaderboard(duration: ScoreDuration): void {
    this.membersLeaderboardStatus = 'loading';
    this.scoresRestService
      .getUsersStats(duration, false, undefined, undefined, this.teamId)
      .pipe(
        tap((res) => {
          this.membersLeaderboard = res.map((r) => ({
            name: r.user.firstname + ' ' + r.user.lastname,
            score: r.score ?? 0,
          }));
          this.membersLeaderboardStatus = this.membersLeaderboard.length > 0 ? 'good' : 'noData';
        }),
      )
      .subscribe();
  }

  getTeamChartScores(duration: ScoreDuration): void {
    this.teamChartStatus = 'loading';
    combineLatest([
      this.members.length
        ? this.scoresRestService.getScores(this.getScoreParams('members', duration, false))
        : of([]),
      this.scoresRestService.getScores(this.getScoreParams('members', duration, true)),
    ])
      .pipe(
        tap(([r, global]) => {
          let filteredMembers: Score[] = r;
          if (this.selectedMembers.length > 0) {
            filteredMembers = r.filter((s) => this.selectedMembers.find((m) => m.id === s.id));
          }
          this.createTeamChart(filteredMembers, global, duration);
          this.teamChartStatus = [...filteredMembers, global].length > 0 ? 'good' : 'noData';
        }),
      )
      .subscribe();
  }

  createTeamChart(scores: Score[], global: Score[], duration: ScoreDuration): void {
    // /!\ scores can be empty /!\
    const formattedScores = scores.length ? this.scoresService.formatScores(scores) : [];
    const formattedGlobalScores = this.scoresService.formatScores(global);

    let aggregatedFormattedScores: Score;
    let aggregatedFormattedGlobalScores: Score;
    let aggregatedData: Point[] = [];

    if (scores.length) {
      [aggregatedFormattedScores, aggregatedFormattedGlobalScores] = this.scoresService.formatScores([
        formattedScores[0],
        formattedGlobalScores[0],
      ]);

      aggregatedData = this.statisticService.transformDataToPoint(aggregatedFormattedScores);
    } else {
      aggregatedFormattedGlobalScores = this.scoresService.formatScores([formattedGlobalScores[0]])[0];
      aggregatedData = this.statisticService.transformDataToPoint(aggregatedFormattedGlobalScores);
    }

    const globalPoints = scores.length
      ? this.statisticService
          .transformDataToPoint(aggregatedFormattedGlobalScores)
          .slice(-formattedScores[0]?.averages?.length)
      : this.statisticService.transformDataToPoint(aggregatedFormattedGlobalScores);

    const labels = this.statisticService
      .formatLabel(
        aggregatedData.map((d) => d.x),
        duration,
      )
      .map((s) => this.titleCasePipe.transform(s));

    const dataSet = scores.length
      ? formattedScores.map((s) => {
          const d = this.statisticService.transformDataToPoint(s);
          return { label: s.label, data: d.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y)) };
        })
      : [];

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
