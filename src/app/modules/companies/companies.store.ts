import { Injectable } from '@angular/core';
import { Store } from 'src/app/core/utils/store/store';
import { CompanyDtoApi } from 'src/app/sdk';

@Injectable({ providedIn: 'root' })
export class CompaniesStore {
  myCompany: Store<CompanyDtoApi> = new Store<CompanyDtoApi>();
}
