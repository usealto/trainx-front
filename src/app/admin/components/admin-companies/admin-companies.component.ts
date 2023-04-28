import { AuthApiService } from './../../../sdk/api/auth.service';
import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { CompanyApi, } from 'src/app/sdk';
import { DataService } from '../../admin-data.service';

@Component({
  selector: 'alto-admin-companies',
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.scss']
})
export class AdminCompaniesComponent implements OnInit {
  companies: CompanyApi[] = [];

  constructor(private readonly companiesRestService: CompaniesRestService,
    private dataService: DataService,
    private readonly authApiService:AuthApiService,
    ) {}

  ngOnInit(): void {
    this.companiesRestService.getCompanies()
    .pipe(
      tap((companies) => this.companies = companies)
    )
    .subscribe();
    console.log('here'); 
  }
}
