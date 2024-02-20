import { TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  CompanyStatsDtoResponseApi,
  GuessDtoPaginatedResponseApi,
  ProgramStatsDtoApi,
  QuestionSubmittedStatusEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  UserStatsDtoPaginatedResponseApi,
} from '@usealto/sdk-ts-angular';
import { EChartsOption } from 'echarts';
import { Observable, Subscription, combineLatest, map, startWith, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { IUser, User } from 'src/app/models/user.model';
import { ETypeValue } from 'src/app/modules/collaboration/components/lead-collaboration/lead-collaboration.component';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from 'src/app/modules/statistics/services/statistics.service';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';
import { IAppData } from '../../../../core/resolvers';
import { ILeadData } from '../../../../core/resolvers/lead.resolver';
import { Company } from '../../../../models/company.model';
import { EScoreDuration, Score } from '../../../../models/score.model';
import { Team, TeamStats } from '../../../../models/team.model';
import { CommentsRestService } from '../../../programs/services/comments-rest.service';
import { QuestionsSubmittedRestService } from '../../../programs/services/questions-submitted-rest.service';
import { EPlaceholderStatus } from '../../../shared/components/placeholder-manager/placeholder-manager.component';

@Component({
  selector: 'alto-lead-home',
  templateUrl: './lead-home.component.html',
  styleUrls: ['./lead-home.component.scss'],
})
export class LeadHomeComponent implements OnInit, OnDestroy {
  me: User = new User({} as IUser);

  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  ScoreDuration = EScoreDuration;
  ScoreTypeEnum = ScoreTypeEnumApi;
  ETypeValue = ETypeValue;

  programDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  isData = false;
  chartDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  durationControl: FormControl<EScoreDuration> = new FormControl<EScoreDuration>(EScoreDuration.Year, {
    nonNullable: true,
  });

  company!: Company;

  teams: Team[] = [];

  scoreCount = 0;
  averageScore = 0;
  averageScoreProgression?: number;

  programsCount = 0;
  startedProgramsCount = 0;
  finishedProgramsCount = 0;
  averageFinishedPrograms = 0;
  averageFinishedProgramsProgression?: number;

  guessCount = 0;
  expectedGuessCount = 0;
  guessCountProgression?: number;

  commentsCount = 0;
  commentsDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  questionsCount = 0;
  questionsDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  statisticTimeRange: ScoreTimeframeEnumApi = ScoreTimeframeEnumApi.Week;
  //
  teamsLeaderboard: { name: string; score: number }[] = [];
  teamsLeaderboardDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  usersLeaderboard: { name: string; score: number }[] = [];
  usersLeaderboardDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  topflopLoaded = false;
  chartOption: EChartsOption = {};

  private leadHomeComponentSubscription = new Subscription();

  constructor(
    private readonly titleCasePipe: TitleCasePipe,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
    private readonly statisticsServices: StatisticsService,
    public readonly programsRestService: ProgramsRestService,
    public readonly guessesRestService: GuessesRestService,
    public readonly companiesRestService: CompaniesRestService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    private readonly commentsRestService: CommentsRestService,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.company = (data[EResolvers.LeadResolver] as ILeadData).company;
    this.me = (data[EResolvers.AppResolver] as IAppData).me;

    this.leadHomeComponentSubscription.add(
      combineLatest([
        this.commentsRestService.getAllComments({ isRead: false }),
        this.questionsSubmittedRestService.getAllQuestions(QuestionSubmittedStatusEnumApi.Submitted),
      ])
        .pipe(
          switchMap(([unreadComments, submittedQuestions]) => {
            this.commentsCount = unreadComments.length;
            this.questionsCount = submittedQuestions.length;
            this.commentsDataStatus =
              this.commentsCount === 0 ? EPlaceholderStatus.NO_DATA : EPlaceholderStatus.GOOD;
            this.questionsDataStatus =
              this.questionsCount === 0 ? EPlaceholderStatus.NO_DATA : EPlaceholderStatus.GOOD;

            return this.durationControl.valueChanges.pipe(startWith(this.durationControl.value));
          }),
          switchMap((duration) => {
            return combineLatest([
              this.createChart(duration),
              this.getProgramsStats(duration),
              this.getGuessesCount(duration),
              this.getTopFlop(duration),
              this.setAverageScore(duration),
            ]);
          }),
        )
        .subscribe(),
    );
  }

  ngOnDestroy(): void {
    this.leadHomeComponentSubscription.unsubscribe();
  }

  getProgramDataStatus() {
    if (!(this.averageScore || (this.programsCount || this.expectedGuessCount || 0) > 0)) {
      this.programDataStatus = EPlaceholderStatus.NO_DATA;
    } else {
      this.programDataStatus = EPlaceholderStatus.GOOD;
    }
  }

  createChart(duration: EScoreDuration): Observable<Score[]> {
    const params = {
      duration: duration,
      type: ScoreTypeEnumApi.Guess,
      timeframe: ScoreTimeframeEnumApi.Month,
    };

    return this.scoresRestService.getScores(params).pipe(
      tap((scores) => {
        this.scoreCount = scores.length;
        this.chartDataStatus = this.scoreCount === 0 ? EPlaceholderStatus.NO_DATA : EPlaceholderStatus.GOOD;
        const formattedScores = this.scoreService.formatScores(scores);
        const points = this.statisticsServices.transformDataToPoint(formattedScores[0]);
        const labels = this.statisticsServices
          .formatLabel(
            points.map((p) => p.x),
            duration,
          )
          .map((s) => this.titleCasePipe.transform(s));

        this.chartOption = {
          xAxis: [{ ...xAxisDatesOptions, data: labels }],
          yAxis: [{ ...yAxisScoreOptions }],
          series: [
            {
              name: I18ns.shared.global,
              color: '#fdb022',
              data: points.map((p) => (p.y ? Math.round((p.y * 10000) / 100) : (p.y as number))),
              type: 'line',
              showSymbol: false,
              tooltip: {
                valueFormatter: (value: any) => {
                  return value ? (value as number) + '%' : '';
                },
              },
            },
          ],
          legend: legendOptions,
        };
      }),
    );
  }

  getTopFlop(duration: EScoreDuration): Observable<UserStatsDtoPaginatedResponseApi> {
    let teamStats = this.company.getStatsByPeriod(duration, false);
    const teams = this.company.teams;

    teamStats = teamStats.filter((t) => t.score && t.score >= 0);

    this.teamsLeaderboard = teamStats.map((t) => {
      // Find the corresponding team based on teamId
      const matchingTeam = teams.find((team) => team.id === t.teamId);

      // Return the mapping with team name and score
      return {
        name: matchingTeam ? matchingTeam.name : 'Unknown Team', // Fallback in case no matching team is found
        score: t.score,
      };
    });

    this.teamsLeaderboardDataStatus =
      this.teamsLeaderboard.length === 0 ? EPlaceholderStatus.NO_DATA : EPlaceholderStatus.GOOD;

    return this.scoresRestService.getPaginatedUsersStats(duration).pipe(
      tap(({ data: rawUsersStats = [] }) => {
        const filteredUsers = rawUsersStats.filter((u) => u.score && u.score >= 0) ?? [];
        this.usersLeaderboard = filteredUsers.map((u) => ({
          name: u.user.firstname + ' ' + u.user.lastname,
          score: u.score ?? 0,
        }));

        this.usersLeaderboardDataStatus =
          this.usersLeaderboard.length === 0 ? EPlaceholderStatus.NO_DATA : EPlaceholderStatus.GOOD;
        this.topflopLoaded = true;
      }),
    );
  }

  setAverageScore(
    duration: EScoreDuration,
  ): Observable<[CompanyStatsDtoResponseApi, CompanyStatsDtoResponseApi]> {
    return combineLatest([
      this.scoresRestService.getCompanyStats(this.company.id, duration),
      this.scoresRestService.getCompanyStats(this.company.id, duration, true),
    ]).pipe(
      tap(([currentStats, previousStats]) => {
        this.averageScore = currentStats.data?.averageScore ?? 0;
        this.averageScoreProgression =
          previousStats.data?.averageScore && currentStats.data?.averageScore
            ? (currentStats.data?.averageScore - previousStats.data?.averageScore) /
              previousStats.data?.averageScore
            : 0;

        if (!(this.averageScore || (this.programsCount || this.expectedGuessCount || 0) > 0)) {
          this.programDataStatus = EPlaceholderStatus.NO_DATA;
        } else {
          this.programDataStatus = EPlaceholderStatus.GOOD;
        }
      }),
    );
  }

  getProgramsStats(duration: EScoreDuration): Observable<[ProgramStatsDtoApi[], ProgramStatsDtoApi[]]> {
    return combineLatest([
      this.scoresRestService.getPaginatedProgramsStats(duration),
      this.scoresRestService.getPaginatedProgramsStats(duration, true),
    ]).pipe(
      map(([paginatedProgramsStats, previousPaginatedProgramsStats]) => {
        const programsStats = paginatedProgramsStats.data ?? [];
        const lastProgramsStats = previousPaginatedProgramsStats.data ?? [];

        this.programsCount = programsStats.length;
        this.finishedProgramsCount = programsStats.filter((p) => p.participation === 1).length;
        this.averageFinishedPrograms =
          this.finishedProgramsCount && this.programsCount
            ? this.finishedProgramsCount / this.programsCount
            : 0;
        const lastProgramsCount = lastProgramsStats.length;
        const lastFinishedProgramsCount = lastProgramsStats.filter((p) => p.participation === 1).length;
        const lastAverageFinishedPrograms =
          lastFinishedProgramsCount && lastProgramsCount ? lastFinishedProgramsCount / lastProgramsCount : 0;
        this.averageFinishedProgramsProgression = this.averageFinishedPrograms - lastAverageFinishedPrograms;
        return [programsStats, lastProgramsStats];
      }),
    );
  }

  getGuessesCount(
    duration: EScoreDuration,
  ): Observable<[GuessDtoPaginatedResponseApi, GuessDtoPaginatedResponseApi]> {
    const teamsStats = this.company.getStatsByPeriod(duration, false);
    this.expectedGuessCount = teamsStats.reduce((acc, team) => acc + (team.questionsPushedCount ?? 0), 0);

    return combineLatest([
      this.guessesRestService.getPaginatedGuesses({ itemsPerPage: 1 }, duration),
      this.guessesRestService.getPaginatedGuesses({ itemsPerPage: 1 }, duration, true),
    ]).pipe(
      tap(([guesses, previousGuesses]) => {
        this.guessCount = guesses.meta.totalItems;
        this.guessCountProgression =
          previousGuesses.meta.totalItems && guesses.meta.totalItems
            ? (guesses.meta.totalItems - previousGuesses.meta.totalItems) / previousGuesses.meta.totalItems
            : 0;
      }),
    );
  }
}
