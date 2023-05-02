import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { CompanyDtoApi, UserDtoApi } from 'src/app/sdk';

@Component({
  selector: 'alto-admin-company-users',
  templateUrl: './admin-company-users.component.html',
  styleUrls: ['./admin-company-users.component.scss'],
})
export class AdminCompanyUsersComponent implements OnInit {
  company!: CompanyDtoApi;
  users: UserDtoApi[] = [];
  id: string | undefined;

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private readonly usersRestService: UsersRestService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    this.companiesRestService
      .getCompanyById(this.id)
      .pipe(tap((company) => (this.company = company)))
      .subscribe();

    this.usersRestService
      .getUsers({ companyId: this.id })
      .pipe(tap((users) => (this.users = users)))
      .subscribe();
  }
}
