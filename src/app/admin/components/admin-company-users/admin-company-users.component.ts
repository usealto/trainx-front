import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, switchMap, tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { CompanyDtoApi, TeamDtoApi, UserDtoApi } from 'src/app/sdk';

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
  teams: TeamDtoApi[] = [];

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private readonly usersRestService: UsersRestService,
    private readonly teamsRestService: TeamsRestService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    console.log(this.id);

    this.teamsRestService
      .getTeams({ companyId: this.id })
      .pipe(
        tap((teams) => {
          console.log(teams);
          this.teams = teams;
        }),
      )
      .subscribe();

    forkJoin({
      company: this.companiesRestService.getCompanyById(this.id),
      users: this.usersRestService.getUsersFiltered({ companyId: this.id }),
    })
      .pipe(
        tap(({ company, users }) => {
          this.company = company;
          this.users = users;
          console.log(this.users);
          this.pageCount = Math.ceil(this.users.length / this.pageSize);
          this.refreshUsers();
        }),
      )
      .subscribe();
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
