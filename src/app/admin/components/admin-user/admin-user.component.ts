import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { CompanyApi, UserApi } from 'src/app/sdk';

@Component({
  selector: 'alto-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.scss']
})

export class AdminUserComponent implements OnInit {
  user!: UserApi;
  id: string | undefined;
  userForm: any;


  constructor(private readonly companiesRestService: CompaniesRestService, private readonly usersRestService:UsersRestService, private route: ActivatedRoute, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    
    
    this.usersRestService.getUsers({ids: this.id})
    .pipe(
      tap((users) => {if(users[0]){ this.user = users[0] }} )
    )
    .subscribe();

    this.userForm = this.formBuilder.group({
      name: '',
    });

  }

  submit() {
    // console.log(this.userForm.value);
    // update the user with the userFrom value using the userRestService
    this.usersRestService.updateUser(this.user.id, this.userForm.value)
    // refresh the getUsers() call if necessary ? TODO
    
  }
}