import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { PatchUserDtoApi, RoleEnumApi, UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { ToastService } from 'src/app/core/toast/toast.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ReplaceInTranslationPipe } from 'src/app/core/utils/i18n/replace-in-translation.pipe';
import { Team } from 'src/app/models/team.model';
import { IUser, User } from 'src/app/models/user.model';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UserForm } from '../../model/user-edit.form';

@Component({
  selector: 'alto-user-edit-form',
  templateUrl: './user-edit-form.component.html',
  styleUrls: ['./user-edit-form.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class UserEditFormComponent implements OnInit {
  I18ns = I18ns;
  @Input() user?: User;
  @Input() me: User = new User({} as IUser);
  @Input() teams: Team[] = [];
  @Output() editedUser = new EventEmitter<User>();
  private fb: IFormBuilder = this.fob;
  userForm: IFormGroup<UserForm> = this.fb.group<UserForm>({
    team: ['', [Validators.required]],
    type: ['', [Validators.required]],
  });

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    readonly fob: UntypedFormBuilder,
    private readonly userService: UsersRestService,
    private readonly toastService: ToastService,
    private replaceInTranslationPipe: ReplaceInTranslationPipe,
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.userForm.patchValue({
        team: this.user?.teamId,
        type: this.getHigherRole(this.user?.roles ?? []),
      });
    });
  }

  getHigherRole(list: Array<UserDtoApiRolesEnumApi>): UserDtoApiRolesEnumApi {
    if (list.includes(UserDtoApiRolesEnumApi.CompanyAdmin)) {
      return UserDtoApiRolesEnumApi.CompanyAdmin;
    } else {
      return UserDtoApiRolesEnumApi.CompanyUser;
    }
  }

  manageRoles(selectedRole: string): Array<RoleEnumApi> {
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
    if (!this.userForm.value) return;
    const { team, type } = this.userForm.value;
    const params: PatchUserDtoApi = {
      teamId: team,
      roles: this.manageRoles(type),
    };
    if (this.user?.id) {
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
