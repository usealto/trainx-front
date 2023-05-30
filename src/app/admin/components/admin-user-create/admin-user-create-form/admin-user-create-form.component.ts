import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, take, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import {
  AuthApiService,
  CompanyDtoApi,
  RoleEnumApi,
  TeamDtoApi,
  UserDtoApi,
  UserDtoApiRolesEnumApi,
  UsersApiService,
  DefaultApiService,
} from '@usealto/sdk-ts-angular';
import { UserForm } from './models/user.form';
import { AuthUserGet } from '../../admin-users/models/authuser.get';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { UsersApiService as SlackApiService } from 'src/app/sdk/api/users.service';
import { MsgService } from 'src/app/core/message/msg.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ShowRawDataModalComponent } from './show-raw-data-modal/show-raw-data-modal.component';

@Component({
  selector: 'alto-admin-user-create-form',
  templateUrl: './admin-user-create-form.component.html',
  styleUrls: ['./admin-user-create-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminUserCreateFormComponent implements OnInit {
  edit = false;
  companyId!: string;
  teams: TeamDtoApi[] = [];
  userForm!: IFormGroup<UserForm>;
  private fb: IFormBuilder;
  rolesPossibleValues = Object.values(UserDtoApiRolesEnumApi);
  userId!: string;
  userAuth0!: AuthUserGet;
  user!: UserDtoApi;
  company!: CompanyDtoApi;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usersApiService: UsersApiService,
    private readonly teamsRestService: TeamsRestService,
    readonly fob: UntypedFormBuilder,
    private readonly authApiService: AuthApiService,
    private readonly usersRestService: UsersRestService,
    private readonly companiesRestService: CompaniesRestService,
    private readonly slackApiService: SlackApiService,
    private readonly msg: MsgService,
    private readonly defaultApiService: DefaultApiService,
    private modalService: NgbModal,
  ) {
    this.fb = fob;
  }

  async ngOnInit(): Promise<void> {
    this.companyId = this.route.snapshot.paramMap.get('companyId') || '';
    this.userId = this.route.snapshot.paramMap.get('userId') || '';

    combineLatest({
      teams: this.teamsRestService.getTeams({ companyId: this.companyId }),
      company: this.companiesRestService.getCompanyById(this.companyId),
    })
      .pipe(take(1))
      .subscribe(({ company, teams }) => {
        this.company = company;
        this.teams = teams;
      });

    if (this.userId) {
      this.edit = true;
      this.usersRestService
        .getUsersFiltered({ ids: this.userId })
        .pipe(
          tap((users) => {
            if (users[0]) {
              this.user = users[0];
              this.fetchAuth0Data(this.user.email);

              this.userForm = this.fb.group<UserForm>({
                firstname: [this.user.firstname || '', [Validators.required]],
                lastname: [this.user.lastname || '', [Validators.required]],
                username: [this.user.username || '', [Validators.required]],
                email: [this.user.email || '', [Validators.required, Validators.email]],
                teamId: [this.user.teamId || '', []],
                roles: [this.user.roles as unknown as Array<RoleEnumApi>, []],
                slackId: [this.user.slackId || '', []],
              });
            } else {
              throw new Error('User not found');
            }
          }),
        )
        .subscribe({
          error: (err) => {
            console.log('err in subscibe', err);
          },
        });
    } else {
      this.userForm = this.fb.group<UserForm>({
        firstname: ['', [Validators.required]],
        lastname: ['', [Validators.required]],
        username: ['', []],
        email: ['', [Validators.required, Validators.email]],
        teamId: [null, []],
        roles: [[RoleEnumApi.CompanyUser], []],
        slackId: ['', []],
      });
    }
  }

  async submit() {
    if (!this.userForm.value) return;

    const { firstname, lastname, username, email, teamId, roles, slackId } = this.userForm.value;

    if (this.edit) {
      this.usersApiService
        .patchUser({
          id: this.user.id,
          patchUserDtoApi: {
            teamId: teamId,
            firstname: firstname,
            lastname: lastname,
            username: username,
            roles: roles,
            slackId: slackId,
          },
        })
        .subscribe((q) => {
          this.router.navigate(['/admin/companies/', this.companyId, 'users', this.userId]);
        });
    } else {
      this.usersApiService
        .createUser({
          createUserDtoApi: {
            email: email,
            companyId: this.companyId,
            teamId: teamId,
            firstname: firstname,
            lastname: lastname,
            username: username,
            roles: roles,
            slackId: slackId,
          },
        })
        .subscribe((q) => {
          this.router.navigate(['/admin/companies/', this.companyId, 'users']);
        });
    }
  }

  showRawDataModal() {
    const modalRef = this.modalService.open(ShowRawDataModalComponent, {
      centered: true,
      scrollable: true,
      size: 'xl',
    });
    modalRef.componentInstance.userAuth0 = this.userAuth0;
    modalRef.componentInstance.user = this.user;
  }

  fetchAuth0Data(email: string) {
    this.authApiService.getAuth0Users({ q: email }).subscribe((q) => {
      if (q.data && q.data.length > 0) {
        this.userAuth0 = q.data[0];
      } else {
        throw new Error('user not found in auth0');
      }
    });
  }

  sendResetPassword() {
    if (!this.userForm.value) return;
    const { email } = this.userForm.value;

    this.authApiService
      .resetUserPassword({
        auth0ResetPasswordParamsDtoApi: {
          email: email,
        },
      })
      .subscribe((res) => this.msg.add({ message: res.data, severity: 'success' }));
  }

  resetSlackId() {
    // this.defaultApiService.n8nProxyControllerProxyGetRequest();
    this.slackApiService
      .updateSlackid({
        companyId: this.companyId,
        userId: this.userId,
        slackAdmin: this.company.slackAdmin,
      })
      .subscribe((res) => console.log(res));
  }
}
