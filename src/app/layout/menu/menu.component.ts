import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
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
  toggleTooltip = false;

  isAdmin = false;
  displayAdmin = false;

  leadRoute = ['/', AltoRoutes.lead, AltoRoutes.leadHome];
  userRoute = ['/', AltoRoutes.user, AltoRoutes.userHome];

  constructor(
    public readonly userStore: ProfileStore,
    private readonly router: Router,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const { roles } = this.userStore.user.value;
    if (
      roles.some((r) => r === UserDtoApiRolesEnumApi.AltoAdmin || r === UserDtoApiRolesEnumApi.CompanyAdmin)
    ) {
      this.isAdmin = true;
    }

    const segments = window.location.pathname.split('/');
    this.manageLeadState(segments[1]);

    this.router.events
      .pipe(
        tap((event) => {
          if (event instanceof NavigationEnd) {
            this.manageLeadState(event.url.split('/')[1]);
          }
        }),
      )
      .subscribe();
  }

  manageLeadState(route: string | undefined) {
    if (route === '') {
      // Redirects from root to User or Lead
      this.router.navigate(this.isAdmin ? this.leadRoute : this.userRoute);
      this.displayAdmin = this.isAdmin;
    } else {
      this.displayAdmin = !!route && route === AltoRoutes.lead;
    }
  }

  switchToAdmin(goAdmin: boolean) {
    this.displayAdmin = goAdmin;
    this.router.navigate(goAdmin ? this.leadRoute : this.userRoute);
  }

  logOut() {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
    return;
  }
}
