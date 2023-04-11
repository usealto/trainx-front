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

  constructor(private readonly companiesRestService: CompaniesRestService, private readonly usersRestService:UsersRestService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    
    this.usersRestService.getUsers()
    .pipe(
      tap((users) => this.users = users)
    )
    .subscribe();
  }
}