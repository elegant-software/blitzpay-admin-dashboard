import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStateService } from '../services/auth-state.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit {
  readonly session$;
  returnUrl = '/';
  errorMessage: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly authState: AuthStateService
  ) {
    this.session$ = this.authState.session$;
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.errorMessage = this.resolveErrorMessage(this.route.snapshot.queryParamMap.get('error'));
    console.log('[auth] login page init', {
      returnUrl: this.returnUrl,
      queryError: this.route.snapshot.queryParamMap.get('error'),
      session: this.authState.snapshot
    });

    const session = this.authState.snapshot;

    if (session.status === 'authenticated' && session.accessResolution === 'authorized') {
      void this.router.navigateByUrl(this.returnUrl);
    }
  }

  async signIn(): Promise<void> {
    console.log('[auth] signIn clicked', {
      returnUrl: this.returnUrl
    });
    try {
      await this.authService.login(this.returnUrl);
    } catch (error) {
      console.error('[auth] signIn failed', error);
      this.errorMessage = 'Sign-in could not be started. Check the console and Keycloak client settings.';
    }
  }

  async register(): Promise<void> {
    console.log('[auth] register clicked', {
      returnUrl: this.returnUrl
    });
    try {
      await this.authService.register(this.returnUrl);
    } catch (error) {
      console.error('[auth] register failed', error);
      this.errorMessage = 'Registration could not be started. Check the console and Keycloak client settings.';
    }
  }

  private resolveErrorMessage(errorCode: string | null): string | null {
    switch (errorCode) {
      case 'session-expired':
        return 'Your session expired. Sign in again to continue.';
      case 'keycloak_init_failed':
      case 'auth_config_invalid':
        return 'Authentication is not configured correctly yet. Update the Keycloak realm and client settings for this environment.';
      case 'auth_error':
      case 'auth_refresh_error':
      case 'token_refresh_failed':
        return 'The identity provider could not complete sign-in. Try again in a moment.';
      default:
        return null;
    }
  }
}
