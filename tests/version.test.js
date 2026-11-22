import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

test('Version Consistency: package.json, package-lock.json, and vendor/phaser.min.js agree on 3.90.0', () => {
  const EXPECTED_VERSION = '3.90.0';

  // 1. package.json
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(pkg.dependencies?.phaser, EXPECTED_VERSION, 'package.json dependencies.phaser must be pinned exact to 3.90.0 without carets');

  // 2. package-lock.json
  const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
  const rootDepVersion = lock.packages?.['']?.dependencies?.phaser;
  const installedVersion = lock.packages?.['node_modules/phaser']?.version;
  assert.equal(rootDepVersion, EXPECTED_VERSION, 'package-lock.json root dependency must match 3.90.0');
  assert.equal(installedVersion, EXPECTED_VERSION, 'package-lock.json node_modules/phaser version must match 3.90.0');

  // 3. vendor/phaser.min.js version string
  const vendorContent = fs.readFileSync('vendor/phaser.min.js', 'utf8');
  const match = vendorContent.match(/VERSION:"([^"]+)"/) || vendorContent.match(/VERSION='([^']+)'/);
  assert.ok(match, 'vendor/phaser.min.js must contain a VERSION definition');
  assert.equal(match[1], EXPECTED_VERSION, 'vendor/phaser.min.js VERSION string must equal 3.90.0');

  // 4. Checksum parity between vendor/phaser.min.js and node_modules/phaser/dist/phaser.min.js
  if (fs.existsSync('node_modules/phaser/dist/phaser.min.js')) {
    const vendorHash = crypto.createHash('sha256').update(fs.readFileSync('vendor/phaser.min.js')).digest('hex');
    const npmHash = crypto.createHash('sha256').update(fs.readFileSync('node_modules/phaser/dist/phaser.min.js')).digest('hex');
    assert.equal(vendorHash, npmHash, 'vendor/phaser.min.js must be bit-for-bit identical to node_modules/phaser/dist/phaser.min.js');
  }
});
