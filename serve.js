// Zero-dependency static file server for local preview.
// Python's http.server is unsafe on this PC (python.exe is infected), so use Node instead.
//
//   node serve.js [port]      then open http://localhost:8777/site/
//   node serve.js --phone     also lets a phone on the same wifi open the site; prints the address

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = __dirname;
const phone = process.argv.includes('--phone');
const port = Number(process.argv.find((arg) => /^\d+$/.test(arg))) || 8777;
// With --phone the wifi can reach the server, so share only the website, not the notes beside it.
const shared = phone ? path.join(root, 'site') : root;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  // The Qaida's recordings. Whichever of these your phone or recorder gives you, the browser can play it.
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.ogg': 'audio/ogg',
  '.opus': 'audio/ogg',
  '.webm': 'audio/webm',
};

// Only requests addressed to this machine are answered. Any web page open in a browser here could point a name it owns
// at 127.0.0.1 ("DNS rebinding") and read whatever this server shares; such a request carries that name in its Host.
const hosts = new Set(['localhost', '127.0.0.1', '[::1]']);
if (phone) {
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const net of nets) if (net.family === 'IPv4' || net.family === 4) hosts.add(net.address);
  }
}

// The response headers Netlify sends (site/_headers), so the preview enforces the same Content-Security-Policy:
// anything it would block online is blocked here too, with the reason in the console. Read on every request, so an
// edit applies at once. Cache-Control is left out: the preview always wants the newest file.
function siteHeaders(sitePath) {
  const found = {};
  let applies = false;
  let text = '';
  try {
    text = fs.readFileSync(path.join(root, 'site', '_headers'), 'utf8');
  } catch {
    return found;
  }
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      const rule = line.trim();
      applies = rule.endsWith('*') ? sitePath.startsWith(rule.slice(0, -1)) : sitePath === rule;
    } else if (applies) {
      const colon = line.indexOf(':');
      const name = line.slice(0, colon).trim();
      if (name.toLowerCase() !== 'cache-control') found[name] = line.slice(colon + 1).trim();
    }
  }
  return found;
}

http.createServer((req, res) => {
  if (!hosts.has((req.headers.host || '').replace(/:\d+$/, ''))) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400); // a malformed address would otherwise crash the server
    return res.end('Bad request');
  }
  if (urlPath === '/') {
    res.writeHead(302, { Location: '/site/' });
    return res.end();
  }

  let file = path.normalize(path.join(root, urlPath));
  if (file !== shared && !file.startsWith(shared + path.sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  if (urlPath.endsWith('/')) file = path.join(file, 'index.html');

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    res.writeHead(200, {
      ...(urlPath.startsWith('/site/') ? siteHeaders(urlPath.slice('/site'.length)) : {}),
      'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}).listen(port, phone ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`Serving ${shared} at http://localhost:${port}/site/`);
  if (!phone) return;
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const net of nets) {
      if ((net.family === 'IPv4' || net.family === 4) && !net.internal) {
        console.log(`On your phone (same wifi): http://${net.address}:${port}/site/`);
      }
    }
  }
});
