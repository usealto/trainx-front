import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  TeamDtoApi,
  TeamStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import { Observable, combineLatest, filter, map, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from '../../services/statistics.service';

import { ActivatedRoute } from '@angular/router';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { Company } from 'src/app/models/company.model';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { DataForTable } from '../../models/statistics.model';
import { Store } from '@ngrx/store';
import * as FromRoot from '../../../../core/store/store.reducer';
import { Team, TeamStats } from '../../../../models/team.model';


@UntilDestroy()
@Component({
  selector: 'alto-statistics-global-engagement',
  templateUrl: './statistics-global-engagement.component.html',
  styleUrls: ['./statistics-global-engagement.component.scss'],
})
export class StatisticsGlobalEngagementComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;
  duration: ScoreDuration = ScoreDuration.Trimester;
  AltoRoutes = AltoRoutes;

  company: Company = {} as Company;

  teamsStats: TeamStats[] = [];
  teamsStatsPrev: TeamStats[] = [];

  leaderboard: { name: string; score: number; progression: number }[] = [];

  guessChartOptions: any = {};
  guessesDataStatus: PlaceholderDataStatus = 'loading';
  guessesLeaderboardDataStatus: PlaceholderDataStatus = 'loading';

  collaborationChartOptions: any = {};
  collaborationDataStatus: PlaceholderDataStatus = 'loading';

  teamsDataStatus: PlaceholderDataStatus = 'loading';
  teams: Team[] = [];
  teamsDisplay: DataForTable[] = [];
  paginatedTeams: DataForTable[] = [];
  teamsPage = 1;
  teamsPageSize = 5;

  hasConnector = false;

  constructor(
    private readonly titleCasePipe: TitleCasePipe,
    public readonly teamStore: TeamStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly statisticsServices: StatisticsService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    private readonly store: Store<FromRoot.AppState>,
  ) {}

  ngOnInit(): void {
    this.store
      .select(FromRoot.selectCompany)
      .pipe(tap(({ data: company }) => (this.company = company)))
      .subscribe();
    this.teamsStats = this.company.getStatsByPeriod(this.duration, false);
    this.teamsStatsPrev = this.company.getStatsByPeriod(this.duration, true);
    this.getAllData();
  }

  private getAllData(): void {
    this.getTeamDataForTable();
    combineLatest([this.getActivityData(), this.getTeamEngagementData()])
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  private getActivityData(): Observable<[TeamStats[], TeamStats[]]> {
    return this.scoresRestService
      .getScores({
        duration: this.duration,
        type: ScoreTypeEnumApi.Guess,
        timeframe:
          this.duration === ScoreDuration.Year
            ? ScoreTimeframeEnumApi.Month
            : this.duration === ScoreDuration.Trimester
            ? ScoreTimeframeEnumApi.Week
            : ScoreTimeframeEnumApi.Day,
      })
      .pipe(
        tap((scores) => (this.guessesDataStatus = scores.length === 0 ? 'noData' : 'good')),
        filter((scores) => scores.length > 0),
        tap((scores) => {
          const formattedScores = this.scoresService.formatScores(scores);
          const aggregatedData = this.statisticsServices.transformDataToPointByCounts(formattedScores[0]);
          const labels = this.statisticsServices
            .formatLabel(
              aggregatedData.map((d) => d.x),
              this.duration,
            )
            .map((s) => this.titleCasePipe.transform(s));
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
        map((): [TeamStats[], TeamStats[]] => {
          return [this.teamsStats, this.teamsStatsPrev];
        }),
        tap(
          ([currentsStats]) =>
            (this.guessesLeaderboardDataStatus = currentsStats.length === 0 ? 'noData' : 'good'),
        ),
        tap(([currentStats, previousStats]) => {
          currentStats = currentStats.sort((a, b) => (b.totalGuessesCount || 0) - (a.totalGuessesCount || 0));
          currentStats = currentStats.filter((t) => t.score && t.score >= 0);
          previousStats = previousStats.filter((t) => t.score && t.score >= 0);
          this.leaderboard = currentStats.map((t) => {
            const previousScore = previousStats.find((p) => p.teamId === t.teamId)?.score;
            const progression = this.scoresService.getProgression(t.score, previousScore);
            return {
              name: this.company.teams.find((team) => team.id === t.teamId)?.name ?? '',
              score: t.totalGuessesCount ? t.totalGuessesCount : 0,
              progression: progression ? progression : 0,
            };
          });
        }),
      );
  }

  private getTeamEngagementData() {
    return combineLatest([
      this.scoresRestService.getScores({
        duration: this.duration,
        type: ScoreTypeEnumApi.Comment,
        timeframe:
          this.duration === ScoreDuration.Year
            ? ScoreTimeframeEnumApi.Month
            : this.duration === ScoreDuration.Trimester
            ? ScoreTimeframeEnumApi.Week
            : ScoreTimeframeEnumApi.Day,
      }),
      this.scoresRestService.getScores({
        duration: this.duration,
        type: ScoreTypeEnumApi.QuestionSubmitted,
        timeframe:
          this.duration === ScoreDuration.Year
            ? ScoreTimeframeEnumApi.Month
            : this.duration === ScoreDuration.Trimester
            ? ScoreTimeframeEnumApi.Week
            : ScoreTimeframeEnumApi.Day,
      }),
    ]).pipe(
      map(([commentsScores, questionsSubmittedScores]) => {
        return [commentsScores, questionsSubmittedScores];
      }),
      tap(([commentsScores, questionsSubmittedScores]) => {
        this.collaborationDataStatus =
          commentsScores.length === 0 && questionsSubmittedScores.length === 0 ? 'noData' : 'good';
      }),
      filter(
        ([commentsScores, questionsSubmittedScores]) =>
          commentsScores.length > 0 || questionsSubmittedScores.length > 0,
      ),
      tap(([commentsScores, questionsSubmittedScores]) => {
        const formattedCommentsScores = this.scoresService.formatScores(commentsScores);
        const formattedQuestionsSubmittedScores = this.scoresService.formatScores(questionsSubmittedScores);

        const [aggregaedFormattedCommentsScores, aggregatedFormattedQuestionsSubmittedScores] =
          this.scoresService.formatScores([formattedCommentsScores[0], formattedQuestionsSubmittedScores[0]]);

        const aggregatedComments = this.statisticsServices.transformDataToPointByCounts(
          aggregaedFormattedCommentsScores,
        );
        const aggregatedQuestionsSubmitted = this.statisticsServices.transformDataToPointByCounts(
          aggregatedFormattedQuestionsSubmittedScores,
        );
        const labels = this.statisticsServices
          .formatLabel(
            aggregatedComments.map((d) => d.x),
            this.duration,
          )
          .map((s) => this.titleCasePipe.transform(s));

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

  private getTeamDataForTable(): void {
    this.teamsDataStatus = this.teamsStats.length === 0 ? 'noData' : 'good';
    this.hasConnector = this.company.isConnectorActive ?? false;
    this.teams = this.teamsStats.map((t) => this.company.teams.find((team) => team.id === t.teamId) as Team);

    this.teamsDisplay = this.teamsStats.map((t) => {
      const teamProg = this.teamsStatsPrev.find((tp) => tp.teamId === t.teamId);
      return this.dataForTeamTableMapper(t, teamProg);
    });
    this.changeTeamsPage(1);
  }

  updateTimePicker(event: any): void {
    this.duration = event;
    this.getAllData();
  }

  changeTeamsPage(page: number) {
    this.teamsPage = page;
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
