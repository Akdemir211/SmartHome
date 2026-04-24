import { NextResponse } from 'next/server';
import {
  moveMouse,
  leftDown,
  leftUp,
  rightDown,
  rightUp,
  scroll,
  doubleClick,
  drag,
  getVirtualScreen,
} from '@/lib/mouse/mouse-control';
import { typeText, pressKey } from '@/lib/keyboard/keyboard-control';
import { ensureMouseServer } from '@/lib/mouse/mouse-server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execAsync = promisify(exec);

ensureMouseServer();

interface ControlRequest {
  tool: string;
  args: Record<string, unknown>;
}

function ok(message: string, data?: unknown) {
  return NextResponse.json({ ok: true, message, data });
}
function fail(message: string) {
  return NextResponse.json({ ok: false, message });
}

async function takeScreenshot(): Promise<{ base64: string; width: number; height: number }> {
  const tmp = path.join(os.tmpdir(), `jarvis_ss_${Date.now()}.png`);
  const screen = getVirtualScreen();
  const pw = screen.primaryWidth;
  const ph = screen.primaryHeight;

  const psScript = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$w = ${pw}; $h = ${ph}
$b = [System.Drawing.Bitmap]::new($w, $h)
$g = [System.Drawing.Graphics]::FromImage($b)
$g.CopyFromScreen(0, 0, 0, 0, [System.Drawing.Size]::new($w, $h))
$pen = [System.Drawing.Pens]::Lime
$font = [System.Drawing.Font]::new('Consolas', 9)
$brush = [System.Drawing.Brushes]::Lime
$bgBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(140, 0, 0, 0))
$g.FillRectangle($bgBrush, 0, 0, $w, 26)
$g.FillRectangle($bgBrush, 0, 0, 26, $h)
for ($x = 0; $x -le $w; $x += 200) {
  $g.DrawLine($pen, $x, 0, $x, 26)
  if ($x -gt 0) { $g.DrawString("$x", $font, $brush, ($x - 14), 3) }
}
for ($y = 0; $y -le $h; $y += 200) {
  $g.DrawLine($pen, 0, $y, 26, $y)
  if ($y -gt 0) { $g.DrawString("$y", $font, $brush, 2, ($y - 7)) }
}
$b.Save('${tmp.replace(/\\/g, '\\\\')}', [System.Drawing.Imaging.ImageFormat]::Jpeg)
$g.Dispose(); $b.Dispose()
`.replace(/\n/g, ' ');

  await execAsync(`powershell -NoProfile -Command "${psScript}"`);
  const buf = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);
  return { base64: buf.toString('base64'), width: pw, height: ph };
}

export async function POST(req: Request) {
  try {
    const { tool, args } = (await req.json()) as ControlRequest;
    console.log(`[COMPUTER] ${tool}`, args);

    switch (tool) {
      case 'computer_mouse_click': {
        const x = Math.round(Number(args.x) || 0);
        const y = Math.round(Number(args.y) || 0);
        const btn = String(args.button ?? 'left');
        if (btn === 'right') {
          rightDown(x, y);
          rightUp();
        } else {
          leftDown(x, y);
          leftUp();
        }
        return ok(`Tıklandı (${btn}) → ${x},${y}`);
      }

      case 'computer_mouse_double_click': {
        const x = Math.round(Number(args.x) || 0);
        const y = Math.round(Number(args.y) || 0);
        doubleClick(x, y);
        return ok(`Çift tıklandı → ${x},${y}`);
      }

      case 'computer_mouse_move': {
        const x = Math.round(Number(args.x) || 0);
        const y = Math.round(Number(args.y) || 0);
        moveMouse(x, y);
        return ok(`Fare taşındı → ${x},${y}`);
      }

      case 'computer_mouse_drag': {
        const fx = Math.round(Number(args.from_x) || 0);
        const fy = Math.round(Number(args.from_y) || 0);
        const tx = Math.round(Number(args.to_x) || 0);
        const ty = Math.round(Number(args.to_y) || 0);
        drag(fx, fy, tx, ty);
        return ok(`Sürüklendi ${fx},${fy} → ${tx},${ty}`);
      }

      case 'computer_scroll': {
        const dir = String(args.direction ?? 'down') as 'up' | 'down';
        const amt = Math.max(1, Math.min(20, Number(args.amount) || 3));
        scroll(dir, amt);
        return ok(`Kaydırıldı: ${dir} ×${amt}`);
      }

      case 'computer_type_text': {
        const text = String(args.text ?? '');
        if (!text) return fail('Metin boş');
        typeText(text);
        return ok(`Yazıldı: "${text.slice(0, 50)}${text.length > 50 ? '…' : ''}"`);
      }

      case 'computer_press_key': {
        const key = String(args.key ?? '');
        if (!key) return fail('Tuş belirtilmedi');
        pressKey(key);
        return ok(`Basıldı: ${key}`);
      }

      case 'computer_wait': {
        const ms = Math.max(50, Math.min(10000, Number(args.ms) || 1000));
        await new Promise((r) => setTimeout(r, ms));
        return ok(`${ms}ms beklendi`);
      }

      case 'computer_screenshot': {
        const ss = await takeScreenshot();
        return ok(
          `Ekran görüntüsü alındı (${ss.width}x${ss.height}). Cetvelleri kullanarak koordinatları oku.`,
          { base64: ss.base64, mimeType: 'image/jpeg', width: ss.width, height: ss.height },
        );
      }

      default:
        return fail(`Bilinmeyen komut: ${tool}`);
    }
  } catch (err) {
    console.error('[COMPUTER] Hata:', err);
    return NextResponse.json({ ok: false, message: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json(getVirtualScreen());
  } catch {
    return NextResponse.json({ x: 0, y: 0, width: 1920, height: 1080 });
  }
}
