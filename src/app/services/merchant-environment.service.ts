import { BackendEnvironment, EnvironmentKey } from '../models/merchant-catalog.models';

export const MERCHANT_ENVIRONMENTS: readonly BackendEnvironment[] = [
  { key: 'local', label: 'Local', baseUrl: 'http://localhost:8080', storefrontUrl: 'http://localhost:4201' },
  { key: 'k8s-staging', label: 'K8s Staging', baseUrl: 'https://api-blitzpay-staging.zackpay.de', storefrontUrl: 'https://blitz-pay-web.zackpay.de' },
  { key: 'aws-staging', label: 'AWS Staging', baseUrl: 'https://api.zackpay.de', storefrontUrl: 'https://blitz-pay-web.zackpay.de' }
] as const;

export function getEnvironmentByKey(key: EnvironmentKey): BackendEnvironment {
  return MERCHANT_ENVIRONMENTS.find((env) => env.key === key) ?? MERCHANT_ENVIRONMENTS[0];
}

export function buildApiBaseUrl(environment: BackendEnvironment, apiVersion: string): string {
  const cleanedVersion = apiVersion.trim().replace(/^\/+|\/+$/g, '');
  return `${environment.baseUrl}/${cleanedVersion}`;
}
