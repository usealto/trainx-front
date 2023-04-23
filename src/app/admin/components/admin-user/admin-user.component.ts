import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UserDtoApi } from 'src/app/sdk';

@Component({
  selector: 'alto-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.scss'],
})
export class AdminUserComponent implements OnInit {
  user!: UserDtoApi;
  id: string | undefined;
  userForm: any;
  display = false;

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private readonly usersRestService: UsersRestService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    this.usersRestService
      .getUsers({ ids: this.id })
      .pipe(
        tap((users) => {
          if (users[0]) {
            this.user = users[0];
          }
        }),
      )
      .pipe(
        tap(() => {
          this.userForm = this.formBuilder.group({
            slackId: [this.user.slackId],
            username: [this.user.username],
          });
        }),
      )
      .subscribe();
  }

  async submit() {
    // update the user with the userFrom value using the userRestService
    this.usersRestService.patchUser(this.user.id, this.userForm.value).subscribe();

    // refresh after the API has time to implement the changes
    // first sleep 1 second
    await new Promise((f) => setTimeout(f, 1000));
    this.ngOnInit();
  }
}
