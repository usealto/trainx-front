import { Injectable } from '@angular/core';
import { Store } from 'src/app/core/utils/store/store';
import { CompanyDtoApi } from '@usealto/sdk-ts-angular';

@Injectable({ providedIn: 'root' })
export class CompaniesStore {
  myCompany: Store<CompanyDtoApi> = new Store<CompanyDtoApi>();
}
