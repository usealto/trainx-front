import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { Component, OnInit } from '@angular/core';
import { UserDtoApi } from '@usealto/sdk-ts-angular';
import { DataService } from 'src/app/admin/admin-data.service';
import { Router } from '@angular/router';

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
      console.log(user);
      this.user = user;
      this.userEmail = user.email;
    });
  }

  removeImpersonation() {
    console.log('héo');
    localStorage.setItem('impersonatedUser', '');
    this.impersonatedUser = false;
    this.dataService.sendData('impersonatedUserUpdated');
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
