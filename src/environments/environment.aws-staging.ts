export const environment = {
  defaultEnvironmentKey: 'aws-staging' as const,
  auth: {
    authorityUrl: 'https://auth.zackpay.de',
    realm: 'blitzpay',
    clientId: 'blitzpay-admin-dashboard',
    redirectPath: '/',
    postLogoutRedirectPath: '/auth/login',
    silentCheckSsoPath: '/silent-check-sso.html',
    scopes: ['openid', 'profile', 'email'],
    requiredRoles: ['blitzpay-admin'],
    apiBaseUrls: ['https://api.zackpay.de', 'https://api-blitzpay-staging.zackpay.de']
  }
};
