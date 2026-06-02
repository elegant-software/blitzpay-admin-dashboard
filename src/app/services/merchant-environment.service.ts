import { BackendEnvironment, EnvironmentKey } from '../models/merchant-catalog.models';

export const MERCHANT_ENVIRONMENTS: readonly BackendEnvironment[] = [
  { key: 'local', label: 'Local', baseUrl: 'http://localhost:8080', storefrontUrl: 'http://localhost:4201' },
  { key: 'staging', label: 'Staging', baseUrl: 'https://api-blitzpay-staging.elegantsoftware.de', storefrontUrl: 'https://pay.blitzpay.com' }
] as const;

export function getEnvironmentByKey(key: EnvironmentKey): BackendEnvironment {
  return MERCHANT_ENVIRONMENTS.find((env) => env.key === key) ?? MERCHANT_ENVIRONMENTS[0];
}

export function buildApiBaseUrl(environment: BackendEnvironment, apiVersion: string): string {
  const cleanedVersion = apiVersion.trim().replace(/^\/+|\/+$/g, '');
  return `${environment.baseUrl}/${cleanedVersion}`;
}
