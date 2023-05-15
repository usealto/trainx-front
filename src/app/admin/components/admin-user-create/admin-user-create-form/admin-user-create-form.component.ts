import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { TeamDtoApi, UserDtoApiRolesEnumApi, UsersApiService } from 'src/app/sdk';
import { UserForm } from './models/user.form';

@Component({
  selector: 'alto-admin-user-create-form',
  templateUrl: './admin-user-create-form.component.html',
  styleUrls: ['./admin-user-create-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminUserCreateFormComponent implements OnInit {
  companyId!: string;
  teams: TeamDtoApi[] = [];
  userForm!: IFormGroup<UserForm>;
  private fb: IFormBuilder;
  rolesPossibleValues = Object.values(UserDtoApiRolesEnumApi);
  userId!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usersApiService: UsersApiService,
    private readonly teamsRestService: TeamsRestService,
    readonly fob: UntypedFormBuilder,
  ) {
    this.fb = fob;
  }

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('companyId') || '';
    this.userId = this.route.snapshot.paramMap.get('userId') || '';

    console.log(this.companyId, this.userId);

    this.userForm = this.fb.group<UserForm>({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      username: ['', []],
      email: ['', [Validators.required, Validators.email]],
      teamId: [null, []],
      roles: [[], []],
      slackId: ['', []],
    });

    this.teamsRestService
      .getTeams({ companyId: this.companyId })
      .pipe(tap((teams) => (this.teams = teams)))
      .subscribe();
  }

  async submit() {
    console.log('new user to be created if service is created as well');
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const $this = this;

    if (!this.userForm.value) return;

    const { firstname, lastname, username, email, teamId, roles, slackId } = this.userForm.value;

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
        console.log(q);
        $this.router.navigate(['/admin/companies/', $this.companyId, 'users']);
      });
  }
}
