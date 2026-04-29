import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStateService } from '../services/auth-state.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.css'
})
export class AccessDeniedComponent implements OnInit {
  readonly session$;
  reason = 'role-missing';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly authState: AuthStateService
  ) {
    this.session$ = this.authState.session$;
  }

  ngOnInit(): void {
    this.reason = this.route.snapshot.queryParamMap.get('reason') || this.authService.resolveAccessDeniedReason();
  }

  get title(): string {
    switch (this.reason) {
      case 'registration-pending':
        return 'Registration submitted';
      case 'social-unlinked':
        return 'Social identity needs review';
      case 'account-conflict':
        return 'Account match needs support';
      case 'config-error':
        return 'Authentication configuration incomplete';
      case 'provider-error':
        return 'Identity provider unavailable';
      default:
        return 'Access not yet granted';
    }
  }

  get description(): string {
    switch (this.reason) {
      case 'registration-pending':
        return 'Your identity is valid, but admin access is still pending approval. Check with the operations team before retrying.';
      case 'social-unlinked':
        return 'Your social account signed in successfully, but it is not linked to an approved admin record yet.';
      case 'account-conflict':
        return 'Multiple admin records match this verified identity. Support review is required before access can be granted.';
      case 'config-error':
        return 'The dashboard is missing required Keycloak realm or client settings for this environment.';
      case 'provider-error':
        return 'The hosted sign-in service is temporarily unavailable. Retry shortly.';
      default:
        return 'You signed in successfully, but your account does not have the required admin role for this dashboard.';
    }
  }

  async signOut(): Promise<void> {
    await this.authService.logout();
  }

  async retrySignIn(): Promise<void> {
    await this.authService.login('/');
  }

  async continueRegistration(): Promise<void> {
    await this.authService.register('/');
  }

  backToLogin(): void {
    void this.router.navigate(['/auth/login']);
  }
}
