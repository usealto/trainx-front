import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ChallengeDtoApi,
  ChallengeDtoApiTypeEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  TeamStatsDtoApi,
  UserDtoApi,
  UserStatsDtoApi,
} from '@usealto/sdk-ts-angular';
import Chart, { ChartData } from 'chart.js/auto';
import { Observable, combineLatest, filter, map, of, switchMap, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { ChallengesRestService } from 'src/app/modules/challenges/services/challenges-rest.service';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';
import { chartDefaultOptions } from 'src/app/modules/shared/constants/config';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import {
  ScoreDuration,
  ScoreFilters,
  TopFlop,
  TopFlopDisplay,
} from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from 'src/app/modules/statistics/services/statistics.service';

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

  globalFilters: ScoreFilters = {
    duration: ScoreDuration.Trimester,
    type: ScoreTypeEnumApi.Team,
    teams: [],
  };
  chartFilters: ChartFilters = {
    duration: ScoreDuration.Trimester,
    type: ScoreTypeEnumApi.Tag,
    team: '',
    tags: [],
  };
  scoreCount = 0;

  commentsCount = 0;
  questionsCount = 0;
  statisticTimeRange: ScoreTimeframeEnumApi = ScoreTimeframeEnumApi.Week;
  evolutionChart?: Chart;
  globalScore = 0;
  globalScoreProgression = 0;
  averageCompletion = 0;
  completionProgression = 0;
  activeMembers = 0;
  activeMembersProgression = 0;
  inactiveMembers = 0;
  inactiveMembersProgression = 0;
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
    private readonly statisticsServices: StatisticsService,
    public readonly teamStore: TeamStore,
    public readonly profileStore: ProfileStore,
    public readonly programsStore: ProgramsStore,
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.commentsRestService.getComments(),
      this.questionsSubmittedRestService.getQuestions(),
      this.challengesRestService.getChallenges({ itemsPerPage: 40, sortBy: 'endDate:desc' }),
    ])
      .pipe(
        tap(([comments, questions, challenges]) => {
          this.commentsCount = comments.length;
          // this.questionsCount = questions.length;
          this.questionsCount = 0;
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
    this.chartFilters.tags = this.programsStore.tags.value.slice(0, 3).map((tag) => tag.id);
    this.createCharts(this.chartFilters);
  }

  createCharts({
    duration = this.chartFilters.duration,
    type = this.chartFilters.type ?? ScoreTypeEnumApi.Program,
    team = this.chartFilters.team,
    tags = this.chartFilters.tags,
  }: ChartFilters) {
    this.chartFilters.duration = duration;
    this.chartFilters.type = type;
    this.chartFilters.team = team;
    this.chartFilters.tags = tags;
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
          //temp: manual filter chart by tags until backend updates
          if (tags && tags.length > 0) {
            scores = scores.filter((s) => tags.some((t) => s.id.includes(t)));
          }

          scores = this.scoreService.reduceChartData(scores);
          const aggregateData = this.statisticsServices.aggregateDataForScores(
            scores[0],
            duration as ScoreDuration,
          );

          const labels = this.statisticsServices.formatLabel(
            aggregateData.map((d) => d.x),
            duration as ScoreDuration,
          );

          const data: ChartData = {
            labels: labels,
            datasets: scores.map((s) => {
              const d = this.statisticsServices.aggregateDataForScores(s, duration as ScoreDuration);

              return {
                label: s.label,
                data: d.map((u) => (u.y ? Math.round((u.y * 10000) / 100) : u.y)),
                fill: false,
                tension: 0.2,
                spanGaps: true,
              };
            }),
          };

          const customChartOptions = {
            ...chartDefaultOptions,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (tooltipItem: any) {
                    let labelType = 'tag';
                    if (type === 'program') {
                      labelType = 'programme';
                    }
                    return `${labelType} ${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}%`;
                  },
                },
              },
              legend: {
                display: false,
              },
            },
          };

          this.evolutionChart = new Chart('programScoreEvol', {
            type: 'line',
            data: data,
            options: customChartOptions,
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
              avg: this.scoreService.reduceWithoutNull(s.averages) ?? 0,
            }))
            .filter((x) => !!x.avg);
          if (val === ScoreTypeEnumApi.Program || val === ScoreTypeEnumApi.Tag) {
            this.topFlopProgramTab = val;
            this.topFlopData.programs = {
              top: this.scoreService.getTop(output),
              flop: this.scoreService.getFlop(output),
            };
          }
          if (val === ScoreTypeEnumApi.Team || val === ScoreTypeEnumApi.User) {
            this.topFlopTeamTab = val;
            this.topFlopData.teams = {
              top: this.scoreService.getTop(output),
              flop: this.scoreService.getFlop(output),
            };
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  getGlobalScore({
    duration = this.globalFilters.duration,
    type = this.globalFilters.type ?? ScoreTypeEnumApi.Team,
    teams = this.globalFilters.teams,
  }: ScoreFilters) {
    this.globalFilters.duration = duration;
    this.globalFilters.type = type;
    this.globalFilters.teams = teams;
    this.globalFilters.timeframe = ScoreTimeframeEnumApi.Day;

    return combineLatest([
      this.scoresRestService.getTeamsStats(this.globalFilters.duration as ScoreDuration),
      this.scoresRestService.getTeamsStats(this.globalFilters.duration as ScoreDuration, true),
      this.scoresRestService.getUsersStats(this.globalFilters.duration as ScoreDuration),
      this.scoresRestService.getUsersStats(this.globalFilters.duration as ScoreDuration, true),
    ])
      .pipe(
        map(
          ([current, previous, usersStats, previousUsersStats]) =>
            [
              this.globalFilters.teams && this.globalFilters.teams.length > 0
                ? current.filter((team) => this.globalFilters.teams?.some((teamId) => teamId === team.id))
                : current,
              this.globalFilters.teams && this.globalFilters.teams.length > 0
                ? previous.filter((team) => this.globalFilters.teams?.some((teamId) => teamId === team.id))
                : previous,
              usersStats,
              previousUsersStats,
            ] as [TeamStatsDtoApi[], TeamStatsDtoApi[], UserStatsDtoApi[], UserStatsDtoApi[]],
        ),
        tap(([current, previous, usersStats, previousUsersStats]) => {
          //global score
          const previousScore = previous.reduce((acc, team) => acc + (team.score ?? 0), 0) / previous.length;

          this.globalScore = current.reduce((acc, team) => acc + (team.score ?? 0), 0) / current.length;
          this.globalScoreProgression = previousScore
            ? (this.globalScore - previousScore) / previousScore
            : 0;

          //Active/inactive members
          this.activeMembers = usersStats.filter((u) => u.respondsRegularly).length;
          this.inactiveMembers = usersStats.length - this.activeMembers;

          const prevU = previousUsersStats.filter((u) => u.respondsRegularly).length;
          this.activeMembersProgression =
            prevU > 0 && this.activeMembers ? (this.activeMembers - prevU) / this.activeMembers : 0;

          const prevI = previousUsersStats.length - prevU;
          this.inactiveMembersProgression =
            prevI > 0 && this.inactiveMembers ? (this.inactiveMembers - prevI) / this.inactiveMembers : 0;
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
        this.completionProgression =
          avgCompletion && previousAvgCompletion ? previousAvgCompletion - avgCompletion / avgCompletion : 0;
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
