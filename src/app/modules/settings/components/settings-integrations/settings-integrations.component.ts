import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { AltoConnectorEnumApi, CompanyDtoApiConnectorEnumApi } from '@usealto/sdk-ts-angular';
import { first, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { environment } from '../../../../../environments/environment';
import { updateCompany } from '../../../../core/store/root/root.action';
import * as FromRoot from '../../../../core/store/store.reducer';
import { ToastService } from '../../../../core/toast/toast.service';
import { Company } from '../../../../models/company.model';
import { User } from '../../../../models/user.model';
import { TriggersService } from '../../services/triggers.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

enum ModalType {
  ToggleConnector = 'toggleConnector',
  ToggleWebApp = 'toggleWebApp',
  ChangeConnector = 'changeConnector',
}

@Component({
  selector: 'alto-settings-integrations',
  templateUrl: './settings-integrations.component.html',
  styleUrls: ['./settings-integrations.component.scss'],
})
export class SettingsIntegrationsComponent implements OnInit {
  @Input() company!: Company;
  @Input() users!: User[];

  registerForm!: FormGroup;
  EmojiName = EmojiName;
  I18ns = I18ns;
  ModalType = ModalType;
  Connector = AltoConnectorEnumApi;
  environment = environment;

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
    private readonly toastService: ToastService,
    private readonly triggersService: TriggersService,
    private formBuilder: FormBuilder,
    private store: Store<FromRoot.AppState>,
  ) {}

  ngOnInit(): void {
    this.isIntegrationEnabled = this.company.isIntegrationEnabled ?? false;
    this.isConnectorActivated = this.company.isConnectorActive ?? false;
    this.isWebAppActivated = this.company.usersHaveWebAccess ?? false;
    this.connector =
      this.company.connector === CompanyDtoApiConnectorEnumApi.Slack
        ? AltoConnectorEnumApi.Slack
        : this.company.connector === CompanyDtoApiConnectorEnumApi.GoogleChat
        ? AltoConnectorEnumApi.GoogleChat
        : AltoConnectorEnumApi.Unknown;

    this.nbUsers = this.users.length;
    this.nbUsersConnectorInactive = this.users.filter((user) => !user.isConnectorActive).length;

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
            this.store.dispatch(updateCompany({ company }));
          }),
          switchMap(() => this.store.select(FromRoot.selectCompany)),
          first(),
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
            this.store.dispatch(updateCompany({ company }));
          }),
          switchMap(() => this.store.select(FromRoot.selectCompany)),
          first(),
        )
        .subscribe({
          next: ({ data: company }) => {
            this.company = company;
            this.isWebAppActivated = isActivated;
          },
        });
    }
  }

  changeConnector(connector: AltoConnectorEnumApi) {
    this.emailSent = false;
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
            this.store.dispatch(updateCompany({ company }));
          }),
          switchMap(() => this.store.select(FromRoot.selectCompany)),
          first(),
        )
        .subscribe({
          next: ({ data: company }) => {
            this.company = company;
            this.connector = connector;
          },
        });
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
    window.open(url);
  }

  isSlackActive(): boolean {
    return this.connector === AltoConnectorEnumApi.Slack && this.isConnectorActivated;
  }

  isSlackPending(): boolean {
    return this.connector === AltoConnectorEnumApi.Slack && !this.isConnectorActivated;
  }
}
