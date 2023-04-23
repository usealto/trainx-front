import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UserDtoApi } from 'src/app/sdk';
import { environment } from 'src/environments/environment';
import axios from 'axios';
import { AuthUserGet } from './models/authuser.get';

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
    private route: ActivatedRoute,
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

    let yourJWTToken =
      localStorage.getItem(
        '@@auth0spajs@@::ThcIBQZrRso5QaZq67kCU5eFYTfZwTSK::https://api.usealto.com::openid profile email offline_access',
      ) || '';
    yourJWTToken = JSON.parse(yourJWTToken).body.access_token;
    console.log('gg');
    let $this = this;
    axios
      .get(environment.apiURL + '/v1/auth/users?q=*' + query + '*', {
        headers: {
          Authorization: 'Bearer ' + yourJWTToken,
        },
      })
      .then(function (response: any) {
        console.log('response');
        console.log(response);
        $this.authusers = response.data.data;
      })
      .catch(function (error: any) {
        console.log(error);
      });
  }
}
