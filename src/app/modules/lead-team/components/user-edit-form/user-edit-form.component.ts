import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import {
  PatchUserDtoApi,
  RoleEnumApi,
  TeamDtoApi,
  TeamLightDtoApi,
  UserDtoApi,
  UserDtoApiRolesEnumApi,
} from '@usealto/sdk-ts-angular';
import { UserForm } from '../../model/user-edit.form';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { TeamsRestService } from '../../services/teams-rest.service';
import { tap } from 'rxjs';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { ProfileStore } from 'src/app/modules/profile/profile.store';

@Component({
  selector: 'alto-user-edit-form',
  templateUrl: './user-edit-form.component.html',
  styleUrls: ['./user-edit-form.component.scss'],
})
export class UserEditFormComponent implements OnInit {
  I18ns = I18ns;
  @Input() user!: UserDtoApi;
  @Output() editedUser = new EventEmitter<UserDtoApi>();
  private fb: IFormBuilder;
  userForm!: IFormGroup<UserForm>;
  teams: TeamDtoApi[] = [];
  profile: UserDtoApi = this.profileStore.user.value;

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    readonly fob: UntypedFormBuilder,
    private readonly teamsRestService: TeamsRestService,
    private readonly userService: UsersRestService,
    private readonly profileStore: ProfileStore,
  ) {
    this.fb = fob;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.teamsRestService
        .getTeams()
        .pipe(tap((teams) => (this.teams = teams)))
        .subscribe();
      this.userForm = this.fb.group<UserForm>({
        team: ['', [Validators.required]],
        type: ['', [Validators.required]],
      });
      this.userForm.patchValue({
        team: this.user.team?.id,
        type: this.getHigherRole(this.user.roles),
      });
    });
  }

  getHigherRole(list: Array<UserDtoApiRolesEnumApi>): UserDtoApiRolesEnumApi {
    if (list.includes(UserDtoApiRolesEnumApi.AltoAdmin)) {
      return UserDtoApiRolesEnumApi.AltoAdmin;
    } else if (list.includes(UserDtoApiRolesEnumApi.CompanyAdmin)) {
      return UserDtoApiRolesEnumApi.CompanyAdmin;
    } else {
      return UserDtoApiRolesEnumApi.CompanyUser;
    }
  }

  manageRoles(selectedRole: string): Array<RoleEnumApi> {
    const res: Array<RoleEnumApi> = [];
    if (this.user.roles.includes(UserDtoApiRolesEnumApi.AltoAdmin)) {
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
    this.userService
      .patchUser(this.user.id, params)
      .pipe(
        tap((user) => {
          this.editedUser.emit(user);
          this.activeOffcanvas.close();
        }),
      )
      .subscribe();
    return;
  }
}
