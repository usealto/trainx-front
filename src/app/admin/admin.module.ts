import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminCompaniesComponent } from './components/admin-companies/admin-companies.component';
import { AdminCompanyComponent } from './components/admin-company/admin-company.component';
import { AdminMenuComponent } from './components/admin-layout/admin-menu/admin-menu.component';
import { AdminCompanyUsersComponent } from './components/admin-company-users/admin-company-users.component';
import { AdminUserComponent } from './components/admin-user/admin-user.component';
import { AdminUserCreateComponent } from './components/admin-user-create/admin-user-create.component';
import { AdminUserCreateFormComponent } from './components/admin-user-create/admin-user-create-form/admin-user-create-form.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminUsersUploadComponent } from './components/admin-users-upload/admin-users-upload.component';
import { SharedModule } from '../modules/shared/shared.module';
import { AdminUnauthorizedComponent } from './components/admin-unauthorized/admin-unauthorized.component';
import { AdminCompaniesCreateComponent } from './components/admin-companies-create/admin-companies-create.component';
import { AdminHeaderComponent } from './components/admin-shared/admin-header/admin-header.component';
import { AdminTabsComponent } from './components/admin-shared/admin-tabs/admin-tabs.component';
import { AdminTabComponent } from './components/admin-shared/admin-tabs/admin-tab.component';
import { AdminUsersUploadFormComponent } from './components/admin-companies-create/admin-users-upload-form/admin-users-upload-form.component';
import { EditUserUploadFormComponent } from './components/admin-companies-create/edit-user-upload-form/edit-user-upload-form.component';
import { ApiInterceptor } from '../core/interceptors/api.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AdminCompaniesFiltersListComponent } from './components/admin-companies/admin-companies-filters-list/admin-companies-filters-list.component';

@NgModule({
  declarations: [
    AdminHomeComponent,
    AdminLayoutComponent,
    AdminCompaniesComponent,
    AdminCompanyComponent,
    AdminMenuComponent,
    AdminCompanyUsersComponent,
    AdminUserComponent,
    AdminUserCreateComponent,
    AdminUserCreateFormComponent,
    AdminUsersComponent,
    AdminUsersUploadComponent,
    AdminUnauthorizedComponent,
    AdminCompaniesCreateComponent,
    AdminHeaderComponent,
    AdminTabsComponent,
    AdminTabComponent,
    AdminUsersUploadFormComponent,
    EditUserUploadFormComponent,
    AdminCompaniesFiltersListComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    SharedModule,
  ],
})
export class AdminModule {}
