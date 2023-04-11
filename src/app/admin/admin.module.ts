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

@NgModule({
  declarations: [AdminHomeComponent, AdminLayoutComponent, AdminCompaniesComponent, AdminCompanyComponent, AdminMenuComponent, AdminCompanyUsersComponent, AdminUserComponent, AdminUserCreateComponent, AdminUserCreateFormComponent, AdminUsersComponent],
  imports: [CommonModule, AdminRoutingModule, FormsModule, ReactiveFormsModule],
})
export class AdminModule {}
