import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/admin/admin-data.service';
import { UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';

@Component({
  selector: 'alto-admin-header-remove-impersonation',
  templateUrl: './admin-header-remove-impersonation.component.html',
  styleUrls: ['./admin-header-remove-impersonation.component.scss']
})
export class AdminHeaderRemoveImpersonationComponent implements OnInit{

  constructor(
    private readonly dataService: DataService,
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
    this.impersonatedUser = false;
    this.dataService.sendData('impersonatedUserUpdated');
  }

}