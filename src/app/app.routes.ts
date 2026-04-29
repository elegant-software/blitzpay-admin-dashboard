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
    path: '',
    canActivate: [authGuard],
    component: AuthShellComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
