import { Routes } from '@angular/router';
import { HomeComponent } from './components/navbar/home/home.component';
import { LoginComponent } from './components/navbar/auth/login.component';
import { AdminComponent } from './admin/admin.component';
import { EmployeeDashboardComponent } from './components/navbar/employee/employee-dashboard.component';
import { MyEnrollmentsComponent } from './components/navbar/employee/my-enrollments.component';
import { ManagerDashboardComponent } from './components/navbar/manager/manager-dashboard.component';
import { AdminUsersComponent } from './admin/admin-users.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  

  {
    path: 'employee',
    component: EmployeeDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Employee'] }
  },
  {
    path: 'my-enrollments',
    component: MyEnrollmentsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Employee'] }
  },

  {
    path: 'manager',
    component: ManagerDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Manager'] }
  },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrator'] }
  },

  // fallback
  { path: '**', redirectTo: '' }
];
