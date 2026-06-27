export const environment = {
  defaultEnvironmentKey: 'aws-staging' as const,
  auth: {
    authorityUrl: 'https://auth.elegantsoftware.de',
    realm: 'blitzpay',
    clientId: 'blitzpay-admin-dashboard',
    redirectPath: '/',
    postLogoutRedirectPath: '/auth/login',
    silentCheckSsoPath: '/silent-check-sso.html',
    scopes: ['openid', 'profile', 'email'],
    requiredRoles: ['blitzpay-admin'],
    apiBaseUrls: ['https://api.elegantsoftware.de', 'https://api-blitzpay-staging.elegantsoftware.de']
  }
};
