import { Injectable } from '@angular/core';
import { CompaniesApiService, CompanyDtoApi, PatchCompanyDtoApi } from '@usealto/sdk-ts-angular';
import { Observable, map } from 'rxjs';
import { Company } from 'src/app/models/company.model';

@Injectable({
  providedIn: 'root',
})
export class CompaniesRestService {
  constructor(private readonly companyApi: CompaniesApiService) {}

  getCompanyById(id: string): Observable<Company | undefined> {
    return this.companyApi
      .getCompanyById({ id })
      .pipe(map(({ data }) => (data ? Company.fromDto(data) : undefined)));
  }

  patchCompany(id: string, patchCompanyDtoApi: PatchCompanyDtoApi): Observable<Company> {
    return this.companyApi
      .patchCompany({ id, patchCompanyDtoApi })
      .pipe(map(({ data }) => Company.fromDto(data as CompanyDtoApi)));
  }
}
