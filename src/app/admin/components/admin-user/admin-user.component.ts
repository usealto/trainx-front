import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { AuthApiService, TeamDtoApi, UserDtoApi, UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';
import { AuthUserGet } from '../admin-users/models/authuser.get';
import { TeamsApiService } from '@usealto/sdk-ts-angular';

@Component({
  selector: 'alto-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.scss'],
})
export class AdminUserComponent implements OnInit {
  user!: UserDtoApi;
  userAuth0!: AuthUserGet;
  id: string | undefined;
  userForm: any;
  display = false;
  displayAuth0 = false;
  teams: TeamDtoApi[] = [];
  rolesPossibleValues = Object.values(UserDtoApiRolesEnumApi);
  isDisabled = false;

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private readonly usersRestService: UsersRestService,
    private route: ActivatedRoute,
    private readonly authApiService: AuthApiService,
    private readonly teamsApiService: TeamsApiService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    this.usersRestService
      .getUsersFiltered({ ids: this.id })
      .pipe(
        tap((users) => {
          if (users[0]) {
            this.user = users[0];
            this.fetchAuth0Data(this.user.email);

            this.userForm = this.formBuilder.group({
              slackId: [this.user.slackId],
              username: [this.user.username],
              teamId: [this.user.teamId],
              roles: [this.user.roles],
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

    this.teamsApiService.getTeams({}).subscribe((teams) => {
      this.teams = teams.data || [];
    });
  }

  async submit() {
    // update the user with the userFrom value using the userRestService
    const userFormCleant = JSON.parse(JSON.stringify(this.userForm.value));
    // Object.keys(userFormCleant).forEach((key) => (userFormCleant[key] == null) && delete userFormCleant[key])
    this.usersRestService.patchUser(this.user.id, userFormCleant).subscribe();
    console.log('here1');
    // refresh after the API has time to implement the changes
    // first sleep 1 second
    await new Promise((f) => setTimeout(f, 1000));
    this.ngOnInit();
    this.isDisabled = true;
    console.log('here2');
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
}
