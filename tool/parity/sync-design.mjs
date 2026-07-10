#!/usr/bin/env node
// tool/parity/sync-design.mjs — push MemoX kit changes to the Claude Design project
// deterministically, WITHOUT the human being asked each time.
//
// Why this exists: the kit (mock design) is the SOURCE OF TRUTH and lives on Claude
// Design (claude.ai); the repo copy under the kit localDir is kept in sync. Pushing
// needs design-system auth, which only the user's logged-in `claude` CLI carries — it
// is NOT CI-able. So this script drives that CLI as a nested, plan-bounded `DesignSync`
// push: it computes the kit files changed in a git range, then has the CLI write the
// modified/added ones and delete the removed ones. The finalize_plan boundary makes it
// impossible to touch anything outside the computed paths.
//
// Usage:
//   node tool/parity/sync-design.mjs              # range = lastSyncedCommit..HEAD
//                                                 #         (or HEAD~1..HEAD on first run)
//   node tool/parity/sync-design.mjs <from-ref>   # range = <from-ref>..HEAD
//   node tool/parity/sync-design.mjs --dry        # print the plan, do not push
//
// On success it records `lastSyncedCommit` in .design-sync/config.json so the next run
// only pushes the new delta. Exit: 0 ok / nothing to do, 1 push failed, 2 setup error.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const CONFIG = join(REPO, '.design-sync', 'config.json');

const args = process.argv.slice(2);
const dry = args.includes('--dry');
// --no-record: push but do not write lastSyncedCommit (for the pre-push hook, where the
// range is "what's being pushed", not "since the last manual sync").
const noRecord = args.includes('--no-record');
const fromRefArg = args.find((a) => !a.startsWith('--'));

const git = (...a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();

if (!existsSync(CONFIG)) {
  console.error('sync-design: no .design-sync/config.json — run /design-sync once to pin the project.');
  process.exit(2);
}
const cfg = JSON.parse(readFileSync(CONFIG, 'utf8'));
const { projectId, localDir } = cfg;
if (!projectId || !localDir) {
  console.error('sync-design: config.json missing projectId or localDir.');
  process.exit(2);
}

const head = git('rev-parse', 'HEAD');
let from = fromRefArg || cfg.lastSyncedCommit;
if (!from) {
  // First run with no recorded baseline: sync just the last commit, and warn.
  from = git('rev-parse', 'HEAD~1');
  console.warn('sync-design: no lastSyncedCommit recorded — syncing HEAD~1..HEAD only. Pass a <from-ref> to widen.');
}

// Changed files under the kit localDir, classified into writes (A/M/R-new) + deletes (D).
const prefix = `${localDir.replace(/\\/g, '/')}/`;
const raw = git('diff', '--name-status', '-M', `${from}..${head}`, '--', localDir);
const writes = [];
const deletes = [];
for (const line of raw.split('\n').filter(Boolean)) {
  const parts = line.split('\t');
  const status = parts[0][0]; // A M D R C
  const repoPath = parts[parts.length - 1].replace(/\\/g, '/'); // for R, last col = new path
  if (!repoPath.startsWith(prefix)) continue;
  const projPath = repoPath.slice(prefix.length);
  if (status === 'D') deletes.push(projPath);
  else writes.push(projPath); // A, M, R(new), C
}

if (!writes.length && !deletes.length) {
  console.log(`sync-design: no kit changes in ${from.slice(0, 8)}..${head.slice(0, 8)} — nothing to push.`);
  process.exit(0);
}

console.log(`sync-design: project ${projectId} · localDir "${localDir}"`);
console.log(`range ${from.slice(0, 8)}..${head.slice(0, 8)} → ${writes.length} write(s), ${deletes.length} delete(s):`);
for (const w of writes) console.log(`  W ${w}`);
for (const d of deletes) console.log(`  D ${d}`);

if (dry) { console.log('sync-design: --dry, not pushing.'); process.exit(0); }

// The push must run through a `claude` CLI session that holds design-system auth
// (this surface may not). Build a tight, plan-bounded prompt and drive that CLI.
const list = (a) => a.map((p) => `   ${p}`).join('\n');
const prompt = `You have a DesignSync tool with design-system access. Perform an OFF-SCRIPT, as-is sync to an EXISTING project. DO NOT run the design-sync skill, DO NOT run any converter/build, DO NOT create a project.

Target projectId = ${projectId}

Steps, using ONLY DesignSync tool calls:
1. finalize_plan with: localDir=${JSON.stringify(localDir)}, and EXACTLY these arrays:
   writes (${writes.length}):
${list(writes)}
   deletes (${deletes.length}):
${list(deletes)}
2. If writes is non-empty: write_files with the returned planId, one entry per write path { path: <p>, localPath: <p> }.
3. If deletes is non-empty: delete_files with the planId and the deletes paths.
4. Reply with EXACTLY one final line: "SYNCED w=${writes.length} d=${deletes.length}" on success, or "FAILED: <short error>".
Do nothing else.`;

const claudeBin = process.env.CLAUDE_BIN || 'claude';
// A large delta needs more turns for the nested agent to batch all writes; keep the
// small default but let SYNC_MAX_TURNS widen it for a full-range catch-up sync.
const maxTurns = process.env.SYNC_MAX_TURNS || '12';
console.log(`sync-design: pushing via nested \`${claudeBin} -p\` (max-turns ${maxTurns}; needs a design-authorized CLI login)…`);
const res = spawnSync(
  claudeBin,
  ['--dangerously-skip-permissions', '--max-turns', maxTurns, '-p', prompt],
  { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 12 * 60_000 },
);
const out = `${res.stdout || ''}${res.stderr || ''}`.trim();
const lastLine = out.split('\n').filter(Boolean).pop() || '';
console.log(`sync-design: CLI said → ${lastLine}`);

if (res.error && res.error.code === 'ENOENT') {
  console.error('sync-design: `claude` CLI not found. Install it / set CLAUDE_BIN, or run `/design-sync` manually in a design-authorized CLI.');
  process.exit(1);
}
if (!/^SYNCED /.test(lastLine)) {
  console.error('sync-design: push did not confirm success — NOT recording lastSyncedCommit. Re-run after fixing.');
  process.exit(1);
}

if (noRecord) {
  console.log('sync-design: done (--no-record, lastSyncedCommit unchanged).');
  process.exit(0);
}
cfg.lastSyncedCommit = head;
writeFileSync(CONFIG, `${JSON.stringify(cfg, null, 2)}\n`);
console.log(`sync-design: done. lastSyncedCommit → ${head.slice(0, 8)}`);
process.exit(0);
