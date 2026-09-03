/**
 * @file Version bumper automation script.
 * Synchronizes and increments semantic versions across package.json, 
 * Tauri configuration, and Rust Cargo manifest files.
 */
import fs from 'fs';
import path from 'path';

/**
 * Command-line arguments passed to the script.
 * @type {string[]}
 */
const args = process.argv.slice(2);

/**
 * The target version increment type ('patch', 'minor', or 'major').
 * @type {string}
 */
const type = args[0] || 'patch';

/**
 * Computes the new semantic version based on the existing package.json version.
 */
const packagePath = path.resolve('package.json');
const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

/**
 * Array of version segments [major, minor, patch].
 * @type {number[]}
 */
let parts = packageContent.version.split('.').map(Number);

if (type === 'major') {
  parts[0]++;
  parts[1] = 0;
  parts[2] = 0;
} else if (type === 'minor') {
  parts[1]++;
  parts[2] = 0;
} else {
  parts[2]++; // patch by default
}

/**
 * The newly calculated semantic version string.
 * @type {string}
 */
const newVersion = parts.join('.');

// Update package.json version
packageContent.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2) + '\n');
console.log(`[package.json] -> v${newVersion}`);

// Update Tauri configuration version
const tauriConfPath = path.resolve('src-tauri/tauri.conf.json');
const tauriConfContent = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
tauriConfContent.version = newVersion;
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConfContent, null, 2) + '\n');
console.log(`[src-tauri/tauri.conf.json] -> v${newVersion}`);

// Update Rust Cargo manifest version
const cargoPath = path.resolve('src-tauri/Cargo.toml');
let cargoContent = fs.readFileSync(cargoPath, 'utf8');

/**
 * Regular expression to target the version entry within the [package] block of Cargo.toml.
 * @type {RegExp}
 */
const cargoVersionRegex = /(^\[package\][\s\S]*?version\s*=\s*")[^"]+(")/m;

if (cargoVersionRegex.test(cargoContent)) {
  cargoContent = cargoContent.replace(cargoVersionRegex, `$1${newVersion}$2`);
  fs.writeFileSync(cargoPath, cargoContent, 'utf8');
  console.log(`[src-tauri/Cargo.toml] -> v${newVersion}`);
} else {
  console.warn('[Warning] Could not automatically locate version field inside Cargo.toml');
}

console.log(`\nVersion successfully updated to v${newVersion} in all files!`);