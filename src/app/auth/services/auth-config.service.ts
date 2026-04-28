import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthEnvironmentConfig, AuthRuntimeConfig } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthConfigService {
  private readonly config = this.createRuntimeConfig(environment.auth);

  get runtimeConfig(): AuthRuntimeConfig {
    return this.config;
  }

  isProtectedApiRequest(url: string): boolean {
    return this.config.apiBaseUrls.some((baseUrl) => url.startsWith(baseUrl));
  }

  toAbsoluteUrl(path: string): string {
    return new URL(path, window.location.origin).toString();
  }

  private createRuntimeConfig(config: AuthEnvironmentConfig): AuthRuntimeConfig {
    const authorityUrl = this.normalizeAuthority(config.authorityUrl);

    return {
      ...config,
      authorityUrl,
      redirectUri: this.toAbsoluteUrl(config.redirectPath),
      postLogoutRedirectUri: this.toAbsoluteUrl(config.postLogoutRedirectPath),
      silentCheckSsoRedirectUri: this.toAbsoluteUrl(config.silentCheckSsoPath),
      apiBaseUrls: config.apiBaseUrls.map((apiBaseUrl) => apiBaseUrl.replace(/\/+$/g, ''))
    };
  }

  private normalizeAuthority(authorityUrl: string): string {
    const trimmed = authorityUrl.trim().replace(/\/+$/g, '');

    if (!trimmed) {
      throw new Error('Missing Keycloak authorityUrl');
    }

    return trimmed;
  }
}
