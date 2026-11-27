// Copies the site's Google Fonts into site/fonts/, so pages load them from the site itself (2026-10-08).
//
//   node tools/self-host-fonts.js
//
// Why: loading from Google costs every first visit two extra connections (fonts.googleapis.com for the CSS, then
// fonts.gstatic.com for the files) before text can draw in its font, and it sends each visitor's address to Google,
// which a German court ruled needs consent (LG München I, 3 O 17493/20, 2022). From the site's own address the files
// come over the connection the page already has, and fonts.css can be cached for good.
//
// It asks Google for the same families the pages used to link, as a current Chrome would (so it gets woff2 split into
// unicode-range subsets: a page only downloads the subsets it draws), saves each file, rewrites the CSS to point at
// them, and saves each family's licence (SIL Open Font License, which allows this). Run it again only to add a family
// or weight; then update FAMILIES here and the preload lines in the pages' <head>.

const fs = require('fs');
const path = require('path');

const FAMILIES = 'family=Amiri+Quran&family=Cinzel:wght@500&family=Jost:wght@300;400;500'
  + '&family=Noto+Naskh+Arabic:wght@400;500&family=Scheherazade+New&display=swap';
const LICENCES = { 'Amiri Quran': 'amiriquran', Cinzel: 'cinzel', Jost: 'jost', 'Noto Naskh Arabic': 'notonaskharabic', 'Scheherazade New': 'scheherazadenew' };
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const OUT = path.join(__dirname, '..', 'site', 'fonts');

async function get(url, as) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return as === 'text' ? res.text() : Buffer.from(await res.arrayBuffer());
}

(async () => {
  const css = await get(`https://fonts.googleapis.com/css2?${FAMILIES}`, 'text');
  fs.mkdirSync(OUT, { recursive: true });

  // Each block is "/* subset */ @font-face { ... }". Variable fonts give every weight the same file, so files are
  // named by family and subset, and a weight is added only when two weights really are different files.
  const names = new Map(); // Google's url -> our file name
  const taken = new Set();
  const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)];
  if (!blocks.length) throw new Error('No @font-face blocks came back: has the CSS format changed?');
  let out = '';
  for (const [, subset, body] of blocks) {
    const family = /font-family:\s*'([^']+)'/.exec(body)[1];
    const weight = /font-weight:\s*(\d+)/.exec(body)[1];
    const url = /url\(([^)]+)\)/.exec(body)[1];
    if (!names.has(url)) {
      const slug = family.toLowerCase().replace(/\s+/g, '-');
      let name = `${slug}-${subset}.woff2`;
      if (taken.has(name)) name = `${slug}-${weight}-${subset}.woff2`;
      taken.add(name);
      names.set(url, name);
      fs.writeFileSync(path.join(OUT, name), await get(url));
    }
    out += `/* ${family} ${weight}, ${subset} */\n@font-face {${body.replace(url, names.get(url))}}\n`;
  }

  const header = '/* The site\'s fonts, served from the site itself. Written by tools/self-host-fonts.js from Google Fonts;\n'
    + '   don\'t edit by hand. Licences: LICENCES.txt (SIL Open Font License 1.1). */\n\n';
  fs.writeFileSync(path.join(OUT, 'fonts.css'), header + out);

  let licences = '';
  for (const [family, dir] of Object.entries(LICENCES)) {
    const text = await get(`https://raw.githubusercontent.com/google/fonts/main/ofl/${dir}/OFL.txt`, 'text');
    licences += `==== ${family} ====\n\n${text.trim()}\n\n`;
  }
  fs.writeFileSync(path.join(OUT, 'LICENCES.txt'), licences);

  console.log(`${blocks.length} faces, ${names.size} files saved to ${OUT}`);
  for (const name of [...names.values()].sort()) {
    console.log(`  ${String(fs.statSync(path.join(OUT, name)).size).padStart(7)}  ${name}`);
  }
})().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
