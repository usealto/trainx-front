import { AuthApiService } from './../../../sdk/api/auth.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UserDtoApi } from 'src/app/sdk';
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
    private readonly companiesRestService: CompaniesRestService,
    private readonly usersRestService: UsersRestService,
    private readonly authApiService: AuthApiService,
    private route: ActivatedRoute,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.changeUsersPage(this.q);
  }

  changeUsersPage(query: string) {
    // this.usersRestService.getUsersPaginated({page: this.usersPage, itemsPerPage: this.usersPageSize})
    // .pipe(
    //   tap((q) => (this.users = q.data ?? [])),
    //   tap((q) => (this.usersCount = q.meta.totalItems ?? 0))
    // )
    // .subscribe();
    const queryFormated =  '*' + query + '*'
    if (query.length > 0 && query.length < 3) {
      return
    }
    this.authApiService.getAuth0Users({q:queryFormated}).subscribe((q) => {
      this.authusers = q.data;
    });
  }

  setImpersonation(email: string) {
    localStorage.setItem('impersonatedUser', email);
    this.dataService.sendData('impersonatedUserUpdated');
  }
    
}
