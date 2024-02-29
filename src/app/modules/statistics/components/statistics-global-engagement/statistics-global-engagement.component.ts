import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import { Observable, Subscription, combineLatest, filter, startWith, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { Company } from 'src/app/models/company.model';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { ILeadData } from '../../../../core/resolvers/lead.resolver';
import { EScoreDuration, Score } from '../../../../models/score.model';
import { Team, TeamStats } from '../../../../models/team.model';
import { EPlaceholderStatus } from '../../../shared/components/placeholder-manager/placeholder-manager.component';
import { DataForTable } from '../../models/statistics.model';
import { StatisticsService } from '../../services/statistics.service';
import { ChartsService } from '../../../charts/charts.service';

@Component({
  selector: 'alto-statistics-global-engagement',
  templateUrl: './statistics-global-engagement.component.html',
  styleUrls: ['./statistics-global-engagement.component.scss'],
})
export class StatisticsGlobalEngagementComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;
  AltoRoutes = AltoRoutes;
  EPlaceholderStatus = EPlaceholderStatus;

  // TODO : clean chartsService
  tooltipTitleFormatter = (title: string) => title;

  company!: Company;

  teamsStats: TeamStats[] = [];
  teamsStatsPrev: TeamStats[] = [];

  leaderboard: { name: string; score: number; progression: number }[] = [];

  guessChartOptions: any = {};
  guessesDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  guessesLeaderboardDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  collaborationChartOptions: any = {};
  collaborationDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  teamsDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  teams: Team[] = [];
  paginatedTeams: DataForTable[] = [];

  hasConnector = false;

  durationControl: FormControl<EScoreDuration> = new FormControl<EScoreDuration>(EScoreDuration.Trimester, {
    nonNullable: true,
  });
  pageControl: FormControl<number> = new FormControl(1, { nonNullable: true });
  teamsDisplay: DataForTable[] = [];
  readonly teamsPageSize = 5;
  private readonly statisticsGlobalEngagementComponentSubscription = new Subscription();

  constructor(
    private readonly titleCasePipe: TitleCasePipe,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly statisticsServices: StatisticsService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    public chartsService: ChartsService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.company = (data[EResolvers.LeadResolver] as ILeadData).company;

    this.statisticsGlobalEngagementComponentSubscription.add(
      combineLatest([
        this.durationControl.valueChanges.pipe(
          startWith(this.durationControl.value),
          tap(() => this.pageControl.patchValue(1)),
        ),
        this.pageControl.valueChanges.pipe(startWith(this.pageControl.value)),
      ])
        .pipe(
          tap(([duration]) => {
            this.tooltipTitleFormatter = this.chartsService.tooltipDurationTitleFormatter(duration);
          }),
          tap(([duration, page]) => {
            this.teamsStats = this.company.getStatsByPeriod(duration, false);
            this.teamsStatsPrev = this.company.getStatsByPeriod(duration, true);

            this.teamsStats = this.teamsStats.sort(
              (a, b) => (b.totalGuessesCount || 0) - (a.totalGuessesCount || 0),
            );
            this.leaderboard = this.teamsStats.map((t) => {
              const previousScore = this.teamsStatsPrev.find((p) => p.teamId === t.teamId)?.score;
              const progression = this.scoresService.getProgression(t.score, previousScore);
              return {
                name: this.company.teams.find((team) => team.id === t.teamId)?.name ?? '',
                score: t.totalGuessesCount ? t.totalGuessesCount : 0,
                progression: progression ? progression : 0,
              };
            });
            this.guessesLeaderboardDataStatus =
              this.leaderboard.length === 0 ? EPlaceholderStatus.NO_DATA : EPlaceholderStatus.GOOD;
            this.getTeamDataForTable(page);
          }),
          switchMap(([duration]) => {
            return combineLatest([this.getActivityData(duration), this.getTeamEngagementData(duration)]);
          }),
        )
        .subscribe(),
    );
  }

  private getActivityData(duration: EScoreDuration): Observable<Score[]> {
    return this.scoresRestService
      .getScores({
        duration,
        type: ScoreTypeEnumApi.Guess,
        timeframe:
          duration === EScoreDuration.Year
            ? ScoreTimeframeEnumApi.Month
            : duration === EScoreDuration.Trimester
            ? ScoreTimeframeEnumApi.Week
            : ScoreTimeframeEnumApi.Day,
      })
      .pipe(
        tap((scores) => {
          this.guessesDataStatus = scores.length === 0 ? EPlaceholderStatus.NO_DATA : EPlaceholderStatus.GOOD;
        }),
        filter((scores) => scores.length > 0),
        tap((scores) => {
          const formattedScores = this.scoresService.formatScores(scores);
          const aggregatedData = this.statisticsServices.transformDataToPointByCounts(formattedScores[0]);
          const labels = this.statisticsServices.formatLabel(
            aggregatedData.map((d) => d.x),
            duration,
          );
          const dataset = formattedScores.map((s) => {
            const d = this.statisticsServices.transformDataToPointByCounts(s);
            return {
              label: s.label,
              data: d.map((d) => d.y),
            };
          });

          const series = dataset.map((d) => {
            return {
              name: I18ns.charts.answeredQuestions,
              data: d.data,
              type: 'line',
              showSymbol: false,
              color: '#FD853A',
            };
          });

          this.guessChartOptions = {
            xAxis: [
              {
                ...xAxisDatesOptions,
                data: labels,
              },
            ],
            yAxis: [
              {
                ...yAxisScoreOptions,
                max: undefined,
                interval: undefined,
                name: I18ns.charts.answerCountLabel,
              },
            ],
            series: series,
            legend: { show: false },
          };
        }),
      );
  }

  private getTeamEngagementData(duration: EScoreDuration) {
    return combineLatest([
      this.scoresRestService.getScores({
        duration,
        type: ScoreTypeEnumApi.Comment,
        timeframe:
          duration === EScoreDuration.Year
            ? ScoreTimeframeEnumApi.Month
            : duration === EScoreDuration.Trimester
            ? ScoreTimeframeEnumApi.Week
            : ScoreTimeframeEnumApi.Day,
      }),
      this.scoresRestService.getScores({
        duration,
        type: ScoreTypeEnumApi.QuestionSubmitted,
        timeframe:
          duration === EScoreDuration.Year
            ? ScoreTimeframeEnumApi.Month
            : duration === EScoreDuration.Trimester
            ? ScoreTimeframeEnumApi.Week
            : ScoreTimeframeEnumApi.Day,
      }),
    ]).pipe(
      tap(([commentsScores, questionsSubmittedScores]) => {
        this.collaborationDataStatus =
          commentsScores.length === 0 && questionsSubmittedScores.length === 0
            ? EPlaceholderStatus.NO_DATA
            : EPlaceholderStatus.GOOD;
      }),
      filter(
        ([commentsScores, questionsSubmittedScores]) =>
          commentsScores.length > 0 || questionsSubmittedScores.length > 0,
      ),
      tap(([commentsScores, questionsSubmittedScores]) => {
        const formattedCommentsScores = this.scoresService.formatScores(commentsScores);
        const formattedQuestionsSubmittedScores = this.scoresService.formatScores(questionsSubmittedScores);

        const [aggregatedFormattedCommentsScores, aggregatedFormattedQuestionsSubmittedScores] =
          this.scoresService.formatScores([formattedCommentsScores[0], formattedQuestionsSubmittedScores[0]]);

        const aggregatedComments = this.statisticsServices.transformDataToPointByCounts(
          aggregatedFormattedCommentsScores,
        );
        const aggregatedQuestionsSubmitted = this.statisticsServices.transformDataToPointByCounts(
          aggregatedFormattedQuestionsSubmittedScores,
        );
        const labels = this.statisticsServices.formatLabel(
          aggregatedComments.map((d) => d.x),
          duration,
        );

        const dataset = [
          {
            label: I18ns.statistics.globalEngagement.engagement.comments,
            data: aggregatedComments.map((d) => d.y),
            color: '#53b1fd',
          },
          {
            label: I18ns.statistics.globalEngagement.engagement.suggQuestions,
            data: aggregatedQuestionsSubmitted.map((d) => d.y),
            color: '#9b8afb',
          },
        ];

        const series = dataset.map((d) => {
          return {
            name: d.label,
            data: d.data,
            type: 'line',
            showSymbol: false,
            color: d.color,
          };
        });
        this.collaborationChartOptions = {
          xAxis: [
            {
              ...xAxisDatesOptions,
              data: labels,
            },
          ],
          yAxis: [
            {
              ...yAxisScoreOptions,
              max: undefined,
              interval: undefined,
              name: I18ns.charts.collaborationCountLabel,
            },
          ],
          series: series,
          legend: legendOptions,
        };
      }),
    );
  }

  private getTeamDataForTable(page: number): void {
    this.teamsDataStatus =
      this.teamsStats.length === 0 ? EPlaceholderStatus.NO_DATA : EPlaceholderStatus.GOOD;
    this.hasConnector = this.company.isConnectorActive ?? false;
    this.teams = this.teamsStats.map((t) => this.company.teamById.get(t.teamId) as Team);

    this.teamsDisplay = this.teamsStats
      .map((t) => {
        const teamProg = this.teamsStatsPrev.find((tp) => tp.teamId === t.teamId);
        return this.dataForTeamTableMapper(t, teamProg);
      })
      .sort((a, b) => b.answeredQuestionsProgression - a.answeredQuestionsProgression);

    this.paginatedTeams = this.teamsDisplay.slice((page - 1) * this.teamsPageSize, page * this.teamsPageSize);
  }

  private dataForTeamTableMapper(t: TeamStats, tProg?: TeamStats): DataForTable {
    const totalGuessCount = t.totalGuessesCount
      ? t.totalGuessesCount > (t.questionsPushedCount ?? 0)
        ? t.questionsPushedCount
        : t.totalGuessesCount
      : 0;
    return {
      team: this.company.teams.find((team) => team.id === t.teamId),
      globalScore: t.score,
      answeredQuestionsCount: totalGuessCount,
      answeredQuestionsProgression:
        totalGuessCount && t.questionsPushedCount
          ? Math.round((totalGuessCount / t.questionsPushedCount) * 100)
          : 0,
      questionsPushedCount: t.questionsPushedCount,
      commentsCount: t.commentsCount,
      commentsProgression: this.scoresService.getProgression(t.commentsCount, tProg?.commentsCount) ?? 0,
      submittedQuestionsCount: t.questionsSubmittedCount,
      submittedQuestionsProgression:
        this.scoresService.getProgression(t.questionsSubmittedCount, tProg?.questionsSubmittedCount) ?? 0,
      leastMasteredTags: t.tagStats
        ?.filter((ta) => (ta.score ?? 0) < 50)
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .slice(0, 3)
        .map((t) => t.name),
    } as DataForTable;
  }
}
