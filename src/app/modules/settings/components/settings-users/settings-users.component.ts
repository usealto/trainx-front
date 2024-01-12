import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { Subscription, filter, map, startWith, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ReplaceInTranslationPipe } from 'src/app/core/utils/i18n/replace-in-translation.pipe';
import { Company, ICompany } from 'src/app/models/company.model';
import { UserEditFormComponent } from 'src/app/modules/lead-team/components/user-edit-form/user-edit-form.component';
import { UserFilters } from 'src/app/modules/profile/models/user.model';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UsersService } from 'src/app/modules/profile/services/users.service';
import { DeleteModalComponent } from 'src/app/modules/shared/components/delete-modal/delete-modal.component';
import { IAppData } from '../../../../core/resolvers';
import { patchUser, removeUser, setUsers } from '../../../../core/store/root/root.action';
import * as FromRoot from '../../../../core/store/store.reducer';
import { ToastService } from '../../../../core/toast/toast.service';
import { Team } from '../../../../models/team.model';
import { IUser, User } from '../../../../models/user.model';
import { AddUsersComponent } from './add-users/add-users.component';
import { FormControl } from '@angular/forms';

@UntilDestroy()
@Component({
  selector: 'alto-settings-users',
  templateUrl: './settings-users.component.html',
  styleUrls: ['./settings-users.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class SettingsUsersComponent implements OnInit, OnDestroy {
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
  usersPageControl = new FormControl(1, { nonNullable: true });
  paginatedAdmins: User[] = [];
  adminsDisplay: User[] = [];
  adminsPageSize = 5;
  adminsPageControl = new FormControl(1, { nonNullable: true });

  usedLicensesCount = 0;

  private readonly settingsUsersComponentSubscription = new Subscription();

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
    this.me = (data[EResolvers.AppResolver] as IAppData).me;
    this.company = (data[EResolvers.AppResolver] as IAppData).company;
    this.teams = this.company.teams;

    this.settingsUsersComponentSubscription.add(
      this.store
        .select(FromRoot.selectUsers)
        .pipe(tap(({ data: userById }) => (this.users = Array.from(userById.values()))))
        .subscribe(() => {
          this.displayAdmins();
          this.displayUsers();
          this.setUsedLicensesCount();
        }),
    );

    this.settingsUsersComponentSubscription.add(
      this.adminsPageControl.valueChanges
        .pipe(startWith(this.adminsPageControl.value))
        .subscribe((page) => this.changeAdminsPage(page)),
    );

    this.settingsUsersComponentSubscription.add(
      this.usersPageControl.valueChanges
        .pipe(startWith(this.usersPageControl.value))
        .subscribe((page) => this.changeUsersPage(page)),
    );
  }

  ngOnDestroy(): void {
    this.settingsUsersComponentSubscription.unsubscribe();
  }

  toggleUserLicense(user: User): void {
    this.userRestService
      .patchUser(user.id, { hasLicense: !user.hasLicense })
      .pipe(tap((patchedUser) => this.store.dispatch(patchUser({ user: patchedUser }))))
      .subscribe();
  }

  private displayAdmins() {
    this.adminsDisplay = this.usersService.filterUsers<User[]>(
      this.users.filter((user) => user.isCompanyAdmin()),
      { search: this.userFilters.search },
    );
    this.changeAdminsPage(1);
  }

  private displayUsers() {
    this.usersDisplay = this.usersService.filterUsers<User[]>(
      this.users.filter((user) => user.isCompanyUser() && !user.isCompanyAdmin()),
      { search: this.userFilters.search },
    );
    this.changeUsersPage(1);
  }

  private setUsedLicensesCount() {
    this.usedLicensesCount = this.users.filter((user) => user.hasLicense).length;
  }

  filterAdmins({ search }: { search: string }) {
    this.userFilters.search = search;
    this.displayAdmins();
  }

  filterUsers({ search }: { search: string }) {
    this.userFilters.search = search;
    this.displayUsers();
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
        tap(() => modalRef.close()),
        untilDestroyed(this),
      )
      .subscribe({
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
        tap((users) => {
          this.store.dispatch(setUsers({ users }));
        }),
      )
      .subscribe({
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
    this.paginatedUsers = this.usersDisplay.slice((page - 1) * this.usersPageSize, page * this.usersPageSize);
  }

  changeAdminsPage(page: number): void {
    this.paginatedAdmins = this.adminsDisplay.slice(
      (page - 1) * this.adminsPageSize,
      page * this.adminsPageSize,
    );
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
        tap((user) => {
          this.store.dispatch(patchUser({ user }));
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

  userFilterEmpty(): boolean {
    return this.userFilters.search === '' || this.userFilters.search == undefined;
  }
}
