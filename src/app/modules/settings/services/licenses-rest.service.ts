import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { CompaniesApiService } from '@usealto/the-office-sdk-angular';
import * as FromRoot from '../../../core/store/store.reducer';
import { map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LicensesRestService {
  constructor(private store: Store<FromRoot.AppState>, private readonly compagniesApi: CompaniesApiService) {}

  getApplications(): void {
    this.store
      .select(FromRoot.selectCompany)
      .pipe(
        map((company) => company.data.theOfficeId),
        switchMap((theOfficeId) => this.compagniesApi.getCompanyById({ id: theOfficeId })),
      )
      .subscribe();
  }
}
