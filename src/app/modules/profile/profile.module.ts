import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './components/profile/profile.component';
import { ProfileAccountComponent } from './components/profile-account/profile-account.component';
import { ProfilePasswordComponent } from './components/profile-password/profile-password.component';

@NgModule({
  declarations: [ProfileComponent, ProfileAccountComponent, ProfilePasswordComponent],
  imports: [CommonModule, ProfileRoutingModule, SharedModule],
})
export class ProfileModule {}
