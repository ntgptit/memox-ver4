#!/usr/bin/env node
// tool/preview/kit-server.mjs — serve the MemoX design kit over http:// so the UI-kit
// gallery works. The gallery compiles its screen .jsx with @babel/standalone at runtime,
// which fetches those files — that fetch is blocked on file://, so every screen shows
// "Screen not loaded". Run this and open the printed URL instead.
//
//   node tool/preview/kit-server.mjs            # port 5170
//   node tool/preview/kit-server.mjs 8080       # custom port
//
// Needs a network connection the first time (React + Babel load from unpkg, and
// Material Symbols from Google Fonts).

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', 'docs', 'design', 'MemoX Design System_v4');
const PORT = Number(process.argv[2] || 5170);
const KIT_PATH = '/ui_kits/memox-app/index.html';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.jsx': 'text/plain; charset=utf-8', '.json': 'application/json', '.ttf': 'font/ttf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.map': 'application/json',
};

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    // The gallery lives at KIT_PATH and loads its screen .jsx via paths relative to
    // that URL, so send the bare root there (a redirect keeps those relative paths valid).
    if (p === '/' || p === '/index.html') {
      res.writeHead(302, { location: KIT_PATH }); res.end(); return;
    }
    if (p.endsWith('/')) p += 'index.html';
    const fp = normalize(join(ROOT, p));
    if (!fp.startsWith(normalize(ROOT))) { res.writeHead(403).end('forbidden'); return; }
    const data = await readFile(fp);
    res.writeHead(200, { 'content-type': MIME[extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(PORT, () => {
  console.log(`MemoX kit served from:\n  ${ROOT}\n`);
  console.log(`Open the UI-kit gallery at:\n  http://localhost:${PORT}${KIT_PATH}\n`);
  console.log('(first load pulls React + Babel from unpkg and icons from Google Fonts — needs internet)');
  console.log('Press Ctrl+C to stop.');
});
