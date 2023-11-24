import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AltoConnectorEnumApi, CompanyDtoApi, CompanyDtoApiConnectorEnumApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { CompaniesStore } from 'src/app/modules/companies/companies.store';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { ActivatedRoute } from '@angular/router';
import { EResolverData, ResolversService } from 'src/app/core/resolvers/resolvers.service';

enum ModalType {
  ToggleConnector = 'toggleConnector',
  ToggleWebApp = 'toggleWebApp',
  ChangeConnector = 'changeConnector',
}

@UntilDestroy()
@Component({
  selector: 'alto-settings-integrations',
  templateUrl: './settings-integrations.component.html',
  styleUrls: ['./settings-integrations.component.scss'],
})
export class SettingsIntegrationsComponent implements OnInit {
  I18ns = I18ns;
  ModalType = ModalType;
  Connector = AltoConnectorEnumApi;

  company?: CompanyDtoApi;

  isConnectorActivated = false;

  isWebAppActivated = false;

  connector: AltoConnectorEnumApi = AltoConnectorEnumApi.Unknown;

  constructor(
    private modalService: NgbModal,
    private readonly companiesRestService: CompaniesRestService,
    private readonly companiesStore: CompaniesStore,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.company = data[EResolverData.Company] as CompanyDtoApi;
    this.isConnectorActivated = this.company?.isConnectorActive ?? false;
    this.isWebAppActivated = this.company?.usersHaveWebAccess ?? false;
    this.connector =
      this.company?.connector === CompanyDtoApiConnectorEnumApi.Slack
        ? AltoConnectorEnumApi.Slack
        : this.company?.connector === CompanyDtoApiConnectorEnumApi.GoogleChat
        ? AltoConnectorEnumApi.GoogleChat
        : AltoConnectorEnumApi.Unknown;
  }

  validateModal(type: ModalType, toggle: boolean, e: any, connector = this.connector) {
    e.preventDefault();

    if (type !== ModalType.ChangeConnector || connector !== this.connector) {
      const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true, size: 'md' });
      const componentInstance = modalRef.componentInstance as ConfirmationModalComponent;
      if (type === ModalType.ToggleConnector) {
        componentInstance.title = !toggle
          ? I18ns.settings.continuousSession.integrations.modal.titles.desactivateConnector
          : I18ns.settings.continuousSession.integrations.modal.titles.activateConnector;
        componentInstance.subtitle = !toggle
          ? I18ns.settings.continuousSession.integrations.modal.subtitles.desactivateConnector
          : I18ns.settings.continuousSession.integrations.modal.subtitles.activateConnector;
        componentInstance.validBtn = !toggle
          ? I18ns.settings.continuousSession.integrations.modal.validBtns.desactivateConnector
          : I18ns.settings.continuousSession.integrations.modal.validBtns.activateConnector;
      } else if (type === ModalType.ToggleWebApp) {
        componentInstance.title = !toggle
          ? I18ns.settings.continuousSession.integrations.modal.titles.desactivateWebApp
          : I18ns.settings.continuousSession.integrations.modal.titles.activateWebApp;
        componentInstance.subtitle = !toggle
          ? I18ns.settings.continuousSession.integrations.modal.subtitles.desactivateWebApp
          : I18ns.settings.continuousSession.integrations.modal.subtitles.activateWebApp;
        componentInstance.validBtn = !toggle
          ? I18ns.settings.continuousSession.integrations.modal.validBtns.desactivateWebApp
          : I18ns.settings.continuousSession.integrations.modal.validBtns.activateWebApp;
      } else if (type === ModalType.ChangeConnector) {
        componentInstance.title = I18ns.settings.continuousSession.integrations.modal.titles.changeConnector;
        componentInstance.subtitle =
          I18ns.settings.continuousSession.integrations.modal.subtitles.changeConnector;
        componentInstance.validBtn =
          I18ns.settings.continuousSession.integrations.modal.validBtns.changeConnector;
      }

      componentInstance.next
        .pipe(
          tap((answer) => {
            modalRef.close();
            if (answer === 'next') {
              if (type === ModalType.ToggleConnector) {
                this.activateConnector(toggle);
              } else if (type === ModalType.ToggleWebApp) {
                this.activateWebApp(toggle);
              } else if (type === ModalType.ChangeConnector) {
                this.changeConnector(connector);
              }
            }
          }),
        )
        .subscribe();
    }
  }

  activateConnector(isActivated: boolean) {
    if (this.company?.id) {
      this.companiesRestService
        .patchCompany(this.company.id, { isConnectorActive: isActivated })
        .pipe(
          tap((company) => {
            this.isConnectorActivated = isActivated;
            if (company.data) {
              this.companiesStore.myCompany.value = company.data;
            }
          }),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  activateWebApp(isActivated: boolean) {
    if (this.company?.id) {
      this.companiesRestService
        .patchCompany(this.company.id, { usersHaveWebAccess: isActivated })
        .pipe(
          tap((company) => {
            this.isWebAppActivated = isActivated;
            if (company.data) {
              this.companiesStore.myCompany.value = company.data;
            }
          }),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  changeConnector(connector: AltoConnectorEnumApi) {
    this.connector = connector;
    if (this.company?.id) {
      this.companiesRestService
        .patchCompany(this.company.id, {
          connector:
            connector === AltoConnectorEnumApi.Slack
              ? AltoConnectorEnumApi.Slack
              : connector === AltoConnectorEnumApi.GoogleChat
              ? AltoConnectorEnumApi.GoogleChat
              : AltoConnectorEnumApi.Unknown,
        })
        .pipe(
          tap((company) => {
            if (company.data) {
              this.companiesStore.myCompany.value = company.data;
            }
          }),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }
}
