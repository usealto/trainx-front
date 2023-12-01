import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { AltoConnectorEnumApi, CompanyDtoApiConnectorEnumApi } from '@usealto/sdk-ts-angular';
import { switchMap, tap } from 'rxjs';
import { ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { CompaniesStore } from 'src/app/modules/companies/companies.store';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { environment } from '../../../../../environments/environment';
import { updateCompany } from '../../../../core/store/root/root.action';
import * as FromRoot from '../../../../core/store/store.reducer';
import { ToastService } from '../../../../core/toast/toast.service';
import { Company, ICompany } from '../../../../models/company.model';
import { TriggersService } from '../../services/triggers.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

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
  registerForm!: FormGroup;
  EmojiName = EmojiName;
  I18ns = I18ns;
  ModalType = ModalType;
  Connector = AltoConnectorEnumApi;

  company: Company = new Company({} as ICompany);

  nbUsers = 0;
  nbUsersConnectorInactive = 0;
  emailSent = false;
  disableBtn = false;

  isIntegrationEnabled = false;
  isConnectorActivated = false;

  isWebAppActivated = false;

  connector: AltoConnectorEnumApi = AltoConnectorEnumApi.Unknown;

  constructor(
    private modalService: NgbModal,
    private readonly companiesRestService: CompaniesRestService,
    private readonly companiesStore: CompaniesStore,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    private readonly toastService: ToastService,
    private readonly triggersService: TriggersService,
    private formBuilder: FormBuilder,
    private store: Store<FromRoot.AppState>,
  ) {}

  ngOnInit(): void {
    this.store.select(FromRoot.selectCompany).subscribe((company) => {
      this.company = company.data;
      this.isIntegrationEnabled = company.data.isIntegrationEnabled ?? false;
      this.isConnectorActivated = company.data.isConnectorActive ?? false;
      this.isWebAppActivated = company.data.usersHaveWebAccess ?? false;
      this.connector =
        company.data.connector === CompanyDtoApiConnectorEnumApi.Slack
          ? AltoConnectorEnumApi.Slack
          : company.data.connector === CompanyDtoApiConnectorEnumApi.GoogleChat
          ? AltoConnectorEnumApi.GoogleChat
          : AltoConnectorEnumApi.Unknown;
    });
    this.store.select(FromRoot.selectUsers).subscribe((users) => {
      this.nbUsers = users.data.size;
      this.nbUsersConnectorInactive = Array.from(users.data.values()).filter(
        (user) => !user.isConnectorActive,
      ).length;
    });

    //custom email validator
    this.registerForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
    });
  }

  validateModal(type: ModalType, toggle: boolean, e: any, connector = this.connector) {
    e.preventDefault();

    if (type === ModalType.ToggleConnector && toggle) {
      this.activateConnector(toggle);
      return;
    }

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

  activateConnector(isActivated: boolean): void {
    if (this.company?.id) {
      this.companiesRestService
        .patchCompany(this.company.id, { isIntegrationEnabled: isActivated })
        .pipe(
          tap((company) => {
            // Dispatch l'action updateCompany pour mettre à jour l'état dans NgRx
            this.store.dispatch(updateCompany({ company }));
          }),
          switchMap(() => this.store.select(FromRoot.selectCompany)),
          untilDestroyed(this),
        )
        .subscribe({
          next: ({ data: company }) => {
            this.company = company;
            this.isIntegrationEnabled = company.isIntegrationEnabled;
          },
        });
    }
  }

  activateWebApp(isActivated: boolean) {
    if (this.company?.id) {
      this.companiesRestService
        .patchCompany(this.company.id, { usersHaveWebAccess: isActivated })
        .pipe(
          tap((company) => {
            this.isWebAppActivated = isActivated;
            this.companiesStore.myCompany.value = company;
          }),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  changeConnector(connector: AltoConnectorEnumApi) {
    this.emailSent = false;
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
            this.companiesStore.myCompany.value = company;
          }),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  sendEmailSlackAuthorization() {
    this.disableBtn = true;
    this.triggersService.askSlackAuthorization(this.registerForm.get('email')?.value).subscribe({
      error: () => {
        this.toastService.show({
          text: I18ns.settings.continuousSession.integrations.slackSubtitle.slackError,
          type: 'danger',
        });
        this.disableBtn = false;
      },
      complete: () => {
        this.toastService.show({
          text: I18ns.settings.continuousSession.integrations.slackSubtitle.slackSuccess,
          type: 'success',
        });
        this.emailSent = true;
        this.disableBtn = false;
      },
    });
  }

  sendGchatInstruction() {
    this.emailSent = true;
    this.triggersService.sendGchatInstructions().subscribe({
      error: () => {
        this.toastService.show({
          text: I18ns.settings.continuousSession.integrations.gchatSubtitle.gchatError,
          type: 'danger',
        });
      },
      complete: () => {
        this.toastService.show({
          text: I18ns.settings.continuousSession.integrations.gchatSubtitle.gchatSuccess,
          type: 'success',
        });
      },
    });
  }

  openLinkSlack() {
    const url = environment.slackAuthorization + this.company?.id;
    window.open(url, '_blank');
  }

  isSlackActive(): boolean {
    return this.connector === AltoConnectorEnumApi.Slack && this.isConnectorActivated;
  }

  isSlackPending(): boolean {
    return this.connector === AltoConnectorEnumApi.Slack && !this.isConnectorActivated;
  }
}
