import { Routes } from '@angular/router';
import { AccessDeniedComponent } from './auth/components/access-denied.component';
import { AuthShellComponent } from './auth/components/auth-shell.component';
import { LoginPageComponent } from './auth/components/login-page.component';
import { authGuard } from './auth/guards/auth.guard';

export const appRoutes: Routes = [
  {
    path: 'auth/login',
    component: LoginPageComponent
  },
  {
    path: 'auth/access-denied',
    component: AccessDeniedComponent
  },
  {
    path: 'stripe-connect/return',
    canActivate: [authGuard],
    loadComponent: () => import('./stripe-connect/stripe-connect-return.component').then(m => m.StripeConnectReturnComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    component: AuthShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./platform-kpi-dashboard/platform-kpi-dashboard.component').then(m => m.PlatformKpiDashboardComponent)
      },
      {
        path: 'merchants',
        loadComponent: () => import('./merchant-catalog/merchant-catalog.component').then(m => m.MerchantCatalogComponent)
      },
      {
        path: 'merchants/:id',
        loadComponent: () => import('./merchant-catalog/merchant-detail.component').then(m => m.MerchantDetailComponent)
      },
      {
        path: 'merchants/:id/edit',
        loadComponent: () => import('./merchant-catalog/merchant-edit.component').then(m => m.MerchantEditComponent)
      },
      {
        path: 'merchants/:id/branches/:branchId/edit',
        loadComponent: () => import('./merchant-catalog/branch-edit.component').then(m => m.BranchEditComponent)
      },
      {
        path: 'merchants/:id/products/:productId/edit',
        loadComponent: () => import('./merchant-catalog/product-edit.component').then(m => m.ProductEditComponent)
      },
      {
        path: 'settlements',
        loadComponent: () => import('./settlements/settlement-reporting.component').then(m => m.SettlementReportingComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./appointments/appointments-shell.component').then(m => m.AppointmentsShellComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./appointments/appointment-management.component').then(m => m.AppointmentManagementComponent)
          },
          {
            path: 'calendar',
            loadComponent: () => import('./appointments/branch-calendar.component').then(m => m.BranchCalendarComponent)
          },
          {
            path: 'policy',
            loadComponent: () => import('./appointments/appointment-policy.component').then(m => m.AppointmentPolicyComponent)
          }
        ]
      },
      {
        path: 'user-management',
        loadComponent: () => import('./user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      { path: '**', redirectTo: 'dashboard' }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
