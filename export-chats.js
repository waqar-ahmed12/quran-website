// Saves the Claude Code sessions for this project into chats/, so they survive the machine.
//
//   node export-chats.js
//
// Claude Code keeps a transcript per session as JSONL under %USERPROFILE%\.claude\projects\<project>\. Those
// files are mostly screenshots by weight (about 9.8 MB of a 10 MB session), and aren't readable as they stand.
// This writes two things per session:
//
//   chats/<date>-<id>.md        the conversation to read: what was asked, what was answered, which tools ran
//   chats/raw/<id>.jsonl        the whole transcript, with the screenshot data taken out, to go back to
//
// Run it again whenever you want to catch up; it overwrites. A session still in progress is written as far as
// it has got, so the last few messages of the session doing the exporting won't be in it.

const fs = require('fs');
const os = require('os');
const path = require('path');

const project = path.join(os.homedir(), '.claude', 'projects', 'C--Users-ICONNECT-quran-website');
const out = path.join(__dirname, 'chats');
const rawOut = path.join(out, 'raw');

const cut = (text, max) => (text.length > max ? `${text.slice(0, max)} … [${text.length - max} more characters]` : text);

// Screenshots and other images: keep that there was one, drop the megabyte.
function stripImages(value) {
  if (Array.isArray(value)) return value.map(stripImages);
  if (value && typeof value === 'object') {
    if (value.type === 'image') return { type: 'image', note: '[image removed by export-chats.js]' };
    const copy = {};
    for (const [k, v] of Object.entries(value)) copy[k] = k === 'data' && typeof v === 'string' && v.length > 256 ? '[image data removed]' : stripImages(v);
    return copy;
  }
  return value;
}

// The conversation only: the transcript also carries queue, latch and title bookkeeping.
function blocks(content) {
  if (typeof content === 'string') return [{ type: 'text', text: content }];
  return Array.isArray(content) ? content : [];
}

function render(entry, lines) {
  const { message } = entry;
  if (!message) return;
  const parts = blocks(message.content);
  const said = [];
  const did = [];

  for (const part of parts) {
    if (part.type === 'text' && part.text.trim()) {
      // The harness pins reminders and file contents into user turns; they aren't what anyone said.
      const text = part.text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '').trim();
      if (text) said.push(text);
    } else if (part.type === 'tool_use') {
      const input = JSON.stringify(part.input || {});
      did.push(`**${part.name}** \`${cut(input.replace(/\\n/g, ' '), 300)}\``);
    } else if (part.type === 'tool_result') {
      const body = blocks(part.content)
        .map((b) => (b.type === 'text' ? b.text : b.type === 'image' ? '[screenshot]' : ''))
        .join('\n')
        .trim();
      if (body) did.push(`_result:_ ${cut(body, 600).split('\n').join('\n> ')}`);
    } else if (part.type === 'image') {
      did.push('[screenshot]');
    }
  }

  if (!said.length && !did.length) return;
  const who = message.role === 'assistant' ? 'Claude' : said.length ? 'Waqar' : 'Tools';
  const when = entry.timestamp ? new Date(entry.timestamp).toISOString().replace('T', ' ').slice(0, 19) : '';
  lines.push(`### ${who}${when ? `  ·  ${when}` : ''}`, '');
  for (const text of said) lines.push(text, '');
  for (const text of did) lines.push(`> ${text}`, '');
}

if (!fs.existsSync(project)) throw new Error(`No transcripts at ${project}`);
fs.mkdirSync(rawOut, { recursive: true });

const files = fs.readdirSync(project).filter((f) => f.endsWith('.jsonl'));
const index = [];

for (const file of files) {
  const id = path.basename(file, '.jsonl');
  const entries = [];
  for (const line of fs.readFileSync(path.join(project, file), 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line));
    } catch {
      // a session still being written can end mid-line
    }
  }

  const talk = entries.filter((e) => (e.type === 'user' || e.type === 'assistant') && !e.isSidechain);
  if (!talk.length) continue;

  const started = talk[0].timestamp ? talk[0].timestamp.slice(0, 10) : 'undated';
  const lines = [`# Claude Code session ${id}`, '', `${started} to ${(talk[talk.length - 1].timestamp || '').slice(0, 10)} · ${talk.length} messages`, '', '---', ''];
  for (const entry of talk) render(entry, lines);

  const name = `${started}-${id.slice(0, 8)}.md`;
  fs.writeFileSync(path.join(out, name), lines.join('\n'));
  fs.writeFileSync(path.join(rawOut, file), entries.map((e) => JSON.stringify(stripImages(e))).join('\n'));
  index.push({ name, id, started, messages: talk.length, kb: Math.round(fs.statSync(path.join(out, name)).size / 1024) });
}

index.sort((a, b) => a.started.localeCompare(b.started));
fs.writeFileSync(
  path.join(out, 'README.md'),
  [
    '# Chats',
    '',
    'The Claude Code sessions that built this site, saved by `node export-chats.js` so they outlive the machine.',
    'The `.md` files are the conversations to read; `raw/` holds the full transcripts with the screenshots taken',
    'out, which Claude Code can be pointed back at.',
    '',
    ...index.map((s) => `- [${s.name}](${s.name}) — ${s.started}, ${s.messages} messages, ${s.kb} KB`),
    '',
  ].join('\n'),
);

console.log(`${index.length} session(s) written to chats/`);
for (const s of index) console.log(`  ${s.name}  ${s.messages} messages, ${s.kb} KB`);
