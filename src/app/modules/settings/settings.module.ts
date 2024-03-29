import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './components/settings/settings.component';
import { SettingsUsersComponent } from './components/settings-users/settings-users.component';
import { SettingsIntegrationsComponent } from './components/settings-integrations/settings-integrations.component';
import { AddUsersComponent } from './components/settings-users/add-users/add-users.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { FormsModule } from '@angular/forms';
import { LicensesPanelComponent } from './components/licenses-panel/licenses-panel.component';

@NgModule({
  declarations: [
    SettingsComponent,
    SettingsUsersComponent,
    SettingsIntegrationsComponent,
    AddUsersComponent,
    ConfirmationModalComponent,
    LicensesPanelComponent,
  ],
  imports: [CommonModule, SettingsRoutingModule, SharedModule, FormsModule],
})
export class SettingsModule {}
