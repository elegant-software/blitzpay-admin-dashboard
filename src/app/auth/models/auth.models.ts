export type AuthStatus = 'initializing' | 'authenticated' | 'anonymous' | 'accessDenied' | 'error';

export type AccessResolution =
  | 'authorized'
  | 'pending'
  | 'role-missing'
  | 'social-unlinked'
  | 'account-conflict'
  | 'provider-error'
  | 'config-error';

export interface AuthEnvironmentConfig {
  authorityUrl: string;
  realm: string;
  clientId: string;
  redirectPath: string;
  postLogoutRedirectPath: string;
  silentCheckSsoPath: string;
  scopes: readonly string[];
  requiredRoles: readonly string[];
  apiBaseUrls: readonly string[];
}

export interface AuthRuntimeConfig extends AuthEnvironmentConfig {
  redirectUri: string;
  postLogoutRedirectUri: string;
  silentCheckSsoRedirectUri: string;
}

export interface AuthSession {
  status: AuthStatus;
  accessResolution: AccessResolution;
  subjectId: string | null;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  identityProvider: string | null;
  linkedProviders: string[];
  roles: string[];
  requiredRoles: string[];
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshEligible: boolean;
  returnUrl: string | null;
  lastErrorCode: string | null;
  registrationStatus: string | null;
}

export const DEFAULT_AUTH_SESSION: AuthSession = {
  status: 'initializing',
  accessResolution: 'provider-error',
  subjectId: null,
  displayName: null,
  email: null,
  emailVerified: false,
  identityProvider: null,
  linkedProviders: [],
  roles: [],
  requiredRoles: [],
  accessToken: null,
  accessTokenExpiresAt: null,
  refreshEligible: false,
  returnUrl: null,
  lastErrorCode: null,
  registrationStatus: null
};
