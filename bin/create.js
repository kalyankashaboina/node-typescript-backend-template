#!/usr/bin/env node

'use strict';

const path         = require('path');
const fs           = require('fs');
const { execSync } = require('child_process');
const readline     = require('readline');

// ─────────────────────────────────────────────────────────────────────────────
// Colours
// ─────────────────────────────────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',  bold:   '\x1b[1m',  dim:    '\x1b[2m',
  green:  '\x1b[32m', cyan:   '\x1b[36m', yellow: '\x1b[33m',
  red:    '\x1b[31m', blue:   '\x1b[34m', gray:   '\x1b[90m',
  white:  '\x1b[97m', bg:     '\x1b[100m',
};

// Windows CMD/PowerShell can't render multi-byte Unicode — use ASCII fallbacks
const isWin = process.platform === 'win32';
const S = {
  tick:   isWin ? 'OK'  : '✓',
  cross:  isWin ? 'X'   : '✖',
  warn:   isWin ? '!'   : '▲',
  dot:    isWin ? '>'   : '◆',
  bar:    isWin ? '|'   : '│',
  pass:   isWin ? '  '  : '  ',
};

// ─────────────────────────────────────────────────────────────────────────────
// Renderer helpers
// ─────────────────────────────────────────────────────────────────────────────
const ln     = ()    => process.stdout.write('\n');
const write  = (s)   => process.stdout.write(s);
const writeln= (s)   => process.stdout.write(s + '\n');

function banner() {
  ln();
  writeln(`${c.bold}${c.white}  create-node-ts-api${c.reset}`);
  writeln(`${c.gray}  Scaffold a production-ready Node.js + TypeScript REST API${c.reset}`);
  ln();
}

function divider() {
  writeln(`${c.gray}  ${isWin ? '  ' + '-'.repeat(48) : '  ' + '─'.repeat(48)}${c.reset}`);
}

function success(msg) { writeln(`  ${c.green}${S.tick}${c.reset}  ${msg}`); }
function hint(msg)    { writeln(`  ${c.gray}${S.bar}${c.reset}  ${c.gray}${msg}${c.reset}`); }
function fail(msg)    { ln(); writeln(`  ${c.red}${S.cross}  ${msg}${c.reset}`); ln(); process.exit(1); }

// Spinning progress indicator
function spinner(msg) {
  const frames = isWin ? ['-', '\\', '|', '/'] : ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  let i = 0;
  const id = setInterval(() => {
    write(`\r  ${c.cyan}${frames[i++ % frames.length]}${c.reset}  ${msg}`);
  }, 80);
  return { stop: (doneMsg) => {
    clearInterval(id);
    write(`\r  ${c.green}${S.tick}${c.reset}  ${doneMsg || msg}\n`);
  }, fail: (errMsg) => {
    clearInterval(id);
    write(`\r  ${c.yellow}${S.warn}${c.reset}  ${errMsg}\n`);
  }};
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt engine
// ─────────────────────────────────────────────────────────────────────────────
let rl;
function openRL()  { rl = readline.createInterface({ input: process.stdin, output: process.stdout }); }
function closeRL() { rl.close(); }
function ask(q)    { return new Promise(r => rl.question(q, a => r(a.trim()))); }

// Yes/No — renders like create-vite
async function confirm(question, defaultYes = true) {
  const yes = `${c.bold}${c.cyan}Y${c.reset}`;
  const no  = `${c.bold}${c.cyan}N${c.reset}`;
  const tag = defaultYes ? `${yes}${c.gray}/n${c.reset}` : `${c.gray}y/${c.reset}${no}`;
  ln();
  writeln(`  ${c.cyan}${S.dot}${c.reset}  ${c.white}${question}${c.reset}`);
  const raw = await ask(`    ${c.gray}${tag}${c.reset}  `);
  if (raw === '') return defaultYes;
  return /^y(es)?$/i.test(raw);
}

// Numbered select — renders like create-vite framework picker
async function select(question, options) {
  ln();
  writeln(`  ${c.cyan}${S.dot}${c.reset}  ${c.white}${question}${c.reset}`);
  ln();
  options.forEach((opt, i) => {
    const num    = `${c.bold}${c.cyan}${i + 1}${c.reset}`;
    const name   = `${c.white}${opt.label}${c.reset}`;
    const detail = opt.hint ? `  ${c.gray}${opt.hint}${c.reset}` : '';
    writeln(`    ${num}  ${name}${detail}`);
  });
  ln();
  while (true) {
    const raw = await ask(`    ${c.gray}Select [1-${options.length}]${c.reset}  `);
    const n   = parseInt(raw, 10);
    if (n >= 1 && n <= options.length) return options[n - 1].value;
    writeln(`    ${c.yellow}Enter a number between 1 and ${options.length}${c.reset}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────
const projectName = process.argv[2];

banner();

if (!projectName)
  fail('Missing project name.\n\n     npx create-node-ts-api  <project-name>');

if (!/^[a-z0-9-_]+$/i.test(projectName))
  fail(`"${projectName}" — use only letters, numbers, hyphens, underscores.`);

const targetDir = path.resolve(process.cwd(), projectName);
if (fs.existsSync(targetDir))
  fail(`"${projectName}" already exists. Delete it or choose a different name.`);

const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajor < 18)
  fail(`Node.js 18+ required. You have v${process.versions.node}  →  https://nodejs.org`);

// ─────────────────────────────────────────────────────────────────────────────
// File system helpers
// ─────────────────────────────────────────────────────────────────────────────
const ALWAYS_SKIP    = new Set(['node_modules', 'dist', 'coverage', '.git']);
const DOCKER_FILES   = new Set(['Dockerfile', '.dockerignore']);
const PRETTIER_FILES = new Set(['.prettierrc', '.prettierignore']);

function copyDir(src, dest, opts = {}) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (ALWAYS_SKIP.has(entry))                         continue;
    if (opts.skipDocker   && DOCKER_FILES.has(entry))   continue;
    if (opts.skipPrettier && PRETTIER_FILES.has(entry)) continue;
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    fs.statSync(s).isDirectory() ? copyDir(s, d, opts) : fs.copyFileSync(s, d);
  }
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function readPkg()    { return JSON.parse(fs.readFileSync(path.join(targetDir, 'package.json'), 'utf8')); }
function writePkg(p)  { fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(p, null, 2) + '\n'); }
function hasCmd(cmd)  { try { execSync(`${cmd} --version`, { stdio: 'ignore' }); return true; } catch { return false; } }
function run(cmd)     { execSync(cmd, { cwd: targetDir, stdio: 'inherit' }); }
function runQ(cmd)    { execSync(cmd, { cwd: targetDir, stdio: 'ignore' }); }

// ─────────────────────────────────────────────────────────────────────────────
// Feature writers — each adds exactly its files, nothing more
// ─────────────────────────────────────────────────────────────────────────────
function addDockerCompose() {
  writeFile(path.join(targetDir, 'docker-compose.yml'), `version: '3.9'
services:
  api:
    build: .
    ports:
      - '\${PORT:-5000}:\${PORT:-5000}'
    env_file:
      - .env
    restart: unless-stopped
`);
}

function addHusky() {
  const preCommit = path.join(targetDir, '.husky', 'pre-commit');
  fs.mkdirSync(path.dirname(preCommit), { recursive: true });
  writeFile(preCommit, '#!/bin/sh\nnpx lint-staged\n');
  fs.chmodSync(preCommit, 0o755);

  const pkg = readPkg();
  pkg.scripts.prepare                = 'husky';
  pkg.devDependencies['husky']       = '^9.0.0';
  pkg.devDependencies['lint-staged'] = '^15.0.0';
  pkg['lint-staged'] = { 'src/**/*.ts': ['eslint --fix', 'prettier --write'] };
  writePkg(pkg);
}

function addCI(withTests) {
  const testStep = withTests ? `
      - name: Test
        run: npm test
` : '';
  writeFile(path.join(targetDir, '.github', 'workflows', 'ci.yml'), `name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
jobs:
  ci:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: npm
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
${testStep}      - run: npm run build
`);
}

function addJest() {
  writeFile(path.join(targetDir, 'jest.config.js'), `/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@config/(.*)$':       '<rootDir>/src/config/$1',
    '^@constants/(.*)$':    '<rootDir>/src/constants/$1',
    '^@controllers/(.*)$':  '<rootDir>/src/controllers/$1',
    '^@errors/(.*)$':       '<rootDir>/src/errors/$1',
    '^@middlewares/(.*)$':  '<rootDir>/src/middlewares/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@routes/(.*)$':       '<rootDir>/src/routes/$1',
    '^@services/(.*)$':     '<rootDir>/src/services/$1',
    '^@utils/(.*)$':        '<rootDir>/src/utils/$1',
    '^@validations/(.*)$':  '<rootDir>/src/validations/$1',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
`);
  const dir = path.join(targetDir, 'src', '__tests__', 'unit');
  fs.mkdirSync(dir, { recursive: true });
  writeFile(path.join(dir, 'example.test.ts'), `describe('Example', () => {
  it('1 + 1 equals 2', () => expect(1 + 1).toBe(2));
});\n`);

  const pkg = readPkg();
  pkg.devDependencies['jest']        = '^29.0.0';
  pkg.devDependencies['ts-jest']     = '^29.0.0';
  pkg.devDependencies['@types/jest'] = '^29.0.0';
  pkg.scripts['test']                = 'jest';
  pkg.scripts['test:watch']          = 'jest --watch';
  pkg.scripts['test:coverage']       = 'jest --coverage';
  writePkg(pkg);
}

function addVitest() {
  writeFile(path.join(targetDir, 'vitest.config.ts'), `import { defineConfig } from 'vitest/config';
import path from 'path';
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: { reporter: ['text', 'lcov', 'html'], include: ['src/**/*.ts'] },
  },
  resolve: {
    alias: {
      '@config':       path.resolve(__dirname, 'src/config'),
      '@constants':    path.resolve(__dirname, 'src/constants'),
      '@controllers':  path.resolve(__dirname, 'src/controllers'),
      '@errors':       path.resolve(__dirname, 'src/errors'),
      '@middlewares':  path.resolve(__dirname, 'src/middlewares'),
      '@repositories': path.resolve(__dirname, 'src/repositories'),
      '@routes':       path.resolve(__dirname, 'src/routes'),
      '@services':     path.resolve(__dirname, 'src/services'),
      '@utils':        path.resolve(__dirname, 'src/utils'),
      '@validations':  path.resolve(__dirname, 'src/validations'),
    },
  },
});
`);
  const dir = path.join(targetDir, 'src', '__tests__', 'unit');
  fs.mkdirSync(dir, { recursive: true });
  writeFile(path.join(dir, 'example.test.ts'), `import { describe, it, expect } from 'vitest';
describe('Example', () => {
  it('1 + 1 equals 2', () => expect(1 + 1).toBe(2));
});\n`);

  const pkg = readPkg();
  pkg.devDependencies['vitest']              = '^1.0.0';
  pkg.devDependencies['@vitest/coverage-v8'] = '^1.0.0';
  pkg.scripts['test']                        = 'vitest run';
  pkg.scripts['test:watch']                  = 'vitest';
  pkg.scripts['test:coverage']               = 'vitest run --coverage';
  writePkg(pkg);
}

function removePrettier() {
  const pkg = readPkg();
  delete pkg.scripts['format'];
  delete pkg.scripts['format:check'];
  delete (pkg.devDependencies || {})['prettier'];
  writePkg(pkg);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  openRL();

  // ── Prompts ─────────────────────────────────────────────────────────────────
  writeln(`${c.bold}  Configuring ${c.cyan}${projectName}${c.reset}`);
  divider();

  const useDocker   = await confirm('Add Docker?');
  const useHusky    = await confirm('Add Husky + lint-staged?',       false);
  const usePrettier = await confirm('Add Prettier?');
  const useCI       = await confirm('Add GitHub Actions CI/CD?',      false);
  const useTesting  = await confirm('Add a testing library?',         false);

  let testLib = 'none';
  if (useTesting) {
    testLib = await select('Pick a testing framework', [
      { label: 'Jest',   value: 'jest',   hint: 'most popular · ts-jest preset' },
      { label: 'Vitest', value: 'vitest', hint: 'fast · native ESM' },
    ]);
  }

  closeRL();

  // ── Scaffold ─────────────────────────────────────────────────────────────────
  ln();
  divider();
  ln();

  const templateDir = path.join(__dirname, '..', 'template');

  // Copy template — feature files skipped at source if not selected
  copyDir(templateDir, targetDir, {
    skipDocker:   !useDocker,
    skipPrettier: !usePrettier,
  });

  // Fix npm-stripped .gitignore
  const fromGi = path.join(targetDir, 'gitignore');
  const toGi   = path.join(targetDir, '.gitignore');
  if (fs.existsSync(fromGi)) fs.renameSync(fromGi, toGi);

  // Stamp package.json with project name
  const pkg = readPkg();
  pkg.name = projectName; pkg.version = '0.0.1'; pkg.description = '';
  delete pkg.author; delete pkg.repository; delete pkg.keywords;
  delete pkg.bugs;   delete pkg.homepage;
  writePkg(pkg);

  // Copy .env
  const envEx = path.join(targetDir, '.env.example');
  if (fs.existsSync(envEx)) fs.copyFileSync(envEx, path.join(targetDir, '.env'));

  success(`Scaffolded ${c.bold}${projectName}${c.reset}`);

  // Apply features
  if (useDocker)            { addDockerCompose();                  success('Docker         Dockerfile · .dockerignore · docker-compose.yml'); }
  if (useHusky)             { addHusky();                          success('Husky          pre-commit hook · lint-staged'); }
  if (!usePrettier)         { removePrettier(); }
  else                      {                                      success('Prettier       .prettierrc · format scripts'); }
  if (useCI)                { addCI(testLib !== 'none');           success(`CI/CD          .github/workflows/ci.yml${testLib !== 'none' ? ' · includes test step' : ''}`); }
  if (testLib === 'jest')   { addJest();                          success('Jest           jest.config.js · ts-jest · coverage'); }
  if (testLib === 'vitest') { addVitest();                        success('Vitest         vitest.config.ts · coverage'); }

  // ── Install ──────────────────────────────────────────────────────────────────
  ln();
  divider();
  ln();

  const spin = spinner('Installing packages...');
  try {
    execSync('npm install --loglevel=error', { cwd: targetDir, stdio: 'pipe' });
    spin.stop('Packages installed');
  } catch (e) {
    spin.fail('npm install failed — run it manually');
  }

  // Husky init (must be after install)
  if (useHusky) {
    try { runQ('npx husky'); } catch {}
  }

  // ── Git ───────────────────────────────────────────────────────────────────────
  if (hasCmd('git')) {
    try {
      runQ('git init');
      runQ('git config user.name "kalyankashaboina"');
      runQ('git config user.email "kalyankashaboina07@gmail.com"');
      runQ('git add .');
      runQ('git commit -m "chore: initial commit"');
      success('Git             initialized · initial commit created');
    } catch {}
  }

  // ── Done ──────────────────────────────────────────────────────────────────────
  ln();
  divider();
  ln();

  writeln(`  ${c.bold}${c.green}${S.tick}  ${projectName} is ready${c.reset}`);
  ln();

  // Stack summary
  writeln(`  ${c.bold}Stack${c.reset}`);
  hint(`Express 5  ·  TypeScript  ·  Pino  ·  Zod  ·  Swagger`);
  if (useDocker)          hint(`Docker`);
  if (useHusky)           hint(`Husky + lint-staged`);
  if (usePrettier)        hint(`Prettier`);
  if (useCI)              hint(`GitHub Actions CI/CD`);
  if (testLib !== 'none') hint(`${testLib.charAt(0).toUpperCase() + testLib.slice(1)}`);
  ln();

  // Next steps
  writeln(`  ${c.bold}Next steps${c.reset}`);
  ln();
  writeln(`    ${c.cyan}cd ${projectName}${c.reset}`);
  writeln(`    ${c.cyan}npm run dev${c.reset}`);
  ln();

  // Endpoints
  writeln(`  ${c.bold}Endpoints${c.reset}`);
  ln();
  writeln(`    ${c.gray}API     ${c.reset}  http://localhost:5000/api/v1/users`);
  writeln(`    ${c.gray}Swagger ${c.reset}  http://localhost:5000/api-docs`);
  writeln(`    ${c.gray}Health  ${c.reset}  http://localhost:5000/health`);
  ln();
  divider();
  ln();
}

main().catch(err => {
  ln();
  writeln(`  ${c.red}${S.cross}  ${err.message}${c.reset}`);
  ln();
  process.exit(1);
});
