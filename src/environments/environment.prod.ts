export const environment = {
  defaultEnvironmentKey: 'staging' as const,
  auth: {
    authorityUrl: 'https://keycloak.elegantsoftware.de',
    realm: 'blitzpay',
    clientId: 'blitzpay-admin-dashboard',
    redirectPath: '/',
    postLogoutRedirectPath: '/auth/login',
    silentCheckSsoPath: '/silent-check-sso.html',
    scopes: ['openid', 'profile', 'email'],
    requiredRoles: ['blitzpay-admin'],
    apiBaseUrls: ['https://api-blitzpay-staging.elegantsoftware.de']
  }
};
