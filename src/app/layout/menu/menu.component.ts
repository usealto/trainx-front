import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { IUser, User } from 'src/app/models/user.model';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { IAppData } from '../../core/resolvers';
import { EResolvers, ResolversService } from '../../core/resolvers/resolvers.service';

@UntilDestroy()
@Component({
  selector: 'alto-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  me: User = new User({} as IUser);
  AltoRoutes = AltoRoutes;
  I18ns = I18ns;
  toggleTooltip = false;

  isAdmin = false;
  displayAdmin = false;

  leadRoute = ['/', AltoRoutes.lead, AltoRoutes.leadHome];
  userRoute = ['/', AltoRoutes.user, AltoRoutes.userHome];

  constructor(
    private readonly router: Router,
    private activatedRoute: ActivatedRoute,
    private resolversSerivce: ResolversService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversSerivce.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.me = (data[EResolvers.AppResolver] as IAppData).me;
    this.isAdmin = this.me.isAltoAdmin() || this.me.isCompanyAdmin();

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
