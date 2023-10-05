import { AdminCompaniesComponent } from './components/admin-companies/admin-companies.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminCompanyUsersComponent } from './components/admin-company-users/admin-company-users.component';
import { AdminUserCreateComponent } from './components/admin-user-create/admin-user-create.component';
import { AdminUsersUploadComponent } from './components/admin-users-upload/admin-users-upload.component';
import { AdminUnauthorizedComponent } from './components/admin-unauthorized/admin-unauthorized.component';
import { AdminCompaniesCreateComponent } from './components/admin-companies-create/admin-companies-create.component';
import { AdminCompanyQuestionsComponent } from './components/admin-company-questions/admin-company-questions.component';
import { AdminCompanyUserComponent } from './components/admin-company-user/admin-company-user.component';
import { canAccessAdmin } from './admin.guard';

const routes: Routes = [
  {
    path: '',
    // adding a layout to this route called AdminLayoutComponent
    // this layout will be used for all the routes under this path
    component: AdminLayoutComponent,
    canActivate: [canAccessAdmin],
    children: [
      {
        path: 'home',
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
        component: AdminCompanyUserComponent,
      },
      {
        path: 'companies/:companyId/users/:userId/edit',
        component: AdminUserCreateComponent,
      },
      {
        path: 'companies/:id/users/upload',
        component: AdminUsersUploadComponent,
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      }
    ],
  },
  {
    path: 'unauthorized',
    component: AdminUnauthorizedComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
