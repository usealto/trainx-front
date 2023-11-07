
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { Component, OnInit } from '@angular/core';
import { UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';
import { Router } from '@angular/router';
import { ProfileStore } from 'src/app/modules/profile/profile.store';

@Component({
  selector: 'alto-impersonation-header',
  templateUrl: './impersonation-header.component.html',
  styleUrls: ['./impersonation-header.component.scss']
})
export class ImpersonationHeaderComponent implements OnInit{

  constructor(
    private router : Router,
    private readonly userstore: ProfileStore,
    private readonly usersRestService :UsersRestService) {}

  impersonatedUser =
    localStorage.getItem('impersonatedUser') !== '' && localStorage.getItem('impersonatedUser');
  impersonatedUserEmail = localStorage.getItem('impersonatedUser');
  isAdmin = false;

  ngOnInit(): void {
    this.usersRestService.getMe().subscribe((res) => {
      this.isAdmin = res.roles.some((r) => r === UserDtoApiRolesEnumApi.AltoAdmin)
    })
  }

  removeImpersonation() {
    localStorage.setItem('impersonatedUser', '');
    this.userstore.user.reset();
    this.impersonatedUser = false;
    this.router.navigate(['/']);
    location.reload();
  }

}
