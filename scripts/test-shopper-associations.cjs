const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'projects/blitz-pay-web/deploy/40-storefront-links.sh'), 'utf8').replace(/\r\n/g, '\n');
const isolatedScript = script.replace('target=/usr/share/nginx/html/.well-known', 'target="$SHOPPER_TEST_OUTPUT"');
assert.notEqual(isolatedScript, script, 'The generator output location must be isolated from the host filesystem');
const gitRoot = process.platform === 'win32'
  ? path.resolve(execFileSync('git', ['--exec-path'], { encoding: 'utf8' }).trim(), '../../..')
  : null;
const shell = process.env.BASH_BIN || (gitRoot ? path.join(gitRoot, 'bin/bash.exe') : '/bin/sh');
const fingerprint = Array(32).fill('AB').join(':');

function generate(config = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'blitzpay-links-'));
  try {
    const result = spawnSync(shell, ['-c', isolatedScript], {
      encoding: 'utf8',
      env: { ...process.env, SHOPPER_IOS_APP_ID: '', SHOPPER_ANDROID_PACKAGE: '', SHOPPER_ANDROID_SHA256: '', ...config, SHOPPER_TEST_OUTPUT: directory.replace(/\\/g, '/') },
    });
    if (result.error) throw result.error;
    const read = name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
    return { status: result.status, stderr: result.stderr, android: read('assetlinks.json'), ios: read('apple-app-site-association') };
  } finally {
    assert.equal(path.dirname(directory), path.resolve(os.tmpdir()));
    assert.ok(path.basename(directory).startsWith('blitzpay-links-'));
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test('no app identity means no accidental website association', () => {
  const result = generate();
  assert.equal(result.status, 0);
  assert.deepEqual(result.android, []);
  assert.deepEqual(result.ios.applinks.details, []);
});

test('Android association retains the real package, certificate rotation and Table paths', () => {
  const second = Array(32).fill('CD').join(':');
  const result = generate({ SHOPPER_ANDROID_PACKAGE: 'app.blitzpay.mobile', SHOPPER_ANDROID_SHA256: fingerprint + ',' + second });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.android[0].target.package_name, 'app.blitzpay.mobile');
  assert.deepEqual(result.android[0].target.sha256_cert_fingerprints, [fingerprint, second]);
  assert.ok(result.android[0].relation.includes('delegate_permission/common.handle_all_urls'));
  const rules = result.android[0].relation_extensions['delegate_permission/common.handle_all_urls'].dynamic_app_link_components;
  assert.ok(rules.some(rule => rule['/'] === '/t/*'));
  assert.ok(rules.some(rule => rule['/'] === '*' && rule.exclude === true));
});

test('iOS association matches the supplied signing team/bundle identity and Tables', () => {
  const result = generate({ SHOPPER_IOS_APP_ID: 'ABCDE12345.app.blitzpay.mobile' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.ios.applinks.details[0].appID, 'ABCDE12345.app.blitzpay.mobile');
  assert.ok(result.ios.applinks.details[0].paths.includes('/t/*'));
});

for (const config of [
  { SHOPPER_ANDROID_PACKAGE: 'app.blitzpay.mobile' },
  { SHOPPER_ANDROID_SHA256: fingerprint },
  { SHOPPER_ANDROID_PACKAGE: 'app.blitzpay.mobile', SHOPPER_ANDROID_SHA256: 'TODO' },
  { SHOPPER_IOS_APP_ID: 'TODO_TEAM_ID.app.blitzpay.mobile' },
]) {
  test('reject incomplete or placeholder signing configuration: ' + JSON.stringify(config), () => {
    assert.notEqual(generate(config).status, 0);
  });
}

test('verification URLs bypass SPA and service-worker navigation fallbacks', () => {
  const nginx = fs.readFileSync(path.join(root, 'nginx/storefront.conf'), 'utf8');
  const location = nginx.match(/location \^~ \/\.well-known\/\s*\{([^}]+)\}/)?.[1] || '';
  assert.match(location, /default_type application\/json/);
  assert.match(location, /try_files \$uri =404/);
  assert.doesNotMatch(location, /index\.html|proxy_pass|return 30/);
  const worker = JSON.parse(fs.readFileSync(path.join(root, 'projects/blitz-pay-web/ngsw-config.json'), 'utf8'));
  assert.ok(worker.navigationUrls.includes('!/.well-known/**'));
});


test('browser handoff text includes intact German and Arabic translations', () => {
  const rows = fs.readFileSync(path.join(root, 'projects/blitz-pay-web/src/app/i18n/storefront-translations.ts'), 'utf8');
  assert.ok(rows.includes('Shopper-App \u00f6ffnen'.replace(/\\u([0-9a-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))));
  const arabic = '\u0627\u0641\u062a\u062d \u062a\u0637\u0628\u064a\u0642 \u0627\u0644\u0645\u062a\u0633\u0648\u0642'.replace(/\\u([0-9a-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  assert.ok(rows.includes(arabic));
});
