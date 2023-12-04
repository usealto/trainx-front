import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  CompaniesApiService,
  ApplicationsApiService,
  UsersApiService,
  UserDtoApi,
} from '@usealto/the-office-sdk-angular';
import * as FromRoot from '../../../core/store/store.reducer';
import { Observable, map, switchMap, tap, withLatestFrom } from 'rxjs';
import { TheOfficeCompany } from '../../../models/theoffice-company.model';
import { CompanyDtoApi } from '@usealto/the-office-sdk-angular';
import { User } from '../../../models/user.model';
import { Company } from '../../../models/company.model';

@Injectable({
  providedIn: 'root',
})
export class LicensesRestService {
  constructor(
    private store: Store<FromRoot.AppState>,
    private readonly compagniesApi: CompaniesApiService,
    private readonly applicationsApi: ApplicationsApiService,
    private readonly usersApi: UsersApiService,
  ) {}

  getLicences(company: Company): Observable<TheOfficeCompany> {
    return this.compagniesApi
      .getCompanyById({ id: company.theOfficeId })
      .pipe(map(({ data: company }) => TheOfficeCompany.fromDto(company as CompanyDtoApi)));
  }

  getApplications(): void {
    this.applicationsApi.applicationsControllerGetAllPaginated({}).subscribe((applications) => {
      console.log('applications', applications);
    });
  }

  getUsersMap(trainxUsersMails: string[]): Observable<Map<string, boolean>> {
    return this.usersApi
      .getUsers({
        emails: trainxUsersMails.join(','),
      })
      .pipe(
        map(({ data: users }) => {
          return new Map((users as any[]).map(({ email, license }) => [email, !!license.length]));
        }),
      );
  }
}
