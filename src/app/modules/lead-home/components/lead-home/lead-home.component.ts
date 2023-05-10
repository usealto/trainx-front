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
import { ScoreDuration, ScoreFilters } from 'src/app/modules/programs/models/score.model';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';
import { ScoresRestService } from 'src/app/modules/programs/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/programs/services/scores.service';
import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import {
  ChallengeDtoApi,
  ChallengeDtoApiTypeEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  UserDtoApi,
} from 'src/app/sdk';

type TopFlop = { top: any[]; flop: any[] };

type TopFlopDisplay = {
  label: string;
  avg: number;
};

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

  globalFilters: ScoreFilters = { duration: ScoreDuration.Month, type: ScoreTypeEnumApi.Guess, team: '' };
  chartFilters: ChartFilters = { duration: ScoreDuration.Month, type: ScoreTypeEnumApi.Program, team: '' };
  scoreCount = 0;

  commentsCount = 0;
  questionsCount = 0;
  statisticTimeRange: ScoreTimeframeEnumApi = ScoreTimeframeEnumApi.Week;
  evolutionChart?: Chart;
  globalScore = 0;
  averageCompletion = 0;
  completionProgression = 0;
  activeMembers = 0;
  inactiveMembers = 0;
  //
  challengesByTeam: ChallengeDtoApi[] = [];
  challengesByUser: ChallengeDtoApi[] = [];

  topFlopData: {
    programs: TopFlop;
    teams: TopFlop;
  } = { programs: { top: [], flop: [] }, teams: { top: [], flop: [] } };
  topFlopProgramTab: ScoreTypeEnumApi = ScoreTypeEnumApi.Program;
  topFlopTeamTab: ScoreTypeEnumApi = ScoreTypeEnumApi.Team;

  constructor(
    private readonly commentsRestService: CommentsRestService,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
    private readonly challengesRestService: ChallengesRestService,
    private readonly userService: UsersRestService,
    public readonly teamStore: TeamStore,
    private readonly profileStore: ProfileStore,
  ) {}

  ngOnInit(): void {
    this.userName = this.profileStore.user.value.firstname ?? this.profileStore.user.value.username ?? '';

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
        tap(() => this.getGlobalScore(this.globalFilters)),
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
        untilDestroyed(this),
      )
      .subscribe();
  }

  topFlop(val: ScoreTypeEnumApi) {
    this.scoresRestService
      .getScores({
        ...this.chartFilters,
        timeframe: ScoreTimeframeEnumApi.Day,
        type: val,
        sortBy: 'lastAverage:desc',
      })
      .pipe(
        tap(({ scores }) => {
          const output: TopFlopDisplay[] = scores
            .map((s) => ({
              label: s.label,
              avg: this.scoreService.reduceWithoutNull(s.averages),
            }))
            .filter((x) => !!x.avg);
          if (val === ScoreTypeEnumApi.Program || val === ScoreTypeEnumApi.Tag) {
            this.topFlopProgramTab = val;
            this.topFlopData.programs = {
              top: this.getTop(output),
              flop: this.getFlop(output),
            };
          }
          if (val === ScoreTypeEnumApi.Team || val === ScoreTypeEnumApi.User) {
            this.topFlopTeamTab = val;
            this.topFlopData.teams = {
              top: this.getTop(output),
              flop: this.getFlop(output),
            };
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  getTop(data: TopFlopDisplay[]) {
    return data.filter(({ avg }) => !!avg && avg >= 0.5).sort((a, b) => (a.avg < b.avg ? 1 : -1));
  }

  getFlop(data: TopFlopDisplay[]) {
    return data.filter(({ avg }) => !!avg && avg < 0.5).sort((a, b) => (a.avg > b.avg ? 1 : -1));
  }

  getGlobalScore({
    duration = this.globalFilters.duration,
    type = this.globalFilters.type ?? ScoreTypeEnumApi.Guess,
    team = this.globalFilters.team,
  }: ScoreFilters) {
    this.globalFilters.duration = duration;
    this.globalFilters.type = type;
    this.globalFilters.team = team;
    this.globalFilters.timeframe = ScoreTimeframeEnumApi.Day;

    return this.scoresRestService
      .getScores(this.globalFilters)
      .pipe(
        tap(({ scores }) => {
          this.globalScore = !scores.length ? 0 : this.scoreService.reduceWithoutNull(scores[0].averages);
        }),
        switchMap(() => this.getAverageCompletion(this.globalFilters)),
        untilDestroyed(this),
      )
      .subscribe();
  }

  getAverageCompletion(filt: ScoreFilters) {
    return combineLatest([
      this.scoresRestService.getCompletion(filt, false),
      this.scoresRestService.getCompletion(filt, true),
    ]).pipe(
      map(([current, last]) => [
        [current.filter((p) => p.finishedAt !== null).length, current.length],
        [last.filter((p) => p.finishedAt !== null).length, last.length],
      ]),
      tap(([currentAvg, previousAvg]) => {
        const avgCompletion = currentAvg[1] === 0 ? 0 : currentAvg[0] / currentAvg[1];
        this.averageCompletion = avgCompletion;
        const previousAvgCompletion = previousAvg[1] === 0 ? 0 : previousAvg[0] / previousAvg[1];
        this.completionProgression = avgCompletion
          ? previousAvgCompletion - avgCompletion / avgCompletion
          : 0;
      }),
    );
  }

  @memoize()
  getUser(id: string): Observable<UserDtoApi | undefined> {
    if (!id) {
      return of(undefined);
    }
    return this.userService.getUsersFiltered({ ids: id }).pipe(map((u) => u.shift()));
  }
}
