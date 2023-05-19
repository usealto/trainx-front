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
} from 'src/app/sdk';
import { environment } from 'src/environments/environment';
import { TeamFormComponent } from '../team-form/team-form.component';
import { UserEditFormComponent } from '../user-edit-form/user-edit-form.component';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';

@UntilDestroy()
@Component({
  selector: 'alto-lead-team',
  templateUrl: './lead-team.component.html',
  styleUrls: ['./lead-team.component.scss'],
})
export class LeadTeamComponent implements OnInit {
  I18ns = I18ns;
  activeUsersCount = 0;
  teams: TeamDtoApi[] = [];
  paginatedTeams: TeamDtoApi[] = [];
  teamsPage = 1;
  teamsPageSize = 7;

  usersMap = new Map<string, string>();
  absoluteUsersCount = 0;
  usersCount = 0;
  users: UserDtoApi[] = [];
  paginatedUsers: UserDtoApi[] = [];
  usersPage = 1;
  usersPageSize = 10;

  teamsScores = new Map<string, number>();
  usersScores = new Map<string, number | null>();

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
    combineLatest([this.usersRestService.getUsers(), this.teamsRestService.getTeams()])
      .pipe(
        tap(([users, teams]) => {
          this.teams = teams;
          this.users = users;
          this.absoluteUsersCount = users.length;
        }),
        tap(([users]) => (this.activeUsersCount = users.filter((user) => user.isActive).length)),
        tap(([users]) => (this.usersCount = users.length)),
        tap(([users]) => {
          users.forEach((user) => {
            const member = this.teams.find((team) => team.id === user.teamId);
            this.usersMap.set(user.id, member ? member.shortName : '');
          });
        }),
        tap(() => this.changeTeamsPage(1)),
        tap(() => this.changeUsersPage(this.users, this.usersPage)),
        switchMap(() => this.scoreRestService.getTeamsStats(ScoreDuration.Trimester)),
        tap((scores) => {
          scores.forEach((s) => {
            this.teamsScores.set(s.id, s.score || 0);
          });
        }),
        switchMap(() => {
          return this.scoreRestService.getScores({
            duration: ScoreDuration.Trimester,
            timeframe: ScoreTimeframeEnumApi.Day,
            type: ScoreTypeEnumApi.User,
          });
        }),
        tap(({ scores }: ScoresResponseDtoApi) => {
          scores.forEach((s) => {
            this.usersScores.set(s.id, this.scoreService.reduceWithoutNull(s.averages));
          });
        }),
        // switchMap(() => {
        //   return this.scoreRestService.getScores({
        //     duration: ScoreDuration.Month,
        //     timeframe: ScoreTimeframeEnumApi.Day,
        //     type: ScoreTypeEnumApi.Guess,
        //     user: this.users.map((u) => u.id).join(','),
        //   });
        // }),
        // tap(console.log),
        untilDestroyed(this),
      )
      .subscribe();
  }

  changeTeamsPage(page: number) {
    this.teamsPage = page;
    this.paginatedTeams = this.teams.slice((page - 1) * this.teamsPageSize, page * this.teamsPageSize);
  }

  filterUsers(selectedTeams: TeamDtoApi[] = []) {
    const filter = {
      teams: selectedTeams,
    };

    this.changeUsersPage(this.usersService.filterUsers(this.users, filter), this.usersPage);
  }

  changeUsersPage(users: UserDtoApi[], page: number) {
    this.usersPage = page;
    this.usersCount = users.length;
    this.paginatedUsers = users.slice((page - 1) * this.usersPageSize, page * this.usersPageSize);
  }

  searchUsers(users: UserDtoApi[], s: string) {
    const search = s.toLowerCase();
    const res = search.length ? users.filter((user) => user.username?.toLowerCase().includes(search)) : users;
    this.changeUsersPage(res, this.usersPage);
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

  getTeamUsersCount(teamId: string) {
    return this.profileStore.users.value.filter((user) => user.teamId === teamId).length;
  }

  airtableRedirect() {
    window.open(environment.airtableURL + this.profileStore.user.value.email, '_blank');
  }
}
