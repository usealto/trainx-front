import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import {
  CompaniesApiService,
  CompanyDtoApi,
  CreateCompanyDtoApi,
  CompanyDtoResponseApi,
  PatchCompanyDtoApi,
  DeleteResponseApi,
} from '@usealto/sdk-ts-angular';
import { ProfileStore } from '../../profile/profile.store';
import { CompaniesStore } from '../companies.store';
import { Company } from 'src/app/models/company.model';

@Injectable({
  providedIn: 'root',
})
export class CompaniesRestService {
  constructor(
    private readonly companyApi: CompaniesApiService,
    private readonly userStore: ProfileStore,
    private readonly companiesStore: CompaniesStore,
  ) {}

  getCompanyById(id: string): Observable<Company | undefined> {
    return this.companyApi
      .getCompanyById({ id })
      .pipe(map(({ data }) => (data ? Company.fromDto(data) : undefined)));
  }

  // à supprimer
  getMyCompany(): Observable<Company> {
    return this.companyApi.getCompanyById({ id: this.userStore.user.value.companyId }).pipe(
      map((company) => Company.fromDto(company.data as CompanyDtoApi)),
    );
  }

  patchCompany(id: string, patchCompanyDtoApi: PatchCompanyDtoApi): Observable<Company> {
    return this.companyApi
      .patchCompany({ id, patchCompanyDtoApi })
      .pipe(map(({ data }) => (Company.fromDto(data as CompanyDtoApi))));
  }

  createCompany(createCompanyDtoApi: CreateCompanyDtoApi) {
    return this.companyApi.createCompany({ createCompanyDtoApi });
  }

  deleteCompany(id: string): Observable<DeleteResponseApi> {
    return this.companyApi.deleteCompany({ id });
  }
}
