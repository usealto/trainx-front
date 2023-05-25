import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UserDtoApi } from '@usealto/sdk-ts-angular';
@Component({
  selector: 'alto-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss', '../../../layout/app-layout/app-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit {
  constructor(private readonly usersRestService: UsersRestService, private readonly router: Router) {}
  user!: UserDtoApi;
  authorized = false;

  ngOnInit() {
    this.usersRestService.getMe().subscribe((user) => {
      this.user = user;
      // if the user has the appropriate role, it's ok
      if (/alto-admin/.test(this.user.roles.toString())) {
        this.authorized = true;
      } else {
        // otherwise, if the user is impersonnated, it's ok too
        if (localStorage.getItem('impersonatedUser') !== '' && localStorage.getItem('impersonatedUser')) {
          this.authorized = true;
        } else {
          this.router.navigate(['admin', 'unauthorized']);
        }
      }
    });
  }
}
