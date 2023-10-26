import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TeamDtoApi, UserDtoApi } from '@usealto/sdk-ts-angular';
import { filter, switchMap, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { UserEditFormComponent } from 'src/app/modules/lead-team/components/user-edit-form/user-edit-form.component';
import { UserFilters } from 'src/app/modules/profile/models/user.model';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UsersService } from 'src/app/modules/profile/services/users.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { ReplaceInTranslationPipe } from 'src/app/core/utils/i18n/replace-in-translation.pipe';
import { DeleteModalComponent } from 'src/app/modules/shared/components/delete-modal/delete-modal.component';
import { AddUsersComponent } from './add-users/add-users.component';

@UntilDestroy()
@Component({
  selector: 'alto-settings-users',
  templateUrl: './settings-users.component.html',
  styleUrls: ['./settings-users.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class SettingsUsersComponent implements OnInit {
  userFilters: UserFilters = { teams: [] as TeamDtoApi[], score: '' };

  I18ns = I18ns;
  EmojiName = EmojiName;

  paginatedUsers: UserDtoApi[] = [];
  usersDisplay: UserDtoApi[] = [];
  usersPageSize = 10;
  usersPage = 1;
  usersCount = 0;
  paginatedAdmins: UserDtoApi[] = [];
  adminsDisplay: UserDtoApi[] = [];
  adminsPageSize = 5;
  adminsPage = 1;
  adminsCount = 0;

  constructor(
    private readonly userRestService: UsersRestService,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly usersService: UsersService,
    private modalService: NgbModal,
    private replaceInTranslationPipe: ReplaceInTranslationPipe,
  ) {}

  ngOnInit(): void {
    this.getAdmins();
    this.getUsers();
  }

  getAdmins() {
    this.userRestService
      .getUsersFiltered({ isCompanyAdmin: true })
      .pipe(
        tap((users) => (this.adminsDisplay = users ?? [])),
        tap((users) => (this.adminsCount = users.length)),
        tap(() => this.changeAdminsPage(this.adminsDisplay, 1)),
        untilDestroyed(this),
      )
      .subscribe();
  }

  getUsers() {
    this.userRestService
      .getUsersFiltered({ isCompanyAdmin: false })
      .pipe(
        tap((users) => (this.usersDisplay = users ?? [])),
        tap((users) => (this.usersCount = users.length)),
        tap(() => this.changeUsersPage(this.usersDisplay, 1)),
        untilDestroyed(this),
      )
      .subscribe();
  }

  filterAdmins({ search = this.userFilters.search }: UserFilters = this.userFilters) {
    this.userRestService
      .getUsersFiltered({ isCompanyAdmin: true })
      .pipe(
        tap((users) => {
          const filteredUsers = this.usersService.filterUsers<UserDtoApi[]>(users, { search });
          this.adminsCount = filteredUsers.length;
          this.adminsDisplay = filteredUsers;
          this.changeAdminsPage(this.adminsDisplay, 1);
          if (search === '') {
            this.getAdmins();
          }
        }),
      )
      .subscribe();
  }

  filterUsers({ search = this.userFilters.search }: UserFilters = this.userFilters) {
    this.userRestService
      .getUsersFiltered({ isCompanyAdmin: false })
      .pipe(
        tap((users) => {
          const filteredUsers = this.usersService.filterUsers<UserDtoApi[]>(users, { search });
          this.usersCount = filteredUsers.length;
          this.usersDisplay = filteredUsers;
          this.changeUsersPage(this.usersDisplay, 1);
          if (search === '') {
            this.getUsers();
          }
        }),
      )
      .subscribe();
  }

  deleteUser(user: UserDtoApi) {
    const modalRef = this.modalService.open(DeleteModalComponent, { centered: true, size: 'md' });
    const componentInstance = modalRef.componentInstance as DeleteModalComponent;
    componentInstance.data = {
      title: this.replaceInTranslationPipe.transform(
        I18ns.settings.users.deleteModal.title,
        user.firstname + ' ' + user.lastname,
      ),
      subtitle: this.replaceInTranslationPipe.transform(I18ns.settings.users.deleteModal.subtitle),
    };
    componentInstance.objectDeleted
      .pipe(
        switchMap(() => this.userRestService.deleteUser(user?.id ?? '')),
        tap(() => {
          modalRef.close();
          this.userRestService.resetUsers();
          this.getUsers();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  openUsersForm() {
    const canvasRef = this.offcanvasService.open(AddUsersComponent, {
      position: 'end',
      panelClass: 'overflow-auto users-form',
    });
    canvasRef.closed
      .pipe(
        tap(() => {
          this.getUsers();
        }),
      )
      .subscribe();
    const instance = canvasRef.componentInstance as AddUsersComponent;

    instance.createdUsers
      .pipe(
        filter((x) => !!x),
        tap((userCreated) => {
          this.getUsers();
        }),
      )
      .subscribe();
  }

  changeUsersPage(users: UserDtoApi[], page: number): void {
    this.usersPage = page;
    this.paginatedUsers = this.usersDisplay.slice((page - 1) * this.usersPageSize, page * this.usersPageSize);
    return;
  }

  changeAdminsPage(admins: UserDtoApi[], page: number): void {
    this.adminsPage = page;
    this.paginatedAdmins = this.adminsDisplay.slice(
      (page - 1) * this.adminsPageSize,
      page * this.adminsPageSize,
    );
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
