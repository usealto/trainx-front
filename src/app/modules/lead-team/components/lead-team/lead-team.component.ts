import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { Component, OnInit } from '@angular/core';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { combineLatest, map, tap } from 'rxjs';
import { TeamStore } from '../../team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { TeamApi, UserApi } from 'src/app/sdk';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TeamFormComponent } from '../team-form/team-form.component';

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
  usersCount = 0;
  users: UserApi[] = [];
  usersPage = 1;
  usersPageSize = 10;

  status = [
    { label: I18ns.leadTeam.members.filters.status.active, value: true },
    { label: I18ns.leadTeam.members.filters.status.inactive, value: false },
  ];
  selectedStatus?: { label: string; value: boolean };

  constructor(
    private readonly offcanvasService: NgbOffcanvas,
    private readonly teamsRestService: TeamsRestService,
    private readonly usersRestService: UsersRestService,
    private readonly teamStore: TeamStore,
    private readonly profileStore: ProfileStore,
  ) {}

  ngOnInit(): void {
    combineLatest([this.usersRestService.getUsers(), this.teamsRestService.getTeams()])
      .pipe(
        tap(([users, teams]) => (this.teams = teams)),
        tap(([users]) => (this.activeUsersCount = users.filter((user) => user.isActive).length)),
        tap(([users]) => (this.usersCount = users.length)),
        tap(([users]) => {
          users.forEach((user) => {
            const toto = this.teams.find((team) => team.id === user.teamId);
            this.usersMap.set(user.id, toto ? toto.shortName : '');
          });
        }),
        tap(() => this.changeTeamsPage()),
      )
      .subscribe();
    this.getUsersPaginated();
    this.openTeamForm();
  }

  getUsersPaginated(teamIds: string[] = []) {
    this.usersRestService
      .getUsersPaginated({
        page: this.usersPage,
        itemsPerPage: this.usersPageSize,
        isActive: this.selectedStatus ? this.selectedStatus.value : undefined,
        teamIds: teamIds.join(','),
      })
      .pipe(
        tap((res) => (this.usersCount = res.meta.totalItems)),
        tap((users) => (this.users = users.data ?? [])),
      )
      .subscribe();
  }

  changeTeamsPage() {
    this.paginatedTeams = this.teams.slice(
      (this.teamsPage - 1) * this.teamsPageSize,
      this.teamsPage * this.teamsPageSize,
    );
  }

  changeUsersPage() {
    this.getUsersPaginated();
  }

  filterUsersByTeams(teams: TeamApi[]) {
    this.getUsersPaginated(teams.map((team) => team.id));
  }

  openTeamForm(team?: TeamApi) {
    const canvasRef = this.offcanvasService.open(TeamFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    canvasRef.componentInstance.team = team;
    // canvasRef.componentInstance.createdTeam.pipe(/* Récupération des teams */)
  }

  getTeamUsersCount(teamId: string) {
    return this.profileStore.users.value.filter((user) => user.teamId === teamId).length;
  }
}
