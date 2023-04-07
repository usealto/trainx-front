import { DeleteResponseApi } from './../../../sdk/model/deleteResponse';
import { CompanyResponseApi } from './../../../sdk/model/companyResponse';
import { PatchCompanyDtoApi } from './../../../sdk/model/patchCompanyDto';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CompaniesApiService, GetCompaniesRequestParams, CompanyApi, CreateCompanyDtoApi } from 'src/app/sdk';

@Injectable({
  providedIn: 'root'
})
export class CompaniesRestService {
  
    constructor(private readonly companyApi: CompaniesApiService) {}

    getCompanies(req?: GetCompaniesRequestParams): Observable<CompanyApi[]> {
      return this.companyApi.getCompanies({ ...req}).pipe(map((companies) => companies.data ?? []));
    }

    getCompanyById(id: string): Observable<CompanyApi> {
      return this.companyApi.getCompanyById({ id }).pipe(map((company) => company.data ?? ({} as CompanyApi)));
    }

    patchCompany(id: string, patchCompanyDtoApi: PatchCompanyDtoApi): Observable<CompanyResponseApi> {
      return this.companyApi.patchCompany({ id, patchCompanyDtoApi });
    }

    createCompany(createCompanyDtoApi: CreateCompanyDtoApi) {
      return this.companyApi.createCompany({ createCompanyDtoApi });
    }

    deleteCompany(id: string): Observable<DeleteResponseApi> {
      return this.companyApi.deleteCompany({ id });
    }
}
