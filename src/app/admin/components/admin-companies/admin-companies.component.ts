import { AuthApiService } from './../../../sdk/api/auth.service';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { CompanyDtoApi, UserLightDtoApi } from 'src/app/sdk';
import { DataService } from '../../admin-data.service';
import {
  NgbdSortableHeaderDirective,
  SortEvent,
  compare,
} from 'src/app/core/utils/directives/ngbd-sortable-header.directive';
import { AuthUserGet } from '../admin-users/models/authuser.get';

@Component({
  selector: 'alto-admin-companies',
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.scss'],
})
export class AdminCompaniesComponent implements OnInit {
  @ViewChildren(NgbdSortableHeaderDirective) headers!: QueryList<NgbdSortableHeaderDirective>;
  companies: CompanyDtoApi[] = [];
  displayedCompanies: CompanyDtoApi[] = [];
  selectedIds: string[] = [];
  companyAdmins: AuthUserGet[] = [];
  page = 1;
  pageSize = 7;
  pageCount = 0;
  searchString = '';
  sortDirection: SortEvent = { column: '', direction: '' };

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private dataService: DataService,
    private readonly authApiService: AuthApiService,
  ) {}

  ngOnInit(): void {
    this.authApiService.getRoleUsers({ role: 'company-admin' }).subscribe((q) => {
      this.companyAdmins = q.data;
      console.log(this.companyAdmins);
    });

    this.companiesRestService
      .getCompanies()
      .pipe(tap((companies) => (this.companies = companies)))
      .subscribe(() => {
        console.log(this.companies);
        this.pageCount = Math.ceil(this.companies.length / this.pageSize);
        this.refreshCompanies();
      });
  }

  onSearch(search: string) {
    this.searchString = search;
    this.refreshCompanies();
  }

  onSort(event: SortEvent) {
    this.sortDirection = event;
    this.headers.forEach((header) => {
      if (header.sortable !== event.column) {
        header.direction = '';
      }
    });
    this.refreshCompanies();
  }

  selectAll(event: any) {
    this.selectedIds = event.target.checked ? this.companies.map((item) => item.id) : [];
  }

  selectCompany(id: string) {
    if (this.selectedIds.includes(id)) {
      this.selectedIds = this.selectedIds.filter((arrayId) => arrayId !== id);
    } else {
      this.selectedIds.push(id);
    }
    console.log(this.selectedIds);
  }

  onPaginator(page: number) {
    this.page = page;
    this.refreshCompanies();
  }

  refreshCompanies() {
    let tmpCompanies = this.companies;

    if (this.sortDirection.direction !== '' && this.sortDirection.column !== '') {
      tmpCompanies = [...this.companies].sort((a, b) => {
        const firstValue = a[this.sortDirection.column as keyof CompanyDtoApi] as any;
        const secondValue = b[this.sortDirection.column as keyof CompanyDtoApi] as any;
        const res = compare(firstValue, secondValue);
        // const res = firstValue.localeCompare(secondValue);
        return this.sortDirection.direction === 'asc' ? res : -res;
      });
    }

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

  setImpersonation(email: string) {
    if (email) {
      localStorage.setItem('impersonatedUser', email);
      this.dataService.sendData('impersonatedUserUpdated');
    }
  }

  isImpersonnatedAsCompanyAdminOfthisCompanyUpdate(companyAdmin?: Array<UserLightDtoApi>) {
    const impersonatedUserEmail = localStorage.getItem('impersonatedUser');

    if (impersonatedUserEmail && companyAdmin) {
      const impersonatedUser = companyAdmin.find((user) => user.email === impersonatedUserEmail);

      if (impersonatedUser) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
