import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { Component, OnInit } from '@angular/core';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { combineLatest, map, tap } from 'rxjs';
import { TeamStore } from '../../team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { TeamApi, UserDtoApi } from 'src/app/sdk';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TeamFormComponent } from '../team-form/team-form.component';
import { UsersService } from 'src/app/modules/profile/services/users.service';
import { UserFilters } from 'src/app/modules/profile/models/user.model';

@Component({
  selector: 'alto-lead-team',
  templateUrl: './lead-team.component.html',
  styleUrls: ['./lead-team.component.scss'],
})
export class LeadTeamComponent implements OnInit {
  I18ns = I18ns;
  activeUsersCount = 0;
  teams: TeamApi[] = [];
  paginatedTeams!: TeamApi[];
  teamsPage = 1;
  teamsPageSize = 5;

  usersMap = new Map<string, string>();
  absoluteUsersCount = 0;
  usersCount = 0;
  users: UserDtoApi[] = [];
  paginatedUsers: UserDtoApi[] = [];
  usersPage = 1;
  usersPageSize = 5;

  status = [
    { label: I18ns.leadTeam.members.filters.status.active, value: true },
    { label: I18ns.leadTeam.members.filters.status.inactive, value: false },
  ];
  selectedStatus?: { label: string; value: boolean };

  constructor(
    private readonly offcanvasService: NgbOffcanvas,
    private readonly teamsRestService: TeamsRestService,
    private readonly usersRestService: UsersRestService,
    private readonly usersService: UsersService,
    private readonly teamStore: TeamStore,
    private readonly profileStore: ProfileStore,
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
        tap(() => this.changeTeamsPage()),
        tap(() => this.changeUsersPage(this.users)),
      )
      .subscribe();
  }

  changeTeamsPage() {
    this.paginatedTeams = this.teams.slice(
      (this.teamsPage - 1) * this.teamsPageSize,
      this.teamsPage * this.teamsPageSize,
    );
  }

  filterUsers(selectedTeams: TeamApi[] = []) {
    const filter = {
      teams: selectedTeams,
      status: this.selectedStatus ? this.selectedStatus.value : undefined,
    };

    this.changeUsersPage(this.usersService.filterUsers(this.users, filter));
  }

  changeUsersPage(users: UserDtoApi[]) {
    this.usersCount = users.length;
    this.paginatedUsers = users.slice(
      (this.usersPage - 1) * this.usersPageSize,
      this.usersPage * this.usersPageSize,
    );
  }

  searchUsers(users: UserDtoApi[], s: string) {
    const search = s.toLowerCase();
    const res = search.length ? users.filter((user) => user.username?.toLowerCase().includes(search)) : users;
    this.changeUsersPage(res);
  }

  openTeamForm(team?: TeamApi) {
    const canvasRef = this.offcanvasService.open(TeamFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    canvasRef.componentInstance.team = team;
  }

  getTeamUsersCount(teamId: string) {
    return this.profileStore.users.value.filter((user) => user.teamId === teamId).length;
  }
}
