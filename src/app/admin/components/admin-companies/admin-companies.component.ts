import { AuthApiService, AdminApiService, CompanyDtoApi } from '@usealto/sdk-ts-angular';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { tap } from 'rxjs';
import {
  NgbdSortableHeaderDirective,
} from 'src/app/core/utils/directives/ngbd-sortable-header.directive';
import { AuthUserGet } from '../admin-company-user/models/authuser.get';
import {
  FiltersCompaniesList,
} from './admin-companies-filters-list/admin-companies-filters-list.component';

@Component({
  selector: 'alto-admin-companies',
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.scss'],
})
export class AdminCompaniesComponent implements OnInit {
  @ViewChildren(NgbdSortableHeaderDirective) headers!: QueryList<NgbdSortableHeaderDirective>;
  companies: CompanyDtoApi[] = [];
  displayedCompanies: CompanyDtoApi[] = [];
  companyAdmins: AuthUserGet[] = [];
  page = 1;
  pageSize = 12;
  pageCount = 0;
  searchString = '';
  activeFilters: FiltersCompaniesList = {
    teams: undefined,
    isSlackActive: null,
    userAdmin: null,
    sendingDays: undefined,
    nbQuestions: {
      min: undefined,
      max: undefined,
    },
  };

  constructor(
    private readonly adminApiService: AdminApiService,
    private readonly authApiService: AuthApiService,
  ) {}

  ngOnInit(): void {
    this.authApiService.getRoleUsers({ role: 'company-admin' }).subscribe((q) => {
      this.companyAdmins = q.data;
    });

    this.adminApiService
      .adminGetCompanies({itemsPerPage: 1000 })
      .pipe(tap((companies) => (this.companies = (companies?.data) ? companies?.data : [])))
      .subscribe(() => {
        this.pageCount = Math.ceil(this.companies.length / this.pageSize);
        this.refreshCompanies();
      });
  }

  onSearch(search: string) {
    this.searchString = search;
    this.refreshCompanies();
  }

  onPaginator(page: number) {
    this.page = page;
    this.refreshCompanies();
  }

  refreshCompanies() {
    let tmpCompanies = this.companies;

    if (this.searchString !== '') {
      tmpCompanies = tmpCompanies.filter((company) => {
        const term = this.searchString.toLowerCase();
        return company.name.toLowerCase().includes(term);
      });
    }

    this.pageCount = Math.ceil(tmpCompanies.length / this.pageSize);

    this.displayedCompanies = tmpCompanies.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }
}
