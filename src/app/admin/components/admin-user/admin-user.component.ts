import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { CompanyApi, UserApi } from 'src/app/sdk';

@Component({
  selector: 'alto-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.scss']
})

export class AdminUserComponent implements OnInit {
  company!: CompanyApi;
  user!: UserApi;
  id: string | undefined;


  constructor(private readonly companiesRestService: CompaniesRestService, private readonly usersRestService:UsersRestService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    this.companiesRestService.getCompanyById(this.id)
    .pipe(
      tap((company) => this.company = company)
    )
    .subscribe();
    
    this.usersRestService.getUsers({ids: this.id})
    .pipe(
      tap((users) => {if(users[0]){ this.user = users[0] }} )
    )
    .subscribe();
  }
}