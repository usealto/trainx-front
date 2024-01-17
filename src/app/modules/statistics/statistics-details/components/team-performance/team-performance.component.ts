import { TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  QuestionStatsDtoApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  TagStatsDtoApi,
  UserStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, map, of, startWith, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { Score } from 'src/app/models/score.model';
import { Team } from 'src/app/models/team.model';
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
import { SelectOption } from '../../../../shared/models/select-option.model';

@Component({
  selector: 'alto-team-performance',
  templateUrl: './team-performance.component.html',
  styleUrls: ['./team-performance.component.scss'],
})
export class TeamPerformanceComponent implements OnInit, OnDestroy {
  I18ns = I18ns;
  EmojiName = EmojiName;
  AltoRoutes = AltoRoutes;

  teamId!: string;
  team!: Team;

  teamChartOption: any = {};
  teamChartStatus: PlaceholderDataStatus = 'loading';
  membersLeaderboard: { name: string; score: number }[] = [];
  membersLeaderboardStatus: PlaceholderDataStatus = 'loading';
  membersOptions: SelectOption[] = [];
  membersChartControl = new FormControl([] as FormControl<SelectOption>[], {
    nonNullable: true,
  });

  spiderChartOptions: any = {};
  spiderChartDataStatus: PlaceholderDataStatus = 'loading';
  tagsControl = new FormControl([] as FormControl<SelectOption>[], {
    nonNullable: true,
  });
  tagsOptions: SelectOption[] = [];

  tagsLeaderboard: { name: string; score: number }[] = [];
  tagsLeaderboardStatus: PlaceholderDataStatus = 'loading';

  membersTable: UserStatsDtoApi[] = [];
  membersPageControl = new FormControl(1, { nonNullable: true });
  membersTablePageSize = 5;
  membersTableDataStatus: PlaceholderDataStatus = 'loading';
  displayMemberTables: UserStatsDtoApi[] = [];
  previousMembersStats: UserStatsDtoApi[] = [];
  membersSearchControl: FormControl<string> = new FormControl<string>('', { nonNullable: true });

  questionsTable: QuestionStatsDtoApi[] = [];
  questionsPageControl = new FormControl(1, { nonNullable: true });
  questionsTablePageSize = 5;
  questionsTableDataStatus: PlaceholderDataStatus = 'loading';
  displayQuestionsTables: QuestionStatsDtoApi[] = [];
  previousQuestionsStats: QuestionStatsDtoApi[] = [];
  questionsSearchControl: FormControl<string> = new FormControl<string>('', { nonNullable: true });
  questionsScoreControl: FormControl<string> = new FormControl<string>('', { nonNullable: true });

  durationControl: FormControl<ScoreDuration> = new FormControl<ScoreDuration>(ScoreDuration.Trimester, {
    nonNullable: true,
  });
  private readonly performanceByTeamsSubscription: Subscription = new Subscription();

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
    this.team = (data[EResolvers.AppResolver] as IAppData).company.teams.find(
      (u) => u.id === this.teamId,
    ) as Team;
    const members = Array.from((data[EResolvers.AppResolver] as IAppData).userById.values()).filter(
      (u) => u.teamId === this.teamId,
    );
    this.membersOptions = members.map((user) => new SelectOption({ label: user.fullname, value: user.id }));
    this.membersChartControl.setValue([
      new FormControl(new SelectOption({ label: members[0].fullname, value: members[0].id }), {
        nonNullable: true,
      }),
    ]);

    this.performanceByTeamsSubscription.add(
      combineLatest([
        this.membersChartControl.valueChanges.pipe(startWith(this.membersChartControl.value)),
        this.durationControl.valueChanges.pipe(startWith(this.durationControl.value)),
      ])
        .pipe(
          tap(() => (this.teamChartStatus = 'loading')),
          switchMap(([selectedMembers, duration]) => {
            return combineLatest([
              of(selectedMembers),
              of(duration),
              this.scoresRestService.getScores(this.getScoreParams(duration, false)),
              this.scoresRestService.getScores(this.getScoreParams(duration, true)),
            ]);
          }),
        )
        .subscribe({
          next: ([selectedMembers, duration, memberScores, globalScores]) => {
            const selectedMemberIds = selectedMembers.map((m) => m.value);
            if (selectedMemberIds.length > 0) {
              memberScores = memberScores.filter((s) =>
                selectedMemberIds.find((userOption) => userOption.value === s.id),
              );
            }

            this.createTeamChart(memberScores, globalScores, duration);
            this.teamChartStatus = [...memberScores, globalScores].length > 0 ? 'good' : 'noData';
          },
        }),
    );

    this.performanceByTeamsSubscription.add(
      this.tagsRestService
        .getTags()
        .pipe(
          tap((tags) => {
            this.tagsOptions = tags.map((tag) => new SelectOption({ label: tag.name, value: tag.id }));

            this.tagsControl.setValue(
              tags.slice(0, 6).map(
                (tag) =>
                  new FormControl(new SelectOption({ label: tag.name, value: tag.id }), {
                    nonNullable: true,
                  }),
              ),
            );
          }),
          switchMap(() => {
            return this.tagsControl.valueChanges.pipe(startWith(this.tagsControl.value));
          }),
          tap(() => {
            this.spiderChartDataStatus = 'loading';
            this.tagsLeaderboardStatus = 'loading';
          }),
          switchMap((selectedTags) => {
            return combineLatest([
              of(selectedTags),
              this.scoresRestService.getTagsStats(ScoreDuration.Year, false, this.teamId),
            ]);
          }),
          map(([selectedTags, tagStats]) => {
            this.tagsLeaderboard = tagStats.map((tag) => {
              return {
                name: tag.tag.name,
                score: tag.score ?? 0,
              };
            });
            this.tagsLeaderboardStatus = this.tagsLeaderboard.length === 0 ? 'noData' : 'good';
            const selectedTagIds = selectedTags.map((tag) => tag.value.value);
            tagStats = tagStats.filter((tag) => selectedTagIds.includes(tag.tag.id));
            this.spiderChartDataStatus = tagStats.length === 0 ? 'noData' : 'good';
            if (selectedTags.length > 0) {
              tagStats = tagStats.filter((tag) => tagStats.includes(tag));
            }
            return tagStats.sort((a, b) => a.tag.name.localeCompare(b.tag.name));
          }),
        )
        .subscribe((tagStats) => {
          this.createSpiderChart(tagStats);
        }),
    );

    this.performanceByTeamsSubscription.add(
      combineLatest([
        this.questionsScoreControl.valueChanges,
        this.questionsSearchControl.valueChanges,
        this.durationControl.valueChanges,
      ])
        .pipe(
          startWith<[string, string, ScoreDuration]>([
            this.questionsScoreControl.value,
            this.questionsSearchControl.value,
            this.durationControl.value,
          ]),
          tap(() => (this.questionsTableDataStatus = 'loading')),
          switchMap(([score, search, duration]) => {
            return combineLatest([
              of(search),
              of(score),
              this.scoresRestService.getQuestionsStats(duration, false, undefined, this.teamId),
              this.scoresRestService.getQuestionsStats(duration, true, undefined, this.teamId),
            ]);
          }),
          map(([search, scoreFilter, questionsStats, prevQuestionsStats]) => {
            if (search) {
              questionsStats = questionsStats.filter((question) => {
                const s = search.toLowerCase();
                const title = question.question.title.toLowerCase();
                return title.includes(s);
              });
            }
            if (scoreFilter) {
              questionsStats = this.scoresService.filterByScore(
                questionsStats,
                scoreFilter as ScoreFilter,
                true,
              );
            }
            return [questionsStats, prevQuestionsStats];
          }),
        )
        .subscribe(([questionsStats, prevQuestionsStats]) => {
          this.questionsTable = questionsStats;
          this.previousQuestionsStats = prevQuestionsStats;
          this.changeQuestionsPage(1);
          this.questionsTableDataStatus = this.questionsTable.length > 0 ? 'good' : 'noData';
        }),
    );

    this.performanceByTeamsSubscription.add(
      combineLatest([this.membersSearchControl.valueChanges, this.durationControl.valueChanges])
        .pipe(
          startWith<[string, ScoreDuration]>([this.membersSearchControl.value, this.durationControl.value]),
          tap(() => {
            this.membersTableDataStatus = 'loading';
            this.membersLeaderboardStatus = 'loading';
          }),
          switchMap(([search, duration]) => {
            return combineLatest([
              of(search),
              this.scoresRestService.getUsersStats(duration, false, undefined, undefined, this.teamId),
              this.scoresRestService.getUsersStats(duration, true, undefined, undefined, this.teamId),
            ]);
          }),
          map(([search, usersStats, prevUsersStats]) => {
            console.log(usersStats);
            this.membersLeaderboard = usersStats.map((r) => ({
              name: r.user.firstname + ' ' + r.user.lastname,
              score: r.score ?? 0,
            }));
            this.membersLeaderboardStatus = this.membersLeaderboard.length > 0 ? 'good' : 'noData';
            if (search) {
              usersStats = usersStats.filter((user) => {
                const s = search.toLowerCase();
                const firstname = user.user.firstname.toLowerCase();
                const lastname = user.user.lastname.toLowerCase();
                return firstname.includes(s) || lastname.includes(s);
              });
            }
            return [usersStats, prevUsersStats];
          }),
        )
        .subscribe(([usersStats, prevUsersStats]) => {
          (this.membersTable = usersStats),
            (this.previousMembersStats = prevUsersStats),
            this.changeMembersPage(1);
          this.membersTableDataStatus = this.membersTable.length > 0 ? 'good' : 'noData';
        }),
    );

    this.performanceByTeamsSubscription.add(
      this.membersPageControl.valueChanges.subscribe((page) => {
        this.changeQuestionsPage(page);
      }),
    );

    this.performanceByTeamsSubscription.add(
      this.questionsPageControl.valueChanges.subscribe((page) => {
        this.changeQuestionsPage(page);
      }),
    );
  }

  ngOnDestroy(): void {
    this.performanceByTeamsSubscription.unsubscribe();
  }

  @memoize()
  getQuestionProgression(question: QuestionStatsDtoApi): number {
    const previous = this.previousQuestionsStats.find((m) => m.question.id === question.question.id);
    return previous && previous.score && question.score ? question.score - previous.score : 0;
  }

  changeQuestionsPage(page: number) {
    this.displayQuestionsTables = this.questionsTable.slice(
      (page - 1) * this.questionsTablePageSize,
      page * this.questionsTablePageSize,
    );
  }

  @memoize()
  getMemberProgression(member: UserStatsDtoApi): number {
    const previous = this.previousMembersStats.find((m) => m.user.id === member.user.id);
    return previous && previous.score && member.score ? member.score - previous.score : 0;
  }

  changeMembersPage(page: number) {
    this.displayMemberTables = this.membersTable.slice(
      (page - 1) * this.membersTablePageSize,
      page * this.membersTablePageSize,
    );
  }

  createSpiderChart(tagStats: TagStatsDtoApi[]): void {
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
              name: I18ns.statistics.team.perThemes.chartTitle,
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

  getScoreParams(duration: ScoreDuration, global: boolean): ChartFilters {
    return {
      duration: duration,
      type: global ? ScoreTypeEnumApi.Team : ScoreTypeEnumApi.User,
      ids: global ? [this.teamId] : this.membersOptions.map((m) => m.value),
      scoredBy: undefined,
      scoredById: undefined,
      timeframe:
        duration === ScoreDuration.Year
          ? ScoreTimeframeEnumApi.Month
          : duration === ScoreDuration.Trimester
          ? ScoreTimeframeEnumApi.Week
          : ScoreTimeframeEnumApi.Day,
    };
  }
}
