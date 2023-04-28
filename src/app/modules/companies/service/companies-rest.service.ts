import { DeleteResponseApi } from './../../../sdk/model/deleteResponse';
import { PatchCompanyDtoApi } from './../../../sdk/model/patchCompanyDto';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  CompaniesApiService,
  GetCompaniesRequestParams,
  CompanyDtoApi,
  CreateCompanyDtoApi,
  CompanyDtoResponseApi,
} from 'src/app/sdk';

@Injectable({
  providedIn: 'root',
})
export class CompaniesRestService {
  constructor(private readonly companyApi: CompaniesApiService) {}

  getCompanies(req?: GetCompaniesRequestParams): Observable<CompanyDtoApi[]> {
    return this.companyApi.getCompanies({ ...req }).pipe(map((companies) => companies.data ?? []));
  }

  getCompanyById(id: string): Observable<CompanyDtoApi> {
    return this.companyApi
      .getCompanyById({ id })
      .pipe(map((company) => company.data ?? ({} as CompanyDtoApi)));
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
