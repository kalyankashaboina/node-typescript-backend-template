#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// ── Colours (no dependencies) ─────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  cyan:   '\x1b[36m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
};

const ok    = (msg) => console.log(`${c.green}  ok${c.reset}  ${msg}`);
const info  = (msg) => console.log(`${c.cyan}  --${c.reset}  ${msg}`);
const warn  = (msg) => console.log(`${c.yellow}  !!${c.reset}  ${msg}`);
const error = (msg) => console.log(`${c.red}  xx${c.reset}  ${msg}`);
const step  = (msg) => console.log(`\n${c.bold}${msg}${c.reset}`);

// ── Argument: project name ────────────────────────────────────────────────────
const projectName = process.argv[2];

console.log('');
console.log(`${c.bold}${c.cyan}  create-node-ts-api${c.reset}`);
console.log(`${c.dim}  Production-ready Node.js + TypeScript REST API${c.reset}`);
console.log('');

if (!projectName) {
  error('Please provide a project name:');
  console.log('');
  console.log('    npx create-node-ts-api my-api');
  console.log('');
  process.exit(1);
}

if (!/^[a-z0-9-_]+$/i.test(projectName)) {
  error(`Invalid project name: "${projectName}"`);
  console.log('  Use only letters, numbers, hyphens, and underscores.');
  process.exit(1);
}

// ── Target directory ──────────────────────────────────────────────────────────
const targetDir = path.resolve(process.cwd(), projectName);

if (fs.existsSync(targetDir)) {
  error(`Directory "${projectName}" already exists.`);
  console.log('  Choose a different name or delete the existing folder.');
  process.exit(1);
}

// ── Check Node version ────────────────────────────────────────────────────────
const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajor < 18) {
  error(`Node.js >= 18 is required. You have v${process.versions.node}`);
  console.log('  Download the latest LTS at https://nodejs.org');
  process.exit(1);
}

// ── Template source (inside this npm package) ─────────────────────────────────
const templateDir = path.join(__dirname, '..', 'template');

// ── Files to skip when copying ────────────────────────────────────────────────
const SKIP = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.git',
]);

// ── Recursive copy ────────────────────────────────────────────────────────────
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src)) {
    if (SKIP.has(entry)) continue;

    const srcPath  = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat     = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ── Rename gitignore (npm strips .gitignore on publish) ──────────────────────
function fixGitignore(dir) {
  const from = path.join(dir, 'gitignore');
  const to   = path.join(dir, '.gitignore');
  if (fs.existsSync(from)) fs.renameSync(from, to);
}

// ── Update package.json with project name ────────────────────────────────────
function updatePackageJson(dir, name) {
  const pkgPath = path.join(dir, 'package.json');
  const pkg     = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  pkg.name        = name;
  pkg.version     = '0.0.1';
  pkg.description = '';
  delete pkg.author;
  delete pkg.repository;
  delete pkg.keywords;
  delete pkg.bugs;
  delete pkg.homepage;

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

// ── Check npm / git availability ──────────────────────────────────────────────
function hasCommand(cmd) {
  try { execSync(`${cmd} --version`, { stdio: 'ignore' }); return true; }
  catch { return false; }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

step('Creating your project...');

// 1. Copy template
info(`Scaffolding into ./${projectName}`);
copyDir(templateDir, targetDir);
fixGitignore(targetDir);
updatePackageJson(targetDir, projectName);
ok('Project files created');

// 2. Create .env
const envExample = path.join(targetDir, '.env.example');
const envFile    = path.join(targetDir, '.env');
if (fs.existsSync(envExample) && !fs.existsSync(envFile)) {
  fs.copyFileSync(envExample, envFile);
  ok('.env created from .env.example');
}

// 3. Install dependencies
step('Installing dependencies...');
try {
  execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
  ok('Dependencies installed');
} catch {
  warn('npm install failed — run it manually inside the project folder');
}

// 4. Git init
step('Initializing git...');
if (hasCommand('git')) {
  try {
    execSync('git init',                          { cwd: targetDir, stdio: 'ignore' });
    execSync('git config user.name "kalyankashaboina"',          { cwd: targetDir, stdio: 'ignore' });
    execSync('git config user.email "kalyankashaboina07@gmail.com"', { cwd: targetDir, stdio: 'ignore' });
    execSync('git add .',                         { cwd: targetDir, stdio: 'ignore' });
    execSync('git commit -m "chore: init from create-node-ts-api"', { cwd: targetDir, stdio: 'ignore' });
    ok('Git repository initialized');
  } catch {
    warn('Git init failed — run it manually');
  }
} else {
  warn('Git not found — skipping git init');
}

// 5. Done — print next steps
console.log('');
console.log(`${c.green}${c.bold}  Done! Your project is ready.${c.reset}`);
console.log('');
console.log('  Next steps:');
console.log('');
console.log(`${c.cyan}    cd ${projectName}${c.reset}`);
console.log(`${c.cyan}    npm run dev${c.reset}`);
console.log('');
console.log('  Then open:');
console.log('');
console.log(`    API    ->  http://localhost:5000/api/v1/users`);
console.log(`    Docs   ->  http://localhost:5000/api-docs`);
console.log(`    Health ->  http://localhost:5000/health`);
console.log('');
