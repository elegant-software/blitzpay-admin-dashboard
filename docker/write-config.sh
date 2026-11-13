#!/bin/sh
# Runs from the nginx image's /docker-entrypoint.d/ at container start. Rewrites config.js
# from the API_HOST/AUTH_HOST/STOREFRONT_HOST env vars (blitzpay-domains ConfigMap), so the
# image carries no hostnames. Without those vars the built-in config.js is kept.
# version is the image's release tag (APP_VERSION, baked in by the Dockerfile build-arg).
set -eu

if [ -z "${API_HOST:-}" ] || [ -z "${AUTH_HOST:-}" ] || [ -z "${STOREFRONT_HOST:-}" ]; then
  echo "write-config: API_HOST/AUTH_HOST/STOREFRONT_HOST not set, keeping built-in config.js"
  exit 0
fi

cat > /usr/share/nginx/html/config.js <<CONFIG
window.__BLITZPAY_CONFIG__ = {
  apiHost: '${API_HOST}',
  authHost: '${AUTH_HOST}',
  storefrontHost: '${STOREFRONT_HOST}',
  version: '${APP_VERSION:-dev}'
};
CONFIG
echo "write-config: api=${API_HOST} auth=${AUTH_HOST} storefront=${STOREFRONT_HOST} version=${APP_VERSION:-dev}"
