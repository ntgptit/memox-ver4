#!/usr/bin/env node
// tool/nav_audit/inventory.mjs — mechanical navigation inventory.
//
// Reads the DEFINED artifacts (routes in src/app, interactive nodes / dialogs /
// sheets in the feature screens, handler wiring in routes + containers) and
// generates, in order:
//   1. docs/navigation/nav-inventory.md   — every node with its IN and OUT edges
//   2. docs/navigation/nav-flows-raw.md   — the FULL flow list, duplicates kept
//   3. docs/navigation/nav-flows-final.md — duplicates removed → the walk list
//
// Re-run after navigation changes: node tool/nav_audit/inventory.mjs

import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
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

const read = (p) => readFile(p, 'utf8');

/** Extract a balanced {...} expression starting at src[open] === '{'. */
function balanced(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') {
      depth -= 1;
      if (depth === 0) return src.slice(open + 1, i);
    }
  }
  return '';
}

// ---------------------------------------------------------------------------
// 1. Routes
// ---------------------------------------------------------------------------
const routeFiles = (await walk(join(ROOT, 'src/app'))).filter(
  (p) => p.endsWith('.tsx') && !p.includes('_layout') && !p.includes('+not-found'),
);
const routes = routeFiles.map((file) => {
  let path = file
    .replace(join(ROOT, 'src/app'), '')
    .replace(/\.tsx$/, '')
    .replace(/\/index$/, '')
    .replace(/\((.*?)\)\//, '');
  if (path === '') path = '/';
  return { file, path };
});

/** propName → [actions] wiring found in a file ("onX={<expr>}" containing router calls). */
function extractWiring(src) {
  const wiring = {};
  const re = /(on[A-Z]\w*)=\{/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const expr = balanced(src, m.index + m[1].length + 1);
    const actions = [];
    for (const r of expr.matchAll(/router\.(push|replace|back)\((?:\s*(['"`])(.*?)\2)?/gs)) {
      actions.push(r[1] === 'back' ? 'BACK' : `${r[1].toUpperCase()} ${r[3] ?? '<dynamic>'}`);
    }
    if (actions.length > 0) wiring[m[1]] = [...new Set([...(wiring[m[1]] ?? []), ...actions])];
    else if (/^\s*\(\)\s*=>\s*\{\s*\}\s*$/.test(expr)) wiring[m[1]] = ['NOOP (fixture preview)'];
  }
  return wiring;
}

const routeWiring = {}; // route path → {prop: [actions]}
const routeSrc = {};
for (const r of routes) {
  const src = await read(r.file);
  routeSrc[r.path] = src;
  routeWiring[r.path] = extractWiring(src);
}

// ---------------------------------------------------------------------------
// 2. Screens: interactive nodes + overlays
// ---------------------------------------------------------------------------
const screenFiles = (await walk(join(ROOT, 'src/features'))).filter(
  (p) => /ui\/[^/]*(screen|components)\.tsx$/.test(p) && !p.includes('__tests__'),
);

// Per-screen host resolution: a route hosts a screen when it references one of
// the screen file's exported components OR a sibling container that imports it.
const featureFiles = (await walk(join(ROOT, 'src/features'))).filter((p) => p.endsWith('.tsx') && !p.includes('__tests__'));
const featureSrcCache = {};
for (const f of featureFiles) featureSrcCache[f] = await read(f);

function exportedNames(src) {
  return [...src.matchAll(/export function (\w+)/g)].map((m) => m[1]);
}

function routesRendering(screenFile, src) {
  const base = screenFile.split('/').pop().replace(/\.tsx$/, '');
  const names = new Set(exportedNames(src));
  // sibling containers importing this screen (or, for *-components files, the
  // sibling screen that imports the components) carry the hosting too.
  for (const [f, s] of Object.entries(featureSrcCache)) {
    if (f === screenFile) continue;
    if (s.includes(`./${base}`) || [...names].some((n) => s.includes(`{ ${n}`) || s.includes(`${n},`) || s.includes(`${n} }`))) {
      for (const n of exportedNames(s)) names.add(n);
    }
  }
  const hosts = routes.filter((r) => [...names].some((n) => new RegExp(`\\b${n}\\b`).test(routeSrc[r.path]))).map((r) => r.path);
  return hosts;
}

/** Classify a raw onPress expression into an edge description. */
function classify(expr, wiringLookup) {
  const e = expr.replace(/\s+/g, ' ').trim();
  // overlay state
  const setNull = e.match(/set(\w+)\(\s*null\s*\)/);
  const setVal = e.match(/set(Overlay|Sheet|Mode|Open|Picker\w*)\(\s*['"](\w[\w-]*)['"]\s*\)/) ?? e.match(/set(\w+)\(\s*['"]([\w-]+)['"]\s*\)/);
  const propCalls = [...e.matchAll(/\b(on[A-Z]\w*)\??\.?\(/g)].map((m) => m[1]);
  const ctrlCalls = [...e.matchAll(/\bctrl\.(\w+)/g)].map((m) => m[1]);
  const parts = [];
  if (setVal && !setNull) parts.push(`OPEN overlay '${setVal[2]}'`);
  if (setNull && !setVal) parts.push(`CLOSE overlay`);
  if (setNull && setVal) parts.push(`SWITCH overlay → '${setVal[2]}'`);
  for (const p of propCalls) {
    const dests = wiringLookup(p);
    parts.push(dests ? `${p} → ${dests.join(' | ')}` : `${p} → ⚠ UNWIRED`);
  }
  for (const c of ctrlCalls) parts.push(`controller.${c}`);
  if (parts.length === 0) parts.push(e.length > 60 ? `${e.slice(0, 60)}…` : e || '⚠ NO HANDLER');
  return parts.join(' ; ');
}

const TAGS = 'MxButton|MxIconButton|MxFab|MxChip|MxLink|MenuItem|ListRow|MxCard|Pressable|SourceCard|MxSwitch|MxSegmentedControl|DeckCard|MatchTile|ChoiceOption';
const nodes = []; // {feature, screen, node, tag, edge, routes}
const overlays = []; // {feature, screen, node, kind, closes}

for (const sf of screenFiles) {
  const src = await read(sf);
  const feature = sf.match(/features\/([^/]+)\//)[1];
  const screen = sf.split('/').pop();
  const hostRoutes = routesRendering(sf, src);
  // Wiring beyond the route file: containers (ctrl.* handlers) and sibling
  // screen files (internal composition) of the same feature.
  const featureDir = sf.slice(0, sf.lastIndexOf('/'));
  const siblings = featureFiles.filter((f) => f.startsWith(featureDir) && f !== sf);
  const wiringLookup = (prop, depth = 0) => {
    if (depth > 3) return null;
    for (const rp of hostRoutes) if (routeWiring[rp]?.[prop]) return routeWiring[rp][prop];
    // same file first (internal composition, e.g. a sheet component wired by
    // the screen that hosts it), then siblings (containers).
    for (const f of [sf, ...siblings]) {
      const s = featureSrcCache[f];
      const m = s.match(new RegExp(`${prop}=\\{`));
      if (m) {
        const expr = balanced(s, m.index + prop.length + 1).replace(/\s+/g, ' ').trim();
        const ctrl = expr.match(/\bctrl\.(\w+)/);
        if (ctrl) return [`controller.${ctrl[1]} (container)`];
        const router = [...expr.matchAll(/router\.(push|replace|back)\((?:\s*(['"`])(.*?)\2)?/g)];
        if (router.length) return router.map((r) => (r[1] === 'back' ? 'BACK' : `${r[1].toUpperCase()} ${r[3] ?? '<dynamic>'}`));
        // pass-through (`onDone={onPickTime}`) — follow the chain
        const passRef = expr.match(/^(\w+)$/) ?? expr.match(/^\(?[\w\s,()]*\)?\s*=>\s*(on[A-Z]\w*)\??\.?\(/);
        if (passRef) {
          const next = passRef[1];
          if (next.startsWith('on') && next !== prop) {
            const resolved = wiringLookup(next, depth + 1);
            if (resolved) return resolved;
          }
          return [`↪ ${next} (passed through)`];
        }
        return [`wired: ${expr.slice(0, 50)}${expr.length > 50 ? '…' : ''}`];
      }
    }
    return null;
  };

  // interactive elements: find every JSX open tag of interest, capture node + onPress
  const tagRe = new RegExp(`<(${TAGS})\\b`, 'g');
  let m;
  while ((m = tagRe.exec(src)) !== null) {
    // capture the tag's attribute span (to the matching '>' at depth 0 of braces)
    let i = m.index;
    let depth = 0;
    while (i < src.length) {
      if (src[i] === '{') depth += 1;
      else if (src[i] === '}') depth -= 1;
      else if (src[i] === '>' && depth === 0) break;
      i += 1;
    }
    const attrs = src.slice(m.index, i);
    const nodeId = attrs.match(/\bnode="([^"]+)"/)?.[1] ?? attrs.match(/testID="([^"]+)"/)?.[1];
    const pressIdx = attrs.search(/\bon(Press|Change)=\{/);
    if (nodeId === undefined && pressIdx < 0) continue;
    // A button-like control with NO handler is a dead control, not decoration.
    const BUTTONISH = new Set(['MxButton', 'MxIconButton', 'MxFab', 'MenuItem', 'MxChip', 'Pressable', 'MxSwitch', 'MxLink']);
    let edge = BUTTONISH.has(m[1]) ? '⚠ NO HANDLER (dead control)' : '(display only)';
    if (pressIdx >= 0) {
      const open = attrs.indexOf('{', pressIdx);
      edge = classify(balanced(attrs, open), wiringLookup);
    }
    nodes.push({ feature, screen, node: nodeId ?? '(no node id)', tag: m[1], edge, routes: hostRoutes });
  }

  // overlays: Scrim/Sheet/Dialog occurrences with node ids
  for (const om of src.matchAll(/<(Scrim|Sheet|Dialog|SelectSheet|DeckPlaySheet)\b[^>]*?node="([^"]+)"/gs)) {
    const kind = om[1];
    const nodeId = om[2];
    // find close affordances near the Scrim (onDismiss)
    const around = src.slice(Math.max(0, om.index - 400), om.index + 400);
    const dismiss = around.match(/onDismiss=\{([^}]*)\}/)?.[1]?.trim();
    overlays.push({ feature, screen, node: nodeId, kind, closes: dismiss ? `scrim dismiss → ${dismiss.replace(/\s+/g, ' ').slice(0, 50)}` : '(no scrim dismiss)' });
  }
}

// ---------------------------------------------------------------------------
// 3. Raw flow list (duplicates KEPT)
// ---------------------------------------------------------------------------
// One flow line per (host route × control × resolved edge). A control that
// lives on a screen served by N routes yields N lines; a destination reached
// from M controls appears M times — that duplication is the point.
const rawFlows = [];
for (const n of nodes) {
  const hosts = n.routes.length > 0 ? n.routes : ['(unrouted screen)'];
  for (const host of hosts) {
    rawFlows.push({ from: host, control: n.node, tag: n.tag, action: n.edge, feature: n.feature });
  }
}
// route-level in-edges from route wiring (push/replace destinations)
for (const [rp, wiring] of Object.entries(routeWiring)) {
  for (const [prop, actions] of Object.entries(wiring)) {
    for (const a of actions) {
      if (a.startsWith('PUSH') || a.startsWith('REPLACE')) {
        rawFlows.push({ from: rp, control: `(route wiring: ${prop})`, tag: 'route', action: a, feature: '(route)' });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Dedup → final walk list
// ---------------------------------------------------------------------------
// Key = the BEHAVIOUR under test (action), regardless of which source repeats
// it. Sources are aggregated so every entry point stays visible.
const dedup = new Map();
for (const f of rawFlows) {
  const key = f.action;
  if (!dedup.has(key)) dedup.set(key, { action: key, sources: new Set(), controls: new Set() });
  dedup.get(key).sources.add(f.from);
  dedup.get(key).controls.add(f.control);
}
const final = [...dedup.values()].sort((a, b) => a.action.localeCompare(b.action));

// ---------------------------------------------------------------------------
// 5. Emit docs
// ---------------------------------------------------------------------------
await mkdir(join(ROOT, 'docs/navigation'), { recursive: true });
const stamp = 'GENERATED by tool/nav_audit/inventory.mjs — do not hand-edit; re-run the generator.';

let inv = `# Navigation Inventory\n\n${stamp}\n\n## Routes (${routes.length})\n\n| Route | Wired handler props (route file) |\n|---|---|\n`;
for (const r of [...routes].sort((a, b) => a.path.localeCompare(b.path))) {
  const w = Object.entries(routeWiring[r.path] ?? {})
    .map(([p, a]) => `\`${p}\` → ${a.join(' / ')}`)
    .join('<br>');
  inv += `| \`${r.path}\` | ${w || '—'} |\n`;
}
inv += `\n## Interactive nodes (${nodes.length})\n\n| Feature | Node | Kind | OUT edge (resolved) | Host route(s) |\n|---|---|---|---|---|\n`;
for (const n of nodes) {
  inv += `| ${n.feature} | \`${n.node}\` | ${n.tag} | ${n.edge.replace(/\|/g, '·')} | ${n.routes.map((r) => `\`${r}\``).join(' ') || '—'} |\n`;
}
inv += `\n## Dialogs & bottom sheets (${overlays.length})\n\n| Feature | Node | Kind | Close affordance |\n|---|---|---|---|\n`;
for (const o of overlays) {
  inv += `| ${o.feature} | \`${o.node}\` | ${o.kind} | ${o.closes.replace(/\|/g, '·')} |\n`;
}
await writeFile(join(ROOT, 'docs/navigation/nav-inventory.md'), inv);

let raw = `# Navigation Flows — RAW (duplicates kept on purpose)\n\n${stamp}\n\nEvery (source route × control × resolved action). The same action appearing\nunder many sources IS the duplication this list preserves — it documents every\nentry point. ${rawFlows.length} flow lines.\n\n| # | From | Control | Action |\n|---|---|---|---|\n`;
rawFlows.forEach((f, i) => {
  raw += `| ${i + 1} | \`${f.from}\` | \`${f.control}\` | ${f.action.replace(/\|/g, '·')} |\n`;
});
await writeFile(join(ROOT, 'docs/navigation/nav-flows-raw.md'), raw);

let fin = `# Navigation Flows — FINAL walk list (deduplicated)\n\n${stamp}\n\nUnique behaviours from the raw list (${rawFlows.length} raw → ${final.length} unique).\nEach row = ONE behaviour to verify once; its sources list every entry point that\nmust still be smoke-clicked (the wiring differs per source even when the\ndestination behaviour is shared).\n\n| # | Behaviour (deduped action) | Reached from (sources) | Controls |\n|---|---|---|---|\n`;
final.forEach((f, i) => {
  fin += `| ${i + 1} | ${f.action.replace(/\|/g, '·')} | ${[...f.sources].map((s) => `\`${s}\``).join(' ')} | ${[...f.controls].slice(0, 6).map((c) => `\`${c}\``).join(' ')}${f.controls.size > 6 ? ` +${f.controls.size - 6}` : ''} |\n`;
});
const unwired = final.filter((f) => f.action.includes('UNWIRED') || f.action.includes('NO HANDLER'));
fin += `\n## Gaps surfaced by the dedup (${unwired.length})\n\n`;
for (const u of unwired) fin += `- ${u.action.replace(/\|/g, '·')} — controls: ${[...u.controls].join(', ')}\n`;
await writeFile(join(ROOT, 'docs/navigation/nav-flows-final.md'), fin);

console.log(`routes: ${routes.length} · nodes: ${nodes.length} · overlays: ${overlays.length}`);
console.log(`raw flows: ${rawFlows.length} → unique behaviours: ${final.length} (unwired/no-handler: ${unwired.length})`);
console.log('wrote docs/navigation/{nav-inventory,nav-flows-raw,nav-flows-final}.md');
