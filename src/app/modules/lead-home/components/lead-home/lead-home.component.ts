import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, combineLatest, filter, map, of, switchMap, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { ChallengesRestService } from 'src/app/modules/challenges/services/challenges-rest.service';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';
import { ScoresRestService } from 'src/app/modules/programs/services/scores-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import {
  ChallengeDtoApi,
  ChallengeDtoApiTypeEnumApi,
  GetProgramRunsRequestParams,
  GetScoresRequestParams,
  ProgramRunApi,
  ScoreByTypeEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  TeamDtoApi,
  UserDtoApi,
} from 'src/app/sdk';
import { LeadHomeStatistics } from '../statistics/lead-home-statistics.model';
import Chart from 'chart.js/auto';
import { ScoreDuration } from 'src/app/modules/programs/models/score.model';
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

  name = '';
  active = 1;
  sharedData: LeadHomeStatistics[] = [
    { title: I18ns.leadHome.statistics.globalScore, toolTip: I18ns.leadHome.statistics.globalScoreToolTip },
    {
      title: I18ns.leadHome.statistics.averageCompletion,
      toolTip: I18ns.leadHome.statistics.averageCompletionToolTip,
    },
    {
      title: I18ns.leadHome.statistics.activeMembers,
      toolTip: I18ns.leadHome.statistics.activeMembersToolTip,
    },
    {
      title: I18ns.leadHome.statistics.inactiveMembers,
      toolTip: I18ns.leadHome.statistics.inactiveMembersToolTip,
    },
  ];

  weekData: LeadHomeStatistics[] = [];
  monthData: LeadHomeStatistics[] = [];
  yearData: LeadHomeStatistics[] = [];
  commentsCount = 0;
  questionsCount = 0;
  statisticTimeRange: ScoreTimeframeEnumApi = ScoreTimeframeEnumApi.Week;
  // evolutionTimeRange: ScoreTimeframeEnumApi = ScoreTimeframeEnumApi.Week;
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

  temp: any;

  constructor(
    private readonly commentsRestService: CommentsRestService,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly scoresRestService: ScoresRestService,
    private readonly programRunsService: ProgramRunsRestService,
    private readonly challengesRestService: ChallengesRestService,
    private readonly userService: UsersRestService,
    public readonly teamStore: TeamStore,
    private readonly profileStore: ProfileStore,
  ) {}

  ngOnInit(): void {
    this.name = this.profileStore.user.value.firstname ?? this.profileStore.user.value.username ?? '';
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

    this.createCharts(ScoreDuration.Month);
  }

  createCharts(duration: ScoreDuration | string) {
    if (this.evolutionChart) {
      this.evolutionChart.destroy();
    }
    this.scoresRestService
      .getScores(duration as ScoreDuration, ScoreTypeEnumApi.Program)
      .pipe(
        filter(({ scores }) => !!scores.length),
        tap(({ scores }) => {
          const labels = scores[0].dates.map((d) => d.toLocaleDateString());
          const data = {
            labels: labels,
            datasets: scores.map((s) => ({
              label: s.label,
              data: s.averages.map((u) => Math.round(u * 10000) / 100),
              fill: false,
              tension: 0.1,
            })),
          };
          this.evolutionChart = new Chart('programScoreEvol', {
            type: 'line',
            data: data,
          });
        }),
        tap(console.log),
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
      .pipe()
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

  private _filterStatistics: any;
  public get filterStatistics() {
    return this._filterStatistics;
  }
  public set filterStatistics(value) {
    this._filterStatistics = value;
    this.updateScore({ timeframe: this.statisticTimeRange, teamId: value });
  }

  @memoize()
  getUser(id: string): Observable<UserDtoApi | undefined> {
    if (!id) {
      return of(undefined);
    }
    return this.userService.getUsers({ ids: id }).pipe(map((u) => u.shift()));
  }
}
