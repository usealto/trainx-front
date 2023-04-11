import { AdminCompaniesComponent } from './components/admin-companies/admin-companies.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminCompanyComponent } from './components/admin-company/admin-company.component';
import { AdminCompanyUsersComponent } from './components/admin-company-users/admin-company-users.component';
import { AdminUserComponent } from './components/admin-user/admin-user.component';
import { AdminUserCreateComponent } from './components/admin-user-create/admin-user-create.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';

const routes: Routes = [
  {
    path: '',
    // adding a layout to this route called AdminLayoutComponent
    // this layout will be used for all the routes under this path
    component: AdminLayoutComponent,
    children: [
      {
        path: 'home',
        component: AdminHomeComponent,
      },
      {
        path: 'companies',
        component: AdminCompaniesComponent,
      },
      {
        path: 'companies/:id',
        component: AdminCompanyComponent,
      },
      {
        path: 'companies/:id/users',
        component: AdminCompanyUsersComponent,
      },
      {
        path: 'companies/:id/users/create',
        component: AdminUserCreateComponent,
      },
      {
        path: 'users',
        component: AdminUsersComponent,
      },
      {
        path: 'users/:id',
        component: AdminUserComponent,
      }      
    ]


  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
