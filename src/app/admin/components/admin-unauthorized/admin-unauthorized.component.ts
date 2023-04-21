import { Component, OnInit } from '@angular/core';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UserDtoApi } from 'src/app/sdk';

@Component({
  selector: 'alto-admin-unauthorized',
  templateUrl: './admin-unauthorized.component.html',
  styleUrls: ['./admin-unauthorized.component.scss'],
})
export class AdminUnauthorizedComponent implements OnInit {
  constructor(private readonly usersRestService: UsersRestService) {}
  user!: UserDtoApi;

  ngOnInit() {
    this.usersRestService.getMe().subscribe((user) => {
      this.user = user;
    });
  }
}
