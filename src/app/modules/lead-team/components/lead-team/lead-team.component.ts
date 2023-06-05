import { Component, OnInit } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, switchMap, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UsersService } from 'src/app/modules/profile/services/users.service';
import {
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  ScoresResponseDtoApi,
  TeamDtoApi,
  UserDtoApi,
} from '@usealto/sdk-ts-angular';
import { environment } from 'src/environments/environment';
import { TeamFormComponent } from '../team-form/team-form.component';
import { UserEditFormComponent } from '../user-edit-form/user-edit-form.component';
import { ScoreDuration, ScoreFilter } from 'src/app/modules/shared/models/score.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { UserFilters } from 'src/app/modules/profile/models/user.model';

interface TeamDisplay extends TeamDtoApi {
  score?: number;
}
interface UserDisplay extends UserDtoApi {
  score?: number;
}

@UntilDestroy()
@Component({
  selector: 'alto-lead-team',
  templateUrl: './lead-team.component.html',
  styleUrls: ['./lead-team.component.scss'],
})
export class LeadTeamComponent implements OnInit {
  I18ns = I18ns;
  // Teams
  teams: TeamDtoApi[] = [];
  paginatedTeams: TeamDisplay[] = [];
  teamsPage = 1;
  teamsPageSize = 7;
  teamsScores: TeamDisplay[] = [];
  // Users
  activeUsersCount = 0;
  absoluteUsersCount = 0;
  usersCount = 0;
  usersMap = new Map<string, string>();
  users: UserDtoApi[] = [];
  paginatedUsers: UserDisplay[] = [];
  usersPage = 1;
  usersPageSize = 10;
  usersScores: UserDisplay[] = [];
  usersQuestions = new Map<string, number[]>();
  userFilters: UserFilters = { teams: [] as TeamDtoApi[], score: '' };

  constructor(
    private readonly offcanvasService: NgbOffcanvas,
    private readonly teamsRestService: TeamsRestService,
    private readonly usersRestService: UsersRestService,
    private readonly usersService: UsersService,
    private readonly profileStore: ProfileStore,
    private readonly scoreRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.usersRestService.getUsers(),
      this.teamsRestService.getTeams(),
      this.scoreRestService.getUsersStats(ScoreDuration.Month),
      this.scoreRestService.getUsersStats(ScoreDuration.Month, true),
    ])
      .pipe(
        tap(([users, teams, usersStats, previousUsersStats]) => {
          this.teams = teams;
          this.teamsScores = this.teams;

          this.users = users;
          this.absoluteUsersCount = users.length;
          this.activeUsersCount = usersStats.filter((u) => u.respondsRegularly).length;

          usersStats.forEach((u) => {
            this.usersQuestions.set(u.id, [u.totalGuessesCount || 0]);
          });
          previousUsersStats.forEach((u) => {
            if (this.usersQuestions.has(u.id)) {
              const data = this.usersQuestions.get(u.id);
              if (data) {
                if (data[0] === 0) {
                  data.push(0);
                } else {
                  data.push((u.totalGuessesCount - data[0]) / u.totalGuessesCount);
                }
                this.usersQuestions.set(u.id, data);
              }
            }
          });
        }),
        tap(([users]) => (this.usersCount = users.length)),
        tap(([users]) => {
          users.forEach((user) => {
            const member = this.teams.find((team) => team.id === user.teamId);
            this.usersMap.set(user.id, member ? member.shortName : '');
          });
        }),
        switchMap(() => this.scoreRestService.getTeamsStats(ScoreDuration.Month)),
        tap((scores) => {
          this.teamsScores = this.teams.map((t) => {
            const score = scores.find((s) => s.id === t.id);
            if (score) {
              return { ...t, score: score.score };
            } else {
              return t;
            }
          });
        }),
        switchMap(() => {
          return this.scoreRestService.getScores({
            duration: ScoreDuration.Month,
            timeframe: ScoreTimeframeEnumApi.Day,
            type: ScoreTypeEnumApi.User,
          });
        }),
        tap(({ scores }: ScoresResponseDtoApi) => {
          this.usersScores = this.users.map((u) => {
            const score = scores.find((s) => s.id === u.id);
            if (score) {
              return { ...u, score: this.scoreService.reduceWithoutNull(score.averages) ?? undefined };
            } else {
              return u;
            }
          });
        }),
        tap(() => this.changeTeamsPage(1)),
        tap(() => this.changeUsersPage(this.usersScores, 1)),
        untilDestroyed(this),
      )
      .subscribe();
  }

  changeTeamsPage(page: number) {
    this.teamsPage = page;
    this.paginatedTeams = this.teamsScores.slice((page - 1) * this.teamsPageSize, page * this.teamsPageSize);
  }

  filterUsers(
    {
      teams = this.userFilters.teams,
      score = this.userFilters.score,
      search = this.userFilters.search,
    }: UserFilters = this.userFilters,
  ) {
    this.userFilters.teams = teams;
    this.userFilters.score = score;
    this.userFilters.search = search;

    let output = this.usersService.filterUsers(this.usersScores, { teams, search }) as UserDisplay[];
    if (score) {
      output = this.scoreService.filterByScore(output, score as ScoreFilter, true);
    }

    this.changeUsersPage(output, 1);
  }

  changeUsersPage(users: UserDisplay[], page: number) {
    this.usersPage = page;
    this.usersCount = users.length;
    this.paginatedUsers = users.slice((page - 1) * this.usersPageSize, page * this.usersPageSize);
  }

  openTeamForm(team?: TeamDtoApi) {
    const canvasRef = this.offcanvasService.open(TeamFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    canvasRef.componentInstance.team = team;
  }

  openUserEditionForm(user: UserDtoApi) {
    const canvasRef = this.offcanvasService.open(UserEditFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    canvasRef.componentInstance.user = user;
  }

  @memoize()
  getTeamUsersCount(teamId: string): number {
    return this.profileStore.users.value.filter((user) => user.teamId === teamId).length;
  }

  @memoize()
  getQuestionsByUser(id: string): number[] {
    return this.usersQuestions.get(id) || [];
  }

  airtableRedirect() {
    window.open(environment.airtableURL + this.profileStore.user.value.email, '_blank');
  }
}
