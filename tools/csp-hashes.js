// Writes the hashes of the pages' inline <script>s into site/_headers' Content-Security-Policy, so the browser runs
// those scripts and nothing else inline. Run it after editing any inline <script> in site/ (2026-10-08):
//
//   node tools/csp-hashes.js
//
// Each script is hashed with LF and with CRLF line ends: git keeps LF (what Netlify publishes) while this PC's working
// copy has CRLF (what serve.js sends), and a hash only matches the exact bytes.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const site = path.join(__dirname, '..', 'site');
const headersFile = path.join(site, '_headers');

const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) pages.push(full);
  }
})(site);

const hashes = new Set();
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  for (const [, body] of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    const lf = body.replace(/\r\n/g, '\n');
    for (const variant of [lf, lf.replace(/\n/g, '\r\n')]) {
      hashes.add(`'sha256-${crypto.createHash('sha256').update(variant, 'utf8').digest('base64')}'`);
    }
  }
}

const before = fs.readFileSync(headersFile, 'utf8');
// The header itself is indented under its path; the comment lines above it, which mention it too, start with #.
const after = before.replace(/^([ \t]+Content-Security-Policy:[^\n]*?script-src )[^;\n]*/m, `$1'self' ${[...hashes].sort().join(' ')}`);
if (after === before && !before.includes([...hashes][0])) throw new Error('No script-src found in site/_headers');
fs.writeFileSync(headersFile, after);
console.log(`${pages.length} pages, ${hashes.size / 2} distinct inline scripts, ${hashes.size} hashes written to site/_headers`);
