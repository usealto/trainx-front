import { TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GetQuestionsStatsRequestParams,
  GetUsersStatsRequestParams,
  QuestionDtoApi,
  QuestionStatsDtoApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  TagStatsDtoApi,
  UserStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, debounceTime, filter, map, of, startWith, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { EScoreDuration, EScoreFilter, Score } from 'src/app/models/score.model';
import { Team } from 'src/app/models/team.model';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { IAppData } from '../../../../../core/resolvers';
import { ILeadData } from '../../../../../core/resolvers/lead.resolver';
import { User } from '../../../../../models/user.model';
import { ILeaderboardData } from '../../../../shared/components/leaderboard/leaderboard.component';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';
import { PillOption, SelectOption } from '../../../../shared/models/select-option.model';
import { Point, StatisticsService } from '../../../services/statistics.service';

interface IMemberInfos {
  user: User;
  userStats: UserStatsDtoApi;
  progression?: number;
}

interface IQuestionInfos {
  question: QuestionDtoApi;
  questionStats: QuestionStatsDtoApi;
  progression?: number;
}

@Component({
  selector: 'alto-team-performance',
  templateUrl: './team-performance.component.html',
  styleUrls: ['./team-performance.component.scss'],
})
export class TeamPerformanceComponent implements OnInit, OnDestroy {
  I18ns = I18ns;
  EmojiName = EmojiName;
  AltoRoutes = AltoRoutes;
  EPlaceholderStatus = EPlaceholderStatus;

  teamId!: string;
  team!: Team;
  usersById: Map<string, User> = new Map();

  teamChartOption: any = {};
  teamChartStatus = EPlaceholderStatus.LOADING;

  membersLeaderboard: ILeaderboardData[] = [];
  membersLeaderboardStatus = EPlaceholderStatus.LOADING;
  membersOptions: SelectOption[] = [];
  membersFilterControl = new FormControl([] as FormControl<SelectOption>[], {
    nonNullable: true,
  });

  spiderChartOptions: any = {};
  spiderChartDataStatus = EPlaceholderStatus.LOADING;
  tagsControl = new FormControl([] as FormControl<SelectOption>[], {
    nonNullable: true,
  });
  tagsOptions: SelectOption[] = [];

  tagsLeaderboard: ILeaderboardData[] = [];
  tagsDataStatus = EPlaceholderStatus.LOADING;

  membersInfos: IMemberInfos[] = [];
  membersSearchControl = new FormControl<string | null>(null, { nonNullable: true });
  membersPageControl = new FormControl(1, { nonNullable: true });
  readonly membersTablePageSize = 5;
  membersTotalItems = 0;
  membersInit = false;
  membersTableDataStatus = EPlaceholderStatus.LOADING;

  // Questions table
  questionsInfos: IQuestionInfos[] = [];
  questionsSearchControl: FormControl<string | null> = new FormControl<string | null>(null, {
    nonNullable: true,
  });
  questionsScoreControl = new FormControl<PillOption | null>(null);
  questionsPageControl = new FormControl(1, { nonNullable: true });
  readonly questionsTablePageSize = 5;
  questionsTotalItems = 0;
  questionsInit = false;
  questionsTableDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  readonly scoreOptions: PillOption[] = Score.getFiltersPillOptions();

  durationControl: FormControl<EScoreDuration> = new FormControl<EScoreDuration>(EScoreDuration.Trimester, {
    nonNullable: true,
  });
  private readonly performanceByTeamsSubscription: Subscription = new Subscription();

  constructor(
    private titleCasePipe: TitleCasePipe,
    private readonly router: Router,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly statisticService: StatisticsService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    // TODO : a guard or a resolver should be used to ensure that the team exists
    this.teamId = this.router.url.split('/').pop() || '';
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.team = (data[EResolvers.AppResolver] as IAppData).company.teams.find(
      (u) => u.id === this.teamId,
    ) as Team;
    this.usersById = (data[EResolvers.AppResolver] as IAppData).userById;
    this.membersOptions = Array.from((data[EResolvers.AppResolver] as IAppData).userById.values())
      .filter((u) => u.teamId === this.teamId)
      .map((user) => new SelectOption({ label: user.fullname, value: user.id }));
    this.tagsOptions = Array.from((data[EResolvers.LeadResolver] as ILeadData).tags).map(
      (tag) => new SelectOption({ label: tag.name, value: tag.id }),
    );
    this.resetTagsFilters();
    if (this.membersOptions.length) {
      this.membersFilterControl.setValue([
        new FormControl(this.membersOptions[0], {
          nonNullable: true,
        }),
      ]);
    }

    this.performanceByTeamsSubscription.add(
      combineLatest([
        this.membersFilterControl.valueChanges.pipe(
          startWith(this.membersFilterControl.value),
          map((membersControls) => membersControls.map((x) => x.value)),
        ),
        this.durationControl.valueChanges.pipe(startWith(this.durationControl.value)),
      ])
        .pipe(
          switchMap(([selectedMembers, duration]) => {
            return combineLatest([
              of(selectedMembers),
              of(duration),
              this.membersOptions.length
                ? this.scoresRestService.getScores(this.getScoreParams(duration, false))
                : of([]),
              this.scoresRestService.getScores(this.getScoreParams(duration, true)),
            ]);
          }),
        )
        .subscribe({
          next: ([selectedMembers, duration, memberScores, globalScores]) => {
            const selectedMemberIds = selectedMembers.map((m) => m.value);
            if (selectedMemberIds.length > 0) {
              memberScores = memberScores.filter((s) =>
                selectedMemberIds.find((memberId) => memberId === s.id),
              );
            }

            if ([...memberScores, globalScores].length > 0) {
              this.setTeamChartOptions(memberScores, globalScores, duration);
              this.teamChartStatus = EPlaceholderStatus.GOOD;
            } else {
              this.teamChartStatus = selectedMembers.length
                ? EPlaceholderStatus.NO_RESULT
                : EPlaceholderStatus.NO_DATA;
            }
          },
        }),
    );

    this.performanceByTeamsSubscription.add(
      combineLatest([
        this.questionsPageControl.valueChanges.pipe(startWith(this.questionsPageControl.value)),
        combineLatest([
          this.questionsSearchControl.valueChanges.pipe(startWith(this.questionsSearchControl.value)),
          this.questionsScoreControl.valueChanges.pipe(startWith(this.questionsScoreControl.value)),
          this.durationControl.valueChanges.pipe(startWith(this.durationControl.value)),
        ]).pipe(tap(() => this.questionsPageControl.patchValue(1))),
      ])
        .pipe(
          debounceTime(this.questionsInit ? 0 : 200),
          tap(() => (this.questionsInit = false)),
          switchMap(([page, [search, score, duration]]) => {
            const req: GetQuestionsStatsRequestParams = {
              search: search || undefined,
              itemsPerPage: this.questionsTablePageSize,
              page,
              teamIds: this.teamId,
            };

            switch (score?.value) {
              case EScoreFilter.Under25:
                req.scoreBelowOrEqual = 0.25;
                break;
              case EScoreFilter.Under50:
                req.scoreBelowOrEqual = 0.5;
                break;
              case EScoreFilter.Under75:
                req.scoreBelowOrEqual = 0.75;
                break;
              case EScoreFilter.Over25:
                req.scoreAboveOrEqual = 0.25;
                break;
              case EScoreFilter.Over50:
                req.scoreAboveOrEqual = 0.5;
                break;
              case EScoreFilter.Over75:
                req.scoreAboveOrEqual = 0.75;
                break;
            }

            return this.scoresRestService.getPaginatedQuestionsStats(duration, false, req).pipe(
              switchMap((paginatedQuestionsStats) => {
                req.ids = paginatedQuestionsStats.data?.map((q) => q.question.id).join(',') ?? undefined;

                return combineLatest([
                  of(paginatedQuestionsStats),
                  req.ids
                    ? this.scoresRestService.getPaginatedQuestionsStats(duration, true, req)
                    : of({ data: [] }),
                ]);
              }),
            );
          }),
        )
        .subscribe(([{ data: questionsStats = [], meta }, { data: prevQuestionsStats = [] }]) => {
          this.questionsInfos = questionsStats.map((questionStats) => {
            const previousStats = prevQuestionsStats.find((m) => m.question.id === questionStats.question.id);

            return {
              question: questionStats.question,
              questionStats,
              progression:
                questionStats.score && previousStats?.score
                  ? questionStats.score - previousStats.score
                  : undefined,
            };
          });

          this.questionsTotalItems = meta.totalItems;
          this.questionsTableDataStatus =
            this.questionsInfos.length === 0
              ? this.questionsSearchControl.value || this.questionsScoreControl.value
                ? EPlaceholderStatus.NO_RESULT
                : EPlaceholderStatus.NO_DATA
              : EPlaceholderStatus.GOOD;
        }),
    );

    this.performanceByTeamsSubscription.add(
      combineLatest([
        this.membersPageControl.valueChanges.pipe(startWith(this.membersPageControl.value)),
        combineLatest([
          this.membersSearchControl.valueChanges.pipe(startWith(this.membersSearchControl.value)),
          this.durationControl.valueChanges.pipe(startWith(this.durationControl.value)),
        ]).pipe(tap(() => this.membersPageControl.patchValue(1))),
      ])
        .pipe(
          debounceTime(this.membersInit ? 0 : 200),
          tap(() => (this.membersInit = false)),
          switchMap(([page, [search, duration]]) => {
            const req: GetUsersStatsRequestParams = {
              search: search || undefined,
              itemsPerPage: this.membersTablePageSize,
              page,
              teamIds: this.teamId,
            };

            return this.scoresRestService.getPaginatedUsersStats(duration, false, req).pipe(
              switchMap((paginatedUsersStats) => {
                req.ids = paginatedUsersStats.data?.map((u) => u.user.id).join(',') ?? undefined;

                return combineLatest([
                  of(paginatedUsersStats),
                  req.ids
                    ? this.scoresRestService.getPaginatedUsersStats(duration, true, req)
                    : of({ data: [] }),
                ]);
              }),
            );
          }),
        )
        .subscribe(([{ data: usersStats = [], meta }, { data: prevUsersStats = [] }]) => {
          this.membersInfos = usersStats.map((userStats) => {
            const previousStats = prevUsersStats.find((m) => m.user.id === userStats.user.id);

            return {
              user: this.usersById.get(userStats.user.id) as User,
              userStats,
              progression:
                userStats.score && previousStats?.score ? userStats.score - previousStats.score : undefined,
            };
          });

          this.membersTotalItems = meta.totalItems;
          this.membersTableDataStatus =
            this.membersInfos.length === 0
              ? this.membersSearchControl.value
                ? EPlaceholderStatus.NO_RESULT
                : EPlaceholderStatus.NO_DATA
              : EPlaceholderStatus.GOOD;
        }),
    );

    this.performanceByTeamsSubscription.add(
      this.scoresRestService
        .getAllTagsStats({ teamIds: this.teamId })
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
          switchMap((tagStats) => {
            return combineLatest([
              of(tagStats),
              this.tagsControl.valueChanges.pipe(
                startWith(this.tagsControl.value),
                map((tagsControls) => tagsControls.map((t) => t.value)),
              ),
            ]);
          }),
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
            if (tagStats.length) {
              this.createSpiderChart(
                tagStats
                  .filter(({ score }) => typeof score === 'number')
                  .filter((t) => selectedTags.some(({ value }) => value === t.tag.id)),
              );
              this.spiderChartDataStatus = EPlaceholderStatus.GOOD;
            } else {
              this.spiderChartDataStatus = EPlaceholderStatus.NO_RESULT;
            }
          },
        }),
    );

    this.performanceByTeamsSubscription.add(
      this.durationControl.valueChanges
        .pipe(
          startWith(this.durationControl.value),
          switchMap((duration) => {
            return this.scoresRestService.getAllUsersStats(duration, false, {
              teamIds: this.teamId ? this.teamId : undefined,
              sortBy: 'socre:asc',
            });
          }),
        )
        .subscribe({
          next: (usersStats) => {

            this.membersLeaderboard = usersStats
              .filter(({ score }) => typeof score === 'number')
              .map((u) => ({ name: u.user.firstname + ' ' + u.user.lastname, score: u.score as number }));
            this.membersLeaderboardStatus =
              this.membersLeaderboard.length === 0 ? EPlaceholderStatus.NO_DATA : EPlaceholderStatus.GOOD;
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.performanceByTeamsSubscription.unsubscribe();
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

  setTeamChartOptions(scores: Score[], global: Score[], duration: EScoreDuration): void {
    // /!\ scores can be empty /!\
    const formattedScores = scores.length ? this.scoresService.formatScores(scores) : [];
    const formattedGlobalScores = global.length ? this.scoresService.formatScores(global) : [];

    let aggregatedFormattedScores: Score;
    let aggregatedFormattedGlobalScores: Score;
    let aggregatedData: Point[] = [];

    if (formattedScores.length && formattedGlobalScores.length) {
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

  resetTagsFilters(): void {
    this.tagsControl.setValue(
      this.tagsOptions.slice(0, 6).map(
        (tagOption) =>
          new FormControl(tagOption, {
            nonNullable: true,
          }),
      ),
    );
  }

  resetQuestionsFilters(): void {
    this.questionsSearchControl.patchValue(null);
    this.questionsScoreControl.patchValue(null);
    this.durationControl.patchValue(EScoreDuration.Trimester);
  }

  getScoreParams(duration: EScoreDuration, global: boolean): ChartFilters {
    return {
      duration,
      type: global ? ScoreTypeEnumApi.Team : ScoreTypeEnumApi.User,
      ids: global ? [this.teamId] : this.membersOptions.map((m) => m.value),
      timeframe:
        duration === EScoreDuration.Year
          ? ScoreTimeframeEnumApi.Month
          : duration === EScoreDuration.Trimester
          ? ScoreTimeframeEnumApi.Week
          : ScoreTimeframeEnumApi.Day,
    };
  }
}
