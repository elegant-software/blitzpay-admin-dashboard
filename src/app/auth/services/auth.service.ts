import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import Keycloak, { KeycloakProfile, KeycloakTokenParsed } from 'keycloak-js';
import { AuthConfigService } from './auth-config.service';
import { AuthStateService } from './auth-state.service';
import { AccessResolution, AuthRuntimeConfig, AuthSession } from '../models/auth.models';

type TokenClaims = KeycloakTokenParsed & Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak: Keycloak | null = null;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(
    private readonly authConfig: AuthConfigService,
    private readonly authState: AuthStateService,
    private readonly router: Router
  ) {}

  initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initializeInternal();
    return this.initializationPromise;
  }

  get snapshot(): AuthSession {
    return this.authState.snapshot;
  }

  async login(returnUrl?: string): Promise<void> {
    console.log('[auth] login() called', {
      returnUrl
    });
    const keycloak = await this.ensureKeycloak();
    const redirectUri = this.buildRedirectUri(returnUrl);
    console.log('[auth] login() redirectUri resolved', {
      redirectUri,
      realm: this.authConfig.runtimeConfig.realm,
      clientId: this.authConfig.runtimeConfig.clientId
    });

    this.authState.patch({
      returnUrl: this.normalizeReturnUrl(returnUrl)
    });

    try {
      await keycloak.login({
        redirectUri
      });
      console.log('[auth] login() redirect started');
    } catch (error) {
      console.error('[auth] login() failed before redirect', error);
      throw error;
    }
  }

  async register(returnUrl?: string): Promise<void> {
    console.log('[auth] register() called', {
      returnUrl
    });
    const keycloak = await this.ensureKeycloak();
    const redirectUri = this.buildRedirectUri(returnUrl);
    console.log('[auth] register() redirectUri resolved', {
      redirectUri,
      realm: this.authConfig.runtimeConfig.realm,
      clientId: this.authConfig.runtimeConfig.clientId
    });

    this.authState.patch({
      returnUrl: this.normalizeReturnUrl(returnUrl)
    });

    try {
      await keycloak.register({
        redirectUri
      });
      console.log('[auth] register() redirect started');
    } catch (error) {
      console.error('[auth] register() failed before redirect', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    console.log('[auth] logout() called');
    const redirectUri = this.authConfig.runtimeConfig.postLogoutRedirectUri;

    try {
      const keycloak = await this.ensureKeycloak();
      this.authState.reset();
      this.authState.patch({
        status: 'anonymous',
        accessResolution: 'provider-error'
      });

      console.log('[auth] logout() redirectUri resolved', {
        redirectUri
      });

      const logoutUrl = keycloak.createLogoutUrl({
        redirectUri
      });

      console.log('[auth] logout() redirect started', {
        logoutUrl
      });

      window.location.assign(logoutUrl);
      return;
    } catch (error) {
      console.error('[auth] logout() failed, falling back to local login route', error);
      this.authState.reset();
      this.authState.patch({
        status: 'anonymous',
        accessResolution: 'provider-error',
        lastErrorCode: 'logout_failed'
      });
      await this.router.navigate(['/auth/login'], {
        queryParams: {
          error: 'logout-failed'
        }
      });
      throw error;
    }
  }

  async ensureValidToken(): Promise<string | null> {
    const keycloak = await this.ensureKeycloak();

    if (!keycloak.authenticated || !keycloak.token) {
      return null;
    }

    try {
      await keycloak.updateToken(30);
      this.applyAuthenticatedState(keycloak);
      return keycloak.token ?? null;
    } catch (error) {
      this.handleProviderError('token_refresh_failed');
      throw error;
    }
  }

  async handleUnauthorizedResponse(): Promise<void> {
    this.authState.patch({
      status: 'anonymous',
      accessResolution: 'provider-error',
      accessToken: null,
      accessTokenExpiresAt: null,
      lastErrorCode: 'api_unauthorized'
    });

    await this.router.navigate(['/auth/login'], {
      queryParams: {
        returnUrl: this.normalizeReturnUrl(this.router.url),
        error: 'session-expired'
      }
    });
  }

  async handleForbiddenResponse(): Promise<void> {
    this.authState.patch({
      status: 'accessDenied',
      accessResolution: 'role-missing',
      lastErrorCode: 'api_forbidden'
    });

    await this.router.navigate(['/auth/access-denied'], {
      queryParams: {
        reason: 'role-missing'
      }
    });
  }

  navigationForProtectedRoute(url: string): NavigationExtras {
    return {
      queryParams: {
        returnUrl: this.normalizeReturnUrl(url)
      }
    };
  }

  resolveAccessDeniedReason(): string {
    const session = this.authState.snapshot;

    switch (session.accessResolution) {
      case 'pending':
        return 'registration-pending';
      case 'social-unlinked':
        return 'social-unlinked';
      case 'account-conflict':
        return 'account-conflict';
      case 'config-error':
        return 'config-error';
      case 'provider-error':
        return 'provider-error';
      case 'role-missing':
      default:
        return 'role-missing';
    }
  }

  private async initializeInternal(): Promise<void> {
    this.authState.patch({
      status: 'initializing',
      accessResolution: 'provider-error',
      lastErrorCode: null
    });

    try {
      console.log('[auth] starting Keycloak init', this.authConfig.runtimeConfig);
      const keycloak = this.createKeycloak(this.authConfig.runtimeConfig);
      this.bindCallbacks(keycloak);

      await keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        silentCheckSsoRedirectUri: this.authConfig.runtimeConfig.silentCheckSsoRedirectUri,
        redirectUri: window.location.href,
        checkLoginIframe: true,
        scope: this.authConfig.runtimeConfig.scopes.join(' ')
      });
      console.log('[auth] Keycloak init completed', {
        authenticated: keycloak.authenticated,
        subject: keycloak.subject ?? null
      });

      this.keycloak = keycloak;
      this.initialized = true;

      if (!keycloak.authenticated) {
        console.log('[auth] Keycloak init resolved anonymous session');
        this.authState.patch({
          status: 'anonymous',
          accessResolution: 'provider-error',
          accessToken: null,
          accessTokenExpiresAt: null,
          refreshEligible: false,
          roles: []
        });
        return;
      }

      this.applyAuthenticatedState(keycloak);
    } catch (error) {
      console.error('Keycloak initialization failed', error);
      this.handleConfigError('keycloak_init_failed');
    }
  }

  private createKeycloak(config: AuthRuntimeConfig): Keycloak {
    return new Keycloak({
      url: config.authorityUrl,
      realm: config.realm,
      clientId: config.clientId
    });
  }

  private bindCallbacks(keycloak: Keycloak): void {
    keycloak.onAuthLogout = () => {
      console.log('[auth] onAuthLogout');
      this.authState.patch({
        status: 'anonymous',
        accessResolution: 'provider-error',
        accessToken: null,
        accessTokenExpiresAt: null,
        refreshEligible: false,
        roles: []
      });
    };

    keycloak.onAuthError = (errorData) => {
      console.error('[auth] onAuthError', errorData);
      this.handleProviderError('auth_error');
    };
    keycloak.onAuthRefreshError = () => {
      console.error('[auth] onAuthRefreshError');
      this.handleProviderError('auth_refresh_error');
    };
    keycloak.onTokenExpired = () => {
      console.warn('[auth] onTokenExpired');
      void this.ensureValidToken().catch(() => undefined);
    };
  }

  private applyAuthenticatedState(keycloak: Keycloak): void {
    const claims = (keycloak.tokenParsed ?? {}) as TokenClaims;
    const roles = this.collectRoles(claims);
    const accessResolution = this.resolveAccessResolution(claims, roles);
    const displayName = this.resolveDisplayName(claims);
    const email = this.readStringClaim(claims, 'email');
    const emailVerified = Boolean(claims['email_verified']);
    const identityProvider = this.resolveIdentityProvider(claims);
    const linkedProviders = this.resolveLinkedProviders(claims, identityProvider);
    const profilePromise = keycloak.loadUserProfile().catch(() => null);

    void profilePromise.then((profile) => {
      const resolvedDisplayName = profile ? this.profileDisplayName(profile) : displayName;

      this.authState.patch({
        displayName: resolvedDisplayName
      });
    });

    this.authState.patch({
      status: accessResolution === 'authorized' ? 'authenticated' : 'accessDenied',
      accessResolution,
      subjectId: keycloak.subject ?? null,
      displayName,
      email,
      emailVerified,
      identityProvider,
      linkedProviders,
      roles,
      requiredRoles: [...this.authConfig.runtimeConfig.requiredRoles],
      accessToken: keycloak.token ?? null,
      accessTokenExpiresAt: this.resolveTokenExpiry(claims),
      refreshEligible: Boolean(keycloak.refreshToken),
      returnUrl: this.authState.snapshot.returnUrl,
      lastErrorCode: accessResolution === 'authorized' ? null : this.reasonToErrorCode(accessResolution),
      registrationStatus: this.resolveRegistrationStatus(claims)
    });
  }

  private resolveAccessResolution(claims: TokenClaims, roles: string[]): AccessResolution {
    const requiredRoles = this.authConfig.runtimeConfig.requiredRoles;
    const registrationStatus = this.resolveRegistrationStatus(claims);
    const identityProvider = this.resolveIdentityProvider(claims);
    const accountConflict = Boolean(claims['account_conflict'] || claims['account_match_conflict']);
    const socialUnlinked = Boolean(claims['social_unlinked'] || claims['link_required']);

    if (!requiredRoles.length || requiredRoles.some((role) => roles.includes(role))) {
      return 'authorized';
    }

    if (accountConflict) {
      return 'account-conflict';
    }

    if (socialUnlinked) {
      return 'social-unlinked';
    }

    if (registrationStatus && ['draft', 'submitted', 'pending', 'pendingreview', 'pending_review'].includes(registrationStatus)) {
      return 'pending';
    }

    if (identityProvider && identityProvider !== 'keycloak' && identityProvider !== 'local') {
      return 'social-unlinked';
    }

    return 'role-missing';
  }

  private collectRoles(claims: TokenClaims): string[] {
    const realmRoles = Array.isArray(claims.realm_access?.roles) ? claims.realm_access.roles : [];
    const resourceAccess = claims.resource_access as Record<string, { roles?: string[] }> | undefined;
    const clientRoles = resourceAccess
      ? Object.values(resourceAccess).flatMap((entry) => entry.roles ?? [])
      : [];

    return Array.from(new Set([...realmRoles, ...clientRoles]));
  }

  private resolveRegistrationStatus(claims: TokenClaims): string | null {
    const raw = this.readStringClaim(claims, 'registration_status')
      ?? this.readStringClaim(claims, 'registrationStatus')
      ?? this.readStringClaim(claims, 'access_status');

    return raw ? raw.toLowerCase().replace(/\s+/g, '') : null;
  }

  private resolveDisplayName(claims: TokenClaims): string | null {
    return (
      this.readStringClaim(claims, 'name')
      ?? this.readStringClaim(claims, 'preferred_username')
      ?? ([this.readStringClaim(claims, 'given_name'), this.readStringClaim(claims, 'family_name')].filter(Boolean).join(' ') || null)
    );
  }

  private resolveIdentityProvider(claims: TokenClaims): string | null {
    return this.readStringClaim(claims, 'identity_provider')
      ?? this.readStringClaim(claims, 'idp')
      ?? (claims.azp ? 'keycloak' : null);
  }

  private resolveLinkedProviders(claims: TokenClaims, identityProvider: string | null): string[] {
    const linked = claims['linked_identity_providers'];

    if (Array.isArray(linked)) {
      return linked.filter((value): value is string => typeof value === 'string');
    }

    return identityProvider ? [identityProvider] : [];
  }

  private resolveTokenExpiry(claims: TokenClaims): string | null {
    if (typeof claims.exp !== 'number') {
      return null;
    }

    return new Date(claims.exp * 1000).toISOString();
  }

  private profileDisplayName(profile: KeycloakProfile): string | null {
    const parts = [profile.firstName, profile.lastName].filter(Boolean);
    return parts.join(' ') || profile.username || profile.email || null;
  }

  private readStringClaim(claims: TokenClaims, key: string): string | null {
    const value = claims[key];
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private async ensureKeycloak(): Promise<Keycloak> {
    console.log('[auth] ensureKeycloak()');
    await this.initialize();

    if (!this.keycloak || !this.initialized) {
      console.error('[auth] ensureKeycloak() failed', {
        initialized: this.initialized,
        hasInstance: Boolean(this.keycloak)
      });
      throw new Error('Keycloak is not initialized');
    }

    console.log('[auth] ensureKeycloak() ready');
    return this.keycloak;
  }

  private buildRedirectUri(returnUrl?: string): string {
    return this.authConfig.toAbsoluteUrl(this.normalizeReturnUrl(returnUrl));
  }

  private normalizeReturnUrl(returnUrl?: string): string {
    if (!returnUrl || !returnUrl.startsWith('/')) {
      return '/';
    }

    if (returnUrl.startsWith('/auth/')) {
      return '/';
    }

    return returnUrl;
  }

  private handleProviderError(errorCode: string): void {
    console.error('[auth] provider error', {
      errorCode
    });
    this.authState.patch({
      status: 'error',
      accessResolution: 'provider-error',
      lastErrorCode: errorCode,
      accessToken: null,
      accessTokenExpiresAt: null
    });
  }

  private handleConfigError(errorCode: string): void {
    console.error('[auth] config error', {
      errorCode
    });
    this.authState.patch({
      status: 'error',
      accessResolution: 'config-error',
      lastErrorCode: errorCode,
      accessToken: null,
      accessTokenExpiresAt: null
    });
  }

  private reasonToErrorCode(reason: AccessResolution): string {
    switch (reason) {
      case 'pending':
        return 'registration_pending';
      case 'social-unlinked':
        return 'social_account_link_required';
      case 'account-conflict':
        return 'account_match_conflict';
      case 'config-error':
        return 'auth_config_invalid';
      case 'provider-error':
        return 'identity_provider_unavailable';
      case 'role-missing':
      default:
        return 'role_missing';
    }
  }
}
