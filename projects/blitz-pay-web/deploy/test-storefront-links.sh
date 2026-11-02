#!/bin/sh
set -eu

script=/workspace/40-storefront-links.sh
test_dir=/usr/share/nginx/html/.well-known
aasa=$test_dir/apple-app-site-association

assert_contains() {
  grep -Fq "$2" "$1" || { echo "Expected '$2' in $1" >&2; exit 1; }
}

assert_not_contains() {
  if grep -Fq "$2" "$1"; then
    echo "Did not expect '$2' in $1" >&2
    exit 1
  fi
}

env -i PATH="$PATH" /bin/sh "$script"
assert_contains "$aasa" '"applinks":{"apps":[],"details":[]}'
assert_contains "$aasa" '"appclips":{"apps":[]}'

SHOPPER_IOS_APP_CLIP_ID=ABCDE12345.com.example.shopper.Clip /bin/sh "$script"
assert_contains "$aasa" '"applinks":{"apps":[],"details":[]}'
assert_contains "$aasa" '"appclips":{"apps":["ABCDE12345.com.example.shopper.Clip"]}'
assert_not_contains "$aasa" '"/m/*"'

SHOPPER_IOS_APP_ID=ABCDE12345.com.example.shopper \
  SHOPPER_IOS_APP_CLIP_ID=ABCDE12345.com.example.shopper.Clip \
  /bin/sh "$script"
assert_contains "$aasa" '"appID":"ABCDE12345.com.example.shopper","paths":["/order/*"]'
assert_contains "$aasa" '"appclips":{"apps":["ABCDE12345.com.example.shopper.Clip"]}'

if SHOPPER_IOS_APP_CLIP_ID=invalid /bin/sh "$script" 2>/dev/null; then
  echo 'Expected invalid App Clip ID to fail' >&2
  exit 1
fi

echo 'Storefront Apple association tests passed.'
