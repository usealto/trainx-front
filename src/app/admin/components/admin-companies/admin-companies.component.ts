import { AuthApiService } from './../../../sdk/api/auth.service';
import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { CompanyDtoApi } from 'src/app/sdk';
import { DataService } from '../../admin-data.service';

@Component({
  selector: 'alto-admin-companies',
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.scss'],
})
export class AdminCompaniesComponent implements OnInit {
  companies: CompanyDtoApi[] = [];
  displayedCompanies: CompanyDtoApi[] = [];
  page = 1;
  pageSize = 4;
  pageCount = 0;

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private dataService: DataService,
    private readonly authApiService: AuthApiService,
  ) {}

  ngOnInit(): void {
    this.companiesRestService
      .getCompanies()
      .pipe(tap((companies) => (this.companies = companies)))
      .subscribe(() => {
        this.pageCount = Math.ceil(this.companies.length / this.pageSize);
        this.refreshCountries();
      });
  }

  onPaginator(page: number) {
    this.page = page;
    this.refreshCountries();
  }

  refreshCountries() {
    this.displayedCompanies = this.companies.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }
}
