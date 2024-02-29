import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { Subscription, combineLatest, filter, startWith, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ReplaceInTranslationPipe } from 'src/app/core/utils/i18n/replace-in-translation.pipe';
import { Company } from 'src/app/models/company.model';
import { UserEditFormComponent } from 'src/app/modules/lead-team/components/user-edit-form/user-edit-form.component';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { DeleteModalComponent } from 'src/app/modules/shared/components/delete-modal/delete-modal.component';
import { IAppData } from '../../../../core/resolvers';
import { patchUser, removeUser, setUsers } from '../../../../core/store/root/root.action';
import * as FromRoot from '../../../../core/store/store.reducer';
import { ToastService } from '../../../../core/toast/toast.service';
import { Team } from '../../../../models/team.model';
import { User } from '../../../../models/user.model';
import { EPlaceholderStatus } from '../../../shared/components/placeholder-manager/placeholder-manager.component';
import { AddUsersComponent } from './add-users/add-users.component';

interface IUserInfos {
  user: User;
  hasLicense: FormControl<boolean>;
}

@UntilDestroy()
@Component({
  selector: 'alto-settings-users',
  templateUrl: './settings-users.component.html',
  styleUrls: ['./settings-users.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class SettingsUsersComponent implements OnInit, OnDestroy {
  I18ns = I18ns;
  EmojiName = EmojiName;

  company!: Company;
  me!: User;
  teams: Team[] = [];

  usersInfos: IUserInfos[] = [];

  usersDisplay: IUserInfos[] = [];
  usersPage = 1;
  readonly usersPageSize = 10;
  usersPageControl = new FormControl(1, { nonNullable: true });

  adminsDisplay: IUserInfos[] = [];
  adminsPage = 1;
  readonly adminsPageSize = 5;
  adminsPageControl = new FormControl(1, { nonNullable: true });

  adminSearchControl = new FormControl<string | null>(null);
  userSearchControl = new FormControl<string | null>(null);

  usersDataStatus = EPlaceholderStatus.LOADING;
  adminsDataStatus = EPlaceholderStatus.LOADING;

  usedLicensesCount = 0;

  private readonly settingsUsersComponentSubscription = new Subscription();

  constructor(
    private readonly userRestService: UsersRestService,
    private readonly offcanvasService: NgbOffcanvas,
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

    const users = Array.from((data[EResolvers.AppResolver] as IAppData).userById.values());
    this.usedLicensesCount = users.filter((user) => user.hasLicense).length;
    this.usersInfos = users.map((user) => {
      return {
        user: user,
        hasLicense: new FormControl<boolean>(user.hasLicense),
      } as IUserInfos;
    });

    this.usersInfos.forEach(({ user, hasLicense }) => {
      this.settingsUsersComponentSubscription.add(
        hasLicense.valueChanges
          .pipe(
            switchMap(() => {
              return this.userRestService.patchUser(user.id, { hasLicense: !user.hasLicense });
            }),
          )
          .subscribe({
            next: (updatedUser) => {
              this.store.dispatch(patchUser({ user: updatedUser }));
              const index = this.usersInfos.findIndex(({ user }) => user.id === updatedUser.id);
              this.usersInfos[index].user = updatedUser;
              this.usedLicensesCount = this.usersInfos.filter(({ user }) => user.hasLicense).length;
            },
            error: () => {
              hasLicense.setValue(user.hasLicense, { emitEvent: false });
            },
          }),
      );
    });

    this.settingsUsersComponentSubscription.add(
      combineLatest([
        this.adminSearchControl.valueChanges.pipe(startWith(this.adminSearchControl.value), tap(() => this.adminsPageControl.patchValue(1))),
        this.userSearchControl.valueChanges.pipe(startWith(this.userSearchControl.value), tap(() => this.usersPageControl.patchValue(1))),
      ]).subscribe(([adminSearchTerm, userSearchTerm]) => {
        const userRegex = userSearchTerm ? new RegExp(userSearchTerm, 'i') : null;
        const adminRegex = adminSearchTerm ? new RegExp(adminSearchTerm, 'i') : null;

        this.adminsDisplay = this.usersInfos.filter(({ user }) => {
          if (user.isCompanyAdmin()) {
            return adminRegex ? adminRegex.test(user.fullname) || adminRegex.test(user.email) : true;
          }
          return false;
        });

        this.usersDisplay = this.usersInfos.filter(({ user }) => {
          if (user.isCompanyUser() && !user.isCompanyAdmin()) {
            return userRegex ? userRegex.test(user.fullname) || userRegex.test(user.email) : true;
          }
          return false;
        });

        const adminsCount = this.usersInfos.filter(({ user }) => user.isCompanyAdmin()).length;
        const usersCount = this.usersInfos.filter(
          ({ user }) => user.isCompanyUser() && !user.isCompanyAdmin(),
        ).length;

        this.adminsDataStatus =
          adminsCount <= 0
            ? EPlaceholderStatus.NO_DATA
            : this.adminsDisplay.length <= 0
            ? EPlaceholderStatus.NO_RESULT
            : EPlaceholderStatus.GOOD;
        this.usersDataStatus =
          usersCount <= 0
            ? EPlaceholderStatus.NO_DATA
            : this.usersDisplay.length <= 0
            ? EPlaceholderStatus.NO_RESULT
            : EPlaceholderStatus.GOOD;
      }),
    );

    this.settingsUsersComponentSubscription.add(
      this.adminsPageControl.valueChanges.subscribe((adminsPage) => {
        this.adminsPage = adminsPage;
      }),
    );

    this.settingsUsersComponentSubscription.add(
      this.usersPageControl.valueChanges.subscribe((usersPage) => {
        this.usersPage = usersPage;
      }),
    );
  }

  ngOnDestroy(): void {
    this.settingsUsersComponentSubscription.unsubscribe();
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
        tap(() => modalRef.close()),
        untilDestroyed(this),
      )
      .subscribe({
        next: () => {
          this.store.dispatch(removeUser({ user }));
          const index = this.usersInfos.findIndex(({ user: u }) => u.id === user.id);
          this.usersInfos.splice(index, 1);
          this.userSearchControl.patchValue(this.userSearchControl.value);
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
          return this.userRestService.getUsers();
        }),
        tap((users) => {
          this.store.dispatch(setUsers({ users }));
          users.forEach((u) => {
            const isNewUser = this.usersInfos.some((userInfo) => userInfo.user.id === u.id);

            if (!isNewUser) {
              this.usersInfos.push({ user: u, hasLicense: new FormControl(u.hasLicense) } as IUserInfos);
            }
          });
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
        tap((updatedUser) => {
          this.store.dispatch(patchUser({ user }));
          const index = this.usersInfos.findIndex(({ user }) => user.id === updatedUser.id);
          this.usersInfos[index].user = updatedUser;
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
}
