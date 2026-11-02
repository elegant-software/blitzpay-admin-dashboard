#!/bin/sh
set -eu

# Public app identities only. STOREFRONT_HOST is supplied by blitzpay-domains;
# association responses themselves contain paths and app IDs, not hostnames.
target=/usr/share/nginx/html/.well-known
mkdir -p "$target"
printf '%s\n' '[]' > "$target/assetlinks.json"

applinks='{"apps":[],"details":[]}'
appclips='[]'

if [ -n "${SHOPPER_IOS_APP_ID:-}" ]; then
  printf '%s' "$SHOPPER_IOS_APP_ID" | grep -Eq '^[A-Z0-9]{10}\.[A-Za-z0-9.-]+$' || { echo 'Invalid SHOPPER_IOS_APP_ID' >&2; exit 1; }
  applinks=$(printf '{"apps":[],"details":[{"appID":"%s","paths":["/order/*"]}]}' "$SHOPPER_IOS_APP_ID")
fi

if [ -n "${SHOPPER_IOS_APP_CLIP_ID:-}" ]; then
  printf '%s' "$SHOPPER_IOS_APP_CLIP_ID" | grep -Eq '^[A-Z0-9]{10}\.[A-Za-z0-9.-]+$' || { echo 'Invalid SHOPPER_IOS_APP_CLIP_ID' >&2; exit 1; }
  appclips=$(printf '["%s"]' "$SHOPPER_IOS_APP_CLIP_ID")
fi

printf '{"applinks":%s,"appclips":{"apps":%s}}\n' "$applinks" "$appclips" > "$target/apple-app-site-association"

if [ -n "${SHOPPER_ANDROID_PACKAGE:-}" ] || [ -n "${SHOPPER_ANDROID_SHA256:-}" ]; then
  printf '%s' "${SHOPPER_ANDROID_PACKAGE:-}" | grep -Eq '^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$' || { echo 'Invalid SHOPPER_ANDROID_PACKAGE' >&2; exit 1; }
  # Comma-separated release signing certificate fingerprints (support rotation).
  printf '%s' "${SHOPPER_ANDROID_SHA256:-}" | grep -Eq '^([A-Fa-f0-9]{2}:){31}[A-Fa-f0-9]{2}(,([A-Fa-f0-9]{2}:){31}[A-Fa-f0-9]{2})*$' || { echo 'Invalid SHOPPER_ANDROID_SHA256' >&2; exit 1; }
  fingerprints=$(printf '%s' "$SHOPPER_ANDROID_SHA256" | sed 's/,/","/g')
  printf '[{"relation":["delegate_permission/common.handle_all_urls"],"target":{"namespace":"android_app","package_name":"%s","sha256_cert_fingerprints":["%s"]},"relation_extensions":{"delegate_permission/common.handle_all_urls":{"dynamic_app_link_components":[{"/":"/order/*"},{"/":"*","exclude":true}]}}}]\n' \
    "$SHOPPER_ANDROID_PACKAGE" "$fingerprints" > "$target/assetlinks.json"
fi
