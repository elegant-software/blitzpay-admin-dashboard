// Public hostnames, loaded before the app bundle. In Kubernetes this file is overwritten at
// container start (docker/write-config.sh) from the blitzpay-domains ConfigMap, which the
// blitz-pay Helm chart derives from global.baseDomain. These values only serve local dev and tests.
window.__BLITZPAY_CONFIG__ = {
  apiHost: 'api-blitzpay-staging.zackpay.de',
  authHost: 'auth.zackpay.de',
  storefrontHost: 'storefront.zackpay.de'
};
