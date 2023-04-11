import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UserApi } from 'src/app/sdk';

@Component({
  selector: 'alto-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})

export class AdminUsersComponent implements OnInit {
  users: UserApi[] = [];
  id: string | undefined;
  usersCount = 0;
  usersPage = 1;
  usersPageSize = 10;

  constructor(private readonly companiesRestService: CompaniesRestService, private readonly usersRestService:UsersRestService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.changeUsersPage()
  }

  changeUsersPage() {    
    this.usersRestService.getUsersPaginated({page: this.usersPage, itemsPerPage: this.usersPageSize})
    .pipe(
      tap((q) => (this.users = q.data ?? [])),
      tap((q) => (this.usersCount = q.meta.totalItems ?? 0))
    )
    .subscribe();
  }
}