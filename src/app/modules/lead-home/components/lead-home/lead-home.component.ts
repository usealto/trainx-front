import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ChallengesRestService } from 'src/app/modules/challenges/services/challenges-rest.service';
import { ScoreTimeframe } from 'src/app/modules/programs/models/scores.model';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';
import { ScoresRestService } from 'src/app/modules/programs/services/scores-rest.service';
import { ChallengeApi, ChallengeTypeEnumApi, GetScoresRequestParams, ProgramRunApi } from 'src/app/sdk';
import { LeadHomeStatistics } from '../statistics/lead-home-statistics.model';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';

@UntilDestroy()
@Component({
  selector: 'alto-lead-home',
  templateUrl: './lead-home.component.html',
  styleUrls: ['./lead-home.component.scss'],
})
export class LeadHomeComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  name = 'Thomas';
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
  statisticTimeRange: ScoreTimeframe = 'week';
  globalScore = 0;
  averageCompletion = 0;
  completionProgression = 0;
  //
  programs!: ProgramRunApi[];
  programsPage = 1;
  programsCount = 0;
  programPageSize = 3;
  //
  challengesByTeam: ChallengeApi[] = [];
  challengesByUser: ChallengeApi[] = [];

  constructor(
    private readonly commentsRestService: CommentsRestService,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly scoresRestService: ScoresRestService,
    private readonly programRunsService: ProgramRunsRestService,
    private readonly challengesRestService: ChallengesRestService,
    private readonly userService: UsersRestService,
  ) {}

  ngOnInit(): void {
    this.getProgramRuns();

    combineLatest([
      this.commentsRestService.getComments(),
      this.questionsSubmittedRestService.getQuestions(),
      this.challengesRestService.getChallenges({ itemsPerPage: 30, sortBy: 'endDate:desc' }),
    ])
      .pipe(
        tap(([comments, questions, challenges]) => {
          this.commentsCount = comments.length;
          this.questionsCount = questions.length;
          this.challengesByTeam = challenges
            .filter((c) => c.type === ChallengeTypeEnumApi.ByTeam)
            .slice(0, 5);
          this.challengesByUser = challenges
            .filter((c) => c.type === ChallengeTypeEnumApi.ByUser)
            .slice(0, 5);
        }),
        switchMap(() => this.getScore({ value: 'week' })),
        switchMap(() => this.getAverageCompletion({ value: 'week' })),
        untilDestroyed(this),
      )
      .subscribe();
  }

  changeProgramPage() {
    this.getProgramRuns();
  }

  getProgramRuns() {
    this.programRunsService
      .getProgramRunsPaginated({
        isFinished: false,
        page: this.programsPage,
        itemsPerPage: this.programPageSize,
      })
      .pipe(
        tap((p) => (this.programs = p.data ?? [])),
        tap((p) => (this.programsCount = p.meta.totalItems ?? [])),
        untilDestroyed(this),
      )
      .subscribe();
  }

  updateScore(e: any) {
    combineLatest([this.getScore(e), this.getAverageCompletion(e)])
      .pipe()
      .subscribe();
  }

  getScore(e: any) {
    return this.scoresRestService.getGeneralScores({ timeframe: e?.value } as GetScoresRequestParams).pipe(
      tap((scores) => {
        this.globalScore =
          (scores.scores[0].averages.reduce((prev, curr) => prev + curr, 0) /
            scores.scores[0].averages.length) *
          100;
        this.globalScore = scores.scores[0].averages[0];
      }),
    );
  }

  getAverageCompletion(e: any) {
    return combineLatest([
      this.scoresRestService.getAverageCompletion(e.value),
      this.scoresRestService.getCompletionProgression(e.value),
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

  @memoize()
  getUser(id: string) {
    return this.userService.getUsers({ ids: id }).pipe(map((u) => u.shift()));
  }
}
