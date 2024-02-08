import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { PatchUserDtoApi, RoleEnumApi, UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { ToastService } from 'src/app/core/toast/toast.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ReplaceInTranslationPipe } from 'src/app/core/utils/i18n/replace-in-translation.pipe';
import { Team } from 'src/app/models/team.model';
import { IUser, User } from 'src/app/models/user.model';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { PillOption, SelectOption } from '../../../shared/models/select-option.model';

@Component({
  selector: 'alto-user-edit-form',
  templateUrl: './user-edit-form.component.html',
  styleUrls: ['./user-edit-form.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class UserEditFormComponent implements OnInit {
  I18ns = I18ns;
  UserDtoApiRolesEnumApi = UserDtoApiRolesEnumApi;

  @Input() me: User = new User({} as IUser);
  @Input() user!: User;
  @Input() teams: Team[] = [];
  @Output() editedUser = new EventEmitter<User>();

  teamsOptions: PillOption[] = [];
  userForm!: FormGroup<{ team: FormControl<PillOption | null>; type: FormControl<SelectOption> }>;
  rolesOptions: SelectOption[] = [
    new SelectOption({
      value: UserDtoApiRolesEnumApi.CompanyAdmin,
      label: I18ns.leadTeam.members.forms.edition.adminType,
    }),
    new SelectOption({
      value: UserDtoApiRolesEnumApi.CompanyUser,
      label: I18ns.leadTeam.members.forms.edition.standardType,
    }),
  ];

  get teamControl(): FormControl<PillOption | null> {
    return this.userForm.get('team') as FormControl<PillOption | null>;
  }

  get typeControl(): FormControl<SelectOption> {
    return this.userForm.get('type') as FormControl<SelectOption>;
  }

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    private readonly userService: UsersRestService,
    private readonly toastService: ToastService,
    private replaceInTranslationPipe: ReplaceInTranslationPipe,
  ) {}

  ngOnInit(): void {
    this.teamsOptions = this.teams.map(
      (team) =>
        new PillOption({
          value: team.id,
          label: team.name,
          pillColor: PillOption.getPillColorFromId(team.id),
        }),
    );

    this.userForm = new FormGroup({
      team: new FormControl(
        this.user.teamId ? this.teamsOptions.find(({ value }) => value === this.user?.teamId) ?? null : null,
        [Validators.required],
      ),
      type: new FormControl(this.highestRoleOption(this.user), {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  private highestRoleOption(user: User): SelectOption {
    if (user.isCompanyAdmin()) {
      return this.rolesOptions.find(
        ({ value }) => value === UserDtoApiRolesEnumApi.CompanyAdmin,
      ) as SelectOption;
    }
    return this.rolesOptions.find(
      ({ value }) => value === UserDtoApiRolesEnumApi.CompanyUser,
    ) as SelectOption;
  }

  private manageRoles(selectedRole: string): Array<RoleEnumApi> {
    const res: Array<RoleEnumApi> = [];
    if (this.user?.roles.includes(UserDtoApiRolesEnumApi.AltoAdmin)) {
      res.push(RoleEnumApi.AltoAdmin);
    }
    if (
      selectedRole === UserDtoApiRolesEnumApi.AltoAdmin ||
      selectedRole === UserDtoApiRolesEnumApi.CompanyAdmin
    ) {
      res.push(RoleEnumApi.CompanyAdmin, RoleEnumApi.CompanyUser);
    } else {
      res.push(RoleEnumApi.CompanyUser);
    }
    return res;
  }

  editUser() {
    const { team, type } = this.userForm.value;
    const params: PatchUserDtoApi = {
      teamId: (team as SelectOption).value,
      roles: this.manageRoles((type as SelectOption).value),
    };
    if (this.user.id) {
      this.userService
        .patchUser(this.user.id, params)
        .pipe(
          tap((user) => {
            this.editedUser.emit(user);
            this.activeOffcanvas.close();
            this.toastService.show({
              text: this.replaceInTranslationPipe.transform(I18ns.settings.users.successEdit, user.fullname),
              type: 'success',
            });
          }),
        )
        .subscribe();
    }
    return;
  }
}
