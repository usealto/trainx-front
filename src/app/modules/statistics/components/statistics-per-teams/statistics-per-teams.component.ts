import { Component, OnInit } from '@angular/core';
import { TeamDtoApi, TeamStatsDtoApi, UserStatsDtoApi } from '@usealto/sdk-ts-angular';
import { combineLatest, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { UserFilters } from 'src/app/modules/profile/models/user.model';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { DataForTable } from '../../models/statistics.model';
import { Team, TeamStats } from '../../../../models/team.model';
import { Company } from '../../../../models/company.model';
import * as FromRoot from '../../../../core/store/store.reducer';
import { Store } from '@ngrx/store';
import { untilDestroyed } from '@ngneat/until-destroy';
import { User } from '../../../../models/user.model';
import { selectCompanyAndUsers } from '../../../../core/store/store.reducer';


@Component({
  selector: 'alto-statistics-per-teams',
  templateUrl: './statistics-per-teams.component.html',
  styleUrls: ['./statistics-per-teams.component.scss'],
})
export class StatisticsPerTeamsComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;
  userFilters: UserFilters = { teams: [] as Team[], score: '' };
  duration: ScoreDuration = ScoreDuration.Trimester;

  company: Company = {} as Company;
  teams: Team[] = [];
  users: User[] = [];
  members: DataForTable[] = [];

  teamsStats: TeamStats[] = [];
  teamsStatsPrev: TeamStats[] = [];

  membersDisplay: DataForTable[] = [];
  membersDataStatus: PlaceholderDataStatus = 'loading';

  teamsDisplay: DataForTable[] = [];
  teamsDataStatus: PlaceholderDataStatus = 'loading';

  constructor(
    private readonly scoreRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
    private readonly store: Store<FromRoot.AppState>,
  ) {}

  ngOnInit(): void {
    this.store
      .select(FromRoot.selectCompanyAndUsers)
      .pipe(
        tap(({ company, users }) => {
          this.company = company.data;
          this.teams = this.company.teams;
          this.teamsStats = this.company.getStatsByPeriod(this.duration, false);
          this.teamsStatsPrev = this.company.getStatsByPeriod(this.duration, true);

          this.users = Array.from(users.data.values());

          this.getDatas();
        }),
      )
      .subscribe();
  }

  getDatas() {
    combineLatest([
      this.scoreRestService.getUsersStats(this.duration),
      this.scoreRestService.getUsersStats(this.duration, true),
    ])
      .pipe(
        tap(([users, usersProg]) => {
          this.teamsDisplay = this.teamsStats.map((t) => {
            const teamProg = this.teamsStatsPrev.find((tp) => tp.teamId === t.teamId);
            return this.dataForTeamTableMapper(t, teamProg);
          });
          this.teamsDataStatus = this.teams.length === 0 ? 'noData' : 'good';

          this.membersDisplay = this.users.map((u) => {
            const userStat = users.find((us) => us.user.id === u.id);
            const userProg = usersProg.find((tp) => tp.user.id === u.id);
            return this.dataForMembersTableMapper(u, userStat, userProg);
          });
          this.members = this.membersDisplay;
          console.log(this.members);
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

  changeDuration(duration: string) {
    this.duration = duration as ScoreDuration;
    this.getDatas();
  }

  dataForTeamTableMapper(t: TeamStats, tProg?: TeamStats) {
    return {
      team: this.teams.find((team) => team.id === t.teamId),
      globalScore: t.score,
      answeredQuestionsCount: t.totalGuessesCount,
      answeredQuestionsProgression:
        this.scoreService.getProgression(t.totalGuessesCount, tProg?.totalGuessesCount) ?? 0,
      commentsCount: t.commentsCount,
      commentsProgression: this.scoreService.getProgression(t.commentsCount, tProg?.commentsCount) ?? 0,
      submittedQuestionsCount: t.questionsSubmittedCount,
      submittedQuestionsProgression:
        this.scoreService.getProgression(t.questionsSubmittedCount, tProg?.questionsSubmittedCount) ?? 0,
      leastMasteredTags: t.tagStats
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
