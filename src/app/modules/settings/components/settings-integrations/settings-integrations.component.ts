import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { CompaniesStore } from 'src/app/modules/companies/companies.store';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { CompanyDtoApi } from '@usealto/sdk-ts-angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'alto-settings-integrations',
  templateUrl: './settings-integrations.component.html',
  styleUrls: ['./settings-integrations.component.scss'],
})
export class SettingsIntegrationsComponent implements OnInit {
  I18ns = I18ns;
  company?: CompanyDtoApi;

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private readonly companiesStore: CompaniesStore,
  ) {}

  ngOnInit(): void {
    this.companiesRestService
      .getMyCompany()
      .pipe(tap((comp) => (this.company = comp)))
      .subscribe();
  }

  slackActivate(isChecked: boolean) {
    if (this.company?.id) {
      this.companiesRestService
        .patchCompany(this.company?.id, { isSlackActive: isChecked })
        .pipe(
          tap((comp) => {
            if (comp.data) {
              this.companiesStore.myCompany.value = comp.data;
            }
          }),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }
}
