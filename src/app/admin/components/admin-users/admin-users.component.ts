import { AuthApiService } from '@usealto/sdk-ts-angular';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
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
  companyAdmins: AuthUserGet[] = [];
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
    this.fetchCompanyAdmins();
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

  fetchCompanyAdmins() {
    this.authApiService.getRoleUsers({role:'company-admin'})
    .subscribe((q) => {
      this.companyAdmins = q.data;
    });
  }

  hasRoleCompanyAdmin(email: string) {
    return this.companyAdmins.find((user) => user.email === email);
  }

  setImpersonation(email: string) {
    localStorage.setItem('impersonatedUser', email.toLowerCase());
    this.dataService.sendData('impersonatedUserUpdated');
  }

  setLocalStorage(email: string) {
    localStorage.setItem('impersonatedUser', email.toLowerCase());
  }
    
}
