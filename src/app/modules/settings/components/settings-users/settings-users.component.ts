import { Component, OnInit } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UserDtoApi } from 'src/app/sdk';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'alto-settings-users',
  templateUrl: './settings-users.component.html',
  styleUrls: ['./settings-users.component.scss'],
})
export class SettingsUsersComponent implements OnInit {
  I18ns = I18ns;

  usersDisplay: UserDtoApi[] = [];
  adminDisplay: UserDtoApi[] = [];

  constructor(private readonly userRestService: UsersRestService) {}

  ngOnInit(): void {
    this.userRestService
      .getUsersPaginated({ isCompanyAdmin: true })
      .pipe(
        tap((users) => (this.adminDisplay = users.data ?? [])),
        untilDestroyed(this),
      )
      .subscribe();

    this.userRestService
      .getUsersPaginated({ isCompanyAdmin: false })
      .pipe(
        tap((users) => (this.usersDisplay = users.data ?? [])),
        untilDestroyed(this),
      )
      .subscribe();
  }
}
