import { Component, OnInit } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { TeamDtoApi, UserDtoApi } from '@usealto/sdk-ts-angular';
import { UserEditFormComponent } from 'src/app/modules/lead-team/components/user-edit-form/user-edit-form.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UserFilters } from 'src/app/modules/profile/models/user.model';
import { UsersService } from 'src/app/modules/profile/services/users.service';

@UntilDestroy()
@Component({
  selector: 'alto-settings-users',
  templateUrl: './settings-users.component.html',
  styleUrls: ['./settings-users.component.scss'],
})
export class SettingsUsersComponent implements OnInit {
  userFilters: UserFilters = { teams: [] as TeamDtoApi[], score: '' };

  I18ns = I18ns;

  usersDisplay: UserDtoApi[] = [];
  usersPageSize = 5;
  usersPage = 1;
  usersCount = 0;
  adminsDisplay: UserDtoApi[] = [];
  adminsPageSize = 5;
  adminsPage = 1;
  adminsCount = 0;

  constructor(
    private readonly userRestService: UsersRestService,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly usersService: UsersService,
  ) {}

  ngOnInit(): void {
    this.getAdmins();
    this.getUsers();
  }

  getAdmins() {
    this.userRestService
      .getUsersPaginated({ isCompanyAdmin: true, page: this.adminsPage, itemsPerPage: this.adminsPageSize })
      .pipe(
        tap((users) => (this.adminsDisplay = users.data ?? [])),
        tap((users) => (this.adminsCount = users.meta.totalItems)),
        untilDestroyed(this),
      )
      .subscribe();
  }

  getUsers() {
    this.userRestService
      .getUsersPaginated({ isCompanyAdmin: false, page: this.usersPage, itemsPerPage: this.usersPageSize })
      .pipe(
        tap((users) => (this.usersDisplay = users.data ?? [])),
        tap((users) => (this.usersCount = users.meta.totalItems)),
        untilDestroyed(this),
      )
      .subscribe();
  }

  filterAdmins({ search = this.userFilters.search }: UserFilters = this.userFilters) {
    this.userRestService
      .getUsersFiltered({ isCompanyAdmin: true })
      .pipe(tap((users) => (this.adminsDisplay = this.usersService.filterUsers(users, { search }))))
      .subscribe();
  }

  filterUsers({ search = this.userFilters.search }: UserFilters = this.userFilters) {
    this.userRestService
      .getUsersFiltered({ isCompanyAdmin: false })
      .pipe(tap((users) => (this.usersDisplay = this.usersService.filterUsers(users, { search }))))
      .subscribe();
  }

  changeUsersPage(page: number): void {
    this.getUsers();
    return;
  }

  changeAdminsPage(page: number): void {
    this.getAdmins();
    return;
  }

  openUserEditionForm(user: UserDtoApi) {
    const canvasRef = this.offcanvasService.open(UserEditFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    canvasRef.componentInstance.user = user;
    canvasRef.componentInstance.editedUser
      .pipe(
        tap(() => {
          this.getAdmins();
          this.getUsers();
        }),
      )
      .subscribe();
  }
}
