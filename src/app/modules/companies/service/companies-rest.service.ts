import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import {
  CompaniesApiService,
  GetCompaniesRequestParams,
  CompanyDtoApi,
  CreateCompanyDtoApi,
  CompanyDtoResponseApi,
  PatchCompanyDtoApi,
  DeleteResponseApi,
} from '@usealto/sdk-ts-angular';
import { ProfileStore } from '../../profile/profile.store';
import { CompaniesStore } from '../companies.store';

@Injectable({
  providedIn: 'root',
})
export class CompaniesRestService {
  constructor(
    private readonly companyApi: CompaniesApiService,
    private readonly userStore: ProfileStore,
    private readonly companiesStore: CompaniesStore,
  ) {}

  getCompanies(req?: GetCompaniesRequestParams): Observable<CompanyDtoApi[]> {
    return this.companyApi.getCompanies({ ...req }).pipe(map((companies) => companies.data ?? []));
  }

  getCompanyById(id: string): Observable<CompanyDtoApi> {
    return this.companyApi
      .getCompanyById({ id })
      .pipe(map((company) => company.data ?? ({} as CompanyDtoApi)));
  }

  getMyCompany(): Observable<CompanyDtoApi> {
    if (this.companiesStore.myCompany.value) {
      return this.companiesStore.myCompany.value$;
    } else {
      return this.companyApi.getCompanyById({ id: this.userStore.user.value.companyId }).pipe(
        map((company) => company.data ?? ({} as CompanyDtoApi)),
        tap((comp) => (this.companiesStore.myCompany.value = comp)),
      );
    }
  }

  patchCompany(id: string, patchCompanyDtoApi: PatchCompanyDtoApi): Observable<CompanyDtoResponseApi> {
    return this.companyApi.patchCompany({ id, patchCompanyDtoApi });
  }

  createCompany(createCompanyDtoApi: CreateCompanyDtoApi) {
    return this.companyApi.createCompany({ createCompanyDtoApi });
  }

  deleteCompany(id: string): Observable<DeleteResponseApi> {
    return this.companyApi.deleteCompany({ id });
  }
}
