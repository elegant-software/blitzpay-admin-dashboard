// Hostnames set by public/config.js, which Kubernetes rewrites at container start
// from the blitzpay-domains ConfigMap (see docker/write-config.sh).
export interface RuntimeConfig {
  apiHost: string;
  authHost: string;
  storefrontHost: string;
}

const config = (window as { __BLITZPAY_CONFIG__?: RuntimeConfig }).__BLITZPAY_CONFIG__;

if (!config) {
  throw new Error('Missing runtime config: config.js must load before the app bundle');
}

export const runtimeConfig: RuntimeConfig = config;
