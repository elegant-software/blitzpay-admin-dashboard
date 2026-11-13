// Hostnames set by public/config.js, which Kubernetes rewrites at container start
// from the blitzpay-domains ConfigMap (see docker/write-config.sh).
export interface RuntimeConfig {
  apiHost: string;
  authHost: string;
  /** Optional full Keycloak URL for local development (including protocol and port). */
  authUrl?: string;
  storefrontHost: string;
  /** Reachable storefront URL for local links and QR codes, including protocol and port. */
  localStorefrontUrl?: string;
  /** Release tag of this dashboard image (e.g. v2.26.0), written at container start from APP_VERSION. Absent locally. */
  version?: string;
}

const config = (window as { __BLITZPAY_CONFIG__?: RuntimeConfig }).__BLITZPAY_CONFIG__;

if (!config) {
  throw new Error('Missing runtime config: config.js must load before the app bundle');
}

export const runtimeConfig: RuntimeConfig = config;
