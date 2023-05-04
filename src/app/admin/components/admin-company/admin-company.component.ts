import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { CompanyDtoApi, UserDtoApi, UserDtoApiRolesEnumApi } from 'src/app/sdk';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'alto-admin-company',
  templateUrl: './admin-company.component.html',
  styleUrls: ['./admin-company.component.scss'],
})
export class AdminCompanyComponent implements OnInit {
  company!: CompanyDtoApi;
  users: UserDtoApi[] = [];
  id: string | undefined;
  companyForm: any;
  display = false;
  isImpersonnatedAsCompanyAdminOfthisCompany = false;

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private readonly usersRestService: UsersRestService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    this.companiesRestService
      .getCompanyById(this.id)
      .pipe(tap((company) => (this.company = company)))
      .pipe(
        tap(() => {
          this.companyForm = this.formBuilder.group({
            domain: [this.company.domain],
            name: [this.company.name],
            isSlackActive: [this.company.isSlackActive],
          });
        }),
      )
      .subscribe();

    this.usersRestService
      .getUsersFiltered({ companyId: this.id })
      .pipe(
        tap((users) => (this.users = users)),
        tap(() => this.isImpersonnatedAsCompanyAdminOfthisCompanyUpdate() )
        )
      .subscribe();
  }

  async submit() {
    // update the user with the userFrom value using the userRestService
    this.companiesRestService.patchCompany(this.company.id, this.companyForm.value).subscribe();

    // refresh after the API has time to implement the changes
    // first sleep 1 second
    await new Promise((f) => setTimeout(f, 1000));
    this.ngOnInit();
  }

  isImpersonnatedAsCompanyAdminOfthisCompanyUpdate() {
    const impersonatedUserEmail = localStorage.getItem('impersonatedUser');
    console.log(`temp test for ${impersonatedUserEmail} : users =`,this.users);

    if (impersonatedUserEmail) {
      const impersonatedUser = this.users.find((user) => user.email === impersonatedUserEmail);
      console.log('impersonatedUser',impersonatedUser);
      if (
        impersonatedUser &&
        impersonatedUser.companyId === this.id &&
        impersonatedUser.roles.includes('company-admin' as UserDtoApiRolesEnumApi)
      ) {
        this.isImpersonnatedAsCompanyAdminOfthisCompany = true;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
