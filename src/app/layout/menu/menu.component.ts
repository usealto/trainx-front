import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { UserDtoApiRolesEnumApi } from 'src/app/sdk';
import { buildTime } from 'src/build-time';

@UntilDestroy()
@Component({
  selector: 'alto-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  AltoRoutes = AltoRoutes;
  I18ns = I18ns;
  buildTime = buildTime;

  isAdmin = false;
  displayAdmin = false;

  leadRoute = ['/', AltoRoutes.lead, AltoRoutes.leadHome];
  userRoute = ['/', AltoRoutes.user, AltoRoutes.userHome];

  constructor(public readonly userStore: ProfileStore, private readonly router: Router) {}

  ngOnInit(): void {
    const segments = window.location.pathname.split('/');
    const { roles } = this.userStore.user.value;
    if (
      roles.some((r) => r === UserDtoApiRolesEnumApi.AltoAdmin || r === UserDtoApiRolesEnumApi.CompanyAdmin)
    ) {
      this.isAdmin = true;
    }

    if (!segments[1]) {
      this.router.navigate(this.isAdmin ? this.leadRoute : this.userRoute);
      this.displayAdmin = this.isAdmin;
    } else {
      this.displayAdmin = !!segments.length && segments[1] === AltoRoutes.lead;
    }
  }

  switchToAdmin(goAdmin: boolean) {
    this.displayAdmin = goAdmin;
    this.router.navigate(goAdmin ? this.leadRoute : this.userRoute);
  }
}
