import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { Component, OnInit } from '@angular/core';
import { UserDtoApi } from '@usealto/sdk-ts-angular';
import { DataService } from 'src/app/admin/admin-data.service';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.scss', '../../../../layout/menu/menu.component.scss'],
})
export class AdminMenuComponent implements OnInit {
  constructor(
    private readonly usersRestService: UsersRestService,
    private dataService: DataService,
    private router: Router,
    public auth: AuthService,
  ) {}
  AltoRoutes = AltoRoutes;
  I18ns = I18ns;

  toggleTooltip = false;

  user!: UserDtoApi;
  userEmail = '';
  impersonatedUser =
    localStorage.getItem('impersonatedUser') !== '' && localStorage.getItem('impersonatedUser');

  ngOnInit() {
    this.refreshMe();

    this.dataService.data.subscribe((response) => {
      if (response === 'impersonatedUserUpdated') {
        this.refreshUserImpersonated();
      }
    });
  }

  refreshMe() {
    this.usersRestService.getMe().subscribe((user) => {
      this.user = user;
      this.userEmail = user.email;
    });
  }

  removeImpersonation() {
    localStorage.setItem('impersonatedUser', '');
    this.impersonatedUser = false;
    this.dataService.sendData('impersonatedUserUpdated');
  }

  logOut() {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
    return;
  }

  refreshUserImpersonated() {
    this.refreshMe();
    this.impersonatedUser =
      localStorage.getItem('impersonatedUser') !== '' && localStorage.getItem('impersonatedUser');
    if (localStorage.getItem('impersonatedUser') === '') {
      this.router.navigate(['/admin/home/']).then(() => window.location.reload());
    } else {
      // window.location.reload();
      this.router.navigate(['/l/home/']).then(() => window.location.reload());
    }
  }
}
