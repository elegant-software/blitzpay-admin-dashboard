export const MERCHANT_ENVIRONMENTS = [
    { key: 'local', label: 'Local', baseUrl: 'http://localhost:8080' },
    { key: 'staging', label: 'Staging', baseUrl: 'https://api-blitzpay-staging.elegantsoftware.de' }
];
export function getEnvironmentByKey(key) {
    return MERCHANT_ENVIRONMENTS.find((env) => env.key === key) ?? MERCHANT_ENVIRONMENTS[0];
}
export function buildApiBaseUrl(environment, apiVersion) {
    const cleanedVersion = apiVersion.trim().replace(/^\/+|\/+$/g, '');
    return `${environment.baseUrl}/${cleanedVersion}`;
}
