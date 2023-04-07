import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { CompanyApi, UserApi } from 'src/app/sdk';

@Component({
  selector: 'alto-admin-company',
  templateUrl: './admin-company.component.html',
  styleUrls: ['./admin-company.component.scss']
})

export class AdminCompanyComponent implements OnInit {
  company!: CompanyApi;
  users: UserApi[] = [];
  id: string | undefined;

  constructor(private readonly companiesRestService: CompaniesRestService, private readonly usersRestService:UsersRestService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    this.companiesRestService.getCompanyById(this.id)
    .pipe(
      tap((company) => this.company = company)
    )
    .subscribe();
    
    this.usersRestService.getUsers({companyId: this.id})
    .pipe(
      tap((users) => this.users = users)
    )
    .subscribe();
  }
}