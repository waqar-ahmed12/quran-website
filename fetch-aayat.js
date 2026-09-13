// Copies aayat exactly, in Uthmani script, from the Quran.com API into site/aayat.json, so no verse is
// ever typed by hand. The Arabic is saved unmodified, exactly as Quran.com sends it.
//
//   node fetch-aayat.js 96:1-5 73:4 54:17        one group per argument; a range stays together

const fs = require('fs');
const path = require('path');

// An English meaning, for an on-page option: Saheeh International (Quran.com translation 20). Its footnote
// numbers are removed; the words are kept as sent. Check its licence before launch.
const TRANSLATION = 20;

async function get(url, key) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Quran.com answered ${res.status} for ${key}`);
  return res.json();
}

async function verse(key) {
  const api = 'https://api.quran.com/api/v4/quran';
  const arabic = (await get(`${api}/verses/uthmani?verse_key=${key}`, key)).verses?.[0];
  if (arabic?.verse_key !== key || !arabic.text_uthmani) throw new Error(`No Arabic came back for ${key}`);
  const meaning = (await get(`${api}/translations/${TRANSLATION}?verse_key=${key}`, key)).translations?.[0];
  if (!meaning?.text) throw new Error(`No translation came back for ${key}`);
  return { key, text: arabic.text_uthmani, translation: meaning.text.replace(/<sup[^>]*>.*?<\/sup>/g, '').trim() };
}

(async () => {
  const refs = process.argv.slice(2);
  if (!refs.length) throw new Error('Name the aayat, e.g.  node fetch-aayat.js 96:1-5 73:4');

  const groups = [];
  for (const ref of refs) {
    const m = /^(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/.exec(ref);
    if (!m) throw new Error(`Not a reference like 73:4 or 96:1-5: ${ref}`);
    const surah = Number(m[1]);
    const from = Number(m[2]);
    const to = Number(m[3] ?? from);
    const name = (await get(`https://api.quran.com/api/v4/chapters/${surah}`, ref)).chapter?.name_simple;
    if (!name) throw new Error(`No surah name came back for ${surah}`);
    const aayat = [];
    for (let n = from; n <= to; n++) {
      aayat.push(await verse(`${surah}:${n}`));
      console.log(`${surah}:${n} ok`); // the Arabic itself is checked on the page; this window can't show it properly
    }
    groups.push({ ref, surah: name, aayat });
  }

  const out = path.join(__dirname, 'site', 'aayat.json');
  const data = {
    source: `Quran.com API v4: Arabic text_uthmani; English translation ${TRANSLATION} (Saheeh International)`,
    fetched: new Date().toISOString().slice(0, 10),
    groups,
  };
  fs.writeFileSync(out, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Saved ${out}`);
})().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
