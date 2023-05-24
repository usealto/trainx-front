import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { Component, OnInit } from '@angular/core';
import { UserDtoApi } from 'src/app/sdk';
import { DataService } from 'src/app/admin/admin-data.service';

@Component({
  selector: 'alto-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.scss', '../../../../layout/menu/menu.component.scss'],
})
export class AdminMenuComponent implements OnInit {
  constructor(private readonly usersRestService: UsersRestService, private dataService: DataService) {}
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
    localStorage.setItem('impersonatedUser', '');
    this.impersonatedUser = false;
    this.dataService.sendData('impersonatedUserUpdated');
  }

  refreshUserImpersonated() {
    this.refreshMe();
    this.impersonatedUser =
      localStorage.getItem('impersonatedUser') !== '' && localStorage.getItem('impersonatedUser');
    window.location.reload();
  }
}
