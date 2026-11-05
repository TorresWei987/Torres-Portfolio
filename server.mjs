import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, relative, extname, sep } from 'node:path';

const directory = resolve('dist');
const port = Number(process.env.PORT || 4175);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.png':'image/png', '.pdf':'application/pdf', '.ttf':'font/ttf', '.txt':'text/plain; charset=utf-8' };
const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end('Method not allowed'); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400); response.end('Invalid address'); return; }
  let path = resolve(directory, `.${pathname}`);
  const boundary = relative(directory, path);
  if (boundary === '..' || boundary.startsWith(`..${sep}`) || boundary.includes(':')) { response.writeHead(403); response.end('Access denied'); return; }
  try {
    const info = await stat(path);
    if (info.isDirectory()) {
      if (!pathname.endsWith('/')) { response.writeHead(302, { location: `${pathname}/` }); response.end(); return; }
      path = resolve(path, 'index.html');
    }
    const data = await readFile(path);
    response.writeHead(200, { 'Content-Type':types[extname(path)] || 'application/octet-stream', 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch {
    response.writeHead(404, { 'Content-Type':'text/html; charset=utf-8' });
    response.end(request.method === 'HEAD' ? undefined : await readFile(resolve(directory, '404.html')));
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/`));
