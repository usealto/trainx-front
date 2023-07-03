import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, catchError, combineLatest, of, take } from 'rxjs';
import {
  NgbdSortableHeaderDirective,
  SortEvent,
  compare,
} from 'src/app/core/utils/directives/ngbd-sortable-header.directive';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { CompanyDtoApi, TeamDtoApi, UserDtoApi, UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';
import { DataService } from '../../admin-data.service';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { AdminAssignUsersTeamModalComponent } from './admin-assign-users-team-modal/admin-assign-users-team-modal.component';
import { AdminAssignSelectedUsersTeamModalComponent } from './admin-assign-selected-users-team-modal/admin-assign-selected-users-team-modal.component';
import { ChangeStatusSelectedUsersTeamModalComponent } from './change-status-selected-users-team-modal/change-status-selected-users-team-modal.component';
import {
  AdminUsersFiltersListComponent,
  FiltersUsersList,
} from './admin-users-filters-list/admin-users-filters-list.component';

@Component({
  selector: 'alto-admin-company-users',
  templateUrl: './admin-company-users.component.html',
  styleUrls: ['./admin-company-users.component.scss'],
})
export class AdminCompanyUsersComponent implements OnInit {
  @ViewChildren(NgbdSortableHeaderDirective) headers!: QueryList<NgbdSortableHeaderDirective>;
  company!: CompanyDtoApi;
  users: UserDtoApi[] = [];
  id: string | undefined;
  eRolesEnum = UserDtoApiRolesEnumApi;
  displayedUsers: UserDtoApi[] = [];
  selectedUsers: UserDtoApi[] = [];
  page = 1;
  pageSize = 15;
  pageCount = 0;
  teams: TeamDtoApi[] = [];
  searchString = '';
  sortDirection: SortEvent = { column: '', direction: '' };
  activeFilters: FiltersUsersList = {
    roles: undefined,
  };

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private readonly usersRestService: UsersRestService,
    private readonly teamsRestService: TeamsRestService,
    private dataService: DataService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private readonly offcanvasService: NgbOffcanvas,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    this.fetchAll();
  }

  fetchAll() {
    combineLatest({
      teams: this.teamsRestService.getTeams({ companyId: this.id, itemsPerPage: 1000 }),
      company: this.companiesRestService.getCompanyById(this.id as string),
      users: this.usersRestService.getUsersFiltered({ companyId: this.id, itemsPerPage: 1000 }),
    })
      .pipe(take(1))
      .subscribe(({ company, users, teams }) => {
        this.company = company;
        this.users = users;
        this.teams = teams;
        this.pageCount = Math.ceil(this.users.length / this.pageSize);
        this.refreshUsers();
      });
  }

  selectAll(event: any) {
    this.selectedUsers = event.target.checked ? [...this.users] : [];
  }

  uploadUsersToTeam() {
    const modalRef = this.modalService.open(AdminAssignUsersTeamModalComponent, { centered: true });
    modalRef.componentInstance.teams = this.teams;
    modalRef.result.then((res) => {
      this.updateUsersTeam(res);
    });
  }

  addSelectedUsersToPrograms() {
    console.log();
  }

  changeStatusSelectedUsers() {
    const modalRef = this.modalService.open(ChangeStatusSelectedUsersTeamModalComponent, { centered: true });
  }

  addSelectedUsersToTeams() {
    const modalRef = this.modalService.open(AdminAssignSelectedUsersTeamModalComponent, { centered: true });
    modalRef.componentInstance.teams = this.teams;
    modalRef.result.then((res) => {
      const formatedUsers = this.selectedUsers.map((users) => {
        return {
          email: users.email,
          team: {
            id: res,
          },
        };
      });
      this.updateUsersTeam(formatedUsers);
    });
  }

  openFilterCanvas() {
    const canvasRef = this.offcanvasService.open(AdminUsersFiltersListComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    canvasRef.componentInstance.filters = this.activeFilters;
    canvasRef.result.then((result: any) => {
      this.activeFilters = result;
      this.refreshUsers();
    });
  }

  isUserSelected(user: UserDtoApi) {
    return this.selectedUsers.some((existingUser) => existingUser.email === user.email);
  }

  isSelectedUsersSatus(activeValue: boolean) {
    return this.selectedUsers.every((user) => user.isActive === activeValue);
  }

  selectUser(user: UserDtoApi) {
    if (this.selectedUsers.some((existingUser) => existingUser.email === user.email)) {
      this.selectedUsers = this.selectedUsers.filter((existingUser) => existingUser.email !== user.email);
    } else {
      this.selectedUsers.push(user);
    }
  }

  onPaginator(page: number) {
    this.page = page;
    this.refreshUsers();
  }

  onSearch(search: string) {
    this.searchString = search;
    this.refreshUsers();
  }

  onSort(event: SortEvent) {
    this.sortDirection = event;
    this.headers.forEach((header) => {
      if (header.sortable !== event.column) {
        header.direction = '';
      }
    });
    this.refreshUsers();
  }

  checkFilters(tmpUsers: UserDtoApi[]) {
    return tmpUsers.filter((user) => {
      if (this.activeFilters.roles !== null && this.activeFilters.roles?.length) {
        if (!this.activeFilters.roles?.every((role) => user.roles?.includes(role))) {
          return false;
        }
      }
      return true;
    });
  }

  refreshUsers() {
    let tmpUsers = this.users;

    if (this.sortDirection.direction !== '' && this.sortDirection.column !== '') {
      tmpUsers = [...this.users].sort((a, b) => {
        const firstValue = a[this.sortDirection.column as keyof UserDtoApi] as any;
        const secondValue = b[this.sortDirection.column as keyof UserDtoApi] as any;
        const res = compare(firstValue, secondValue);
        // const res = firstValue.localeCompare(secondValue);
        return this.sortDirection.direction === 'asc' ? res : -res;
      });
    }

    if (this.searchString !== '') {
      tmpUsers = tmpUsers.filter((user) => {
        const term = this.searchString.toLowerCase();
        return (
          user.firstname?.toLowerCase().includes(term) ||
          user.lastname?.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.slackId?.toLowerCase().includes(term)
        );
      });
    }

    tmpUsers = this.checkFilters(tmpUsers);

    this.pageCount = Math.ceil(tmpUsers.length / this.pageSize);

    this.displayedUsers = tmpUsers.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }

  setImpersonation(email: string) {
    if (email) {
      localStorage.setItem('impersonatedUser', email.toLowerCase());
      this.dataService.sendData('impersonatedUserUpdated');
    }
  }

  updateUsersTeam(csvData: any[]) {
    if (csvData.length > 0) {
      const obs = csvData
        .map((user) => {
          const existingUsers = this.users.find((existingUser) => existingUser.email === user.email);
          if (existingUsers) {
            return this.usersRestService
              .patchUser(existingUsers.id, {
                teamId: user.team.id,
              })
              .pipe(catchError(() => of(null)));
          }
          return null;
        })
        .filter((user) => user !== null);

      combineLatest(obs as Observable<UserDtoApi>[])
        .pipe(take(1))
        .subscribe((res) => {
          this.fetchAll();
        });
    }
  }
}
