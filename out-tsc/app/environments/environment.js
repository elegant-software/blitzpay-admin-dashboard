export const environment = {
    defaultEnvironmentKey: 'local',
    auth: {
        authorityUrl: 'https://keycloak.elegantsoftware.de',
        realm: 'blitzpay',
        clientId: 'blitzpay-admin-dashboard',
        redirectPath: '/',
        postLogoutRedirectPath: '/auth/login',
        silentCheckSsoPath: '/silent-check-sso.html',
        scopes: ['openid', 'profile', 'email'],
        requiredRoles: ['blitzpay-admin'],
        apiBaseUrls: ['http://localhost:8080', 'https://api-blitzpay-staging.elegantsoftware.de']
    }
};
