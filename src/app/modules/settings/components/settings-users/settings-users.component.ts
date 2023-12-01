import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { filter, switchMap, tap } from 'rxjs';
import { EResolverData, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ReplaceInTranslationPipe } from 'src/app/core/utils/i18n/replace-in-translation.pipe';
import { Company, ICompany } from 'src/app/models/company.model';
import { UserEditFormComponent } from 'src/app/modules/lead-team/components/user-edit-form/user-edit-form.component';
import { UserFilters } from 'src/app/modules/profile/models/user.model';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UsersService } from 'src/app/modules/profile/services/users.service';
import { DeleteModalComponent } from 'src/app/modules/shared/components/delete-modal/delete-modal.component';
import { patchUser, removeUser, setUsers } from '../../../../core/store/root/root.action';
import * as FromRoot from '../../../../core/store/store.reducer';
import { ToastService } from '../../../../core/toast/toast.service';
import { Team } from '../../../../models/team.model';
import { IUser, User } from '../../../../models/user.model';
import { AddUsersComponent } from './add-users/add-users.component';

@UntilDestroy()
@Component({
  selector: 'alto-settings-users',
  templateUrl: './settings-users.component.html',
  styleUrls: ['./settings-users.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class SettingsUsersComponent implements OnInit {
  userFilters: UserFilters = { search: '' };

  I18ns = I18ns;
  EmojiName = EmojiName;

  company: Company = new Company({} as ICompany);
  me: User = new User({} as IUser);
  teams: Team[] = [];
  users: User[] = [];

  paginatedUsers: User[] = [];
  usersDisplay: User[] = [];
  usersPageSize = 10;
  usersPage = 1;
  usersCount = 0;
  paginatedAdmins: User[] = [];
  adminsDisplay: User[] = [];
  adminsPageSize = 5;
  adminsPage = 1;
  adminsCount = 0;

  constructor(
    private readonly userRestService: UsersRestService,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly usersService: UsersService,
    private readonly modalService: NgbModal,
    private readonly replaceInTranslationPipe: ReplaceInTranslationPipe,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    private readonly store: Store<FromRoot.AppState>,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);

    this.me = data[EResolverData.Me] as User;
    this.store.select(FromRoot.selectCompany).subscribe((company) => {
      this.company = company.data;
    });
    this.teams = Array.from((data[EResolverData.TeamsById] as Map<string, Team>).values());
    this.users = Array.from((data[EResolverData.UsersById] as Map<string, User>).values());

    this.getAdmins();
    this.getUsers();
  }

  getAdmins() {
    this.adminsDisplay = this.usersService.filterUsers<User[]>(
      this.users.filter((user) => user.isCompanyAdmin()),
      { search: this.userFilters.search },
    );
    this.adminsCount = this.adminsDisplay.length;
    this.changeAdminsPage(1);
  }

  getUsers() {
    this.usersDisplay = this.usersService.filterUsers<User[]>(
      this.users.filter((user) => !user.isCompanyAdmin()),
      { search: this.userFilters.search },
    );
    this.usersCount = this.usersDisplay.length;
    this.changeUsersPage(1);
  }

  filterAdmins({ search }: { search: string }) {
    this.userFilters.search = search;
    this.getAdmins();
  }

  filterUsers({ search }: { search: string }) {
    this.userFilters.search = search;
    this.getUsers();
  }

  deleteUser(user: User): void {
    const modalRef = this.modalService.open(DeleteModalComponent, {
      centered: true,
      size: 'md',
    });
    const componentInstance = modalRef.componentInstance as DeleteModalComponent;
    componentInstance.data = {
      title: this.replaceInTranslationPipe.transform(I18ns.settings.users.deleteModal.title, user.fullname),
      subtitle: this.replaceInTranslationPipe.transform(I18ns.settings.users.deleteModal.subtitle),
    };
    componentInstance.objectDeleted
      .pipe(
        switchMap(() => this.userRestService.deleteUser(user.id)),
        tap(() => this.store.dispatch(removeUser({ user }))),
        switchMap(() => this.store.select(FromRoot.selectUsers)),
        tap(() => modalRef.close()),
        untilDestroyed(this),
      )
      .subscribe({
        next: ({ data: users }) => {
          this.users = Array.from(users.values());
          this.getUsers();
        },
        error: () => {
          this.toastService.show({
            type: 'danger',
            text: this.replaceInTranslationPipe.transform(
              I18ns.settings.users.deleteModal.error,
              user.fullname,
            ),
          });
        },
        complete: () => {
          this.toastService.show({
            type: 'success',
            text: this.replaceInTranslationPipe.transform(
              I18ns.settings.users.deleteModal.success,
              user.fullname,
            ),
          });
        },
      });
  }

  openUsersForm() {
    const canvasRef = this.offcanvasService.open(AddUsersComponent, {
      position: 'end',
      panelClass: 'overflow-auto users-form',
    });

    const instance = canvasRef.componentInstance as AddUsersComponent;
    instance.me = this.me;
    instance.teams = this.teams;

    instance.createdUsers
      .pipe(
        filter((x) => !!x),
        switchMap(() => {
          // TODO : update store instead of using rest service (may impact AddUsersComponent)
          return this.userRestService.getUsers();
        }),
        switchMap((users) => {
          this.store.dispatch(setUsers({ users }));
          return this.store.select(FromRoot.selectUsers);
        }),
      )
      .subscribe({
        next: ({ data: users }) => {
          this.users = Array.from(users.values());
          this.getAdmins();
          this.getUsers();
        },
        error: () => {
          this.toastService.show({
            type: 'danger',
            text: I18ns.settings.users.addUsers.APIerror,
          });
        },
        complete: () => {
          this.toastService.show({
            type: 'success',
            text: I18ns.settings.users.addUsers.success,
          });
        },
      });
  }

  changeUsersPage(page: number): void {
    this.usersPage = page;
    this.paginatedUsers = this.usersDisplay.slice((page - 1) * this.usersPageSize, page * this.usersPageSize);
    return;
  }

  changeAdminsPage(page: number): void {
    this.adminsPage = page;
    this.paginatedAdmins = this.adminsDisplay.slice(
      (page - 1) * this.adminsPageSize,
      page * this.adminsPageSize,
    );
    return;
  }

  openUserEditionForm(user: User) {
    const canvasRef = this.offcanvasService.open(UserEditFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    const instance = canvasRef.componentInstance as UserEditFormComponent;
    instance.teams = this.teams;
    instance.me = this.me;
    instance.user = user;

    instance.editedUser
      .pipe(
        switchMap((user) => {
          this.store.dispatch(patchUser({ user }));
          return this.store.select(FromRoot.selectUsers);
        }),
        tap(({ data: users }) => {
          this.users = Array.from(users.values());
          this.getAdmins();
          this.getUsers();
        }),
      )
      .subscribe();
  }

  getStatus(company: Company, user: User): string {
    if (company.isConnectorActive) {
      if (user.isConnectorActive) {
        return 'active';
      } else {
        return 'warning';
      }
    } else {
      return 'inactive';
    }
  }

  getBadgeColor(userStatus: string): string {
    switch (userStatus) {
      case 'active':
        return '#039855';
      case 'warning':
        return '#FEF3F2';
      case 'inactive':
        return '#363F72';
      default:
        return '#363F72';
    }
  }

  getBadgeBackgroundColor(userStatus: string): string {
    switch (userStatus) {
      case 'active':
        return '#ECFDF3';
      case 'warning':
        return '#FEF3F2';
      case 'inactive':
        return '#F8F9FC';
      default:
        return '#F8F9FC';
    }
  }

  getHasRegularUser(usersDisplay: User[]): boolean {
    return usersDisplay.length > 0;
  }

  userFilterEmpty(): boolean {
    return this.userFilters.search === '' || this.userFilters.search == undefined;
  }
}
