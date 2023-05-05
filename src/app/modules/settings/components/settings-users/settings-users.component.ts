import { Component, OnInit } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UserDtoApi } from 'src/app/sdk';
import { UserEditFormComponent } from 'src/app/modules/lead-team/components/user-edit-form/user-edit-form.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@UntilDestroy()
@Component({
  selector: 'alto-settings-users',
  templateUrl: './settings-users.component.html',
  styleUrls: ['./settings-users.component.scss'],
})
export class SettingsUsersComponent implements OnInit {
  I18ns = I18ns;

  usersDisplay: UserDtoApi[] = [];
  usersPageSize = 5;
  usersPage = 1;
  usersCount = 0;
  adminDisplay: UserDtoApi[] = [];

  constructor(
    private readonly userRestService: UsersRestService,
    private readonly offcanvasService: NgbOffcanvas,
  ) {}

  ngOnInit(): void {
    this.userRestService
      .getUsersPaginated({ isCompanyAdmin: true })
      .pipe(
        tap((users) => (this.adminDisplay = users.data ?? [])),
        untilDestroyed(this),
      )
      .subscribe();
    this.getUsers();
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

  changeUsersPage(page: number): void {
    this.getUsers();
    return;
  }

  openUserEditionForm(user: UserDtoApi) {
    const canvasRef = this.offcanvasService.open(UserEditFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    canvasRef.componentInstance.user = user;
  }
}
