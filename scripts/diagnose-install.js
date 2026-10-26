#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Diagnostic Report for Package Installation\n');
console.log('='.repeat(60));

// Check Node/npm versions
try {
  const { execSync } = await import('child_process');
  const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
  const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
  console.log(`✅ Node.js: ${nodeVersion}`);
  console.log(`✅ npm: ${npmVersion}\n`);
} catch (e) {
  console.log(`❌ Could not check Node/npm versions: ${e.message}\n`);
}

// Check package.json
const packageJsonPath = join(rootDir, 'package.json');
if (existsSync(packageJsonPath)) {
  console.log('✅ package.json exists');
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const hasPostprocessing = packageJson.dependencies?.postprocessing;
    const hasThree = packageJson.dependencies?.three;
    const hasTypesThree = packageJson.devDependencies?.['@types/three'];
    
    console.log(`   postprocessing: ${hasPostprocessing ? `✅ listed (${hasPostprocessing})` : '❌ NOT listed'}`);
    console.log(`   three: ${hasThree ? `✅ listed (${hasThree})` : '❌ NOT listed'}`);
    console.log(`   @types/three: ${hasTypesThree ? `✅ listed (${hasTypesThree})` : '❌ NOT listed'}\n`);
  } catch (e) {
    console.log(`   ❌ Error reading package.json: ${e.message}\n`);
  }
} else {
  console.log('❌ package.json NOT FOUND\n');
}

// Check package-lock.json
const packageLockPath = join(rootDir, 'package-lock.json');
if (existsSync(packageLockPath)) {
  console.log('✅ package-lock.json exists');
  try {
    const packageLock = JSON.parse(readFileSync(packageLockPath, 'utf-8'));
    const lockHasPostprocessing = packageLock.packages?.['node_modules/postprocessing'];
    const lockHasThree = packageLock.packages?.['node_modules/three'];
    
    console.log(`   postprocessing in lock: ${lockHasPostprocessing ? '✅ YES' : '❌ NO'}`);
    console.log(`   three in lock: ${lockHasThree ? '✅ YES' : '❌ NO'}\n`);
  } catch (e) {
    console.log(`   ⚠️  Could not parse package-lock.json: ${e.message}\n`);
  }
} else {
  console.log('⚠️  package-lock.json NOT FOUND (this is OK if npm install hasn\'t run)\n');
}

// Check node_modules
const nodeModulesPath = join(rootDir, 'node_modules');
if (existsSync(nodeModulesPath)) {
  console.log('✅ node_modules directory exists');
  
  const requiredPackages = ['postprocessing', 'three', '@types/three'];
  console.log('\n📦 Package Installation Status:');
  console.log('-'.repeat(60));
  
  for (const pkg of requiredPackages) {
    const pkgPath = join(nodeModulesPath, pkg);
    const installed = existsSync(pkgPath);
    const status = installed ? '✅ INSTALLED' : '❌ NOT INSTALLED';
    console.log(`   ${pkg.padEnd(20)} ${status}`);
  }
  
  console.log('-'.repeat(60));
} else {
  console.log('❌ node_modules directory NOT FOUND\n');
}

console.log('\n' + '='.repeat(60));
console.log('\n💡 Next Steps:');
console.log('   1. Run: npm install');
console.log('   2. If that fails, try: npm cache clean --force && npm install');
console.log('   3. Verify with: node scripts/check-deps.js');
console.log('');

