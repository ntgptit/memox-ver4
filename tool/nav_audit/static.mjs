#!/usr/bin/env node
// tool/nav_audit/static.mjs — static navigation/button audit.
// 1. Route table from src/app.
// 2. Every router.push/replace target resolved against the route table.
// 3. Every screen's on* handler prop cross-referenced against its container +
//    route files → candidates for dead (never-wired) buttons.

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

// ---- 1. route table -------------------------------------------------------
const routeFiles = (await walk(join(ROOT, 'src/app'))).filter((p) => p.endsWith('.tsx'));
const routes = routeFiles
  .map((p) => p.replace(join(ROOT, 'src/app'), '').replace(/\.tsx$/, ''))
  .filter((r) => !r.endsWith('_layout') && !r.includes('+not-found'))
  .map((r) => r.replace(/\/index$/, '') || '/')
  .map((r) => r.replace(/\((.*?)\)\//, '')); // strip group segments
console.log('== ROUTES ==');
for (const r of [...routes].sort()) console.log('  ', r || '/');

function matches(target) {
  const path = target.split('?')[0];
  return routes.some((r) => {
    const rr = '^' + r.replace(/\[[^\]]+\]/g, '[^/]+') + '$';
    return new RegExp(rr).test(path) || new RegExp(rr).test(path.replace(/^\/\((.*?)\)/, ''));
  });
}

// ---- 2. push/replace targets ---------------------------------------------
const srcFiles = (await walk(join(ROOT, 'src'))).filter((p) => /\.(tsx|ts)$/.test(p) && !p.includes('__tests__'));
const pushes = [];
for (const f of srcFiles) {
  const src = await readFile(f, 'utf8');
  for (const m of src.matchAll(/router\.(push|replace)\(\s*(['"`])(.*?)\2/gs)) {
    pushes.push({ file: f.replace(ROOT + '/', ''), kind: m[1], target: m[3] });
  }
}
console.log('\n== NAV TARGETS ==');
const bad = [];
for (const p of pushes) {
  const norm = p.target.replace(/\$\{[^}]+\}/g, 'X');
  const ok = matches(norm);
  if (!ok) bad.push(p);
  console.log(`  ${ok ? 'OK ' : 'BAD'} ${p.kind.padEnd(7)} ${p.target}  (${p.file})`);
}

// ---- 3. handler props never wired ----------------------------------------
console.log('\n== SCREEN HANDLER WIRING ==');
const screenFiles = srcFiles.filter((p) => /features\/[^/]+\/ui\/[^/]*screen\.tsx$/.test(p));
for (const sf of screenFiles) {
  const src = await readFile(sf, 'utf8');
  const propsBlocks = [...src.matchAll(/export interface (\w+ScreenProps)[^{]*\{([\s\S]*?)\n\}/g)];
  const handlers = new Set();
  for (const b of propsBlocks) {
    for (const m of b[2].matchAll(/^\s*(on[A-Z]\w*)\??:/gm)) handlers.add(m[1]);
  }
  if (handlers.size === 0) continue;
  // Wiring universe: same feature's containers + all route files + same-dir non-test files.
  const feature = sf.match(/features\/([^/]+)\//)[1];
  const wiringFiles = srcFiles.filter(
    (p) =>
      p !== sf &&
      (p.includes(`features/${feature}/ui/`) || p.includes('src/app/')),
  );
  let wiringSrc = '';
  for (const wf of wiringFiles) wiringSrc += await readFile(wf, 'utf8');
  const dead = [...handlers].filter((h) => !wiringSrc.includes(h));
  const name = sf.replace(ROOT + '/', '');
  if (dead.length > 0) console.log(`  ${name}\n    UNWIRED: ${dead.join(', ')}`);
}

console.log('\n== SUMMARY ==');
console.log(`  routes: ${routes.length} · nav calls: ${pushes.length} · unresolved: ${bad.length}`);
if (bad.length) process.exitCode = 1;
