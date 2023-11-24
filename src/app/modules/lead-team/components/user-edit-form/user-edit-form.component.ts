import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { PatchUserDtoApi, RoleEnumApi, UserDtoApi, UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { ToastService } from 'src/app/core/toast/toast.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ReplaceInTranslationPipe } from 'src/app/core/utils/i18n/replace-in-translation.pipe';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
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
  @Input() user?: UserDtoApi;
  @Output() editedUser = new EventEmitter<UserDtoApi>();
  private fb: IFormBuilder = this.fob;
  userForm: IFormGroup<UserForm> = this.fb.group<UserForm>({
    team: ['', [Validators.required]],
    type: ['', [Validators.required]],
  });
  teams: Team[] = [];
  profile!: User;

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    readonly fob: UntypedFormBuilder,
    private readonly userService: UsersRestService,
    private readonly toastService: ToastService,
    private replaceInTranslationPipe: ReplaceInTranslationPipe,
    private readonly resolversService: ResolversService,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.profile = data['me'] as User;
    this.teams = Array.from((data['teamsById'] as Map<string, Team>).values());
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
        .patchUser(this.user?.id, params)
        .pipe(
          tap((user) => {
            this.userService.resetUsers();
            this.editedUser.emit(user);
            this.activeOffcanvas.close();
            this.toastService.show({
              text: this.replaceInTranslationPipe.transform(
                I18ns.settings.users.successEdit,
                user.firstname + ' ' + user.lastname,
              ),
              type: 'success',
            });
          }),
        )
        .subscribe();
    }
    return;
  }
}
