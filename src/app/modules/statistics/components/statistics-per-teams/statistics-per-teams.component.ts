import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserStatsDtoApi } from '@usealto/sdk-ts-angular';
import { Observable, Subscription, combineLatest, map, of, startWith, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { SelectOption } from 'src/app/modules/shared/models/select-option.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { IAppData } from '../../../../core/resolvers';
import { EResolvers, ResolversService } from '../../../../core/resolvers/resolvers.service';
import { Company } from '../../../../models/company.model';
import { Team, TeamStats } from '../../../../models/team.model';
import { User } from '../../../../models/user.model';
import { DataForTable } from '../../models/statistics.model';

@Component({
  selector: 'alto-statistics-per-teams',
  templateUrl: './statistics-per-teams.component.html',
  styleUrls: ['./statistics-per-teams.component.scss'],
})
export class StatisticsPerTeamsComponent implements OnInit, OnDestroy {
  Emoji = EmojiName;
  I18ns = I18ns;

  durationControl: FormControl<ScoreDuration> = new FormControl<ScoreDuration>(ScoreDuration.Trimester, {
    nonNullable: true,
  });
  searchControl = new FormControl<string | null>(null);
  teamsControl = new FormControl([] as FormControl<SelectOption>[], { nonNullable: true });

  company: Company = {} as Company;
  teams: Team[] = [];
  users: User[] = [];
  members: DataForTable[] = [];

  teamsStatsPrev: TeamStats[] = [];

  membersDisplay: DataForTable[] = [];
  membersDataStatus: PlaceholderDataStatus = 'loading';

  teamsDisplay: DataForTable[] = [];
  teamsDataStatus: PlaceholderDataStatus = 'loading';

  private statisticsPerTeamsComponentSubscription = new Subscription();

  constructor(
    private readonly scoreRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
    private readonly resolversService: ResolversService,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.company = (data[EResolvers.AppResolver] as IAppData).company;
    this.users = Array.from((data[EResolvers.AppResolver] as IAppData).userById.values());
    this.teams = this.company.teams;
    // this.teamsStats = this.company.getStatsByPeriod(this.durationControl.value, false);
    // this.teamsStatsPrev = this.company.getStatsByPeriod(this.durationControl.value, true);

    // this.statisticsPerTeamsComponentSubscription.add(
    //   this.durationControl.valueChanges.pipe(startWith(this.durationControl.value)).subscribe((duration) => {
    //     this.getDatas(duration);
    //   }),
    // );

    this.statisticsPerTeamsComponentSubscription.add(
      combineLatest([
        this.durationControl.valueChanges.pipe(startWith(this.durationControl.value)),
        this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
        this.teamsControl.valueChanges.pipe(startWith(this.teamsControl.value)),
      ])
        .pipe(
          switchMap(([duration, search, teams]) => {
            return combineLatest([
              this.scoreRestService.getUsersStats(duration),
              this.scoreRestService.getUsersStats(duration, true),
              of(duration),
              of(search),
              of(teams.map(({ value }) => value.value)),
            ]);
          }),
        )
        .subscribe(([usersStats, prevUsersStats, duration, search, teams]) => {
          // this.teamsStats = this.company.getStatsByPeriod(duration, false);
        }),
    );
  }

  ngOnDestroy(): void {
    this.statisticsPerTeamsComponentSubscription.unsubscribe();
  }

  getDatas(duration: ScoreDuration) {
    combineLatest([
      this.scoreRestService.getUsersStats(duration),
      this.scoreRestService.getUsersStats(duration, true),
    ])
      .pipe(
        tap(([users, usersProg]) => {
          this.teamsDisplay = this.teams.map((t) => {
            const teamStat = this.teamsStats.find((ts) => ts.teamId === t.id);
            const teamProg = this.teamsStatsPrev.find((tp) => tp.teamId === t.id);
            return this.dataForTeamTableMapper(teamStat, teamProg, t);
          });
          this.teamsDataStatus = this.teams.length === 0 ? 'noData' : 'good';

          this.membersDisplay = this.users.map((u) => {
            const userStat = users.find((us) => us.user.id === u.id);
            const userProg = usersProg.find((tp) => tp.user.id === u.id);
            return this.dataForMembersTableMapper(u, userStat, userProg);
          });
          this.members = this.membersDisplay;
          this.membersDataStatus = users.length === 0 ? 'noData' : 'good';
        }),
      )
      .subscribe();
  }

  filterMembers({ search = this.userFilters.search, teams = this.userFilters.teams }) {
    this.userFilters.search = search;
    this.userFilters.teams = teams;

    let output = this.members;
    if (teams && teams.length > 0) {
      output = output.filter((member) => teams.some((t) => t.id === member.owner?.teamId));
    }
    if (search && search !== '') {
      output = output.filter((member) =>
        (member.owner?.firstname + ' ' + member.owner?.lastname).toLowerCase().includes(search.toLowerCase()),
      );
    }

    this.membersDisplay = output;
    this.membersDataStatus = output.length === 0 ? 'noResult' : 'good';
  }

  dataForTeamTableMapper(t?: TeamStats, tProg?: TeamStats, team?: Team) {
    return {
      team: team,
      globalScore: t?.score,
      answeredQuestionsCount: t?.totalGuessesCount,
      answeredQuestionsProgression:
        this.scoreService.getProgression(t?.totalGuessesCount, tProg?.totalGuessesCount) ?? 0,
      commentsCount: t?.commentsCount,
      commentsProgression: this.scoreService.getProgression(t?.commentsCount, tProg?.commentsCount) ?? 0,
      submittedQuestionsCount: t?.questionsSubmittedCount,
      submittedQuestionsProgression:
        this.scoreService.getProgression(t?.questionsSubmittedCount, tProg?.questionsSubmittedCount) ?? 0,
      leastMasteredTags: t?.tagStats
        ?.filter((ta) => (ta.score ?? 0) < 50)
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .slice(0, 3)
        .map((t) => t.name),
    } as DataForTable;
  }

  dataForMembersTableMapper(user: User, u?: UserStatsDtoApi, uProg?: UserStatsDtoApi) {
    return {
      owner: user,
      globalScore: u?.score,
      answeredQuestionsCount: u?.totalGuessesCount,
      answeredQuestionsProgression:
        this.scoreService.getProgression(u?.totalGuessesCount, uProg?.totalGuessesCount) ?? 0,
      commentsCount: u?.commentsCount,
      commentsProgression: this.scoreService.getProgression(u?.commentsCount, uProg?.commentsCount) ?? 0,
      submittedQuestionsCount: u?.questionsSubmittedCount,
      submittedQuestionsProgression:
        this.scoreService.getProgression(u?.questionsSubmittedCount, uProg?.questionsSubmittedCount) ?? 0,
      leastMasteredTags: u?.tags
        ?.filter((ta) => (ta.score ?? 0) < 50)
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .slice(0, 3)
        .map((t) => t.tag.name),
    } as DataForTable;
  }
}
