import { AuthApiService } from '@usealto/sdk-ts-angular';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import {
  CompanyDtoApi,
  CompanyDtoApiSlackDaysEnumApi,
  UserLightDtoApi,
  WeekDayEnumApi,
} from '@usealto/sdk-ts-angular';
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
  pageSize = 12;
  pageCount = 0;
  searchString = '';
  sortDirection: SortEvent = { column: '', direction: '' };
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
    private readonly companiesRestService: CompaniesRestService,
    private readonly offcanvasService: NgbOffcanvas,
    private dataService: DataService,
    private readonly authApiService: AuthApiService,
  ) {}

  ngOnInit(): void {
    this.authApiService.getRoleUsers({ role: 'company-admin' }).subscribe((q) => {
      this.companyAdmins = q.data;
    });

    this.companiesRestService
      .getCompanies()
      .pipe(tap((companies) => (this.companies = companies)))
      .subscribe(() => {
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
  }

  onPaginator(page: number) {
    this.page = page;
    this.refreshCompanies();
  }

  checkFilters(tmpCompanies: CompanyDtoApi[]) {
    return tmpCompanies.filter((company) => {
      // check for Active slack
      if (this.activeFilters.isSlackActive !== null) {
        if (!(company.isSlackActive === this.activeFilters.isSlackActive)) {
          return false;
        }
      }

      // check for user admin
      if (this.activeFilters.userAdmin !== null) {
        if (this.activeFilters.userAdmin === true) {
          if (!(!!company.admins && company.admins?.length > 0)) {
            return false;
          }
        } else {
          if (!(!company.admins || !(company.admins?.length > 0))) {
            return false;
          }
        }
      }

      // check for sendings days
      if (this.activeFilters.sendingDays && this.activeFilters.sendingDays.length > 0) {
        if (
          !company.slackDays?.every((day) =>
            this.activeFilters.sendingDays?.includes(day as unknown as WeekDayEnumApi),
          )
        ) {
          return false;
        }
      }

      // check for min nb question
      if (this.activeFilters.nbQuestions.min) {
        if (!(company.slackQuestionsPerQuiz ?? 0 >= this.activeFilters.nbQuestions.min)) {
          return false;
        }
      }
      // check for max nb question
      if (this.activeFilters.nbQuestions.max && company.slackQuestionsPerQuiz) {
        if (!(company.slackQuestionsPerQuiz ?? 0 <= this.activeFilters.nbQuestions.max)) {
          return false;
        }
      }
      return true;
    });
  }

  refreshCompanies() {
    let tmpCompanies = this.companies;

    if (this.sortDirection.direction !== '' && this.sortDirection.column !== '') {
      tmpCompanies = [...this.companies].sort((a, b) => {
        const firstValue = a[this.sortDirection.column as keyof CompanyDtoApi] as any;
        const secondValue = b[this.sortDirection.column as keyof CompanyDtoApi] as any;
        const res = compare(firstValue, secondValue);
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
        (user) => user.email.toLowerCase() === impersonatedUserEmail.toLowerCase(),
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
