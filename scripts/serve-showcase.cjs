/** Preview the same entry points prepared by the GitHub Pages workflow. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const site = path.join(root, 'ui-atlas-demo');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.wav': 'audio/wav', '.json': 'application/json', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Invalid URL'); return; }
  if (pathname === '/' || pathname === '/index.html') pathname = '/showcase.html';
  if (pathname === '/resources.html') pathname = '/index.html';
  const shadcn = pathname.startsWith('/shadcn-demo/');
  const base = shadcn ? path.join(root, 'shadcn-demo', 'dist') : site;
  const relative = shadcn ? pathname.slice('/shadcn-demo/'.length) : pathname.slice(1);
  let file = path.resolve(base, relative || 'index.html');
  if (!file.startsWith(base + path.sep) && file !== base) { res.writeHead(403).end('Forbidden'); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { res.writeHead(404).end(shadcn ? 'Build shadcn-demo first: npm ci --prefix shadcn-demo && npm run build --prefix shadcn-demo' : 'Not found'); return; }
    const range = req.headers.range && /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
    const start = range ? Number(range[1]) : 0;
    const end = range && range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
    if (start > end || start >= stat.size) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return; }
    const headers = { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
    if (range) headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
    res.writeHead(range ? 206 : 200, headers);
    if (req.method === 'HEAD') res.end(); else fs.createReadStream(file, { start, end }).pipe(res);
  });
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`Showcase preview: http://127.0.0.1:${server.address().port}`));
