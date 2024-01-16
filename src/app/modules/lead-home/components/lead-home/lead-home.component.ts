import { TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  GuessDtoPaginatedResponseApi,
  ProgramStatsDtoApi,
  QuestionSubmittedStatusEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  UserStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import { EChartsOption } from 'echarts';
import { Observable, Subscription, combineLatest, startWith, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { IUser, User } from 'src/app/models/user.model';
import { ETypeValue } from 'src/app/modules/collaboration/components/lead-collaboration/lead-collaboration.component';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { legendOptions, xAxisDatesOptions, yAxisScoreOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from 'src/app/modules/statistics/services/statistics.service';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';
import { IAppData } from '../../../../core/resolvers';
import { ITeamStatsData } from '../../../../core/resolvers/teamStats.resolver';
import { Company } from '../../../../models/company.model';
import { Team, TeamStats } from '../../../../models/team.model';
import { Score } from '../../../../models/score.model';
import { CommentsRestService } from '../../../programs/services/comments-rest.service';
import { QuestionsSubmittedRestService } from '../../../programs/services/questions-submitted-rest.service';

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
  ScoreDuration = ScoreDuration;
  ScoreTypeEnum = ScoreTypeEnumApi;
  ETypeValue = ETypeValue;
  programDataStatus: PlaceholderDataStatus = 'loading';
  isData = false;
  chartDataStatus: PlaceholderDataStatus = 'loading';

  durationControl: FormControl<ScoreDuration> = new FormControl<ScoreDuration>(ScoreDuration.Year, {
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
  commentsDataStatus: PlaceholderDataStatus = 'loading';
  questionsCount = 0;
  questionsDataStatus: PlaceholderDataStatus = 'loading';
  statisticTimeRange: ScoreTimeframeEnumApi = ScoreTimeframeEnumApi.Week;
  //
  teamsLeaderboard: { name: string; score: number }[] = [];
  teamsLeaderboardCount = 0;
  teamsLeaderboardDataStatus: PlaceholderDataStatus = 'loading';
  usersLeaderboard: { name: string; score: number }[] = [];
  usersLeaderboardCount = 0;
  usersLeaderboardDataStatus: PlaceholderDataStatus = 'loading';
  topflopLoaded = false;
  chartOption: EChartsOption = {};

  private leadHomeComponentSubscription = new Subscription();

  constructor(
    private readonly titleCasePipe: TitleCasePipe,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
    private readonly statisticsServices: StatisticsService,
    public readonly teamStore: TeamStore,
    public readonly profileStore: ProfileStore,
    public readonly programsStore: ProgramsStore,
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
    this.company = (data[EResolvers.TeamStats] as ITeamStatsData).company;
    this.me = (data[EResolvers.AppResolver] as IAppData).me;

    this.leadHomeComponentSubscription.add(
      combineLatest([
        this.commentsRestService.getUnreadComments(),
        this.questionsSubmittedRestService.getQuestionsCount({
          status: QuestionSubmittedStatusEnumApi.Submitted,
        }),
      ]).subscribe(([unreadComments, questionsCount]) => {
        console.log('unreadComments', unreadComments);
        console.log('questionsCount', questionsCount);
        this.commentsCount = unreadComments.length;
        this.questionsCount = questionsCount;
        this.commentsDataStatus = this.commentsCount === 0 ? 'noData' : 'good';
        this.questionsDataStatus = this.questionsCount === 0 ? 'noData' : 'good';
      }),
    );

    this.leadHomeComponentSubscription.add(
      this.durationControl.valueChanges
        .pipe(
          startWith(this.durationControl.value),
          tap((duration) => {
            this.setTeamsAndStats(duration);
          }),
          switchMap((duration) => {
            return combineLatest([
              this.createChart(duration),
              this.getProgramsStats(duration),
              this.getGuessesCount(duration),
              this.getTopFlop(duration),
            ]);
          }),
        )
        .subscribe(),
    );
  }

  ngOnDestroy(): void {
    this.leadHomeComponentSubscription.unsubscribe();
  }

  setTeamsAndStats(duration: ScoreDuration): void {
    const teamStatsNow = this.company.getStatsByPeriod(duration, false);
    const teamStatsPrev = this.company.getStatsByPeriod(duration, true);
    this.setAverageScore(teamStatsNow, teamStatsPrev);
  }

  getProgramDataStatus() {
    if (!(this.averageScore || (this.programsCount || this.expectedGuessCount || 0) > 0)) {
      this.programDataStatus = 'noData';
    } else {
      this.programDataStatus = 'good';
    }
  }

  createChart(duration: ScoreDuration): Observable<Score[]> {
    const params = {
      duration: duration,
      type: ScoreTypeEnumApi.Guess,
      timeframe: ScoreTimeframeEnumApi.Month,
    };

    return this.scoresRestService.getScores(params).pipe(
      tap((scores) => {
        this.scoreCount = scores.length;
        this.chartDataStatus = this.scoreCount === 0 ? 'noData' : 'good';
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

  getTopFlop(duration: ScoreDuration): Observable<UserStatsDtoApi[]> {
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

    this.teamsLeaderboardCount = this.teamsLeaderboard.length;
    this.teamsLeaderboardDataStatus = this.teamsLeaderboardCount === 0 ? 'noData' : 'good';

    return this.scoresRestService.getUsersStats(duration).pipe(
      tap((users) => {
        users = users.filter((u) => u.score && u.score >= 0);
        this.usersLeaderboard = users.map((u) => ({
          name: u.user.firstname + ' ' + u.user.lastname,
          score: u.score ?? 0,
        }));

        this.usersLeaderboardCount = this.usersLeaderboard.length;
        this.usersLeaderboardDataStatus = this.usersLeaderboardCount === 0 ? 'noData' : 'good';
        this.topflopLoaded = true;
      }),
    );
  }

  setAverageScore(current: TeamStats[], previous: TeamStats[]) {
    current = current.filter((t) => t.score);
    previous = previous.filter((t) => t.score);
    const previousScore = previous.reduce((acc, team) => acc + (team.score ?? 0), 0) / previous.length;
    this.averageScore =
      current.filter((t) => t.score).reduce((acc, team) => acc + (team.score ?? 0), 0) / current.length;
    this.averageScoreProgression = previousScore ? (this.averageScore - previousScore) / previousScore : 0;
    this.getProgramDataStatus();
  }

  getProgramsStats(duration: ScoreDuration): Observable<[ProgramStatsDtoApi[], ProgramStatsDtoApi[]]> {
    return combineLatest([
      this.scoresRestService.getProgramsStats(duration),
      this.scoresRestService.getProgramsStats(duration, true),
    ]).pipe(
      tap(([programsStats, lastProgramsStats]) => {
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
      }),
    );
  }

  getGuessesCount(
    duration: ScoreDuration,
  ): Observable<[GuessDtoPaginatedResponseApi, GuessDtoPaginatedResponseApi]> {
    const teamsStats = this.company.getStatsByPeriod(duration, false);
    this.expectedGuessCount = teamsStats.reduce((acc, team) => acc + (team.questionsPushedCount ?? 0), 0);

    return combineLatest([
      this.guessesRestService.getGuesses({ itemsPerPage: 1 }, duration),
      this.guessesRestService.getGuesses({ itemsPerPage: 1 }, duration, true),
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
