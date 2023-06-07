import { Component, OnInit } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { Router } from '@angular/router';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
@Component({
  selector: 'alto-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {
  AltoRoutes = AltoRoutes;
  I18ns = I18ns;
  route: string[] = [];

  constructor(public readonly userStore: ProfileStore, private readonly router: Router) {}

  ngOnInit(): void {
    if (
      this.userStore.user.value?.roles.some(
        (r) => r === UserDtoApiRolesEnumApi.AltoAdmin || r === UserDtoApiRolesEnumApi.CompanyAdmin,
      )
    ) {
      this.route = ['/', AltoRoutes.lead, AltoRoutes.leadHome];
    } else {
      this.route = ['/', AltoRoutes.user, AltoRoutes.userHome];
    }
  }
}
