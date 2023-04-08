import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminCompaniesComponent } from './components/admin-companies/admin-companies.component';
import { AdminCompanyComponent } from './components/admin-company/admin-company.component';
import { AdminMenuComponent } from './components/admin-layout/admin-menu/admin-menu.component';

@NgModule({
  declarations: [AdminHomeComponent, AdminLayoutComponent, AdminCompaniesComponent, AdminCompanyComponent, AdminMenuComponent],
  imports: [CommonModule, AdminRoutingModule, FormsModule, ReactiveFormsModule],
})
export class AdminModule {}
