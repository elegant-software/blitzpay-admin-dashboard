import { runtimeConfig } from '../../environments/runtime-config';
import { BackendEnvironment, EnvironmentKey } from '../models/merchant-catalog.models';

const k8sApiUrl = `https://${runtimeConfig.apiHost}`;
const storefrontUrl = `https://${runtimeConfig.storefrontHost}`;

export const MERCHANT_ENVIRONMENTS: readonly BackendEnvironment[] = [
  { key: 'local', label: 'Local', baseUrl: 'http://localhost:8080', storefrontUrl: (runtimeConfig.localStorefrontUrl ?? 'http://localhost:4201').replace(/\/+$/, '') },
  { key: 'k8s-staging', label: 'K8s Staging', baseUrl: k8sApiUrl, storefrontUrl },
  { key: 'aws-staging', label: 'AWS Staging', baseUrl: k8sApiUrl, storefrontUrl }
] as const;

export function getEnvironmentByKey(key: EnvironmentKey): BackendEnvironment {
  return MERCHANT_ENVIRONMENTS.find((env) => env.key === key) ?? MERCHANT_ENVIRONMENTS[0];
}

export function buildApiBaseUrl(environment: BackendEnvironment, apiVersion: string): string {
  const cleanedVersion = apiVersion.trim().replace(/^\/+|\/+$/g, '');
  return `${environment.baseUrl}/${cleanedVersion}`;
}
