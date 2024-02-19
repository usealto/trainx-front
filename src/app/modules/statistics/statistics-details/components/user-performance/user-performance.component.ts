import { Location, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ScoreByTypeEnumApi, ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, filter, map, startWith, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { EScoreDuration, Score } from 'src/app/models/score.model';
import { Team } from 'src/app/models/team.model';
import { IUser, User } from 'src/app/models/user.model';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { IAppData } from '../../../../../core/resolvers';
import { ILeadData } from '../../../../../core/resolvers/lead.resolver';
import { ToastService } from '../../../../../core/toast/toast.service';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';
import { AltoRoutes } from '../../../../shared/constants/routes';
import { SelectOption } from '../../../../shared/models/select-option.model';
import { StatisticsService } from '../../../services/statistics.service';

@Component({
  selector: 'alto-user-performance',
  templateUrl: './user-performance.component.html',
  styleUrls: ['./user-performance.component.scss'],
})
export class UserPerformanceComponent implements OnInit, OnDestroy {
  I18ns = I18ns;
  EmojiName = EmojiName;
  AltoRoutes = AltoRoutes;

  user!: User;
  team!: Team;

  durationControl: FormControl<EScoreDuration> = new FormControl<EScoreDuration>(EScoreDuration.Year, {
    nonNullable: true,
  });
  userChartOptions!: any;
  userChartStatus = EPlaceholderStatus.LOADING;

  spiderChartOptions!: any;
  spiderChartStatus = EPlaceholderStatus.LOADING;
  tagsOptions: SelectOption[] = [];
  tagsControl = new FormControl([] as FormControl<SelectOption>[], { nonNullable: true });

  private readonly userPerformanceComponentSubscription = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly statisticsService: StatisticsService,
    readonly titleCasePipe: TitleCasePipe,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    private readonly location: Location,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    // TODO : data should come from parent component
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    const usersById = (data[EResolvers.AppResolver] as IAppData).userById;
    const teamsById = (data[EResolvers.AppResolver] as IAppData).company.teamById;
    const tagsDtos = (data[EResolvers.LeadResolver] as ILeadData).tags;

    this.tagsOptions = tagsDtos.map((tagDto) => new SelectOption({ label: tagDto.name, value: tagDto.id }));

    // TODO : move logic into a guard or resolver
    const userId = this.router.url.split('/').pop() || '';
    this.user = usersById.get(userId) || new User({} as IUser);
    if (!this.user.teamId || this.user.teamId === '' || !teamsById.has(this.user.teamId)) {
      this.location.back();
      this.toastService.show({ type: 'danger', text: I18ns.statistics.user.toasts.noTeam });
    } else {
      this.team = teamsById.get(this.user.teamId) as Team;
    }

    // User chart subscription
    this.userPerformanceComponentSubscription.add(
      this.durationControl.valueChanges
        .pipe(
          startWith(this.durationControl.value),
          switchMap((duration) => {
            let timeframe: ScoreTimeframeEnumApi;

            switch (duration) {
              case EScoreDuration.Year:
                timeframe = ScoreTimeframeEnumApi.Month;
                break;
              case EScoreDuration.Trimester:
                timeframe = ScoreTimeframeEnumApi.Week;
                break;
              default:
                timeframe = ScoreTimeframeEnumApi.Day;
                break;
            }

            return combineLatest([
              this.scoresRestService.getScores({
                duration,
                type: ScoreTypeEnumApi.User,
                ids: [this.user.id],
                timeframe,
              }),
              this.scoresRestService.getScores({
                duration,
                type: ScoreTypeEnumApi.Team,
                ids: [this.user.teamId as string],
                timeframe,
              }),
            ]);
          }),
          filter(([userScores]) => {
            if (userScores.length === 0) {
              this.userChartStatus = EPlaceholderStatus.NO_DATA;
              return false;
            }
            return true;
          }),
        )
        .subscribe({
          next: ([userScores, teamScores]) => {
            this.createUserChart(userScores[0], teamScores[0], this.durationControl.value);
            this.userChartStatus =
              userScores.length > 0 ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_DATA;
          },
        }),
    );

    // Spider chart subscription
    this.userPerformanceComponentSubscription.add(
      this.scoresRestService
        .getPaginatedTagsStats(EScoreDuration.Year, false, {
          sortBy: 'score:desc',
          itemsPerPage: 6,
        })
        .pipe(
          tap(({ data: bestTagsStats = [] }) => {
            this.tagsControl.setValue(
              bestTagsStats.map((tagStats) => {
                return new FormControl(
                  this.tagsOptions.find((tagOption) => tagOption.value === tagStats.tag.id) as SelectOption,
                  { nonNullable: true },
                );
              }),
            );
          }),
          switchMap(() => {
            return this.tagsControl.valueChanges.pipe(
              startWith(this.tagsControl.value),
              map((tags) => tags.map((tag) => tag.value)),
            );
          }),
          filter((selectedTags) => {
            if (selectedTags.length < 3 || selectedTags.length > 6) {
              this.spiderChartStatus = EPlaceholderStatus.NO_DATA;
              return false;
            }
            return true;
          }),
          switchMap((selectedTagsOptions) => {
            return combineLatest([
              this.scoresRestService.getScores({
                duration: EScoreDuration.Year,
                type: ScoreTypeEnumApi.Tag,
                team: this.user.teamId,
                timeframe: ScoreTimeframeEnumApi.Year,
                ids: selectedTagsOptions.map(({ value }) => value),
              }),
              this.scoresRestService.getScores({
                duration: EScoreDuration.Year,
                type: ScoreTypeEnumApi.Tag,
                scoredBy: ScoreByTypeEnumApi.User,
                scoredById: this.user.id,
                timeframe: ScoreTimeframeEnumApi.Year,
                ids: selectedTagsOptions.map(({ value }) => value),
              }),
            ]).pipe(
              tap(([teamScores, userScores]) => {
                this.createSpiderChart(
                  selectedTagsOptions.map(({ label }) => label),
                  teamScores.map((teamScore) => {
                    return teamScore.averages[0] ? Math.round((teamScore.averages[0] * 10000) / 100) : null;
                  }),
                  userScores.map((userScore) => {
                    return userScore.averages[0] ? Math.round((userScore.averages[0] * 10000) / 100) : null;
                  }),
                );
              }),
            );
          }),
        )
        .subscribe({
          next: ([teamScores, userScores]) => {
            if (teamScores.length > 0 || userScores.length > 0) {
              this.spiderChartStatus = EPlaceholderStatus.GOOD;
            }
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.userPerformanceComponentSubscription.unsubscribe();
  }

  createSpiderChart(
    selectedTagsLabels: string[],
    teamScores: (number | null)[],
    userScores: (number | null)[],
  ): void {
    this.spiderChartOptions = {
      color: ['#475467', '#FF917C'],
      radar: {
        indicator: selectedTagsLabels.map((name) => {
          return { name, max: 100 };
        }),
      },
      series: [
        {
          type: 'radar',
          // silent: true,
          data: [
            {
              value: teamScores,
              name: I18ns.statistics.user.performance.masteringLevel.spiderChart.teamScore,
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
              value: userScores,
              name: I18ns.statistics.user.performance.masteringLevel.spiderChart.userScore,
              areaStyle: {
                color: 'rgba(255, 145, 124, 0.6)',
                offset: 0,
              },
              label: {
                show: true,
                formatter: function (params: any) {
                  if (params.value !== null && params.value !== undefined) {
                    return (params.value as string) + ' %';
                  }
                  return undefined;
                },
              },
            },
          ],
        },
      ],
    };
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
}
