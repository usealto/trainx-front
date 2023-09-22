import { AuthApiService } from '@usealto/sdk-ts-angular';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserDtoApi } from '@usealto/sdk-ts-angular';
import { AuthUserGet } from './models/authuser.get';
import { DataService } from '../../admin-data.service';

@Component({
  selector: 'alto-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
})
export class AdminUsersComponent implements OnInit {
  users: UserDtoApi[] = [];
  authusers: AuthUserGet[] = [];
  id: string | undefined;
  usersCount = 0;
  usersPage = 1;
  usersPageSize = 10;
  q = '';

  constructor(
    private readonly authApiService: AuthApiService,
    private route: ActivatedRoute,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.changeUsersPage(this.q);
  }

  changeUsersPage(query: string) {
    const queryFormated =  '*' + query + '*'
    if (query.length > 0 && query.length < 3) {
      return
    }
    this.authApiService.getAuth0Users({q:queryFormated}).subscribe((q) => {
      this.authusers = q.data;
    });
  }

  setLocalStorage(email: string) {
    localStorage.setItem('impersonatedUser', email.toLowerCase());
  }
    
}
