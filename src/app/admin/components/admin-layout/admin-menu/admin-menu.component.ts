import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { Component, OnInit } from '@angular/core';
import { UserDtoApi } from '@usealto/sdk-ts-angular';
import { DataService } from 'src/app/admin/admin-data.service';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

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
      this.router.navigate(['/admin/companies/']).then(() => window.location.reload());
    } else {
      window.location.reload();
    }
  }
}
