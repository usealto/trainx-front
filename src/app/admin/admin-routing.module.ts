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
import { AdminUsersUploadComponent } from './components/admin-users-upload/admin-users-upload.component';
import { AdminUnauthorizedComponent } from './components/admin-unauthorized/admin-unauthorized.component';
import { AdminCompaniesCreateComponent } from './components/admin-companies-create/admin-companies-create.component';
import { AdminCompanyQuestionsComponent } from './components/admin-company-questions/admin-company-questions.component';

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
        path: 'companies/create',
        component: AdminCompaniesCreateComponent,
      },
      {
        path: 'companies/:id',
        component: AdminCompaniesCreateComponent,
      },
      {
        path: 'companies/:id/users',
        component: AdminCompanyUsersComponent,
      },
      {
        path: 'companies/:id/questions',
        component: AdminCompanyQuestionsComponent,
      },
      {
        path: 'companies/:companyId/users/create',
        component: AdminUserCreateComponent,
      },
      {
        path: 'companies/:companyId/users/:userId',
        component: AdminUserCreateComponent,
      },
      {
        path: 'companies/:id/users/upload',
        component: AdminUsersUploadComponent,
      },
      {
        path: 'users',
        component: AdminUsersComponent,
      },
      {
        path: 'users/:id',
        component: AdminUserComponent,
      },
      {
        path: 'unauthorized',
        component: AdminUnauthorizedComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
