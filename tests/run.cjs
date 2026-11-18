const { mkdtempSync, symlinkSync, rmSync, writeFileSync, readFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');
const output = mkdtempSync(join(tmpdir(), 'edudent-tests-'));
try {
  symlinkSync(resolve('node_modules'), join(output, 'node_modules'), 'dir');
  const config = join(output, 'tsconfig.json');
  writeFileSync(config, JSON.stringify({ compilerOptions: {
    outDir: output, rootDir: process.cwd(), module: 'commonjs', moduleResolution: 'node', target: 'es2022',
    esModuleInterop: true, skipLibCheck: true, strict: true, baseUrl: process.cwd(), paths: { '@/*': ['./*'] }
  }, files: ['lib/tutor/groq.ts', 'lib/tutor/knowledge.ts', 'components/dentalGeometry.ts', 'app/api/tutor/route.ts'].map(file => resolve(file)) }));
  const compile = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', config], { stdio: 'inherit' });
  if (compile.status !== 0) process.exitCode = compile.status || 1;
  else {
    const routeFile = join(output, 'app/api/tutor/route.js');
    writeFileSync(routeFile, readFileSync(routeFile, 'utf8').replaceAll('@/lib/tutor/', '../../../lib/tutor/'));
    process.exitCode = spawnSync(process.execPath, ['--test', 'tests/tutor.cjs'], { stdio: 'inherit', env: { ...process.env, EDUDENT_TEST_BUILD: output } }).status ?? 1;
  }
} finally { rmSync(output, { recursive: true, force: true }); }
