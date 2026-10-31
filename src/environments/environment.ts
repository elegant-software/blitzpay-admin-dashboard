import { runtimeConfig } from './runtime-config';

export const environment = {
  defaultEnvironmentKey: 'local' as const,
  auth: {
    authorityUrl: `https://${runtimeConfig.authHost}`,
    realm: 'blitzpay',
    clientId: 'blitzpay-admin-dashboard',
    redirectPath: '/',
    postLogoutRedirectPath: '/auth/login',
    silentCheckSsoPath: '/silent-check-sso.html',
    scopes: ['openid', 'profile', 'email'],
    requiredRoles: ['blitzpay-admin'],
    apiBaseUrls: ['http://localhost:8080', `https://${runtimeConfig.apiHost}`, 'https://api.zackpay.de']
  }
};
