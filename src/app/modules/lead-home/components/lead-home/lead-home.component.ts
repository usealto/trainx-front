import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import Chart, { ChartData } from 'chart.js/auto';
import { Observable, combineLatest, filter, map, of, switchMap, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { ChallengesRestService } from 'src/app/modules/challenges/services/challenges-rest.service';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { ScoreDuration } from 'src/app/modules/programs/models/score.model';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';
import { ScoresRestService } from 'src/app/modules/programs/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/programs/services/scores.service';
import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import {
  ChallengeDtoApi,
  ChallengeDtoApiTypeEnumApi,
  GetProgramRunsRequestParams,
  GetScoresRequestParams,
  ProgramRunApi,
  ScoreByTypeEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  ScoresResponseDtoApi,
  TeamDtoApi,
  UserDtoApi,
} from 'src/app/sdk';
@UntilDestroy()
@Component({
  selector: 'alto-lead-home',
  templateUrl: './lead-home.component.html',
  styleUrls: ['./lead-home.component.scss'],
})
export class LeadHomeComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  ScoreDuration = ScoreDuration;
  ScoreTypeEnum = ScoreTypeEnumApi;

  userName = '';

  chartFilters: ChartFilters = { duration: ScoreDuration.Month, type: ScoreTypeEnumApi.Program, team: '' };
  scoreCount = 0;

  commentsCount = 0;
  questionsCount = 0;
  statisticTimeRange: ScoreTimeframeEnumApi = ScoreTimeframeEnumApi.Week;
  evolutionChart?: Chart;
  globalScore = 0;
  averageCompletion = 0;
  completionProgression = 0;
  //
  programs!: ProgramRunApi[];
  programsPage = 1;
  programsCount = 0;
  programPageSize = 3;
  //
  challengesByTeam: ChallengeDtoApi[] = [];
  challengesByUser: ChallengeDtoApi[] = [];

  topFlopData: {
    programs: any[];
    teams: any[];
  } = { programs: [], teams: [] };
  topFlopProgramTab: ScoreTypeEnumApi = ScoreTypeEnumApi.Program;
  topFlopTeamTab: ScoreTypeEnumApi = ScoreTypeEnumApi.Team;

  constructor(
    private readonly commentsRestService: CommentsRestService,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoreService: ScoresService,

    private readonly programRunsService: ProgramRunsRestService,
    private readonly challengesRestService: ChallengesRestService,
    private readonly userService: UsersRestService,
    public readonly teamStore: TeamStore,
    private readonly profileStore: ProfileStore,
  ) {}

  ngOnInit(): void {
    this.userName = this.profileStore.user.value.firstname ?? this.profileStore.user.value.username ?? '';
    this.getProgramRuns();

    combineLatest([
      this.commentsRestService.getComments(),
      this.questionsSubmittedRestService.getQuestions(),
      this.challengesRestService.getChallenges({ itemsPerPage: 40, sortBy: 'endDate:desc' }),
    ])
      .pipe(
        tap(([comments, questions, challenges]) => {
          this.commentsCount = comments.length;
          this.questionsCount = questions.length;
          this.challengesByTeam = challenges
            .filter((c) => c.type === ChallengeDtoApiTypeEnumApi.ByTeam)
            .slice(0, 5);
          this.challengesByUser = challenges
            .filter((c) => c.type === ChallengeDtoApiTypeEnumApi.ByUser)
            .slice(0, 5);
        }),
        switchMap(() => this.getScore({ timeframe: ScoreTimeframeEnumApi.Week } as GetScoresRequestParams)),
        switchMap(() => this.getAverageCompletion(ScoreTimeframeEnumApi.Week)),
        untilDestroyed(this),
      )
      .subscribe();

    this.createCharts(this.chartFilters);
  }

  createCharts({
    duration = this.chartFilters.duration,
    type = this.chartFilters.type ?? ScoreTypeEnumApi.Program,
    team = this.chartFilters.team,
  }: ChartFilters) {
    this.chartFilters.duration = duration;
    this.chartFilters.type = type;
    this.chartFilters.team = team;

    this.topFlop(this.topFlopProgramTab);
    this.topFlop(this.topFlopTeamTab);

    if (this.evolutionChart) {
      this.evolutionChart.destroy();
    }
    this.scoresRestService
      .getScores(this.chartFilters)
      .pipe(
        tap(({ scores }) => (this.scoreCount = scores.length)),
        filter(() => !!this.scoreCount),
        tap(({ scores }) => {
          const labels = scores[0].dates.map((d) => d.toLocaleDateString());
          const data: ChartData = {
            labels: labels,
            datasets: scores.map((s) => ({
              label: s.label,
              data: s.averages.map((u) => (u ? Math.round(u * 10000) / 100 : u)),
              fill: false,
              tension: 0.2,
              spanGaps: true,
            })),
          };

          this.evolutionChart = new Chart('programScoreEvol', {
            type: 'line',
            data: data,
            options: chartDefaultOptions,
          });
        }),
      )
      .subscribe();
  }

  topFlop(val: ScoreTypeEnumApi) {
    this.scoresRestService
      .getScores({
        ...this.chartFilters,
        timeframe: this.scoreService.durationToTimeFrame(this.chartFilters.duration as ScoreDuration),
        type: val,
        sortBy: 'lastAverage:desc',
      })
      .pipe(
        tap((sc: ScoresResponseDtoApi) => {
          const output = sc.scores.map((s) => ({
            label: s.label,
            avg: s.averages.at(-1),
          }));
          if (val === ScoreTypeEnumApi.Program || val === ScoreTypeEnumApi.Tag) {
            this.topFlopProgramTab = val;
            this.topFlopData.programs = output;
          }
          if (val === ScoreTypeEnumApi.Team || val === ScoreTypeEnumApi.User) {
            this.topFlopTeamTab = val;
            this.topFlopData.teams = output;
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  changeProgramPage() {
    this.getProgramRuns();
  }

  getProgramRuns(teams: string[] = []) {
    this.programRunsService
      .getProgramRunsPaginated({
        isFinished: false,
        page: this.programsPage,
        itemsPerPage: this.programPageSize,
        teamIds: teams.join(','),
      })
      .pipe(
        tap((p) => (this.programs = p.data ?? [])),
        tap((p) => (this.programsCount = p.meta.totalItems ?? [])),
        untilDestroyed(this),
      )
      .subscribe();
  }

  updateScore(e: { timeframe?: string; teamId?: string }) {
    const paramsScore = e.teamId ? { scoredBy: ScoreByTypeEnumApi.Team, scoredById: e.teamId } : null;
    const paramsAverage = e.teamId ? { teamIds: e.teamId } : null;
    combineLatest([
      this.getScore(paramsScore as GetScoresRequestParams),
      this.getAverageCompletion(
        e.timeframe as ScoreTimeframeEnumApi,
        paramsAverage as GetProgramRunsRequestParams,
      ),
    ])
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  getScore(e: GetScoresRequestParams) {
    return this.scoresRestService.getGeneralScores(e).pipe(
      filter((s) => {
        if (!s.scores.length) {
          this.globalScore = 0;
          return false;
        }
        return true;
      }),
      tap((scores) => {
        this.globalScore =
          scores.scores[0].averages.reduce((prev, curr) => prev + curr, 0) / scores.scores[0].averages.length;
      }),
    );
  }

  getAverageCompletion(timeframe: ScoreTimeframeEnumApi, req?: GetProgramRunsRequestParams) {
    return combineLatest([
      this.scoresRestService.getAverageCompletion(timeframe, req),
      this.scoresRestService.getCompletionProgression(timeframe, req),
    ]).pipe(
      map(([current, last]) => [
        [current.filter((p) => p.finishedAt !== null), current],
        [last.filter((p) => p.finishedAt !== null), last],
      ]),
      tap(([currentAvg, previousAvg]) => {
        const avgCompletion = currentAvg[0].length / currentAvg[1].length;
        this.averageCompletion = avgCompletion;
        const previousAvgCompletion = previousAvg[0].length / previousAvg[1].length;
        this.completionProgression = avgCompletion
          ? (isNaN(previousAvgCompletion) ? 0 : previousAvgCompletion - avgCompletion) / avgCompletion
          : 0;
      }),
    );
  }

  filterPrograms(teams: TeamDtoApi[]) {
    this.getProgramRuns(teams.map((t) => t.id));
  }

  @memoize()
  getUser(id: string): Observable<UserDtoApi | undefined> {
    if (!id) {
      return of(undefined);
    }
    return this.userService.getUsersFiltered({ ids: id }).pipe(map((u) => u.shift()));
  }
}
