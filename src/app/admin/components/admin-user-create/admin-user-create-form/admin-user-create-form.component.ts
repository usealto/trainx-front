import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, take, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import {
  AdminApiService,
  CompanyDtoApi,
  RoleEnumApi,
  TeamDtoApi,
  UserDtoApi,
  UserDtoApiRolesEnumApi,
  UsersApiService,
} from '@usealto/sdk-ts-angular';
import { UserForm } from './models/user.form';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';


@Component({
  selector: 'alto-admin-user-create-form',
  templateUrl: './admin-user-create-form.component.html',
  styleUrls: ['./admin-user-create-form.component.scss'],
})
export class AdminUserCreateFormComponent implements OnInit {
  edit = false;
  companyId!: string;
  teams: TeamDtoApi[] = [];
  userForm!: IFormGroup<UserForm>;
  private fb: IFormBuilder;
  rolesPossibleValues = Object.values(UserDtoApiRolesEnumApi);
  userId!: string;
  user!: UserDtoApi;
  company!: CompanyDtoApi;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usersApiService: UsersApiService,
    readonly fob: UntypedFormBuilder,
    private readonly adminApiService: AdminApiService,
    private readonly companiesRestService: CompaniesRestService,
    private readonly teamsRestService: TeamsRestService,
  ) {
    this.fb = fob;
  }

  async ngOnInit(): Promise<void> {
    this.companyId = this.route.snapshot.paramMap.get('companyId') || '';
    this.userId = this.route.snapshot.paramMap.get('userId') || '';

    combineLatest({
      company: this.companiesRestService.getCompanyById(this.companyId),
      teams: this.teamsRestService.getTeams({ itemsPerPage: 1000 }),
    })
      .pipe(take(1))
      .subscribe(({ company, teams }) => {
        this.company = company;
        // Be very careful here : we are not impersonating the user, so we need to
        // filter by the company id to avoid leaking data. TODO : dev smth more robust
        this.teams = teams.filter((t) => t.companyId === this.companyId);
      });

    if (this.userId) {
      this.edit = true;
      this.adminApiService
        .adminGetUsers({ ids: this.userId })
        .pipe(
          tap((users) => {
            if (users.data && users.data[0]) {
              this.user = users.data[0];

              this.userForm = this.fb.group<UserForm>({
                firstname: [this.user.firstname || '', [Validators.required]],
                lastname: [this.user.lastname || '', [Validators.required]],
                email: [this.user.email || '', [Validators.required, Validators.email]],
                roles: [this.user.roles as unknown as Array<RoleEnumApi>, []],
                team: [this.user.team, [Validators.required]],
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
        email: ['', [Validators.required, Validators.email]],
        roles: [[RoleEnumApi.CompanyUser], []],
        team: [undefined, [Validators.required]],
      });
    }
  }

  async submit() {
    if (!this.userForm.value) return;

    const { firstname, lastname, email, roles, team } = this.userForm.value;

    if (this.edit) {
      this.usersApiService
        .patchUser({
          id: this.user.id,
          patchUserDtoApi: {
            firstname: firstname,
            lastname: lastname,
            roles: roles,
            teamId: team?.id,
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
            firstname: firstname,
            lastname: lastname,
            roles: roles,
            teamId: team?.id,
          },
        })
        .subscribe((q) => {
          this.router.navigate(['/admin/companies/', this.companyId, 'users']);
        });
    }
  }

  
}
