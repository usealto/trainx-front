import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminCompaniesComponent } from './components/admin-companies/admin-companies.component';
import { AdminMenuComponent } from './components/admin-layout/admin-menu/admin-menu.component';
import { AdminCompanyUsersComponent } from './components/admin-company-users/admin-company-users.component';
import { AdminUserCreateComponent } from './components/admin-user-create/admin-user-create.component';
import { AdminUserCreateFormComponent } from './components/admin-user-create/admin-user-create-form/admin-user-create-form.component';
import { AdminUsersUploadComponent } from './components/admin-users-upload/admin-users-upload.component';
import { SharedModule } from '../modules/shared/shared.module';
import { AdminUnauthorizedComponent } from './components/admin-unauthorized/admin-unauthorized.component';
import { AdminCompaniesCreateComponent } from './components/admin-companies-create/admin-companies-create.component';
import { AdminHeaderComponent } from './components/admin-shared/admin-header/admin-header.component';
import { AdminUsersUploadFormComponent } from './components/admin-companies-create/admin-users-upload-form/admin-users-upload-form.component';
import { EditUserUploadFormComponent } from './components/admin-companies-create/edit-user-upload-form/edit-user-upload-form.component';
import { AdminCompaniesFiltersListComponent } from './components/admin-companies/admin-companies-filters-list/admin-companies-filters-list.component';
import { ShowRawDataModalComponent } from './components/admin-company-user/show-raw-data-modal/show-raw-data-modal.component';
import { AdminUsersFiltersListComponent } from './components/admin-company-users/admin-users-filters-list/admin-users-filters-list.component';
import { AdminCompanyQuestionsComponent } from './components/admin-company-questions/admin-company-questions.component';
import { AdminUploadQuestionsModalComponent } from './components/admin-company-questions/admin-upload-questions-modal/admin-upload-questions-modal.component';
import { AdminCompanyUserComponent } from './components/admin-company-user/admin-company-user.component';
import { Role2colorPipe } from './roleColor.pipe';
import { Role2BackgroundColor } from './roleBackgroundColor.pipe';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminCompaniesComponent,
    AdminMenuComponent,
    AdminCompanyUsersComponent,
    AdminUserCreateComponent,
    AdminUserCreateFormComponent,
    AdminUsersUploadComponent,
    AdminUnauthorizedComponent,
    AdminCompaniesCreateComponent,
    AdminHeaderComponent,
    AdminUsersUploadFormComponent,
    EditUserUploadFormComponent,
    AdminCompaniesFiltersListComponent,
    ShowRawDataModalComponent,
    AdminUsersFiltersListComponent,
    AdminCompanyQuestionsComponent,
    AdminUploadQuestionsModalComponent,
    AdminCompanyUserComponent,
    Role2colorPipe,
    Role2BackgroundColor
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    SharedModule,
  ],
  exports: [Role2colorPipe, Role2BackgroundColor],
})
export class AdminModule {}
