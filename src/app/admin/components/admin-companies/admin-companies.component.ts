import { AuthApiService } from './../../../sdk/api/auth.service';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { CompanyDtoApi, CompanyDtoApiSlackDaysEnumApi, UserLightDtoApi, WeekDayEnumApi } from 'src/app/sdk';
import { DataService } from '../../admin-data.service';
import {
  NgbdSortableHeaderDirective,
  SortEvent,
  compare,
} from 'src/app/core/utils/directives/ngbd-sortable-header.directive';
import { AuthUserGet } from '../admin-users/models/authuser.get';
import {
  AdminCompaniesFiltersListComponent,
  FiltersCompaniesList,
} from './admin-companies-filters-list/admin-companies-filters-list.component';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

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
  activeFilters: FiltersCompaniesList = {
    teams: undefined,
    isSlackActive: null,
    userAdmin: undefined,
    sendingDays: undefined,
    nbQuestions: {
      min: undefined,
      max: undefined,
    },
  };

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private readonly offcanvasService: NgbOffcanvas,
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

  openFilterCanvas() {
    const canvasRef = this.offcanvasService.open(AdminCompaniesFiltersListComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    canvasRef.componentInstance.filters = this.activeFilters;
    canvasRef.result.then(
      (result: any) => {
        this.activeFilters = result;
        this.refreshCompanies();
      },
      (reason: any) => {},
    );
  }

  deleteSelectedCompanies() {
    console.log('delete selected companies');
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

  checkFilters(tmpCompanies: CompanyDtoApi[]) {
    return tmpCompanies.filter((company) => {
      return (
        (this.activeFilters.isSlackActive !== null
          ? company.isSlackActive === this.activeFilters.isSlackActive
          : true) &&
        // check for user admin
        (this.activeFilters.userAdmin && this.activeFilters.userAdmin !== ''
          ? company.admins?.some((admin) => admin.email.toLowerCase() === this.activeFilters.userAdmin)
          : true) &&
        // check for sending days
        (this.activeFilters.sendingDays && this.activeFilters.sendingDays.length > 0
          ? company.slackDays?.every((day) =>
              this.activeFilters.sendingDays?.includes(day as unknown as WeekDayEnumApi),
            )
          : true) &&
        // check for minimun
        (this.activeFilters.nbQuestions.min && company.slackQuestionsPerQuiz
          ? company.slackQuestionsPerQuiz >= this.activeFilters.nbQuestions.min
          : true) &&
        // check for maximum
        (this.activeFilters.nbQuestions.max && company.slackQuestionsPerQuiz
          ? company.slackQuestionsPerQuiz <= this.activeFilters.nbQuestions.max
          : true)
      );
    });
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

    tmpCompanies = this.checkFilters(tmpCompanies);

    this.pageCount = Math.ceil(tmpCompanies.length / this.pageSize);

    this.displayedCompanies = tmpCompanies.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }

  setImpersonation(email: string) {
    if (email) {
      localStorage.setItem('impersonatedUser', email.toLowerCase());
      this.dataService.sendData('impersonatedUserUpdated');
    }
  }

  isImpersonnatedAsCompanyAdminOfthisCompanyUpdate(companyAdmin?: Array<UserLightDtoApi>) {
    const impersonatedUserEmail = localStorage.getItem('impersonatedUser');

    if (impersonatedUserEmail && companyAdmin) {
      const impersonatedUser = companyAdmin.find(
        (user) => user.email.toLowerCase() === impersonatedUserEmail,
      );

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
