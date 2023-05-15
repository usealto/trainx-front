import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs';
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
  displayedUsers: UserDtoApi[] = [];
  selectedIds: string[] = [];
  page = 1;
  pageSize = 7;
  pageCount = 0;

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private readonly usersRestService: UsersRestService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    this.companiesRestService
      .getCompanyById(this.id)
      .pipe(
        switchMap((company) => {
          this.company = company;
          return this.usersRestService.getUsersFiltered({ companyId: company.id });
        }),
        tap((users) => {
          this.users = users;
          this.pageCount = Math.ceil(this.users.length / this.pageSize);
          this.refreshUsers();
          console.log(this.users);
        }),
      )
      .subscribe();

    // this.companiesRestService
    //   .getCompanyById(this.id)
    //   .pipe(tap((company) => (this.company = company)))
    //   .subscribe();

    // this.usersRestService
    //   .getUsersFiltered({ companyId: this.id })
    //   .pipe(
    //     tap((users) => {
    //       this.users = users;
    //       console.log(this.users);
    //     }),
    //   )
    //   .subscribe();
  }
  selectAll(event: any) {
    this.selectedIds = event.target.checked ? this.users.map((item) => item.id) : [];
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
    this.refreshUsers();
  }

  refreshUsers() {
    this.displayedUsers = this.users.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }
}
