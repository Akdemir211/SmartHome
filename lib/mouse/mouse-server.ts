import http from 'http';
import {
  moveMouse,
  leftDown,
  leftUp,
  rightDown,
  rightUp,
  scroll,
  doubleClick,
  drag,
} from './mouse-control';
import { typeText, pressKey } from '../keyboard/keyboard-control';

let launched = false;

export function ensureMouseServer(): void {
  if (launched) return;
  launched = true;

  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');

    if (req.method !== 'POST') {
      res.writeHead(204);
      res.end();
      return;
    }

    let body = '';
    req.on('data', (c: Buffer) => { body += c; });
    req.on('end', () => {
      const p = body.split(',');
      const x = +p[1] || 0;
      const y = +p[2] || 0;

      switch (p[0]) {
        case 'm':  moveMouse(x, y);       break;
        case 'ld': leftDown(x, y);        break;
        case 'lu': leftUp();              break;
        case 'rd': rightDown(x, y);       break;
        case 'ru': rightUp();             break;
        case 'sc': scroll(x > 0 ? 'up' : 'down', Math.abs(x) || 3); break;
        case 'dc': doubleClick(x, y);     break;
        case 'dr': drag(x, y, +p[3] || 0, +p[4] || 0); break;
        case 'tp': typeText(decodeURIComponent(p.slice(1).join(','))); break;
        case 'pk': pressKey(decodeURIComponent(p.slice(1).join(','))); break;
      }

      res.writeHead(200);
      res.end();
    });
  });

  server.listen(3001, '127.0.0.1', () => {
    console.log('[InputServer] running on :3001');
  });

  server.on('error', (e: NodeJS.ErrnoException) => {
    if (e.code === 'EADDRINUSE') {
      console.log('[InputServer] :3001 already in use — reusing');
    } else {
      console.error('[InputServer]', e.message);
    }
  });
}
