import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
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

interface IUserInfos {
  user: User;
  licenseControl: FormControl<boolean>;
}

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
  users: IUserInfos[] = [];

  paginatedUsers: IUserInfos[] = [];
  usersDisplay: IUserInfos[] = [];
  usersPageSize = 10;
  usersPage = 1;
  usersCount = 0;
  paginatedAdmins: IUserInfos[] = [];
  adminsDisplay: IUserInfos[] = [];
  adminsPageSize = 5;
  adminsPage = 1;
  adminsCount = 0;

  availableLicensesCount = 0;
  usedLicensesCount = 0;

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
    this.store.select(FromRoot.selectCompany).pipe(
      tap(({ data: company }) => {
        this.company = company;
        this.availableLicensesCount = company.licenseCount;
      }),
    );
    this.teams = Array.from((data[EResolverData.TeamsById] as Map<string, Team>).values());

    // this.licensesRestService.getLicences(this.company).subscribe((company) => {
    //   this.availableLicensesCount = company.licenses.reduce((acc, license) => license.quantity + acc, 0);
    // });

    // this.licensesRestService
    //   .getUsers(this.users.map(({ user }) => user.email))
    //   .subscribe((theOfficeUsers) => {
    //     this.usedLicensesCount = theOfficeUsers.reduce((acc, user) => {
    //       return user.hasLicense ? acc++ : acc;
    //     }, 0);

    //     this.setUsers(Array.from((data[EResolverData.UsersById] as Map<string, User>).values()));
    //     this.displayAdmins();
    //     this.displayUsers();
    //   });
  }

  toggleUserLicense(user: User): void {
    console.log('toggleUserLicense', user);
    // this.usersMap.set(user.email, !this.usersMap.get(user.email));
  }

  displayAdmins() {
    const filteredUsers = this.usersService.filterUsers<User[]>(
      this.users.map(({ user }) => user).filter((user) => user.isCompanyAdmin()),
      { search: this.userFilters.search },
    );

    this.adminsDisplay = this.users.filter(({ user }) => {
      return filteredUsers.some((filteredUser) => filteredUser.email === user.email);
    });
    this.adminsCount = this.adminsDisplay.length;
    this.changeAdminsPage(1);
  }

  displayUsers() {
    const filteredUsers = this.usersService.filterUsers<User[]>(
      this.users.map(({ user }) => user).filter((user) => user.isCompanyUser() && !user.isCompanyAdmin()),
      { search: this.userFilters.search },
    );

    this.usersDisplay = this.users.filter(({ user }) => {
      return filteredUsers.some((filteredUser) => filteredUser.email === user.email);
    });
    this.usersCount = this.usersDisplay.length;
    this.changeUsersPage(1);
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
        switchMap(() => this.store.select(FromRoot.selectUsers)),
        tap(() => modalRef.close()),
        untilDestroyed(this),
      )
      .subscribe({
        next: ({ data: users }) => {
          this.users = Array.from(users.values()).map((user) => {
            return {
              user,
              licenseControl: new FormControl(false, { nonNullable: true }),
            };
          });
          this.displayUsers();
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
          this.users = Array.from(users.values()).map((user) => {
            return {
              user,
              licenseControl: new FormControl(false, { nonNullable: true }),
            };
          });
          this.displayAdmins();
          this.displayUsers();
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
          this.users = Array.from(users.values()).map((user) => {
            return {
              user,
              licenseControl: new FormControl(false, { nonNullable: true }),
            };
          });
          this.displayAdmins();
          this.displayUsers();
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

  private setUsers(users: User[]) {
    this.users = Array.from(users.values()).map((user) => {
      return {
        user,
        licenseControl: new FormControl(false, { nonNullable: true }),
      };
    });
  }
}
